"""
Give the board dropdowns their options.

The monday export carried column names and types but not their label sets —
zero of 630 columns arrived with any — so every status and dropdown column came
through with nothing to choose from. This puts a usable set behind the ones
whose meaning is unambiguous.

Two kinds of list here, and the difference matters.

Currency is derived, not invented: it is built from the countries the
Foundation actually operates in, so it cannot drift from the Operations tables.

The rest are conventional defaults. They are a starting point chosen so the
forms work today, not a claim about how the Foundation categorises its
spending. Re-run with --overwrite after editing this file to change them.
"""

from django.core.management.base import BaseCommand

from operations.models import BoardColumn, OperatingCountry

#: Column title -> the labels it should offer, in order.
#: Matched on title, so one entry covers every board that uses that column.
DEFAULTS: dict[str, list[str]] = {
    "Priority": ["Low", "Medium", "High", "Urgent"],
    "Approval Status": ["Pending", "Approved", "Rejected", "Paid"],
    "Status": ["Not started", "Working on it", "Stuck", "Done"],
    "Payment Status": ["Unpaid", "Part paid", "Paid"],
    "Category": [
        "Travel and transport",
        "Equipment and materials",
        "Venue and facilities",
        "Printing and stationery",
        "Refreshments",
        "Staff costs",
        "Utilities and communications",
        "Other",
    ],
}


def status_settings(labels: list[str]) -> dict:
    """monday's own shape: labels keyed by index, plus an explicit order."""
    return {
        "labels": {str(i): text for i, text in enumerate(labels)},
        "labels_positions_v2": {str(i): i for i, _ in enumerate(labels)},
    }


def dropdown_settings(labels: list[str]) -> dict:
    return {"labels": [{"id": i, "name": text} for i, text in enumerate(labels)]}


class Command(BaseCommand):
    help = "Populate the label sets for status and dropdown board columns."

    def add_arguments(self, parser):
        parser.add_argument(
            "--overwrite",
            action="store_true",
            help="Replace labels on columns that already have some.",
        )

    def handle(self, *args, **options):
        overwrite = options["overwrite"]

        # Derived from the Operations tables so it cannot disagree with them.
        currencies = [
            f"{c.currency_code} — {c.name}"
            for c in OperatingCountry.objects.filter(is_active=True).order_by("order")
        ]
        wanted = dict(DEFAULTS)
        if currencies:
            wanted["Currency"] = currencies

        filled = skipped = 0
        for column in BoardColumn.objects.filter(column_type__in=("status", "dropdown")):
            labels = wanted.get(column.title.strip())
            if not labels:
                continue
            if column.choices and not overwrite:
                skipped += 1
                continue

            column.settings = (
                status_settings(labels)
                if column.column_type == "status"
                else dropdown_settings(labels)
            )
            column.save(update_fields=["settings"])
            filled += 1
            self.stdout.write(f"  {column.board.name} · {column.title}: {len(labels)} options")

        self.stdout.write(
            self.style.SUCCESS(
                f"{filled} column(s) given options, {skipped} left as they were. "
                "Currency is built from the operating countries; the rest are defaults you can edit."
            )
        )
