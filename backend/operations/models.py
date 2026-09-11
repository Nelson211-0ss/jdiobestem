"""
The operations boards, mirrored from monday.com.

The account holds 74 boards — fundraising, HR, finance, governance, programmes,
procurement — and grows whenever somebody adds one. Hand-writing a Django model
per board would be weeks of work that breaks the next time a column is added, so
this mirrors monday's own shape instead: a board has groups and columns, and
holds records whose values are keyed by column.

That buys three things. Every board works, including ones that do not exist yet;
a column added in monday appears here after a sync rather than needing a
migration; and the dashboard can render any board from its column definitions.

Values live in a JSON column keyed by monday column id rather than in an
entity-attribute-value table. Postgres indexes and queries JSONB well, and it
keeps one record in one row — an EAV table would turn every list view into a
pivot.

This sits alongside the typed models, it does not replace them. Volunteer
applications, donations, news and the rest stay in their own tables, because
those are written by the public website and need real constraints. See
OVERLAPS in sync_monday.py for where the two meet.
"""

from django.contrib.auth.models import User
from django.db import models
from django.utils.text import slugify

from core.countries import country_field
from core.models import TimeStampedModel


class BoardCategory(models.TextChoices):
    """Our grouping for the dashboard nav. monday has no equivalent, so these
    are assigned during sync from the board's name."""

    FUNDRAISING = "fundraising", "Fundraising"
    FINANCE = "finance", "Finance"
    PROGRAMMES = "programmes", "Programmes"
    PEOPLE = "people", "People & HR"
    GOVERNANCE = "governance", "Governance & compliance"
    OPERATIONS = "operations", "Operations"
    MARKETING = "marketing", "Marketing & events"
    OTHER = "other", "Other"


def board_slug(name: str, exclude_pk=None) -> str:
    """A readable, stable address for a board: "Fixed Assets & Equipment" ->
    "fixed-assets-equipment". Suffixed only if two boards would collide."""
    base = slugify(name)[:130] or "board"
    candidate, n = base, 2
    while (
        Board.objects.filter(slug=candidate).exclude(pk=exclude_pk).exists()
        if exclude_pk
        else Board.objects.filter(slug=candidate).exists()
    ):
        candidate = f"{base}-{n}"
        n += 1
    return candidate


class Board(TimeStampedModel):
    monday_id = models.CharField(max_length=32, unique=True, db_index=True)
    # How the dashboard addresses a board. The monday id is an internal number
    # that means nothing to anyone reading a URL, and it survives here only so a
    # record can be traced back to where it came from.
    slug = models.SlugField(max_length=140, unique=True, blank=True)
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    category = models.CharField(
        max_length=20, choices=BoardCategory.choices, default=BoardCategory.OTHER, db_index=True
    )

    # monday creates a hidden "Subitems of X" board for every board that uses
    # subitems. They are synced but hidden from the nav, and reached through
    # their parent's records instead.
    is_subitem_board = models.BooleanField(default=False, db_index=True)
    parent_board = models.ForeignKey(
        "self", null=True, blank=True, on_delete=models.SET_NULL, related_name="subitem_boards"
    )

    is_visible = models.BooleanField(
        default=True, help_text="Uncheck to hide from the dashboard without deleting anything."
    )
    country = country_field()
    order = models.PositiveSmallIntegerField(default=0)
    item_count = models.PositiveIntegerField(default=0)
    synced_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ["category", "order", "name"]

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = board_slug(self.name, self.pk)
        super().save(*args, **kwargs)

    def __str__(self):
        return self.name


class BoardGroup(models.Model):
    """A group is a section within a board — monday's equivalent of a swimlane."""

    board = models.ForeignKey(Board, related_name="groups", on_delete=models.CASCADE)
    monday_id = models.CharField(max_length=64)
    title = models.CharField(max_length=255)
    color = models.CharField(max_length=32, blank=True)
    position = models.PositiveSmallIntegerField(default=0)

    class Meta:
        ordering = ["position", "id"]
        constraints = [
            models.UniqueConstraint(fields=["board", "monday_id"], name="unique_group_per_board")
        ]

    def __str__(self):
        return self.title


