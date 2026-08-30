"""Bursaries and their payments, for the dashboard."""

from rest_framework import viewsets

from accounts import policy
from activity.recorder import LoggedViewSetMixin
from api.permissions import ResourcePermission

from .models import Scholarship, ScholarshipPayment
from .serializers import ScholarshipPaymentSerializer, ScholarshipSerializer


class ScopedViewSet(LoggedViewSetMixin, viewsets.ModelViewSet):
    """The permission decides whether the action is allowed, the queryset
    decides which rows are in view — the same two layers as everything else."""

    permission_classes = [ResourcePermission]
    resource: str = ""

    def get_queryset(self):
        return policy.scope(self.request.user, super().get_queryset(), self.resource)


class ScholarshipViewSet(ScopedViewSet):
    queryset = (
        Scholarship.objects.select_related("office", "managed_by")
        .prefetch_related("benefits", "payments")
    )
    resource = "scholarships"
    serializer_class = ScholarshipSerializer
    filterset_fields = ["status", "school_level", "country", "office", "sponsor_type"]
    search_fields = [
        "reference", "student_name", "school_name", "sponsor_name", "guardian_name", "notes",
    ]
    ordering_fields = ["student_name", "school_name", "started_on", "status", "created_at"]
    ordering = ["student_name"]


class ScholarshipPaymentViewSet(ScopedViewSet):
    queryset = ScholarshipPayment.objects.select_related("scholarship", "recorded_by")
    resource = "scholarship-payments"
    serializer_class = ScholarshipPaymentSerializer
    filterset_fields = ["scholarship", "method", "academic_year"]
    search_fields = [
        "term", "reference", "notes", "scholarship__student_name", "scholarship__school_name",
    ]
    ordering_fields = ["paid_on", "amount", "created_at"]
    ordering = ["-paid_on"]

    def perform_create(self, serializer):
        # Who recorded it comes from the session, never from the client.
        serializer.save(recorded_by=self.request.user)
