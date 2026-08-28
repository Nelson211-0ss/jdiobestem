from rest_framework import serializers

from .models import Board, BoardColumn, BoardGroup, Office, OperatingCountry, Record


class BoardColumnSerializer(serializers.ModelSerializer):
    choices = serializers.ListField(read_only=True)

    class Meta:
        model = BoardColumn
        fields = ["id", "monday_id", "title", "column_type", "position", "show_in_list", "choices"]


class BoardGroupSerializer(serializers.ModelSerializer):
    class Meta:
        model = BoardGroup
        fields = ["id", "monday_id", "title", "color", "position"]


class BoardSerializer(serializers.ModelSerializer):
    category_display = serializers.CharField(source="get_category_display", read_only=True)

    class Meta:
        model = Board
        fields = [
            "id", "monday_id", "name", "description", "category", "category_display",
            "is_subitem_board", "is_visible", "item_count", "synced_at",
        ]


class BoardDetailSerializer(BoardSerializer):
    columns = BoardColumnSerializer(many=True, read_only=True)
    groups = BoardGroupSerializer(many=True, read_only=True)

    class Meta(BoardSerializer.Meta):
        fields = BoardSerializer.Meta.fields + ["columns", "groups"]


class RecordSerializer(serializers.ModelSerializer):
    group_title = serializers.SerializerMethodField()
    office_name = serializers.CharField(source="office.name", read_only=True, default="")

    class Meta:
        model = Record
        fields = [
            "id", "monday_id", "name", "group_id", "group_title", "values",
            "country", "office", "office_name",
            "is_local", "monday_updated_at", "created_at", "updated_at",
        ]
        read_only_fields = ["monday_id", "monday_updated_at", "created_at", "updated_at"]

    def get_group_title(self, obj):
        group = obj.board.groups.filter(monday_id=obj.group_id).first()
        return group.title if group else ""


class OperatingCountrySerializer(serializers.ModelSerializer):
    # Offices are rows in their own right, with one-main-per-country enforced by
    # the database. These two are read-only summaries for the countries table;
    # offices are created and edited through the Offices resource.
    main_office = serializers.SerializerMethodField()
    office_count = serializers.SerializerMethodField()

    class Meta:
        model = OperatingCountry
        fields = [
            "id", "code", "name", "currency_code", "currency_symbol",
            "main_office", "office_count", "is_active", "order", "notes",
        ]

    def get_main_office(self, obj):
        office = next((o for o in obj.offices.all() if o.is_main), None)
        return office.name if office else ""

    def get_office_count(self, obj):
        return len(obj.offices.all())


class OfficeSerializer(serializers.ModelSerializer):
    country_name = serializers.CharField(source="country.name", read_only=True)

    class Meta:
        model = Office
        fields = [
            "id", "country", "country_name", "name", "is_main", "address", "city",
            "region", "phone", "email", "is_active", "order", "notes",
        ]

    def validate(self, attrs):
        """One main office per country. The database enforces it too; this is
        so the dashboard says why rather than showing an integrity error."""
        country = attrs.get("country") or getattr(self.instance, "country", None)
        is_main = attrs.get("is_main", getattr(self.instance, "is_main", False))
        if is_main and country:
            clash = Office.objects.filter(country=country, is_main=True)
            if self.instance:
                clash = clash.exclude(pk=self.instance.pk)
            if clash.exists():
                raise serializers.ValidationError(
                    {"is_main": f"{country.name} already has a main office. Change that one first."}
                )
        return attrs
