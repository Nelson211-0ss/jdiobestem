"""Vacancies and applications: the dashboard's, and the careers page's."""

from accounts import policy
from activity.models import ActivityLog
from activity.recorder import LoggedViewSetMixin, record
from api.notifications import send_notification
from api.permissions import IsStaff, ResourcePermission
from rest_framework import status, viewsets
from rest_framework.decorators import api_view, permission_classes
from rest_framework.generics import ListAPIView
from rest_framework.response import Response

import posixpath
import uuid

from django.conf import settings
from django.core.files.storage import default_storage
from rest_framework.decorators import parser_classes
from rest_framework.parsers import MultiPartParser

from .models import JobApplication, JobPosting

#: What a CV may be sent as. Narrower than the dashboard's list on purpose —
#: this endpoint is open to anyone who can reach the careers page.
ALLOWED_CV_TYPES = {
    "application/pdf": ".pdf",
    "application/msword": ".doc",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document": ".docx",
    "image/jpeg": ".jpg",
    "image/png": ".png",
}
from .serializers import (
    JobApplicationSerializer,
    JobPostingSerializer,
    PublicApplicationSerializer,
)


class JobPostingViewSet(LoggedViewSetMixin, viewsets.ModelViewSet):
    permission_classes = [ResourcePermission]
    resource = "job-postings"
    queryset = JobPosting.objects.select_related("office").prefetch_related("applications")
    serializer_class = JobPostingSerializer
    filterset_fields = ["is_open", "employment_type", "country", "office"]
    search_fields = ["title", "summary", "description"]
    ordering_fields = ["order", "posted_on", "title"]
    ordering = ["order", "-posted_on"]

    def get_queryset(self):
        return policy.scope(self.request.user, super().get_queryset(), self.resource)


class JobApplicationViewSet(LoggedViewSetMixin, viewsets.ModelViewSet):
    permission_classes = [ResourcePermission]
    resource = "job-applications"
    queryset = JobApplication.objects.select_related("posting", "decided_by")
    serializer_class = JobApplicationSerializer
    filterset_fields = ["stage", "posting", "country"]
    search_fields = ["name", "email", "posting_title", "notes"]
    ordering_fields = ["created_at", "name", "stage"]
    ordering = ["-created_at"]

    def get_queryset(self):
        return policy.scope(self.request.user, super().get_queryset(), self.resource)

    def perform_update(self, serializer):
        previous = JobApplication.objects.filter(pk=serializer.instance.pk).values_list(
            "stage", flat=True
        ).first()

        # Who decided is recorded from the request rather than typed, so it is
        # always the person who actually moved it.
        moving_to_decision = (
            serializer.validated_data.get("stage") in JobApplication.CLOSED_STAGES
        )
        if moving_to_decision:
            serializer.save(decided_by=self.request.user)
        else:
            super().perform_update(serializer)
            return

        instance = serializer.instance
        if previous != instance.stage:
            record(
                self.request,
                action=ActivityLog.Action.UPDATE,
                resource=self.resource,
                instance=instance,
                changes={"stage": {"from": previous, "to": instance.stage}},
                detail=f"Moved {instance.name} to {instance.get_stage_display()}",
            )


# ---------------------------------------------------------------- public


class OpenPostingList(ListAPIView):
    """What the careers page shows. Closed postings are simply absent."""

    queryset = JobPosting.objects.filter(is_open=True).select_related("office")
    pagination_class = None

    def list(self, request, *args, **kwargs):
        return Response(
            [
                {
                    "slug": p.slug,
                    "title": p.title,
                    "summary": p.summary,
                    "description": p.description,
                    "responsibilities": p.responsibility_list,
                    "requirements": p.requirement_list,
                    "employment_type": p.get_employment_type_display(),
                    "country": p.country,
                    "office": p.office.name if p.office else "",
                    "posted_on": p.posted_on.isoformat() if p.posted_on else "",
                }
                for p in self.get_queryset()
            ]
        )


@api_view(["POST"])
def apply(request):
    """
    An application from the careers page.

    Reached through the website's own route handler with the service key, so
    the endpoint is not open to the internet. Everything a reviewer owns —
    stage, notes, the decision — is refused here by the serializer.
    """
    data = request.data.copy()

    # The site sends the slug it showed the applicant. Resolving it here rather
    # than trusting an id means a posting cannot be applied for by guessing a
    # number, and a closed one is refused by the serializer.
    slug = str(data.pop("slug", [""])[0] if isinstance(data.get("slug"), list) else data.pop("slug", "") or "")
    if slug and not data.get("posting"):
        posting = JobPosting.objects.filter(slug=slug, is_open=True).first()
        if posting is None:
            return Response(
                {"detail": "That position is no longer open."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        data["posting"] = posting.pk

    serializer = PublicApplicationSerializer(data=data)
    serializer.is_valid(raise_exception=True)
    application = serializer.save()

    # Relayed to the inbox as well as stored, the way the other forms are: the
    # record is the point, but somebody still has to know it arrived.
    send_notification(
        subject=f"Job application: {application.posting_title or 'general'}",
        lines=[
            ("Name", application.name),
            ("Email", application.email),
            ("Phone", application.phone),
            ("Position", application.posting_title),
            ("CV", application.cv),
            ("Covering letter", application.cover_letter),
        ],
        reply_to=application.email,
    )

    return Response({"ok": True}, status=status.HTTP_201_CREATED)


@api_view(["POST"])
@parser_classes([MultiPartParser])
def upload_cv(request):
    """
    An applicant's CV.

    Separate from the dashboard's upload endpoint, which is staff-only and
    should stay that way: opening it so the public could attach a CV would open
    it for everything else too. This one writes to `cv/` and nowhere else, and
    accepts only the file types a CV actually comes in.
    """
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
    extension = ALLOWED_CV_TYPES.get(content_type)
    if not extension:
        return Response(
            {"detail": "Send a CV as a PDF, a Word document, or an image."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    # A generated name: an applicant's filename is not something to trust into
    # a storage key, and two people called cv.pdf must not collide.
    key = posixpath.join("cv", f"{uuid.uuid4().hex}{extension}")
    saved = default_storage.save(key, uploaded)
    return Response({"url": default_storage.url(saved), "path": saved})
