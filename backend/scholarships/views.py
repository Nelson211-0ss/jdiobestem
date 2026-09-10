"""Bursaries and their payments, for the dashboard."""

from rest_framework import viewsets

from accounts import policy
from activity.recorder import LoggedViewSetMixin
from api.permissions import ResourcePermission

from .models import Scholarship, ScholarshipPayment, ScholarshipTerm
from .serializers import (
    ScholarshipPaymentSerializer,
    ScholarshipSerializer,
    ScholarshipTermSerializer,
)
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
        payments = obj.payments.select_related("recorded_by", "term").order_by("-paid_on")
        return [
            (
                "Terms and what is owed",
                [("term", "Term"), ("starts", "Begins"), ("ends", "Ends"),
                 ("due", "Fees due"), ("paid", "Paid"), ("outstanding", "Outstanding")],
                [
                    {
                        "term": str(t), "starts": t.starts_on, "ends": t.ends_on,
                        "due": f"{t.due:,.0f}", "paid": f"{t.paid:,.0f}",
                        "outstanding": f"{t.outstanding:,.0f}" if t.outstanding else "Settled",
                    }
                    for t in obj.terms.all()
                ],
            ),
            (
                "Payments to the school",
                [("paid_on", "Date"), ("term", "Term"), ("amount", "Amount"),
                 ("method", "Method"), ("reference", "Reference"), ("receipt", "Receipt")],
                [
                    {
                        "paid_on": p.paid_on, "term": str(p.term) if p.term_id else "",
                        "amount": f"{p.amount:,.0f}", "method": p.get_method_display(),
                        "reference": p.reference, "receipt": p.receipt,
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


class ScholarshipTermViewSet(ScopedViewSet):
    queryset = ScholarshipTerm.objects.select_related("scholarship", "scholarship__school")
    resource = "scholarship-terms"
    serializer_class = ScholarshipTermSerializer
    filterset_fields = ["scholarship", "academic_year"]
    search_fields = ["label", "academic_year", "scholarship__student_name"]
    ordering_fields = ["starts_on", "ends_on", "label"]
    ordering = ["-starts_on"]


class ScholarshipPaymentViewSet(ScopedViewSet):
    queryset = ScholarshipPayment.objects.select_related(
        "scholarship", "scholarship__school", "term", "recorded_by"
    )
    resource = "scholarship-payments"
    serializer_class = ScholarshipPaymentSerializer
    filterset_fields = ["scholarship", "method", "term"]
    search_fields = [
        "reference", "notes", "term__label", "scholarship__student_name",
        "scholarship__school__name",
    ]
    ordering_fields = ["paid_on", "amount", "created_at"]
    ordering = ["-paid_on"]

    def perform_create(self, serializer):
        # Who recorded it comes from the session, never from the client.
        serializer.save(recorded_by=self.request.user)
