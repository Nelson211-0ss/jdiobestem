from rest_framework import serializers

from .models import Newsletter, NewsletterDelivery


class NewsletterDeliverySerializer(serializers.ModelSerializer):
    class Meta:
        model = NewsletterDelivery
        fields = ["id", "email", "status", "error", "sent_at"]


class NewsletterSerializer(serializers.ModelSerializer):
    created_by_name = serializers.CharField(source="created_by.username", read_only=True)
    status_display = serializers.CharField(source="get_status_display", read_only=True)
    # How many addresses this would go to right now, so nobody has to guess
    # before pressing send.
    audience_count = serializers.SerializerMethodField()
    is_editable = serializers.BooleanField(read_only=True)
    # The cover where there is one, else the PDF — the table shows a picture
    # for the first and a file chip for the second.
    thumbnail = serializers.SerializerMethodField()

    class Meta:
        model = Newsletter
        fields = [
            "id", "subject", "issue_label", "published_on", "pdf", "cover_image",
            "preheader", "body", "country",
            "status", "status_display", "created_by", "created_by_name",
            "is_public", "sent_at", "recipient_count", "sent_count", "failed_count",
            "audience_count", "is_editable", "thumbnail", "created_at", "updated_at",
        ]
        read_only_fields = [
            "status", "created_by", "sent_at",
            "recipient_count", "sent_count", "failed_count",
        ]

    def get_audience_count(self, obj):
        return obj.audience().count()

    def get_thumbnail(self, obj):
        # The cover art if there is any, then the rendered first page, then the
        # PDF itself — which the table falls back to showing as a file chip.
        return obj.cover_image or obj.preview_image or obj.pdf or ""

    def validate(self, attrs):
        """A campaign that has reached anyone is frozen — the copy people
        received must keep matching the copy on file."""
        if self.instance and not self.instance.is_editable:
            raise serializers.ValidationError(
                "This newsletter has already been sent, so it can no longer be edited. "
                "Duplicate it if you want to send something similar."
            )
        return attrs
