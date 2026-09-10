"""
`GET /api/admin/<resource>/export/` for any dashboard ViewSet.

Mixed into the ViewSet rather than written per resource, so every table in the
dashboard exports the same way and a new resource gets it for nothing.

Three properties matter and all three come from reusing the list machinery
instead of re-implementing it:

* Access. The action is a GET, so ResourcePermission maps it to `view` — a
  person who may not see a resource cannot export it either.
* Scope. It calls the ViewSet's own get_queryset(), so a Uganda coordinator
  exports Uganda's rows and nobody else's.
* Agreement with the screen. It runs the same filter backends, and takes its
  columns from the table the person was looking at, so the file cannot show a
  different set of records than the page it was downloaded from.
"""

from __future__ import annotations

import io
import logging
from datetime import datetime
from urllib.parse import unquote

import pymupdf
import requests
from django.conf import settings
from PIL import Image, ImageOps

from django.http import HttpResponse
from rest_framework.decorators import action
from rest_framework.response import Response

from core.reports import (
    Report,
    RecordReport,
    _lookup,
    record_to_csv,
    record_to_pdf,
    to_csv,
    to_pdf,
)

#: Enough for any real report, low enough that a bad filter cannot spin for
#: minutes building a thousand-page document.
MAX_ROWS = 5000

#: Query parameters that steer the export itself rather than the queryset.
#: `format` is DRF's own content-negotiation override — it never reaches this
#: action, so the output format is asked for as `fmt`.
CONTROL_PARAMS = {
    "fmt", "format", "columns", "fields", "title", "page", "page_size", "limit", "offset",
}


def _columns(request, rows: list[dict]) -> list[tuple[str, str]]:
    """
    `columns=name:Heading,other:Other heading`.

    The dashboard sends the columns it is displaying, so the export matches the
    screen. Without it — someone calling the API directly — every serialized
    field is used, which is the only honest default.
    """
    raw = request.query_params.get("columns", "").strip()
    if raw:
        parsed: list[tuple[str, str]] = []
        for part in raw.split(","):
            if not part.strip():
                continue
            name, _, label = part.partition(":")
            name = name.strip()
            if name:
                parsed.append((name, unquote(label).strip() or name.replace("_", " ").title()))
        if parsed:
            return parsed

    keys = list(rows[0].keys()) if rows else []
    return [(k, k.replace("_", " ").capitalize()) for k in keys]


logger = logging.getLogger(__name__)

#: A phone photograph of a receipt is routinely 8000px and ten megabytes. It is
#: fetched at full size, then reduced — a report needs a legible receipt, not an
#: archival scan, and embedding the original would produce a file nobody can
#: email.
ATTACHMENT_MAX_BYTES = 30_000_000
ATTACHMENT_TIMEOUT = 10
ATTACHMENT_MAX_EDGE = 1600
ATTACHMENT_LIMIT = 12


def _own_media(url: str) -> bool:
    """
    Only files the Foundation itself serves.

    Without this the export would fetch whatever URL happened to be stored in a
    record, which turns a report into a way of making the server issue requests
    on someone else's behalf.
    """
    base = (getattr(settings, "R2_PUBLIC_URL", "") or "").rstrip("/")
    if base and url.startswith(base + "/"):
        return True
    media = str(getattr(settings, "MEDIA_URL", "") or "")
    return bool(media) and media not in ("/", "") and url.startswith(media)


def _as_report_image(data: bytes) -> bytes | None:
    """
    Whatever was uploaded, as a modest JPEG.

    A PDF receipt becomes its first page. Everything else goes through Pillow
    rather than PyMuPDF for one reason: a receipt is usually a phone photograph,
    and phones record orientation in EXIF rather than rotating the pixels. Read
    without honouring that, half of them come out on their side.
    """
    try:
        if data[:4] == b"%PDF":
            doc = pymupdf.open(stream=data, filetype="pdf")
            page = doc[0].get_pixmap(dpi=140)
            doc.close()
            return page.tobytes("jpeg", jpg_quality=80)

        image = Image.open(io.BytesIO(data))
        image = ImageOps.exif_transpose(image)
        if image.mode != "RGB":
            image = image.convert("RGB")
        image.thumbnail((ATTACHMENT_MAX_EDGE, ATTACHMENT_MAX_EDGE))
        out = io.BytesIO()
        image.save(out, "JPEG", quality=75, optimize=True)
        return out.getvalue()
    except Exception:
        logger.info("Report attachment could not be read", exc_info=True)
        return None


