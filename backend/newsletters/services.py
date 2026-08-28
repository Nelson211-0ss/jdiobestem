"""
Actually sending a campaign.

Two rules shape this module.

First, nobody is mailed twice. A delivery row is created for every recipient
before anything is sent, with a unique constraint on (newsletter, subscriber),
and only rows still pending are handed to the provider. Running a send again
after a failure resumes; it does not restart.

Second, the send never silently half-works. Every recipient ends as `sent` or
`failed` with the provider's reason attached, and the campaign is only marked
sent when nothing failed.
"""

from __future__ import annotations

from django.conf import settings
from django.db import transaction
from django.utils import timezone

from .emails import (
    BATCH_SIZE,
    absolute,
    render_body,
    send_batch,
    to_plain_text,
    wrap_email,
)
from .models import Newsletter, NewsletterDelivery


def unsubscribe_url(subscriber) -> str:
    return f"{settings.PUBLIC_BASE_URL}/api/newsletter/unsubscribe/{subscriber.unsubscribe_token}/"


def build_message(newsletter: Newsletter, subscriber) -> dict:
    """One Resend message for one subscriber."""
    url = unsubscribe_url(subscriber)
    body_html = render_body(newsletter.body)
    pdf_url = absolute(newsletter.pdf)
    return {
        "from": settings.NOTIFY_FROM,
        "to": [subscriber.email],
        "subject": newsletter.subject,
        "html": wrap_email(
            newsletter.subject,
            body_html,
            url,
            newsletter.preheader,
            pdf_url=pdf_url,
            cover_url=absolute(newsletter.cover_image),
            issue_label=newsletter.issue_label,
        ),
        "text": to_plain_text(newsletter.body, url, pdf_url),
        # Lets a mailbox provider offer its own unsubscribe button, which keeps
        # complaints from turning into spam reports.
        "headers": {
            "List-Unsubscribe": f"<{url}>",
            "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
        },
    }


@transaction.atomic
def prepare(newsletter: Newsletter) -> int:
    """Create the delivery rows for anyone in the audience who has none yet."""
    existing = set(
        NewsletterDelivery.objects.filter(newsletter=newsletter).values_list(
            "subscriber_id", flat=True
        )
    )
    new_rows = [
        NewsletterDelivery(newsletter=newsletter, subscriber=s, email=s.email)
        for s in newsletter.audience()
        if s.id not in existing
    ]
    NewsletterDelivery.objects.bulk_create(new_rows, ignore_conflicts=True)

    newsletter.recipient_count = NewsletterDelivery.objects.filter(newsletter=newsletter).count()
    newsletter.save(update_fields=["recipient_count", "updated_at"])
    return newsletter.recipient_count


def send(newsletter: Newsletter) -> dict:
    """
    Send everything still pending. Safe to call again after a partial failure.

    Returns a summary the dashboard can show verbatim.
    """
    prepare(newsletter)

    # Failed rows are included, not just pending ones: a retry after a provider
    # outage is precisely the case this exists for. Rows already marked sent are
    # never reselected, which is what keeps a retry from mailing anyone twice.
    pending = list(
        NewsletterDelivery.objects.filter(
            newsletter=newsletter,
            status__in=(NewsletterDelivery.Status.PENDING, NewsletterDelivery.Status.FAILED),
        ).select_related("subscriber")
    )

    if not pending:
        already = NewsletterDelivery.objects.filter(
            newsletter=newsletter, status=NewsletterDelivery.Status.SENT
        ).count()
        return {
            "sent": 0,
            "failed": 0,
            "already_sent": already,
            "detail": (
                "Nobody to send to — nobody is subscribed to this campaign's audience."
                if already == 0
                else f"All {already} of them have already received this."
            ),
        }

    newsletter.status = Newsletter.Status.SENDING
    newsletter.save(update_fields=["status", "updated_at"])

    sent = failed = 0

    for start in range(0, len(pending), BATCH_SIZE):
        chunk = pending[start : start + BATCH_SIZE]
        messages = [build_message(newsletter, d.subscriber) for d in chunk]
        ids, error = send_batch(messages)
        now = timezone.now()

        if error:
            for delivery in chunk:
                delivery.status = NewsletterDelivery.Status.FAILED
                delivery.error = error
            NewsletterDelivery.objects.bulk_update(chunk, ["status", "error"])
            failed += len(chunk)
            continue

        for i, delivery in enumerate(chunk):
            delivery.status = NewsletterDelivery.Status.SENT
            delivery.provider_message_id = ids[i] if i < len(ids) else ""
            delivery.sent_at = now
            delivery.error = ""
        NewsletterDelivery.objects.bulk_update(
            chunk, ["status", "provider_message_id", "sent_at", "error"]
        )
        sent += len(chunk)

    totals = NewsletterDelivery.objects.filter(newsletter=newsletter)
    newsletter.sent_count = totals.filter(status=NewsletterDelivery.Status.SENT).count()
    newsletter.failed_count = totals.filter(status=NewsletterDelivery.Status.FAILED).count()
    newsletter.status = (
        Newsletter.Status.SENT if newsletter.failed_count == 0 else Newsletter.Status.FAILED
    )
    if newsletter.status == Newsletter.Status.SENT and not newsletter.sent_at:
        newsletter.sent_at = timezone.now()
    newsletter.save(
        update_fields=["sent_count", "failed_count", "status", "sent_at", "updated_at"]
    )

    detail = f"Sent to {sent} subscriber{'s' if sent != 1 else ''}."
    if failed:
        detail += f" {failed} failed — open the campaign to see why, then send again to retry just those."

    return {
        "sent": sent,
        "failed": failed,
        "already_sent": newsletter.sent_count - sent,
        "detail": detail,
    }
