from rest_framework import serializers

from .models import JobApplication, JobPosting


class JobPostingSerializer(serializers.ModelSerializer):
    employment_type_display = serializers.CharField(
        source="get_employment_type_display", read_only=True
    )
    office_name = serializers.CharField(source="office.name", read_only=True)
    application_count = serializers.SerializerMethodField()

    class Meta:
        model = JobPosting
        fields = [
            "id", "title", "slug", "summary", "description",
            "responsibilities", "requirements",
            "employment_type", "employment_type_display",
            "country", "office", "office_name",
            "is_open", "posted_on", "order", "application_count",
            "created_at", "updated_at",
        ]
        read_only_fields = ["created_at", "updated_at"]

    def get_application_count(self, obj):
        return obj.applications.count()


class JobApplicationSerializer(serializers.ModelSerializer):
    stage_display = serializers.CharField(source="get_stage_display", read_only=True)
    decided_by_name = serializers.CharField(source="decided_by.username", read_only=True)

    class Meta:
        model = JobApplication
        fields = [
            "id", "posting", "posting_title", "name", "email", "phone",
            "cover_letter", "cv", "stage", "stage_display", "notes",
            "decided_at", "decided_by", "decided_by_name", "country",
            "created_at", "updated_at",
        ]
        # Set by the application from the stage, never typed in: a decision date
        # that disagrees with the stage would be worse than none.
        read_only_fields = ["posting_title", "decided_at", "decided_by", "created_at", "updated_at"]


class PublicApplicationSerializer(serializers.ModelSerializer):
    """
    What the careers page is allowed to send.

    Deliberately narrow: an applicant supplies who they are and what they are
    applying for. Stage, notes and the decision belong to the people reviewing
    it, and accepting them here would let anyone post themselves into `hired`.
    """

    class Meta:
        model = JobApplication
        fields = ["posting", "name", "email", "phone", "cover_letter", "cv", "country"]

    def validate_posting(self, value):
        if value and not value.is_open:
            raise serializers.ValidationError("That position is no longer open.")
        return value