class BoardColumn(models.Model):
    """
    A column definition, carried over with its type and settings.

    `settings` holds the raw monday configuration — the label set for a status
    column, the options for a dropdown. The dashboard reads it to build the
    right input, which is why a new status label appears in the interface after
    a sync without any code change.
    """

    board = models.ForeignKey(Board, related_name="columns", on_delete=models.CASCADE)
    monday_id = models.CharField(max_length=64)
    title = models.CharField(max_length=255)
    column_type = models.CharField(max_length=40, db_index=True)
    settings = models.JSONField(default=dict, blank=True)
    position = models.PositiveSmallIntegerField(default=0)

    #: Shown in the list view. Long text and files are opened on the record.
    show_in_list = models.BooleanField(
        default=True, help_text="Show this column in the table view."
    )
    # Retired: not shown in the table, not offered on the form, not deleted.
    # `show_in_list` only governs the table — a long description belongs on the
    # form but not in a cell — so hiding a column everywhere needs its own
    # switch. Values already recorded stay in the record untouched, which is
    # why this is a flag rather than a deletion.
    is_hidden = models.BooleanField(default=False, db_index=True)

    class Meta:
        ordering = ["position", "id"]
        constraints = [
            models.UniqueConstraint(fields=["board", "monday_id"], name="unique_column_per_board")
        ]

    def __str__(self):
        return f"{self.board.name} · {self.title}"

    @property
    def choices(self) -> list[dict]:
        """Label set for status and dropdown columns, in monday's own order."""
        settings = self.settings or {}
        if self.column_type == "status":
            labels = settings.get("labels") or {}
            order = settings.get("labels_positions_v2") or {}
            items = [
                {"value": key, "label": text}
                for key, text in labels.items()
                if isinstance(text, str) and text.strip()
            ]
            items.sort(key=lambda item: order.get(item["value"], 999))
            return items
        if self.column_type == "dropdown":
            labels = settings.get("labels") or []
            return [
                {"value": str(entry.get("id")), "label": entry.get("name", "")}
                for entry in labels
                if isinstance(entry, dict)
            ]
        return []


class Record(TimeStampedModel):
    """
    One row on a board — a monday item, or a subitem of one.

    `values` is keyed by monday column id, so a record survives a column being
    renamed and can be pushed back to monday without translation.
    """

    board = models.ForeignKey(Board, related_name="records", on_delete=models.CASCADE)
    monday_id = models.CharField(max_length=32, blank=True, db_index=True)
    name = models.CharField(max_length=500)
    group_id = models.CharField(max_length=64, blank=True, db_index=True)
    parent_record = models.ForeignKey(
        "self", null=True, blank=True, on_delete=models.CASCADE, related_name="subitems"
    )

    values = models.JSONField(default=dict, blank=True)

    #: Set when a record is created here and has not yet been pushed to monday.
    country = country_field()
    office = models.ForeignKey(
        "operations.Office",
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="records",
        help_text="Which office this belongs to, where that is narrower than the country.",
    )
    is_local = models.BooleanField(default=False, db_index=True)

    # Who entered it. Set from the session when the record is created and never
    # editable: an attribution somebody can type is not an attribution. Kept if
    # the account is later removed, so the trail survives the person leaving.
    created_by = models.ForeignKey(
        User,
        null=True,
        blank=True,
        editable=False,
        on_delete=models.SET_NULL,
        related_name="board_records",
    )
    created_by_name = models.CharField(max_length=150, blank=True, editable=False)
    monday_updated_at = models.DateTimeField(null=True, blank=True)
    synced_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ["-monday_updated_at", "-created_at"]
        indexes = [models.Index(fields=["board", "group_id"])]
        constraints = [
            models.UniqueConstraint(
                fields=["board", "monday_id"],
                condition=models.Q(monday_id__gt=""),
                name="unique_record_per_board",
            )
        ]

    def __str__(self):
        return self.name


class OperatingCountry(TimeStampedModel):
    """
    The countries the Foundation works in, and what each one spends.

    Country and currency are picked from here rather than typed, so the Uganda
    office cannot become "Uganda ", "UG" and "uganda" in three different tables.
    Adding a country is a row, not a deployment.

    The two-letter code matches what every other model stores in its `country`
    column, so this table is the vocabulary those columns are drawn from.
    """

    code = models.CharField(
        max_length=2,
        unique=True,
        help_text="Two-letter code, matching the country stored on other records. 'GL' is reserved for Global.",
    )
    name = models.CharField(max_length=120)
    currency_code = models.CharField(max_length=3, help_text="ISO 4217, e.g. UGX.")
    currency_symbol = models.CharField(max_length=8, blank=True)

    is_active = models.BooleanField(default=True, db_index=True)
    order = models.PositiveSmallIntegerField(default=0)
    notes = models.TextField(blank=True)

    class Meta:
        ordering = ["order", "name"]
        verbose_name = "operating country"
        verbose_name_plural = "operating countries"

    def __str__(self):
        return f"{self.name} ({self.currency_code})"


