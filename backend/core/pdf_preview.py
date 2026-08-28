"""
First-page previews for PDFs.

A newsletter and a handbook are PDFs, and a table of file-type chips tells you
far less than a wall of covers does. So the first page is rasterised once, when
the file is attached, and stored beside it as an ordinary image — after that a
PDF row is just another thumbnail and nothing downstream has to know the
difference.

Rendering happens on save and is wrapped throughout: a preview that cannot be
produced leaves the record perfectly usable, so a malformed PDF or a slow
network is never a reason to refuse somebody's upload.
"""

from __future__ import annotations

import io
import logging

import requests  # type: ignore[import-untyped]
from django.conf import settings
from django.core.files.base import ContentFile
from django.core.files.storage import default_storage

logger = logging.getLogger(__name__)

#: Wide enough to read the masthead in a table row and on a retina screen.
PREVIEW_WIDTH = 480

#: A PDF larger than this is not fetched. Newsletters run to a few megabytes;
#: anything far bigger is not something to pull into memory on a save.
MAX_FETCH_BYTES = 40 * 1024 * 1024

FETCH_TIMEOUT = 20


def _absolute(url: str) -> str:
    if url.startswith(("http://", "https://")):
        return url
    return f"{settings.PUBLIC_BASE_URL}/{url.lstrip('/')}"


def load_pdf_bytes(reference: str) -> bytes | None:
    """
    The PDF's contents, from wherever it is kept.

    Uploads live in object storage and are addressed by URL; a file already
    sitting under the website's /public folder is a path this process cannot
    read from disk, so it is fetched over HTTP like any other client would.
    """
    if not reference:
        return None

    # Object storage first: cheaper and does not depend on the site being up.
    try:
        if not reference.startswith(("http://", "https://")) and default_storage.exists(reference):
            with default_storage.open(reference, "rb") as handle:
                return handle.read(MAX_FETCH_BYTES + 1)
    except Exception:  # noqa: BLE001 — fall through to fetching it
        pass

    try:
        response = requests.get(_absolute(reference), timeout=FETCH_TIMEOUT, stream=True)
        if response.status_code >= 400:
            logger.info("Preview source %s responded %s", reference, response.status_code)
            return None

        declared = int(response.headers.get("Content-Length") or 0)
        if declared > MAX_FETCH_BYTES:
            logger.info("Preview source %s is too large to render (%s bytes)", reference, declared)
            return None

        data = b""
        for chunk in response.iter_content(64 * 1024):
            data += chunk
            if len(data) > MAX_FETCH_BYTES:
                logger.info("Preview source %s exceeded the size limit while reading", reference)
                return None
        return data
    except Exception:  # noqa: BLE001
        logger.info("Could not read %s for a preview", reference, exc_info=True)
        return None


def render_first_page(pdf_bytes: bytes) -> bytes | None:
    """The first page as PNG bytes, or None if it cannot be rendered."""
    if not pdf_bytes:
        return None
    try:
        import pymupdf  # imported lazily so the app still starts without it

        with pymupdf.open(stream=pdf_bytes, filetype="pdf") as document:
            if document.page_count == 0:
                return None
            page = document.load_page(0)
            # Scale from the page's own width rather than a fixed zoom, so A4
            # and US Letter both come out the intended size.
            zoom = PREVIEW_WIDTH / max(page.rect.width, 1)
            pixmap = page.get_pixmap(matrix=pymupdf.Matrix(zoom, zoom), alpha=False)
            return pixmap.tobytes("png")
    except Exception:  # noqa: BLE001 — a preview is never worth an exception
        logger.info("Could not render a PDF preview", exc_info=True)
        return None


def build_preview(reference: str, key_prefix: str) -> str:
    """
    Render `reference` and store the result. Returns the stored image's URL,
    or "" if no preview could be made.
    """
    if not reference or not reference.lower().split("?")[0].endswith(".pdf"):
        return ""

    image = render_first_page(load_pdf_bytes(reference))
    if not image:
        return ""

    try:
        import hashlib

        digest = hashlib.sha1(reference.encode("utf-8")).hexdigest()[:16]
        name = default_storage.save(
            f"previews/{key_prefix}-{digest}.png", ContentFile(image)
        )
        return default_storage.url(name)
    except Exception:  # noqa: BLE001
        logger.info("Could not store a PDF preview for %s", reference, exc_info=True)
        return ""
