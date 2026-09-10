"""Bursaries for the dashboard."""

from rest_framework import serializers

from api.admin_serializers import LabelledChoicesMixin, ThumbnailMixin

from .models import (
    Scholarship,
    ScholarshipBenefit,
    ScholarshipPayment,
    ScholarshipTerm,
)


class ScholarshipBenefitSerializer(serializers.ModelSerializer):
    class Meta:
        model = ScholarshipBenefit
        fields = ["id", "label", "detail", "order"]


class ScholarshipSerializer(ThumbnailMixin, LabelledChoicesMixin, serializers.ModelSerializer):
    benefits = ScholarshipBenefitSerializer(many=True, required=False)
    # The student's photograph is the record's picture in the table.
    thumbnail_fields = ("photo",)

    office_name = serializers.CharField(source="office.name", read_only=True, default="")
    payment_count = serializers.IntegerField(source="payments.count", read_only=True)
    total_paid = serializers.SerializerMethodField()
    # What is still owed is the number this table exists to answer.
    outstanding = serializers.SerializerMethodField()
    total_due = serializers.SerializerMethodField()
    term_count = serializers.IntegerField(source="terms.count", read_only=True)
    next_term_due = serializers.SerializerMethodField()
    school_name = serializers.CharField(source="school.name", read_only=True, default="")

    class Meta:
        model = Scholarship
        fields = "__all__"
        read_only_fields = ["created_at", "updated_at"]

    def get_total_paid(self, obj) -> str:
        """Grouped, because this is the number people scan the table for."""
        total = sum((p.amount for p in obj.payments.all()), start=0)
        if not total:
            return ""
        return f"{obj.currency} {total:,.2f}".strip()

    def _money(self, obj, total) -> str:
        if not total:
            return ""
        return f"{obj.currency} {total:,.2f}".strip()

    def get_outstanding(self, obj) -> str:
        return self._money(obj, obj.outstanding)

    def get_total_due(self, obj) -> str:
        return self._money(obj, obj.total_due)

    def get_next_term_due(self, obj) -> str:
        """The soonest unsettled term, which is what a reminder is about."""
        unsettled = [t for t in obj.terms.all() if not t.is_settled]
        if not unsettled:
            return ""
        soonest = min(unsettled, key=lambda t: t.starts_on)
        return f"{soonest} — starts {soonest.starts_on:%d %b %Y}"

    def validate(self, attrs):
        # An award that ended should say why and when. Checked together because
        # neither field means anything without the other.
        merged = {**getattr(self.instance, "__dict__", {}), **attrs}
        status = merged.get("status")
        if status in {Scholarship.Status.TERMINATED, Scholarship.Status.COMPLETED}:
            if not merged.get("ended_on"):
                raise serializers.ValidationError(
                    {"ended_on": "Give the date it ended."}
                )
        if status == Scholarship.Status.TERMINATED and not merged.get("termination_reason"):
            raise serializers.ValidationError(
                {"termination_reason": "Say why the bursary was terminated."}
            )

        started, expected = merged.get("started_on"), merged.get("expected_end_on")
        if started and expected and expected < started:
            raise serializers.ValidationError(
                {"expected_end_on": "This is before the bursary started."}
            )
        return attrs

    def _write_benefits(self, scholarship, benefits):
        if benefits is None:
            return
        # Replaced wholesale, which is what keeps a removed benefit removed.
        scholarship.benefits.all().delete()
        for i, item in enumerate(benefits):
            ScholarshipBenefit.objects.create(
                scholarship=scholarship,
                order=item.get("order", i),
                label=item.get("label", ""),
                detail=item.get("detail", ""),
            )

    def create(self, validated_data):
        benefits = validated_data.pop("benefits", None)
        scholarship = super().create(validated_data)
        self._write_benefits(scholarship, benefits)
        return scholarship

    def update(self, instance, validated_data):
        benefits = validated_data.pop("benefits", None)
        scholarship = super().update(instance, validated_data)
        self._write_benefits(scholarship, benefits)
        return scholarship


class ScholarshipTermSerializer(serializers.ModelSerializer):
    student_name = serializers.CharField(source="scholarship.student_name", read_only=True)
    reference = serializers.CharField(source="scholarship.reference", read_only=True)
    school_name = serializers.CharField(source="scholarship.school.name", read_only=True, default="")
    amount_due_effective = serializers.SerializerMethodField()
    paid = serializers.SerializerMethodField()
    outstanding = serializers.SerializerMethodField()
    is_settled = serializers.BooleanField(read_only=True)

    class Meta:
        model = ScholarshipTerm
        fields = "__all__"
        read_only_fields = ["created_at", "updated_at"]

    def _money(self, obj, total) -> str:
        currency = obj.scholarship.currency
        return f"{currency} {total:,.2f}".strip() if total else ""

    def get_amount_due_effective(self, obj) -> str:
        return self._money(obj, obj.due)

    def get_paid(self, obj) -> str:
        return self._money(obj, obj.paid)

    def get_outstanding(self, obj) -> str:
        return self._money(obj, obj.outstanding)

    def validate(self, attrs):
        starts = attrs.get("starts_on") or getattr(self.instance, "starts_on", None)
        ends = attrs.get("ends_on") or getattr(self.instance, "ends_on", None)
        if starts and ends and ends < starts:
            raise serializers.ValidationError({"ends_on": "A term cannot end before it begins."})
        return attrs


class ScholarshipPaymentSerializer(LabelledChoicesMixin, serializers.ModelSerializer):
    student_name = serializers.CharField(source="scholarship.student_name", read_only=True)
    school_name = serializers.CharField(source="scholarship.school.name", read_only=True)
    term_label = serializers.CharField(source="term.__str__", read_only=True, default="")
    recorded_by_name = serializers.CharField(
        source="recorded_by.get_full_name", read_only=True, default=""
    )

    class Meta:
        model = ScholarshipPayment
        fields = "__all__"
        read_only_fields = ["created_at", "updated_at", "recorded_by"]

    def validate_amount(self, value):
        if value is not None and value <= 0:
            raise serializers.ValidationError("A payment has to be more than zero.")
        return value
