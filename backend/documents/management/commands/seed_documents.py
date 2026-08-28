"""
Seed the documents the Foundation already publishes.

The two mentorship handbooks are the real case this feature exists for: a
handbook that is reissued each year, where the question "which edition was a
mentor given?" has to stay answerable. Both are dated 10 September 2026 and
sit under /mentorship on the website, so they are entered as public documents
with their 2026/27 edition marked current.

Nothing else is invented. Other documents get added through the dashboard.
"""

from datetime import date

from django.core.management.base import BaseCommand
from django.db import transaction

from documents.models import Document, DocumentEdition

HANDBOOKS = [
    {
        "slug": "mentor-handbook",
        "title": "Mentor Handbook",
        "description": "Mentor Handbook for Volunteer Mentors. Given to every volunteer mentor.",
        "category": Document.Category.HANDBOOK,
        "is_public": True,
        "edition": {
            "version": "2026/27",
            "external_url": "/mentorship/Mentor%20Handbook.pdf",
            "effective_date": date(2026, 9, 10),
            "is_current": True,
            "summary": "First edition.",
        },
    },
    {
        "slug": "mentee-handbook",
        "title": "Mentee Handbook",
        "description": "Mentee Handbook for Member Students. Given to every student in the programme.",
        "category": Document.Category.HANDBOOK,
        "is_public": True,
        "edition": {
            "version": "2026/27",
            "external_url": "/mentorship/Mentee%20Handbook.pdf",
            "effective_date": date(2026, 9, 10),
            "is_current": True,
            "summary": "First edition.",
        },
    },
]


class Command(BaseCommand):
    help = "Create or update the documents the Foundation already publishes."

    @transaction.atomic
    def handle(self, *args, **options):
        for entry in HANDBOOKS:
            edition = entry.pop("edition")
            document, created = Document.objects.update_or_create(
                slug=entry["slug"], defaults=entry
            )
            self.stdout.write(f"  {'created' if created else 'updated'}  {document.title}")

            # Matched on version so re-running updates that edition rather than
            # adding a second row for the same one.
            obj, made = DocumentEdition.objects.update_or_create(
                document=document, version=edition["version"],
                defaults={k: v for k, v in edition.items() if k != "version"},
            )
            self.stdout.write(f"      {'created' if made else 'updated'}  edition {obj.version}")

        self.stdout.write(
            self.style.SUCCESS(
                f"{Document.objects.count()} documents, {DocumentEdition.objects.count()} editions"
            )
        )
