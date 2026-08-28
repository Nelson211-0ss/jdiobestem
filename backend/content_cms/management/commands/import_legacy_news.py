"""
Bring the original news stories into the database.

The news page used to render `content/news-data.tsx` directly. When it became
database-backed those four stories stopped appearing, because nothing had ever
copied them across — the page changed where it read from and the content was
left behind.

The fixture was produced by rendering each story's JSX through React and
converting the resulting HTML to Markdown, so the text, headings, lists,
blockquotes and links are the ones the site actually published rather than a
retyping of them.
"""

import json
from pathlib import Path

from django.core.management.base import BaseCommand
from django.db import transaction

from content_cms.models import NewsGalleryImage, NewsLink, NewsStory

DEFAULT_FIXTURE = Path(__file__).resolve().parents[2] / "fixtures" / "legacy-news.json"


class Command(BaseCommand):
    help = "Import the original news stories from the legacy fixture."

    def add_arguments(self, parser):
        parser.add_argument("--from-file", default=str(DEFAULT_FIXTURE))
        parser.add_argument(
            "--publish",
            action="store_true",
            help="Publish them. Without this they are imported as drafts for review.",
        )
        parser.add_argument(
            "--overwrite",
            action="store_true",
            help="Replace the body and metadata of stories that already exist.",
        )

    @transaction.atomic
    def handle(self, *args, **options):
        path = Path(options["from_file"])
        stories = json.loads(path.read_text())

        created_n = updated_n = skipped_n = 0

        for entry in stories:
            gallery = entry.pop("gallery", [])
            links = entry.pop("links", [])

            existing = NewsStory.objects.filter(slug=entry["slug"]).first()
            if existing and not options["overwrite"]:
                skipped_n += 1
                self.stdout.write(f"  exists, left alone   {entry['slug']}")
                continue

            fields = {**entry, "is_published": options["publish"]}
            story, created = NewsStory.objects.update_or_create(
                slug=entry["slug"], defaults=fields
            )

            # Rebuilt rather than merged: these are ordered lists belonging to
            # the story, and a partial update would leave stale rows behind.
            story.gallery.all().delete()
            for i, image in enumerate(gallery):
                NewsGalleryImage.objects.create(
                    story=story, src=image["src"], alt=image["alt"],
                    caption=image.get("caption", ""), order=i,
                )
            story.links.all().delete()
            for i, link in enumerate(links):
                NewsLink.objects.create(
                    story=story, href=link["href"], label=link["label"],
                    icon=link.get("icon", ""), order=i,
                )

            created_n += int(created)
            updated_n += int(not created)
            self.stdout.write(
                f"  {'imported' if created else 'updated '}  {story.slug}  "
                f"({len(gallery)} images, {len(links)} links)"
            )

        state = "published" if options["publish"] else "drafts — publish them when you have read them through"
        self.stdout.write(
            self.style.SUCCESS(
                f"{created_n} imported, {updated_n} updated, {skipped_n} skipped; "
                f"imported as {state}. {NewsStory.objects.count()} stories in total."
            )
        )
