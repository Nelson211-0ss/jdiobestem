"""Bursaries and their payments, for the dashboard."""

from rest_framework import viewsets

from accounts import policy
from activity.recorder import LoggedViewSetMixin
from api.permissions import ResourcePermission

from .models import Scholarship, ScholarshipPayment
from .serializers import ScholarshipPaymentSerializer, ScholarshipSerializer
from core.exporting import ExportableMixin


class ScopedViewSet(ExportableMixin, LoggedViewSetMixin, viewsets.ModelViewSet):
    """The permission decides whether the action is allowed, the queryset
    decides which rows are in view — the same two layers as everything else."""

    permission_classes = [ResourcePermission]
    resource: str = ""

    def get_queryset(self):
        return policy.scope(self.request.user, super().get_queryset(), self.resource)


class ScholarshipViewSet(ScopedViewSet):
    queryset = (
        Scholarship.objects.select_related("office", "school")
        .prefetch_related("benefits", "payments")
    )
    resource = "scholarships"
    serializer_class = ScholarshipSerializer
    filterset_fields = ["status", "school__level", "country", "office"]
    search_fields = [
        "reference", "student_name", "school__name", "guardian_name",
    ]
    ordering_fields = ["student_name", "school__name", "started_on", "status", "created_at"]
    ordering = ["student_name"]

    def export_detail_tables(self, obj):
        """A bursary report is only useful with the money on the same sheet."""
        payments = obj.payments.select_related("recorded_by").order_by("-paid_on")
        return [
            (
                "Payments to the school",
                [("paid_on", "Date"), ("academic_year", "Year"), ("term", "Term"),
                 ("amount", "Amount"), ("method", "Method"), ("reference", "Reference")],
                [
                    {
                        "paid_on": p.paid_on, "academic_year": p.academic_year, "term": p.term,
                        "amount": f"{p.amount:,.0f}", "method": p.get_method_display(),
                        "reference": p.reference,
                    }
                    for p in payments
                ],
            ),
            (
                "What else the bursary covers",
                [("label", "Benefit"), ("detail", "Detail")],
                [{"label": b.label, "detail": b.detail} for b in obj.benefits.all()],
            ),
        ]


class ScholarshipPaymentViewSet(ScopedViewSet):
    queryset = ScholarshipPayment.objects.select_related("scholarship", "scholarship__school", "recorded_by")
    resource = "scholarship-payments"
    serializer_class = ScholarshipPaymentSerializer
    filterset_fields = ["scholarship", "method", "academic_year"]
    search_fields = [
        "term", "reference", "notes", "scholarship__student_name", "scholarship__school__name",
    ]
    ordering_fields = ["paid_on", "amount", "created_at"]
    ordering = ["-paid_on"]

    def perform_create(self, serializer):
        # Who recorded it comes from the session, never from the client.
        serializer.save(recorded_by=self.request.user)
