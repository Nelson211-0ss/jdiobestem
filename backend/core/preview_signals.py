"""
Keeping PDF previews in step with the files they came from.

A signal rather than a call in each view: an edition created by a management
command, a fixture or the API should end up with the same preview, and there is
no sensible way to remember to call it in all three.

The regeneration guard is `preview_source`. It records which file the stored
image was rendered from, so an unrelated edit does not re-render a PDF, and
changing the file does.
"""

from __future__ import annotations

import logging

from django.db.models.signals import post_save
from django.dispatch import receiver

from core.pdf_preview import build_preview

logger = logging.getLogger(__name__)


def _refresh(instance, source: str, prefix: str) -> None:
    if source == (instance.preview_source or ""):
        return  # already rendered from exactly this file

    preview = build_preview(source, prefix) if source else ""

    # Written straight to the row: saving the instance would re-enter this
    # signal, and there is nothing else to persist.
    type(instance).objects.filter(pk=instance.pk).update(
        preview_image=preview, preview_source=source
    )
    instance.preview_image = preview
    instance.preview_source = source


@receiver(post_save, sender="newsletters.Newsletter", dispatch_uid="newsletter_preview")
def newsletter_preview(sender, instance, **kwargs):
    try:
        _refresh(instance, instance.pdf or "", "newsletter")
    except Exception:  # noqa: BLE001 — never let a preview break a save
        logger.info("Newsletter preview refresh failed", exc_info=True)


@receiver(post_save, sender="documents.DocumentEdition", dispatch_uid="edition_preview")
def edition_preview(sender, instance, **kwargs):
    try:
        source = (instance.file.name if instance.file else "") or instance.external_url or ""
        _refresh(instance, source, "edition")
    except Exception:  # noqa: BLE001
        logger.info("Document edition preview refresh failed", exc_info=True)
