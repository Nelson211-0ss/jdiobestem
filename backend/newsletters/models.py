"""
Newsletters: composing one, and the record of who it actually reached.

Sending is the only thing the dashboard does that cannot be undone — a story
can be unpublished, an email cannot be recalled. So the send is recorded per
recipient rather than as a single flag: if the provider fails halfway through,
the campaign can be run again and it picks up exactly where it stopped instead
of mailing the first half of the list twice.
"""

from django.contrib.auth.models import User
from django.db import models

from core.countries import Country, country_field
from core.models import TimeStampedModel
from submissions.models import NewsletterSubscriber


class Newsletter(TimeStampedModel):
    """One campaign: what was written, who it was aimed at, and how it went."""

    class Status(models.TextChoices):
        DRAFT = "draft", "Draft"
        SENDING = "sending", "Sending"
        SENT = "sent", "Sent"
        FAILED = "failed", "Failed"

    subject = models.CharField(max_length=200, help_text="The email subject line.")
    issue_label = models.CharField(
        max_length=120, blank=True, help_text="Which issue this is, e.g. August 2026."
    )
    published_on = models.DateField(null=True, blank=True, help_text="The issue date.")

    preheader = models.CharField(
        max_length=200,
        blank=True,
        help_text="The grey line after the subject in an inbox. Left blank, the first line of the note is used.",
    )

    # The newsletter itself. It is laid out and exported as a PDF rather than
    # written here, so this is the thing subscribers actually receive — the
    # email around it is a covering note pointing at it.
    pdf = models.CharField(
        max_length=500, blank=True, help_text="The newsletter PDF. Uploaded, or a path under /public."
    )
    cover_image = models.CharField(
        max_length=500, blank=True, help_text="Optional cover image, shown in the email above the link."
    )

    # Rendered from the PDF's first page when one is attached, so the table can
    # show the newsletter rather than a file icon. `preview_source` records
    # which PDF it was made from, so it is regenerated when that changes and
    # not on every unrelated save.
    preview_image = models.CharField(max_length=500, blank=True, editable=False)
    preview_source = models.CharField(max_length=500, blank=True, editable=False)

    body = models.TextField(
        blank=True,
        help_text="Optional short note in the email, above the link. Markdown.",
    )

    # Who it goes to. Global means every subscribed address; a country means
    # only the addresses on that country's list.
    country = country_field(
        help_text=(
            "Global sends to every subscribed address. A country sends only to "
            "addresses on that country's list."
        )
    )

    status = models.CharField(
        max_length=20, choices=Status.choices, default=Status.DRAFT, db_index=True
    )

    # Sending and publishing are separate decisions. A campaign goes to the
    # people who asked for it; putting the issue on the website for anyone to
    # read is a further choice, so it is made explicitly rather than inferred
    # from the send having happened.
    is_public = models.BooleanField(
        default=False,
        db_index=True,
        help_text="Show this issue on the website's newsletters page.",
    )

    created_by = models.ForeignKey(
        User, null=True, blank=True, on_delete=models.SET_NULL, related_name="newsletters"
    )
    sent_at = models.DateTimeField(null=True, blank=True)

    # Filled in by the send, so the list view can show the outcome without
    # counting delivery rows every time.
    recipient_count = models.PositiveIntegerField(default=0)
    sent_count = models.PositiveIntegerField(default=0)
    failed_count = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return self.subject

    @property
    def is_editable(self) -> bool:
        """A campaign stops being editable the moment anyone has received it."""
        return self.status in (self.Status.DRAFT, self.Status.FAILED) and self.sent_count == 0

    def audience(self):
        """The subscribers this campaign is aimed at, as a queryset."""
        qs = NewsletterSubscriber.objects.filter(
            status=NewsletterSubscriber.SubscriptionStatus.SUBSCRIBED
        )
        if self.country and self.country != Country.GLOBAL:
            qs = qs.filter(country=self.country)
        return qs.order_by("id")


class NewsletterDelivery(TimeStampedModel):
    """One address, one campaign. The unique constraint is what makes a repeated
    send safe: a second attempt can only ever fill in the gaps."""

    class Status(models.TextChoices):
        PENDING = "pending", "Pending"
        SENT = "sent", "Sent"
        FAILED = "failed", "Failed"

    newsletter = models.ForeignKey(
        Newsletter, on_delete=models.CASCADE, related_name="deliveries"
    )
    subscriber = models.ForeignKey(
        NewsletterSubscriber, on_delete=models.CASCADE, related_name="deliveries"
    )
    # Kept alongside the FK: this is the address it actually went to, which
    # stays true even if the subscriber later changes theirs.
    email = models.EmailField()

    status = models.CharField(
        max_length=20, choices=Status.choices, default=Status.PENDING, db_index=True
    )
    provider_message_id = models.CharField(max_length=200, blank=True)
    error = models.TextField(blank=True)
    sent_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ["id"]
        constraints = [
            models.UniqueConstraint(
                fields=["newsletter", "subscriber"], name="one_delivery_per_subscriber"
            )
        ]
        verbose_name_plural = "newsletter deliveries"

    def __str__(self):
        return f"{self.email} — {self.get_status_display()}"
