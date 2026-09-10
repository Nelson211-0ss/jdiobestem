"""
A daily note about school fees that are due and not yet sent.

Run from cron. It exists because the cost of forgetting is borne by a student:
a term starts, the fees have not reached the school, and nobody finds out until
the child is sent home. The dashboard can answer "what is owed" at any time,
but only if somebody thinks to look — this makes it arrive instead.

Silent when there is nothing owed. A reminder that comes every day whether or
not anything needs doing is one people stop opening.
"""

from datetime import timedelta

from django.conf import settings
from django.core.management.base import BaseCommand
from django.utils import timezone

from api import notifications
from scholarships.models import Scholarship, ScholarshipTerm

#: How far ahead to warn. Fees are wanted at the start of term, and a fortnight
#: is enough notice to move money without being so early it is ignored.
DEFAULT_LEAD_DAYS = 14

#: Bursaries whose fees are actually expected.
LIVE = (Scholarship.Status.ACTIVE, Scholarship.Status.PENDING)


class Command(BaseCommand):
    help = "Email a reminder of school fees due and unpaid."

    def add_arguments(self, parser):
        parser.add_argument("--lead-days", type=int, default=DEFAULT_LEAD_DAYS)
        parser.add_argument("--to", default="", help="Override the recipient.")
        parser.add_argument(
            "--dry-run", action="store_true", help="Print it instead of sending."
        )

    def handle(self, *args, **options):
        today = timezone.localdate()
        horizon = today + timedelta(days=options["lead_days"])

        terms = (
            ScholarshipTerm.objects.filter(
                scholarship__status__in=LIVE, starts_on__lte=horizon
            )
            .select_related("scholarship", "scholarship__school")
            .prefetch_related("payments")
            .order_by("starts_on")
        )
        owing = [t for t in terms if not t.is_settled]

        if not owing:
            self.stdout.write("Nothing outstanding — no reminder sent.")
            return

        lines = []
        total = 0
        for term in owing:
            bursary = term.scholarship
            when = "overdue since" if term.starts_on <= today else "starts"
            lines.append(
                (
                    f"{bursary.student_name} ({bursary.reference})",
                    f"{bursary.currency} {term.outstanding:,.0f} for {term} — "
                    f"{when} {term.starts_on:%d %b %Y}, {bursary.school.name}",
                )
            )
            total += term.outstanding

        currency = owing[0].scholarship.currency or ""
        subject = f"School fees due: {len(owing)} term(s), {currency} {total:,.0f}".strip()
        lines.append(("—", ""))
        lines.append(("Total outstanding", f"{currency} {total:,.0f}".strip()))

        recipient = (
            options["to"]
            or getattr(settings, "FEE_REMINDER_TO", "")
            or getattr(settings, "NOTIFY_TO", "")
        )

        if options["dry_run"]:
            self.stdout.write(f"To: {recipient}\n{subject}\n")
            for label, value in lines:
                self.stdout.write(f"  {label}: {value}")
            return

        sent = notifications.send_notification(subject, lines, to=recipient)
        self.stdout.write(
            self.style.SUCCESS(f"Reminder sent to {recipient}: {subject}")
            if sent
            else self.style.WARNING("Email is not configured — nothing sent.")
        )
