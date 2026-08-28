from django.contrib import admin
from django.db.models import Sum

from core.admin import ExportCsvMixin
from core.admin_site import admin_site

from .models import Donation


@admin.register(Donation, site=admin_site)
class DonationAdmin(ExportCsvMixin, admin.ModelAdmin):
    """
    Read-only by design.

    Stripe is the source of truth for money. Letting staff edit an amount here
    would produce a local total that quietly disagrees with the payment
    processor, so every field is locked and rows arrive only from the webhook.
    """

    csv_filename = "donations"
    list_display = ("created_at", "donor_name", "donor_email", "amount_display", "status", "livemode")
    list_filter = ("status", "livemode", "currency", "created_at")
    search_fields = ("donor_name", "donor_email", "stripe_session_id", "stripe_payment_intent")
    date_hierarchy = "created_at"
    actions = ["export_as_csv"]

    def get_readonly_fields(self, request, obj=None):
        return [f.name for f in self.model._meta.fields]

    def has_add_permission(self, request):
        return False

    def has_delete_permission(self, request, obj=None):
        return False

    def changelist_view(self, request, extra_context=None):
        """Show the total for whatever the current filter selects."""
        response = super().changelist_view(request, extra_context)
        try:
            qs = response.context_data["cl"].queryset.filter(status="succeeded")
        except (AttributeError, KeyError):
            return response
        total = qs.aggregate(total=Sum("amount_cents"))["total"] or 0
        response.context_data["title"] = (
            f"{response.context_data.get('title', 'Donations')} "
            f"— {qs.count()} succeeded, {total / 100:,.2f} total"
        )
        return response
