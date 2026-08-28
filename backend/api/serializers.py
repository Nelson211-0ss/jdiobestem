"""
Serializers for the public forms.

Validation lives here rather than in the Next.js routes, so there is one place
that decides what a valid submission is — the browser, a curl, and a future
mobile client all meet the same rules.
"""

from rest_framework import serializers

from donations.models import Donation
from submissions.models import (
    ContactMessage,
    NewsletterSubscriber,
    ProjectProposal,
    VolunteerApplication,
)


class VolunteerApplicationSerializer(serializers.ModelSerializer):
    class Meta:
        model = VolunteerApplication
        fields = ["id", "name", "email", "phone", "interest", "message", "status", "created_at"]
        read_only_fields = ["id", "status", "created_at"]


class NewsletterSubscriberSerializer(serializers.ModelSerializer):
    class Meta:
        model = NewsletterSubscriber
        fields = ["id", "email", "source", "status", "created_at"]
        read_only_fields = ["id", "status", "created_at"]
        extra_kwargs = {"email": {"validators": []}}  # re-subscribing is not an error


class ContactMessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ContactMessage
        fields = ["id", "name", "email", "topic", "message", "status", "created_at"]
        read_only_fields = ["id", "status", "created_at"]


class ProjectProposalSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProjectProposal
        exclude = ["staff_notes", "notified_at"]
        read_only_fields = ["id", "status", "created_at", "updated_at"]

    def validate_declaration(self, value):
        # The one box that is not free text; the form requires it ticked.
        if not value:
            raise serializers.ValidationError("Please confirm the declaration before submitting.")
        return value

    def validate_summary(self, value):
        if len(value) > 4000:
            raise serializers.ValidationError("This is too long.")
        return value


class DonationSerializer(serializers.ModelSerializer):
    amount = serializers.DecimalField(max_digits=12, decimal_places=2, read_only=True)

    class Meta:
        model = Donation
        fields = [
            "id", "stripe_session_id", "stripe_payment_intent", "donor_name", "donor_email",
            "amount_cents", "amount", "currency", "status", "livemode", "receipt_url", "created_at",
        ]
        read_only_fields = ["id", "created_at"]
        extra_kwargs = {"stripe_session_id": {"validators": []}}  # upsert, not a duplicate error
