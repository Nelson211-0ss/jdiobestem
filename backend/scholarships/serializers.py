"""Bursaries for the dashboard."""

from rest_framework import serializers

from api.admin_serializers import LabelledChoicesMixin, ThumbnailMixin

from .models import Scholarship, ScholarshipBenefit, ScholarshipPayment


class ScholarshipBenefitSerializer(serializers.ModelSerializer):
    class Meta:
        model = ScholarshipBenefit
        fields = ["id", "label", "detail", "order"]


class ScholarshipSerializer(ThumbnailMixin, LabelledChoicesMixin, serializers.ModelSerializer):
    benefits = ScholarshipBenefitSerializer(many=True, required=False)
    # The student's photograph is the record's picture in the table.
    thumbnail_fields = ("photo",)

    office_name = serializers.CharField(source="office.name", read_only=True, default="")
    managed_by_name = serializers.CharField(
        source="managed_by.get_full_name", read_only=True, default=""
    )
    payment_count = serializers.IntegerField(source="payments.count", read_only=True)
    total_paid = serializers.SerializerMethodField()

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


class ScholarshipPaymentSerializer(LabelledChoicesMixin, serializers.ModelSerializer):
    student_name = serializers.CharField(source="scholarship.student_name", read_only=True)
    school_name = serializers.CharField(source="scholarship.school_name", read_only=True)
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