def _fetch_attachment(url) -> bytes | None:
    if not isinstance(url, str) or not url.startswith(("http://", "https://")):
        return None
    if not _own_media(url):
        return None
    try:
        response = requests.get(url, timeout=ATTACHMENT_TIMEOUT, stream=True)
        if response.status_code != 200:
            return None
        chunks, total = [], 0
        for chunk in response.iter_content(65536):
            total += len(chunk)
            if total > ATTACHMENT_MAX_BYTES:
                return None
            chunks.append(chunk)
    except requests.RequestException:
        # A slow or missing attachment must not cost the whole report.
        logger.info("Report attachment could not be fetched: %s", url)
        return None
    return _as_report_image(b"".join(chunks))


def _spec(raw: str, fallback: list[str]) -> list[tuple[str, str]]:
    """Parse `name:Heading,other:Other` into pairs, falling back to bare keys."""
    parsed: list[tuple[str, str]] = []
    for part in (raw or "").split(","):
        if not part.strip():
            continue
        name, _, label = part.partition(":")
        name = name.strip()
        if name:
            parsed.append((name, unquote(label).strip() or name.replace("_", " ").title()))
    if parsed:
        return parsed
    return [(k, k.replace("_", " ").capitalize()) for k in fallback]


def _applied_filters(request) -> list[tuple[str, str]]:
    """The filters in force, so a reader knows what the figures exclude."""
    out = []
    for key in sorted(request.query_params):
        if key in CONTROL_PARAMS:
            continue
        value = ", ".join(v for v in request.query_params.getlist(key) if v)
        if value:
            out.append((key.replace("_", " "), value))
    return out


