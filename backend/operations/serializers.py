from decimal import Decimal

from rest_framework import serializers

from .models import (
    Board,
    BoardColumn,
    BoardGroup,
    ExpenseLine,
    Office,
    OperatingCountry,
    Record,
)


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
    # Retired columns are left out entirely rather than flagged, so the table,
    # the form and the filters all stop offering them without any of them
    # having to know the concept exists.
    columns = serializers.SerializerMethodField()
    groups = BoardGroupSerializer(many=True, read_only=True)

    def get_columns(self, obj):
        live = [c for c in obj.columns.all() if not c.is_hidden]
        return BoardColumnSerializer(live, many=True).data

    class Meta(BoardSerializer.Meta):
        fields = BoardSerializer.Meta.fields + ["columns", "groups"]


class ExpenseLineSerializer(serializers.ModelSerializer):
    class Meta:
        model = ExpenseLine
        fields = ["id", "name", "incurred_on", "amount", "order"]


class RecordSerializer(serializers.ModelSerializer):
    group_title = serializers.SerializerMethodField()
    office_name = serializers.CharField(source="office.name", read_only=True, default="")
    expense_lines = ExpenseLineSerializer(many=True, required=False)

    class Meta:
        model = Record
        fields = [
            "id", "monday_id", "name", "group_id", "group_title", "values",
            "country", "office", "office_name", "expense_lines",
            "is_local", "created_by_name", "monday_updated_at", "created_at", "updated_at",
        ]
        read_only_fields = [
            "monday_id", "created_by_name", "monday_updated_at", "created_at", "updated_at",
        ]

    def get_group_title(self, obj):
        group = obj.board.groups.filter(monday_id=obj.group_id).first()
        return group.title if group else ""

    # --- compound expenses -------------------------------------------------
    #
    # A compound expense has no total of its own: it is the sum of its lines,
    # written back onto the record so everything that reads the board — the
    # table, the accounting figures, the reports — keeps reading one field and
    # needs to know nothing about this.

    def _column(self, board, title):
        return next((c for c in board.columns.all() if c.title == title), None)

    def _is_compound(self, board, values) -> bool:
        column = self._column(board, "Expense type")
        if not column:
            return False
        chosen = str((values or {}).get(column.monday_id) or "")
        label = {c["value"]: c["label"] for c in column.choices}.get(chosen, chosen)
        return label.strip().lower() == "compound"

    def validate(self, attrs):
        board = (self.instance.board if self.instance else None) or self.context.get("board")
        if board is None:
            return attrs

        values = attrs.get("values", getattr(self.instance, "values", {}) or {})
        lines = attrs.get("expense_lines")
        if lines is None and self.instance is not None:
            lines = [{"name": l.name} for l in self.instance.expense_lines.all()]
        lines = lines or []

        if self._is_compound(board, values):
            if not lines:
                raise serializers.ValidationError(
                    {"expense_lines": "A compound expense needs at least one entry."}
                )
        elif lines and self._column(board, "Expense type"):
            raise serializers.ValidationError(
                {"expense_lines": "Only a compound expense has entries. Change the type first."}
            )
        return attrs

    def _apply_lines(self, record, lines):
        """Replace the lines and write the total back onto the record."""
        record.expense_lines.all().delete()
        ExpenseLine.objects.bulk_create(
            [
                ExpenseLine(
                    record=record,
                    name=line["name"],
                    incurred_on=line["incurred_on"],
                    amount=line["amount"],
                    order=line.get("order", index),
                )
                for index, line in enumerate(lines)
            ]
        )
        amount_column = self._column(record.board, "Amount")
        if amount_column and self._is_compound(record.board, record.values):
            total = sum((line["amount"] for line in lines), start=Decimal("0"))
            values = dict(record.values or {})
            values[amount_column.monday_id] = str(total)
            record.values = values
            record.save(update_fields=["values"])

    def create(self, validated_data):
        lines = validated_data.pop("expense_lines", [])
        record = super().create(validated_data)
        if lines:
            self._apply_lines(record, lines)
        return record

    def update(self, instance, validated_data):
        lines = validated_data.pop("expense_lines", None)
        record = super().update(instance, validated_data)
        if lines is not None:
            self._apply_lines(record, lines)
        return record


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
    lead_name = serializers.CharField(source="lead.get_full_name", read_only=True)

    class Meta:
        model = Office
        fields = [
            "id", "country", "country_name", "name", "is_main", "address", "city",
            "region", "phone", "email", "lead", "lead_name", "registration_number",
            "staff_headcount", "established_on", "is_active", "order", "notes",
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
