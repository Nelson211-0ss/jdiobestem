"""
Render first-page previews for PDFs that do not have one.

New records get theirs on save. This is for the ones that were already there,
and for retrying anything that failed the first time — a file that was briefly
unreachable, or a record created before previews existed.
"""

from django.core.management.base import BaseCommand

from core.pdf_preview import build_preview
from documents.models import DocumentEdition
from newsletters.models import Newsletter


class Command(BaseCommand):
    help = "Render missing first-page previews for newsletters and document editions."

    def add_arguments(self, parser):
        parser.add_argument(
            "--force",
            action="store_true",
            help="Re-render even where a preview already exists.",
        )

    def handle(self, *args, **options):
        force = options["force"]
        made = skipped = failed = 0

        def run(queryset, source_of, prefix, label):
            nonlocal made, skipped, failed
            for obj in queryset:
                source = source_of(obj)
                if not source:
                    continue
                if obj.preview_image and not force:
                    skipped += 1
                    continue
                preview = build_preview(source, prefix)
                type(obj).objects.filter(pk=obj.pk).update(
                    preview_image=preview, preview_source=source
                )
                if preview:
                    made += 1
                    self.stdout.write(f"  rendered  {label(obj)}")
                else:
                    failed += 1
                    self.stdout.write(
                        self.style.WARNING(f"  could not read  {label(obj)}  ({source[:70]})")
                    )

        run(
            Newsletter.objects.all(),
            lambda n: n.pdf or "",
            "newsletter",
            lambda n: f"newsletter: {n.subject}",
        )
        run(
            DocumentEdition.objects.select_related("document"),
            lambda e: (e.file.name if e.file else "") or e.external_url or "",
            "edition",
            lambda e: f"{e.document.title} {e.version}",
        )

        self.stdout.write(
            self.style.SUCCESS(
                f"{made} rendered, {skipped} already had one, {failed} could not be read"
            )
        )
