"""Shared admin behaviour: CSV export, reused by every submission list."""

import csv

from django.contrib import admin
from django.http import HttpResponse


class ExportCsvMixin:
    """
    Adds 'Export selected to CSV' to any ModelAdmin.

    Exports the columns already on screen (`list_display`), so the file staff
    download matches the table they were looking at rather than dumping every
    field in the model.
    """

    csv_filename = "export"

    @admin.action(description="Export selected to CSV")
    def export_as_csv(self, request, queryset):
        fields = [f for f in self.list_display if f != "__str__"]
        response = HttpResponse(content_type="text/csv")
        response["Content-Disposition"] = f'attachment; filename="{self.csv_filename}.csv"'
        writer = csv.writer(response)
        writer.writerow(fields)
        for obj in queryset:
            row = []
            for field in fields:
                value = getattr(obj, field, "")
                if callable(value):
                    value = value()
                row.append(value)
            writer.writerow(row)
        return response


# Django registers User and Group against its default AdminSite, which this
# project does not serve. Without re-registering them here, nobody could create
# a staff account from the dashboard.
from django.contrib.auth.admin import GroupAdmin, UserAdmin  # noqa: E402
from django.contrib.auth.models import Group, User  # noqa: E402

from core.admin_site import admin_site  # noqa: E402

class UserWithProfileAdmin(UserAdmin):
    """The staff profile edited inline, so granting access and setting the
    attributes that access is computed from is one action rather than two."""

    search_fields = ("username", "first_name", "last_name", "email")

    def get_inlines(self, request, obj):
        from accounts.admin_inlines import StaffProfileInline

        return [StaffProfileInline] if obj else []


admin_site.register(User, UserWithProfileAdmin)
admin_site.register(Group, GroupAdmin)
