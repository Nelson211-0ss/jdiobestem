"""
Donations, mirrored from Stripe.

Stripe stays the source of truth for money — this table is a local copy so the
Foundation can see its own giving history, run its own totals, and tie a gift to
a donor without logging into a payment dashboard. The webhook writes it; nothing
here ever moves money.
"""

from django.db import models

from core.countries import Country, country_field
from core.models import TimeStampedModel


class Donation(TimeStampedModel):
    class DonationStatus(models.TextChoices):
        PENDING = "pending", "Pending"
        SUCCEEDED = "succeeded", "Succeeded"
        FAILED = "failed", "Failed"
        REFUNDED = "refunded", "Refunded"

    # Unique so a redelivered webhook updates the row instead of duplicating it.
    stripe_session_id = models.CharField(max_length=255, unique=True)
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
    raw_event = models.JSONField(
        null=True, blank=True, help_text="The webhook payload as received, for reconciliation."
    )

    class Meta:
        ordering = ["-created_at"]

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