class Office(TimeStampedModel):
    """
    A place the Foundation works from.

    A country has one main office and may have others — a country office plus
    field or programme offices. "Main" is enforced rather than trusted: the
    database refuses a second main office for the same country, so nothing can
    quietly end up with two or none through an edit made in a hurry.
    """

    country = models.ForeignKey(
        OperatingCountry, on_delete=models.CASCADE, related_name="offices"
    )
    name = models.CharField(max_length=200)
    is_main = models.BooleanField(
        default=False, db_index=True, help_text="The country's principal office. Only one per country."
    )

    address = models.TextField(blank=True)
    city = models.CharField(max_length=120, blank=True)
    region = models.CharField(max_length=120, blank=True)
    phone = models.CharField(max_length=50, blank=True)
    email = models.EmailField(blank=True)

    # Carried over from the "Country Office Profiles" board, which held these
    # four and nothing else the office record did not already have. One place
    # for an office rather than two that disagree.
    lead = models.ForeignKey(
        User,
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="offices_led",
        help_text="Who runs this office.",
    )
    registration_number = models.CharField(
        max_length=120, blank=True, help_text="As registered with the authorities in this country."
    )
    staff_headcount = models.PositiveSmallIntegerField(
        null=True, blank=True, help_text="People based here."
    )
    established_on = models.DateField(
        null=True, blank=True, help_text="When the office opened."
    )

    is_active = models.BooleanField(default=True, db_index=True)
    order = models.PositiveSmallIntegerField(default=0)
    notes = models.TextField(blank=True)

    class Meta:
        ordering = ["country__order", "-is_main", "order", "name"]
        constraints = [
            models.UniqueConstraint(
                fields=["country"],
                condition=models.Q(is_main=True),
                name="one_main_office_per_country",
            )
        ]

    def __str__(self):
        return f"{self.name}{' — main' if self.is_main else ''}"


class ExchangeRate(models.Model):
    """
    A rate the Foundation has decided to use, for a date.

    The accounting figures are grouped by their own currency and always will be:
    an expense in UGX and a gift in USD are different facts. But somebody does
    eventually have to ask "what did we spend in total", and answering it needs
    a rate.

    So the rate is a record rather than a constant or a live lookup. It is
    entered by whoever reconciles the books, it carries the date it applies
    from, and every converted figure says which rate produced it. A number
    fetched from an API at render time cannot be audited a year later; this can.
    """

    base = models.CharField(max_length=8, help_text="The currency being converted from, e.g. UGX.")
    quote = models.CharField(max_length=8, help_text="The currency being converted to, e.g. USD.")
    rate = models.DecimalField(
        max_digits=18,
        decimal_places=6,
        help_text="One unit of the base currency in the quote currency.",
    )
    effective_from = models.DateField(
        db_index=True, help_text="The rate applies to money dated on or after this."
    )
    note = models.CharField(
        max_length=200, blank=True, help_text="Where the rate came from, e.g. Bank of Uganda mid-rate."
    )

    class Meta:
        ordering = ["-effective_from", "base", "quote"]
        constraints = [
            models.UniqueConstraint(
                fields=["base", "quote", "effective_from"], name="unique_rate_per_day"
            )
        ]

    def __str__(self):
        return f"1 {self.base} = {self.rate:,.6f} {self.quote} from {self.effective_from:%d %b %Y}"


class ExpenseLine(models.Model):
    """
    One line of a compound expense.

    A trip is not an amount, it is a fare, a night's lodging and a meal, each on
    its own day. Recorded as one figure, the only question it can answer is how
    much was spent; recorded as lines, it answers what on, and when — which is
    what anybody checking the books actually asks.

    So a compound expense carries no typed total at all: its amount is the sum
    of these, and is written back onto the record whenever they change. A total
    somebody can edit independently of the lines beneath it starts disagreeing
    with them, and the disagreement is always found late.
    """

    record = models.ForeignKey(
        Record, on_delete=models.CASCADE, related_name="expense_lines"
    )
    name = models.CharField(max_length=200)
    incurred_on = models.DateField()
    amount = models.DecimalField(max_digits=14, decimal_places=2)
    order = models.PositiveSmallIntegerField(default=0)

    class Meta:
        ordering = ["incurred_on", "order", "id"]

    def __str__(self):
        return f"{self.name} — {self.amount:,.2f}"
