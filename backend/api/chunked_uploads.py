"""
Uploads that survive a dropped connection.

A single POST of a 12 MB photograph over a mobile connection is all-or-nothing:
if the link drops at 90% the bytes are gone and the person starts again. Here
the file is sent in pieces, each piece is stored as soon as it lands, and the
browser can ask which pieces already arrived and send only the rest.

The design is deliberately dull. Chunks are ordinary objects in the same
storage, under `incoming/<id>/<index>`; finishing concatenates them in order,
writes the real file, and deletes the parts. No database rows, no background
worker, nothing to clean up if a browser is closed mid-upload beyond objects
that a lifecycle rule can sweep.

The size ceiling is still enforced, now against the running total rather than
one request, so the limit cannot be walked past by sending many small pieces.
"""

from __future__ import annotations

import posixpath
import re
import uuid

from django.conf import settings
from django.core.files.base import ContentFile
from django.core.files.storage import default_storage
from rest_framework import status
from rest_framework.decorators import api_view, parser_classes, permission_classes
from rest_framework.parsers import MultiPartParser
from rest_framework.response import Response

from activity.models import ActivityLog
from activity.recorder import record
from core.derivatives import make_thumbnail

from .permissions import IsStaff
from .uploads import FOLDERS

#: Upload ids are ours, but they arrive from the browser and address storage
#: paths, so they are checked rather than trusted.
UPLOAD_ID_RE = re.compile(r"^[0-9a-f]{32}$")

STAGING = "incoming"


def _part_path(upload_id: str, index: int) -> str:
    return posixpath.join(STAGING, upload_id, f"{index:05d}")


def _parts_present(upload_id: str) -> list[int]:
    """Which pieces are already stored. This is what makes a resume possible."""
    try:
        _dirs, files = default_storage.listdir(posixpath.join(STAGING, upload_id))
    except Exception:  # noqa: BLE001 — nothing uploaded yet is not an error
        return []
    out = []
    for name in files:
        stem = posixpath.splitext(name)[0]
        if stem.isdigit():
            out.append(int(stem))
    return sorted(out)


@api_view(["POST"])
@permission_classes([IsStaff])
def begin(request):
    """Start an upload. Returns the id every subsequent request quotes."""
    folder = FOLDERS.get(request.data.get("folder", "misc"), "misc")
    return Response({"upload_id": uuid.uuid4().hex, "folder": folder, "received": []})


@api_view(["GET"])
@permission_classes([IsStaff])
def status_for(request, upload_id):
    """
    Which pieces arrived. The browser calls this before resuming, so a retry
    after a dropped connection sends only what is missing.
    """
    if not UPLOAD_ID_RE.match(upload_id):
        return Response({"detail": "Unknown upload."}, status=status.HTTP_400_BAD_REQUEST)
    return Response({"upload_id": upload_id, "received": _parts_present(upload_id)})


@api_view(["POST"])
@parser_classes([MultiPartParser])
@permission_classes([IsStaff])
def part(request, upload_id):
    """Store one piece. Safe to send the same index twice — the last wins."""
    if not UPLOAD_ID_RE.match(upload_id):
        return Response({"detail": "Unknown upload."}, status=status.HTTP_400_BAD_REQUEST)

    chunk = request.FILES.get("chunk")
    if chunk is None:
        return Response({"detail": "No chunk was sent."}, status=status.HTTP_400_BAD_REQUEST)

    try:
        index = int(request.data.get("index", ""))
    except (TypeError, ValueError):
        return Response({"detail": "A chunk needs its index."}, status=status.HTTP_400_BAD_REQUEST)
    if index < 0 or index > 10_000:
        return Response({"detail": "Chunk index out of range."}, status=status.HTTP_400_BAD_REQUEST)

    # The ceiling applies to the whole upload, not to one request, or it could
    # be stepped past a chunk at a time.
    already = 0
    for i in _parts_present(upload_id):
        try:
            already += default_storage.size(_part_path(upload_id, i))
        except Exception:  # noqa: BLE001
            continue
    if already + chunk.size > settings.UPLOAD_MAX_BYTES:
        limit_mb = settings.UPLOAD_MAX_BYTES / (1024 * 1024)
        _discard(upload_id)
        return Response(
            {"detail": f"That file is larger than the {limit_mb:.0f} MB limit."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    path = _part_path(upload_id, index)
    if default_storage.exists(path):
        default_storage.delete(path)
    default_storage.save(path, chunk)

    return Response({"received": _parts_present(upload_id)})


@api_view(["POST"])
@permission_classes([IsStaff])
def finish(request, upload_id):
    """
    Join the pieces into the real file.

    Refuses if any piece is missing rather than writing a truncated file: a
    corrupt receipt that looks fine in a list is worse than an upload that
    failed loudly.
    """
    if not UPLOAD_ID_RE.match(upload_id):
        return Response({"detail": "Unknown upload."}, status=status.HTTP_400_BAD_REQUEST)

    try:
        total = int(request.data.get("total", ""))
    except (TypeError, ValueError):
        return Response({"detail": "Say how many chunks there were."}, status=status.HTTP_400_BAD_REQUEST)

    present = _parts_present(upload_id)
    missing = [i for i in range(total) if i not in present]
    if missing:
        return Response(
            {"detail": "Some pieces did not arrive.", "missing": missing[:50]},
            status=status.HTTP_409_CONFLICT,
        )

    content_type = str(request.data.get("content_type", "")).split(";")[0].strip().lower()
    extension = settings.UPLOAD_ALLOWED_TYPES.get(content_type)
    if not extension:
        _discard(upload_id)
        allowed = ", ".join(sorted(settings.UPLOAD_ALLOWED_TYPES))
        return Response(
            {"detail": f"That file type is not accepted. Allowed: {allowed}."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    folder = FOLDERS.get(request.data.get("folder", "misc"), "misc")

    payload = bytearray()
    for i in range(total):
        with default_storage.open(_part_path(upload_id, i), "rb") as handle:
            payload += handle.read()

    key = posixpath.join(folder, f"{uuid.uuid4().hex}{extension}")
    saved = default_storage.save(key, ContentFile(bytes(payload)))
    thumb = make_thumbnail(saved, bytes(payload))
    _discard(upload_id)

    record(
        request,
        action=ActivityLog.Action.UPLOAD,
        resource=folder,
        object_label=str(request.data.get("filename", ""))[:300],
        detail=f"Uploaded {saved} ({len(payload)} bytes, {total} parts)",
    )

    return Response(
        {
            "path": saved,
            "url": default_storage.url(saved),
            "thumb_url": default_storage.url(thumb) if thumb else "",
            "size": len(payload),
        }
    )


def _discard(upload_id: str) -> None:
    """Remove the staged pieces. Best effort — leftovers cost only storage."""
    for i in _parts_present(upload_id):
        try:
            default_storage.delete(_part_path(upload_id, i))
        except Exception:  # noqa: BLE001
            continue
