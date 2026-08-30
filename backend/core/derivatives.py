"""
Small copies of uploaded images.

A table showing twenty receipts should not pull twenty full-resolution
photographs across a Ugandan mobile connection — a 6 MB phone snap is 6 MB
whether it is displayed at 44 pixels or 1400. So every uploaded image gets a
thumbnail written beside it, and the interface asks for that instead.

The thumbnail's name is derived from the original's, not stored: `abc.jpg`
becomes `abc-thumb.webp`. That means nothing has to remember the pairing — the
browser can work out the thumbnail's address from the file's own, and fall back
to the original if it is not there, which is what happens for everything
uploaded before this existed.
"""

from __future__ import annotations

import io
import logging
import mimetypes
import posixpath

from django.core.files.base import ContentFile
from django.core.files.storage import default_storage

logger = logging.getLogger(__name__)

# Python does not know webp on every platform, and storage derives the stored
# object's Content-Type from this. Without it the thumbnail is served as
# application/octet-stream, which browsers sniff around but proxies and
# download dialogs do not.
mimetypes.add_type("image/webp", ".webp")

#: Wide enough for a retina thumbnail and a comfortable list row, small enough
#: that a page of them costs less than one original.
THUMB_WIDTH = 480

#: Formats worth deriving from. A PDF has no thumbnail without rendering it,
#: which is a different job (see core/pdf_preview.py).
THUMBABLE = {".jpg", ".jpeg", ".png", ".webp", ".gif"}

THUMB_SUFFIX = "-thumb.webp"


def thumb_name(name: str) -> str:
    """The derived name for a stored file, by convention rather than lookup."""
    stem, _ext = posixpath.splitext(name)
    return f"{stem}{THUMB_SUFFIX}"


def make_thumbnail(name: str, data: bytes) -> str:
    """
    Write a thumbnail beside `name`. Returns its stored name, or "" if none was
    made — an unsupported format, or an image too broken to open.

    Never raises: a missing thumbnail costs a little bandwidth, while a failed
    upload costs somebody their work.
    """
    _stem, ext = posixpath.splitext(name.lower())
    if ext not in THUMBABLE:
        return ""

    try:
        from PIL import Image

        with Image.open(io.BytesIO(data)) as image:
            # A phone photograph carries its orientation in EXIF rather than in
            # the pixels; without this, portrait shots come out on their side.
            try:
                from PIL import ImageOps

                image = ImageOps.exif_transpose(image)
            except Exception:  # noqa: BLE001
                pass

            if image.width <= THUMB_WIDTH:
                # Already small. Deriving a copy would cost storage and save
                # nothing.
                return ""

            image = image.convert("RGB")
            height = round(image.height * (THUMB_WIDTH / image.width))
            image = image.resize((THUMB_WIDTH, height), Image.LANCZOS)

            buffer = io.BytesIO()
            image.save(buffer, format="WEBP", quality=82, method=4)
            buffer.seek(0)

        target = thumb_name(name)
        # Overwrite rather than let storage suffix a duplicate: the name is a
        # convention the browser relies on, so it has to be exactly this.
        if default_storage.exists(target):
            default_storage.delete(target)
        return default_storage.save(target, ContentFile(buffer.read()))
    except Exception:  # noqa: BLE001 — a thumbnail is never worth a failed upload
        logger.info("Could not derive a thumbnail for %s", name, exc_info=True)
        return ""
