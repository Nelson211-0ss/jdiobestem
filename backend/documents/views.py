"""Documents and their editions, for the dashboard."""

from accounts import policy
from api.permissions import ResourcePermission
from activity.recorder import LoggedViewSetMixin
from rest_framework import viewsets

from .models import Document, DocumentEdition
from .serializers import DocumentEditionSerializer, DocumentSerializer


class ScopedViewSet(LoggedViewSetMixin, viewsets.ModelViewSet):
    """Same two layers as every other resource: the permission decides whether
    the action is allowed, the queryset decides which rows are in view."""

    permission_classes = [ResourcePermission]
    resource: str = ""

    def get_queryset(self):
        return policy.scope(self.request.user, super().get_queryset(), self.resource)


class DocumentViewSet(ScopedViewSet):
    # Prefetched because the serializer summarises each document's editions.
    queryset = Document.objects.select_related("office", "owner").prefetch_related("editions")
    resource = "documents"
    serializer_class = DocumentSerializer
    filterset_fields = ["category", "country", "is_archived", "is_public", "office"]
    search_fields = ["title", "description", "notes", "slug"]
    ordering_fields = ["title", "category", "created_at"]
    ordering = ["title"]


class DocumentEditionViewSet(ScopedViewSet):
    queryset = DocumentEdition.objects.select_related("document", "uploaded_by")
    resource = "document-editions"
    serializer_class = DocumentEditionSerializer
    filterset_fields = ["document", "is_current"]
    search_fields = ["version", "summary", "document__title"]
    ordering_fields = ["effective_date", "created_at", "version"]
    ordering = ["-effective_date", "-created_at"]

    def perform_create(self, serializer):
        serializer.save(uploaded_by=self.request.user)
