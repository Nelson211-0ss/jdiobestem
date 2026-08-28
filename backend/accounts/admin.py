from django.contrib import admin

from core.admin_site import admin_site

from .models import StaffProfile


@admin.register(StaffProfile, site=admin_site)
class StaffProfileAdmin(admin.ModelAdmin):
    list_display = ("user", "role", "country_label", "position", "department")
    list_filter = ("role", "country")
    search_fields = ("user__username", "user__email", "position", "department")
    autocomplete_fields = ("user",)

    @admin.display(description="Country")
    def country_label(self, obj):
        return obj.country_label


from .models import PermissionOverride  # noqa: E402


@admin.register(PermissionOverride, site=admin_site)
class PermissionOverrideAdmin(admin.ModelAdmin):
    list_display = ("user", "resource", "action", "effect", "reason", "granted_by")
    list_filter = ("effect", "resource", "action")
    search_fields = ("user__username", "resource", "reason")
    autocomplete_fields = ("user", "granted_by")