class ExportableMixin:
    """Adds the export action. The ViewSet must already define `resource`."""

    export_max_rows = MAX_ROWS

    def export_slug(self, request) -> str:
        """What the downloaded file is named after. The resource key by
        default; boards override it, since every board shares one key."""
        return str(getattr(self, "resource", "report")).strip("-") or "report"

    def export_title(self, request) -> str:
        supplied = (request.query_params.get("title") or "").strip()
        if supplied:
            return supplied[:120]
        model = getattr(getattr(self, "queryset", None), "model", None)
        if model is not None:
            return str(model._meta.verbose_name_plural).title()
        return str(getattr(self, "resource", "Report")).replace("-", " ").title()

    def export_attachments(self, pairs, tables) -> list[tuple[str, bytes]]:
        """
        Receipts and other uploads, fetched and shown on the report.

        Scanned out of the values rather than declared per resource, so a
        receipt column on any page — or on a bursary's payments — ends up on
        the page without every ViewSet having to say so.
        """
        found: list[tuple[str, bytes]] = []
        seen: set[str] = set()
        #: Values that became pictures. Printing the URL as well would put a
        #: hundred characters of storage path above the thing it points at.
        self.embedded_values: set[str] = getattr(self, "embedded_values", set())

        def consider(label, value):
            if len(found) >= ATTACHMENT_LIMIT:
                return
            # A page record's columns arrive as one nested object when no
            # explicit field list is given, so walk into it rather than only
            # looking at the top level.
            if isinstance(value, dict):
                for nested in value.values():
                    consider(label, nested)
                return
            if isinstance(value, (list, tuple)):
                for nested in value:
                    consider(label, nested)
                return
            if not isinstance(value, str) or value in seen:
                return
            seen.add(value)
            image = _fetch_attachment(value)
            if image:
                found.append((label, image))
                self.embedded_values.add(value)

        for label, value in pairs:
            consider(label, value)
        for heading, columns, rows in tables:
            for row in rows:
                for name, label in columns:
                    consider(f"{heading} — {label}", _lookup(row, name))
        return found

    def export_detail_tables(self, obj) -> list[tuple[str, list[tuple[str, str]], list[dict]]]:
        """
        Rows belonging to this record, put on the same sheet.

        A bursary on its own is a commitment; a bursary with every payment made
        under it is a report somebody can act on. Resources that have such rows
        override this — the default is that a record stands alone.
        """
        return []

    @action(detail=True, methods=["get"], url_path="export")
    def export_record(self, request, *args, **kwargs):
        """One record as a document: label and value, then anything under it."""
        fmt = (request.query_params.get("fmt") or "pdf").lower()
        if fmt not in ("csv", "pdf"):
            return Response({"detail": "fmt must be csv or pdf."}, status=400)

        obj = self.get_object()
        data = self.get_serializer(obj).data
        skip = {"id", "changes", "change_summary"}
        pairs_spec = _spec(
            request.query_params.get("fields", ""),
            [k for k in data.keys() if k not in skip],
        )

        # _lookup, not data.get: a page record keeps its columns in one JSON
        # blob, so `values.text8` is a path and a plain get misses it.
        pairs = [(label, _lookup(data, name)) for name, label in pairs_spec]
        tables = self.export_detail_tables(obj)
        # Only worth fetching for something that can show them.
        images = self.export_attachments(pairs, tables) if fmt == "pdf" else []
        shown_as_pictures = getattr(self, "embedded_values", set())
        # isinstance first: a serialized value can be a list or a dict, and
        # membership of a set is only defined for something hashable.
        def without_urls(value):
            """Replace anything already on the page as a picture."""
            if isinstance(value, str):
                return "Shown below" if value in shown_as_pictures else value
            if isinstance(value, (list, tuple)) and value:
                kept = [v for v in value if not (isinstance(v, str) and v in shown_as_pictures)]
                if not kept:
                    return f"{len(value)} shown below" if len(value) > 1 else "Shown below"
                return kept
            return value

        pairs = [(label, without_urls(value)) for label, value in pairs]

        person = getattr(request, "user", None)
        report = RecordReport(
            title=self.export_title(request),
            heading=str(obj)[:160],
            pairs=pairs,
            tables=tables,
            images=images,
            generated_by=(person.get_full_name() or person.username) if person else "",
            generated_at=datetime.now(),
        )

        slug = self.export_slug(request)
        filename = f"{slug}-{obj.pk}-{report.generated_at.strftime('%Y-%m-%d')}.{fmt}"
        payload, content_type = (
            (record_to_csv(report), "text/csv; charset=utf-8")
            if fmt == "csv"
            else (record_to_pdf(report), "application/pdf")
        )
        response = HttpResponse(payload, content_type=content_type)
        response["Content-Disposition"] = f'attachment; filename="{filename}"'
        response["Content-Length"] = str(len(payload))
        return response

    @action(detail=False, methods=["get"], url_path="export")
    def export(self, request, *args, **kwargs):
        # Deliberately not `format`: DRF reserves that for content negotiation
        # and answers 404 for a suffix it has no renderer for, so the action
        # would never be reached.
        fmt = (request.query_params.get("fmt") or "csv").lower()
        if fmt not in ("csv", "pdf"):
            return Response({"detail": "fmt must be csv or pdf."}, status=400)

        queryset = self.filter_queryset(self.get_queryset())
        total = queryset.count()
        rows = self.get_serializer(queryset[: self.export_max_rows], many=True).data

        person = getattr(request, "user", None)
        report = Report(
            title=self.export_title(request),
            columns=_columns(request, rows),
            rows=rows,
            generated_by=(person.get_full_name() or person.username) if person else "",
            generated_at=datetime.now(),
            filters=_applied_filters(request),
            total=total,
            note=(
                f"Showing the first {self.export_max_rows:,} of {total:,} records. "
                "Narrow the filters to export the rest."
                if total > self.export_max_rows
                else ""
            ),
        )

        slug = self.export_slug(request)
        stamp = report.generated_at.strftime("%Y-%m-%d")
        filename = f"{slug}-{stamp}.{fmt}"

        if fmt == "csv":
            payload, content_type = to_csv(report), "text/csv; charset=utf-8"
        else:
            payload, content_type = to_pdf(report), "application/pdf"

        response = HttpResponse(payload, content_type=content_type)
        response["Content-Disposition"] = f'attachment; filename="{filename}"'
        response["Content-Length"] = str(len(payload))
        return response
