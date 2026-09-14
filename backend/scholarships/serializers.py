"""Bursaries for the dashboard."""

from django.utils import timezone
from django.utils.dateparse import parse_date
from rest_framework import serializers

from api.admin_serializers import LabelledChoicesMixin, ThumbnailMixin

from .models import (
    Scholarship,
    ScholarshipBenefit,
    ScholarshipPayment,
    ScholarshipTerm,
)


#: What the term select sends for a period the bursary has not been given yet.
#: A prefix rather than a separate field, because the person filling the form
#: is answering one question — which term is this for — and should not have to
#: know whether the answer already exists in the database.
NEW_TERM_PREFIX = "new:"


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
        # A term whose dates nobody has filled in yet cannot be the soonest
        # anything, so it is passed over rather than sorted against None.
        unsettled = [t for t in obj.terms.all() if not t.is_settled and t.starts_on]
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
    # The student's photograph, so a term is read as a child's term rather than
    # as a row of dates. Taken from the bursary rather than stored again here:
    # there is one picture of a student and it belongs on the bursary.
    thumbnail = serializers.CharField(source="scholarship.photo", read_only=True, default="")
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
    """
    One transfer to a school.

    The term it settles can be chosen before anyone has set that term up. Most
    bursaries are entered long before the school publishes a calendar, and a
    payment that cannot say what it is for until somebody else does paperwork
    is a payment recorded against nothing. So the term select also offers the
    periods that school level runs — three terms, or two semesters at a
    university — and picking one here creates it.
    """

    student_name = serializers.CharField(source="scholarship.student_name", read_only=True)
    school_name = serializers.CharField(source="scholarship.school.name", read_only=True)
    # Whose fees this paid, as a face. Same source as the bursary's own
    # picture — there is one photograph of a student, on their bursary.
    thumbnail = serializers.CharField(source="scholarship.photo", read_only=True, default="")
    term_label = serializers.CharField(source="term.__str__", read_only=True, default="")
    recorded_by_name = serializers.CharField(
        source="recorded_by.get_full_name", read_only=True, default=""
    )
    paid_by_name = serializers.CharField(
        source="paid_by.get_full_name", read_only=True, default=""
    )

    class Meta:
        model = ScholarshipPayment
        fields = "__all__"
        read_only_fields = ["created_at", "updated_at", "recorded_by"]

    def to_internal_value(self, data):
        """Resolve a term that does not exist yet.

        The select sends `new:Term 2` for a period the bursary has not been
        given. It is created against the year the money was sent, with its
        dates left for whoever has the school calendar — see the note on
        ScholarshipTerm about why those are optional.
        """
        raw = (data or {}).get("term")
        if isinstance(raw, str) and raw.startswith(NEW_TERM_PREFIX):
            data = data.copy() if hasattr(data, "copy") else dict(data)
            data["term"] = self._term_for(data, raw[len(NEW_TERM_PREFIX):].strip())
        return super().to_internal_value(data)

    def _term_for(self, data, label):
        bursary_id = data.get("scholarship") or getattr(self.instance, "scholarship_id", None)
        try:
            bursary = Scholarship.objects.get(pk=bursary_id)
        except (Scholarship.DoesNotExist, ValueError, TypeError):
            raise serializers.ValidationError(
                {"term": "Choose the bursary first — a term belongs to one student."}
            )
        if not label:
            raise serializers.ValidationError({"term": "That term has no name."})

        paid_on = parse_date(str(data.get("paid_on") or "")) or timezone.localdate()
        term, _ = ScholarshipTerm.objects.get_or_create(
            scholarship=bursary,
            academic_year=str(paid_on.year),
            label=label[:40],
        )
        return term.pk

    def validate_amount(self, value):
        if value is not None and value <= 0:
            raise serializers.ValidationError("A payment has to be more than zero.")
        return value

    def validate_receipts(self, value):
        """Stored as a list of addresses, whatever shape it arrived in."""
        if value in (None, ""):
            return []
        if isinstance(value, str):
            return [value]
        if not isinstance(value, list) or any(not isinstance(v, str) for v in value):
            raise serializers.ValidationError("Receipts are a list of uploaded files.")
        return [v for v in value if v.strip()]
