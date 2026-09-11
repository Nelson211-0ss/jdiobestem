"""
Put stored phone numbers into the one shape the dashboard now writes.

The forms used to be plain text boxes, so the same number could be saved four
ways — 0700123456, 256700123456, +256 700 123456, (0)700-123456 — and none of
the local ones can be dialled from another country or matched against each
other. The dashboard now picks the country code, which writes `+256700123456`;
this brings what is already stored into line with that.

It converts only what it can be sure of. A number whose length does not fit
the country's national format is left exactly as it is and reported, because
the alternative is inventing or deleting a digit in somebody's contact details.
"""

import re

from django.apps import apps
from django.core.management.base import BaseCommand

#: Countries the Foundation works in, with the length of a national number.
DIALS = {
    "+256": ("Uganda", 9),
    "+211": ("South Sudan", 9),
    "+1": ("United States", 10),
}

#: Apps whose records hold contact details.
APPS = {
    "accounts", "operations", "submissions", "donations", "content_cms",
    "programmes", "newsletters", "documents", "scholarships", "jobs",
}


def phone_fields():
    """Every column that holds a phone number and nothing else.

    Deliberately not `guardian_contact` and the like: those are "how to reach
    them" free text that may hold a name beside the number, and rewriting them
    as a bare number would lose the rest.
    """
    for model in apps.get_models():
        if model._meta.app_label not in APPS:
            continue
        for field in model._meta.get_fields():
            if not hasattr(field, "attname") or not hasattr(field, "max_length"):
                continue
            if "phone" in field.name.lower():
                yield model, field.name


def normalise(value: str, dial: str) -> tuple[str, str]:
    """Return (new value, reason it was left alone)."""
    raw = (value or "").strip()
    if not raw:
        return raw, ""

    if raw.startswith("+"):
        tidy = "+" + re.sub(r"\D", "", raw[1:])
        return (tidy, "") if tidy != raw else (raw, "")

    digits = re.sub(r"\D", "", raw)
    if not digits:
        return raw, "no digits"

    _, national_length = DIALS[dial]
    bare = dial.lstrip("+")

    # Already carries the country code, just without the plus.
    if digits.startswith(bare) and len(digits) == len(bare) + national_length:
        return f"+{digits}", ""

    local = digits.lstrip("0")
    if len(local) == national_length:
        return f"{dial}{local}", ""

    return raw, f"{len(local)} digits after the trunk zero, expected {national_length}"


class Command(BaseCommand):
    help = "Rewrite stored phone numbers with their country code."

    def add_arguments(self, parser):
        parser.add_argument(
            "--dial", default="+256", choices=sorted(DIALS), help="Country to assume for local numbers."
        )
        parser.add_argument("--dry-run", action="store_true")

    def handle(self, *args, **options):
        dial, dry = options["dial"], options["dry_run"]
        country, _ = DIALS[dial]
        changed = skipped = 0

        for model, name in phone_fields():
            rows = model.objects.exclude(**{name: ""}).exclude(**{f"{name}__isnull": True})
            for obj in rows:
                before = getattr(obj, name)
                after, reason = normalise(before, dial)
                label = f"{model._meta.label}.{name} #{obj.pk}"
                if reason:
                    skipped += 1
                    self.stdout.write(self.style.WARNING(f"  left alone  {label}: {before!r} — {reason}"))
                elif after != before:
                    changed += 1
                    self.stdout.write(f"  {'would set' if dry else 'set'}   {label}: {before!r} -> {after!r}")
                    if not dry:
                        setattr(obj, name, after)
                        obj.save(update_fields=[name])

        self.stdout.write(
            self.style.SUCCESS(
                f"{changed} number(s) {'would be ' if dry else ''}rewritten assuming {country}; "
                f"{skipped} left for a human to look at."
            )
        )
