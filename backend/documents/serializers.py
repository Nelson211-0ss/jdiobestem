from rest_framework import serializers

from .models import Document, DocumentEdition


class DocumentEditionSerializer(serializers.ModelSerializer):
    document_title = serializers.CharField(source="document.title", read_only=True)
    uploaded_by_name = serializers.CharField(source="uploaded_by.username", read_only=True)
    # The browser needs somewhere to send people; either half may be the answer.
    download_url = serializers.SerializerMethodField()
    thumbnail = serializers.SerializerMethodField()

    class Meta:
        model = DocumentEdition
        fields = [
            "id", "document", "document_title", "version", "file", "external_url",
            "download_url", "thumbnail", "effective_date", "is_current", "summary",
            "uploaded_by", "uploaded_by_name", "created_at", "updated_at",
        ]
        read_only_fields = ["uploaded_by", "created_at", "updated_at"]

    def get_download_url(self, obj):
        if obj.file:
            return obj.file.url
        return obj.external_url or ""

    def get_thumbnail(self, obj):
        return obj.preview_image or self.get_download_url(obj)

    def validate(self, attrs):
        """One current edition per document. The database enforces it too; this
        is so the dashboard says which one is in the way."""
        document = attrs.get("document") or getattr(self.instance, "document", None)
        is_current = attrs.get("is_current", getattr(self.instance, "is_current", False))
        if is_current and document:
            clash = DocumentEdition.objects.filter(document=document, is_current=True)
            if self.instance:
                clash = clash.exclude(pk=self.instance.pk)
            existing = clash.first()
            if existing:
                raise serializers.ValidationError(
                    {
                        "is_current": (
                            f"{document.title} already has {existing.version} as its current "
                            "edition. Change that one first."
                        )
                    }
                )
        return attrs


class DocumentSerializer(serializers.ModelSerializer):
    owner_name = serializers.CharField(source="owner.username", read_only=True)
    office_name = serializers.CharField(source="office.name", read_only=True)
    category_display = serializers.CharField(source="get_category_display", read_only=True)

    # Summaries so the table can show the state of a document without opening it.
    current_version = serializers.SerializerMethodField()
    edition_count = serializers.SerializerMethodField()
    #: Whatever the current edition is — usually a PDF, so the table shows a
    #: file chip rather than a picture.
    thumbnail = serializers.SerializerMethodField()
    editions = DocumentEditionSerializer(many=True, read_only=True)

    class Meta:
        model = Document
        fields = [
            "id", "title", "slug", "description", "category", "category_display",
            "country", "office", "office_name", "owner", "owner_name",
            "is_archived", "is_public", "notes",
            "current_version", "edition_count", "thumbnail", "editions",
            "created_at", "updated_at",
        ]
        read_only_fields = ["created_at", "updated_at"]

    def get_current_version(self, obj):
        current = next((e for e in obj.editions.all() if e.is_current), None)
        return current.version if current else ""

    def get_edition_count(self, obj):
        return len(obj.editions.all())

    def get_thumbnail(self, obj):
        current = next((e for e in obj.editions.all() if e.is_current), None)
        if not current:
            return ""
        return (
            current.preview_image
            or (current.file.url if current.file else "")
            or current.external_url
            or ""
        )
