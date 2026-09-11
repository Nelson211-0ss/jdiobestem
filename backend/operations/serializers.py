from decimal import Decimal, InvalidOperation

from rest_framework import serializers

from .models import (
    Board,
    BoardColumn,
    BoardGroup,
    ExchangeRate,
    ExpenseLine,
    Office,
    OperatingCountry,
    Record,
    SalaryPayment,
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


def _to_decimal(value):
    """A board value as a number, or None when it is not one."""
    if value in (None, ""):
        return None
    try:
        return Decimal(str(value).replace(",", "").strip())
    except (InvalidOperation, AttributeError, TypeError):
        return None


class ExpenseLineSerializer(serializers.ModelSerializer):
    class Meta:
        model = ExpenseLine
        fields = ["id", "name", "incurred_on", "amount", "order"]


class RecordSerializer(serializers.ModelSerializer):
    group_title = serializers.SerializerMethodField()
    office_name = serializers.CharField(source="office.name", read_only=True, default="")
    expense_lines = ExpenseLineSerializer(many=True, required=False)
    # A PDF receipt reads as a file chip unless its first page is rendered.
    # Only what has already been rendered is looked up here; building is
    # done on save, so listing a page never waits on a download.
    file_previews = serializers.SerializerMethodField()

    class Meta:
        model = Record
        fields = [
            "id", "monday_id", "name", "group_id", "group_title", "values",
            "country", "office", "office_name", "expense_lines", "file_previews",
            "is_local", "created_by_name", "monday_updated_at", "created_at", "updated_at",
        ]
        read_only_fields = [
            "monday_id", "created_by_name", "monday_updated_at", "created_at", "updated_at",
        ]

    def get_file_previews(self, obj) -> dict:
        from core.models import FilePreview

        urls = []

        def walk(value):
            if isinstance(value, dict):
                for nested in value.values():
                    walk(nested)
            elif isinstance(value, (list, tuple)):
                for nested in value:
                    walk(nested)
            elif isinstance(value, str) and value.lower().split("?")[0].endswith(".pdf"):
                urls.append(value)

        walk(obj.values or {})
        if not urls:
            return {}
        return {
            row.source: row.image
            for row in FilePreview.objects.filter(source__in=urls)
            if row.image
        }

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
            # The recorded amount is the expense; the entries say what it was
            # made up of. They may cover less than all of it — not everything is
            # always itemised — but they cannot come to more than was spent.
            amount_column = self._column(board, "Amount")
            total = _to_decimal(values.get(amount_column.monday_id)) if amount_column else None
            if total is not None and total > 0:
                itemised = sum(
                    (_to_decimal(line.get("amount")) or Decimal("0") for line in lines),
                    start=Decimal("0"),
                )
                if itemised > total:
                    raise serializers.ValidationError(
                        {
                            "expense_lines": (
                                f"The entries come to {itemised:,.2f}, which is more than the "
                                f"{total:,.2f} recorded for this expense. Raise the amount or "
                                "reduce an entry."
                            )
                        }
                    )
        elif lines and self._column(board, "Expense type"):
            raise serializers.ValidationError(
                {"expense_lines": "Only a compound expense has entries. Change the type first."}
            )
        return attrs

    def _apply_lines(self, record, lines):
        """Replace the lines. The recorded amount is left alone — it is what
        was spent, and the entries only say what it went on."""
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

    def _render_previews(self, record):
        """Wrapped: an attachment that will not render must never cost
        somebody the save that attached it."""
        try:
            from core.pdf_preview import previews_for

            previews_for(record.values or {})
        except Exception:  # noqa: BLE001
            pass

    def create(self, validated_data):
        lines = validated_data.pop("expense_lines", [])
        record = super().create(validated_data)
        if lines:
            self._apply_lines(record, lines)
        self._render_previews(record)
        return record

    def update(self, instance, validated_data):
        lines = validated_data.pop("expense_lines", None)
        record = super().update(instance, validated_data)
        if lines is not None:
            self._apply_lines(record, lines)
        self._render_previews(record)
        return record


class SalaryPaymentSerializer(serializers.ModelSerializer):
    person_name = serializers.CharField(source="person.name", read_only=True)
    person_role = serializers.CharField(source="person.role", read_only=True)
    total = serializers.SerializerMethodField()

    class Meta:
        model = SalaryPayment
        fields = "__all__"

    def get_total(self, obj) -> str:
        return f"{obj.currency} {obj.total:,.2f}".strip()


class ExchangeRateSerializer(serializers.ModelSerializer):
    summary = serializers.CharField(source="__str__", read_only=True)

    class Meta:
        model = ExchangeRate
        fields = "__all__"

    def validate(self, attrs):
        base = (attrs.get("base") or getattr(self.instance, "base", "")).upper()
        quote = (attrs.get("quote") or getattr(self.instance, "quote", "")).upper()
        if base and quote and base == quote:
            raise serializers.ValidationError(
                {"quote": "A currency is worth one of itself; no rate is needed."}
            )
        attrs["base"], attrs["quote"] = base, quote
        return attrs


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
