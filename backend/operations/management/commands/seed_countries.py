"""Seed the countries the Foundation operates in, and their main offices."""

from django.core.management.base import BaseCommand
from django.db import transaction

from operations.models import Office, OperatingCountry

# `main_office` is the place the Foundation actually works from in that country,
# as recorded on the website. South Sudan has none written down yet, so it gets
# a country row and no office rather than an invented address.
COUNTRIES = [
    {
        "code": "UG",
        "name": "Uganda",
        "currency_code": "UGX",
        "currency_symbol": "USh",
        "order": 1,
        "main_office": "Bugembe, Jinja",
    },
    {
        "code": "SS",
        "name": "South Sudan",
        "currency_code": "SSP",
        "currency_symbol": "£",
        "order": 2,
        "main_office": "",
    },
    {
        "code": "US",
        "name": "United States",
        "currency_code": "USD",
        "currency_symbol": "$",
        "order": 3,
        "main_office": "Oklahoma City, OK",
    },
]


class Command(BaseCommand):
    help = "Create or update the operating countries and their main offices."

    @transaction.atomic
    def handle(self, *args, **options):
        for entry in COUNTRIES:
            fields = {k: v for k, v in entry.items() if k != "main_office"}
            country, created = OperatingCountry.objects.update_or_create(
                code=fields["code"], defaults=fields
            )
            self.stdout.write(f"  {'created' if created else 'updated'}  {country}")

            office_name = entry["main_office"]
            if not office_name:
                continue

            # Matched on is_main rather than name so re-running after a rename
            # updates the existing office instead of tripping the one-main-per-
            # country constraint with a second row.
            office, made = Office.objects.update_or_create(
                country=country,
                is_main=True,
                defaults={"name": office_name, "is_active": True},
            )
            self.stdout.write(f"      {'created' if made else 'updated'}  main office: {office}")

        self.stdout.write(
            self.style.SUCCESS(
                f"{OperatingCountry.objects.count()} operating countries, "
                f"{Office.objects.count()} offices"
            )
        )
