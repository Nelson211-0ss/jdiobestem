"""
File uploads for the dashboard.

Everything goes to whatever `STORAGES["default"]` is — Cloudflare R2 in
production, the local filesystem when no R2 credentials are configured — so
this endpoint does not know or care which is in use.

Validation is server-side. The browser's Content-Type header is a claim, not a
fact, so the extension is derived from the allow-list rather than taken from the
filename, and the size is checked against the bytes actually received.
"""

import posixpath
import uuid

from django.conf import settings
from django.core.files.storage import default_storage
from core.derivatives import make_thumbnail

from activity.models import ActivityLog
from activity.recorder import record
from rest_framework import status
from rest_framework.decorators import api_view, parser_classes, permission_classes
from rest_framework.parsers import MultiPartParser
from rest_framework.response import Response

from .permissions import IsStaff

#: Where each kind of upload lands, so the bucket does not become one flat heap.
# Anything not listed here lands in misc/, so a folder used by the dashboard
# but missing from this map quietly loses track of where its files went.
FOLDERS = {
    "news": "news",
    "team": "team",
    "magazine": "magazine",
    "newsletter": "newsletter",
    "documents": "documents",
    "cv": "cv",
    "receipts": "receipts",
    "programmes": "programmes",
    "misc": "misc",
}


@api_view(["POST"])
@permission_classes([IsStaff])
@parser_classes([MultiPartParser])
def upload(request):
    uploaded = request.FILES.get("file")
    if not uploaded:
        return Response({"detail": "No file was sent."}, status=status.HTTP_400_BAD_REQUEST)

    if uploaded.size > settings.UPLOAD_MAX_BYTES:
        limit_mb = settings.UPLOAD_MAX_BYTES / (1024 * 1024)
        return Response(
            {"detail": f"That file is larger than the {limit_mb:.0f} MB limit."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    content_type = (uploaded.content_type or "").split(";")[0].strip().lower()
    extension = settings.UPLOAD_ALLOWED_TYPES.get(content_type)
    if not extension:
        allowed = ", ".join(sorted(settings.UPLOAD_ALLOWED_TYPES))
        return Response(
            {"detail": f"That file type is not accepted. Allowed: {allowed}."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    folder = FOLDERS.get(request.data.get("folder", "misc"), "misc")

    # A generated name, not the uploaded one: user-supplied filenames bring
    # path separators, collisions, and unicode surprises with them.
    key = posixpath.join(folder, f"{uuid.uuid4().hex}{extension}")
    # Read once: the file is needed for storage and again for the thumbnail,
    # and a Django UploadedFile cannot be rewound reliably after saving.
    payload = uploaded.read()
    uploaded.seek(0)
    saved = default_storage.save(key, uploaded)
    thumb = make_thumbnail(saved, payload)

    # Files land in object storage that outlives the record referencing them,
    # so who put one there is worth knowing.
    record(
        request,
        action=ActivityLog.Action.UPLOAD,
        resource=folder,
        object_label=getattr(uploaded, "name", "")[:300],
        detail=f"Uploaded {saved} ({uploaded.size} bytes)",
    )

    return Response(
        {
            "path": saved,
            "url": default_storage.url(saved),
            # Empty when the file is not an image, or already small enough that
            # a copy would save nothing. The browser falls back to `url`.
            "thumb_url": default_storage.url(thumb) if thumb else "",
            "size": uploaded.size,
            "content_type": content_type,
        },
        status=status.HTTP_201_CREATED,
    )
