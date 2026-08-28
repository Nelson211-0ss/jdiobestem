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

from django.db import models

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


class Board(TimeStampedModel):
    monday_id = models.CharField(max_length=32, unique=True, db_index=True)
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

    def __str__(self):
        return self.name

    @property
    def slug(self):
        """Stable, URL-safe identifier. The monday id, because board names are
        not unique — this account has three boards called 'Build Vibe app'."""
        return self.monday_id


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
    show_in_list = models.BooleanField(default=True)

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
