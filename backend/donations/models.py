"""
Giving: what arrives through Stripe, and what arrives by every other route.

Stripe stays the source of truth for the gifts it processes — those rows are a
local copy so the Foundation can see its own history without logging into a
payment dashboard, and the webhook writes them.

But most giving is not a card payment. A cheque, a bank transfer, a pledge made
at an event, a donation in kind: these used to live on a separate board, which
meant "what did we receive this year" could not be answered without adding two
lists together and hoping neither had been forgotten. They are the same fact —
somebody gave the Foundation something — so they are one table, separated by
`source` rather than by which page they were typed into.

A Stripe row stays read-only. A hand-recorded one is editable, because the
person who typed it is the only one who can correct it.
"""

from django.contrib.auth.models import User
from django.db import models
from django.utils import timezone

from core.countries import Country, country_field
from core.models import TimeStampedModel


class Donation(TimeStampedModel):
    class DonationStatus(models.TextChoices):
        PENDING = "pending", "Pending"
        SUCCEEDED = "succeeded", "Succeeded"
        FAILED = "failed", "Failed"
        REFUNDED = "refunded", "Refunded"
        # For gifts that did not come through a card reader.
        PLEDGED = "pledged", "Pledged"
        RECEIVED = "received", "Received"

    #: The statuses that mean the money is actually the Foundation's. A pledge
    #: is a promise and is deliberately not counted until it arrives.
    BANKED = ("succeeded", "received")

    class Source(models.TextChoices):
        ONLINE = "online", "Online (Stripe)"
        OFFLINE = "offline", "Recorded by hand"

    class GiftType(models.TextChoices):
        ONE_OFF = "one_off", "One-off gift"
        RECURRING = "recurring", "Recurring gift"
        PLEDGE = "pledge", "Pledge"
        IN_KIND = "in_kind", "In kind"
        GRANT = "grant", "Grant"

    class Method(models.TextChoices):
        CARD = "card", "Card"
        BANK = "bank", "Bank transfer"
        MOBILE = "mobile", "Mobile money"
        CHEQUE = "cheque", "Cheque"
        CASH = "cash", "Cash"
        IN_KIND = "in_kind", "In kind"
        OTHER = "other", "Other"

    class ReceiptStatus(models.TextChoices):
        NOT_SENT = "not_sent", "Not sent"
        SENT = "sent", "Sent"
        NOT_REQUIRED = "not_required", "Not required"

    source = models.CharField(
        max_length=10, choices=Source.choices, default=Source.ONLINE, db_index=True
    )

    # Unique so a redelivered webhook updates the row instead of duplicating it.
    # Null rather than blank for a hand-recorded gift: Postgres allows many
    # NULLs under a unique constraint but only one empty string, so blanks
    # would let exactly one offline gift exist.
    stripe_session_id = models.CharField(max_length=255, unique=True, null=True, blank=True)
    stripe_payment_intent = models.CharField(max_length=255, blank=True, db_index=True)

    donor_name = models.CharField(max_length=200, blank=True)
    donor_email = models.EmailField(blank=True, db_index=True)

    # Minor units, as Stripe sends them. Never a float.
    amount_cents = models.PositiveIntegerField()
    currency = models.CharField(max_length=10, default="usd")

    status = models.CharField(
        max_length=20, choices=DonationStatus.choices, default=DonationStatus.PENDING, db_index=True
    )
    livemode = models.BooleanField(default=False, help_text="False for test-mode payments.")

    country = country_field(help_text="Which office this gift is credited to.")
    receipt_url = models.URLField(blank=True)

    # --- what a hand-recorded gift needs beyond the above -----------------
    gift_type = models.CharField(
        max_length=20, choices=GiftType.choices, default=GiftType.ONE_OFF, db_index=True
    )
    payment_method = models.CharField(max_length=20, choices=Method.choices, blank=True)
    designation = models.CharField(
        max_length=200,
        blank=True,
        help_text="What the gift is for. Blank means unrestricted.",
    )
    # When the money actually arrived, which is not when somebody typed it in.
    # Stripe rows get this from the payment; sorting and totals use it either
    # way, so a gift banked in March does not land in the month it was entered.
    received_on = models.DateField(null=True, blank=True, db_index=True)
    receipt_status = models.CharField(
        max_length=20, choices=ReceiptStatus.choices, default=ReceiptStatus.NOT_SENT
    )
    receipt_sent_on = models.DateField(null=True, blank=True)
    notes = models.TextField(blank=True)
    recorded_by = models.ForeignKey(
        User, null=True, blank=True, on_delete=models.SET_NULL, related_name="donations_recorded"
    )
    raw_event = models.JSONField(
        null=True, blank=True, help_text="The webhook payload as received, for reconciliation."
    )

    class Meta:
        ordering = ["-received_on", "-created_at"]

    def save(self, *args, **kwargs):
        # Every gift has a date it counts against, so nothing has to fall back
        # to `created_at` when it is summed.
        if not self.received_on:
            self.received_on = (self.created_at or timezone.now()).date()
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.amount_display} — {self.donor_email or 'anonymous'}"

    @property
    def amount(self):
        """Major units, as a Decimal, for display and for summing."""
        from decimal import Decimal

        return Decimal(self.amount_cents) / Decimal(100)

    @property
    def amount_display(self):
        return f"{self.currency.upper()} {self.amount:,.2f}"
