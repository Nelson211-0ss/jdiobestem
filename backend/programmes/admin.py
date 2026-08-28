from django.contrib import admin

from core.admin import ExportCsvMixin
from core.admin_site import admin_site

from .models import Cohort, Mentee, Mentor, MentorshipPairing, ScienceFairProject


@admin.register(Cohort, site=admin_site)
class CohortAdmin(admin.ModelAdmin):
    list_display = ("name", "starts_on", "ends_on", "is_active")
    list_filter = ("is_active",)
    search_fields = ("name",)


class PairingInline(admin.TabularInline):
    model = MentorshipPairing
    extra = 0
    autocomplete_fields = ("mentor", "mentee", "cohort")


@admin.register(Mentor, site=admin_site)
class MentorAdmin(ExportCsvMixin, admin.ModelAdmin):
    csv_filename = "mentors"
    list_display = ("name", "profession", "organisation", "mode", "country", "is_active")
    list_filter = ("mode", "country", "is_active")
    search_fields = ("name", "email", "profession", "organisation", "expertise")
    autocomplete_fields = ("application", "team_member")
    actions = ["export_as_csv"]
    inlines = [PairingInline]


@admin.register(Mentee, site=admin_site)
class MenteeAdmin(ExportCsvMixin, admin.ModelAdmin):
    csv_filename = "mentees"
    list_display = ("name", "school", "class_stream", "district", "country", "is_active")
    list_filter = ("country", "is_active", "district")
    search_fields = ("name", "email", "school", "district")
    actions = ["export_as_csv"]
    inlines = [PairingInline]


@admin.register(MentorshipPairing, site=admin_site)
class MentorshipPairingAdmin(ExportCsvMixin, admin.ModelAdmin):
    csv_filename = "mentorship-pairings"
    list_display = ("mentor", "mentee", "cohort", "status", "started_on", "ended_on")
    list_filter = ("status", "cohort")
    search_fields = ("mentor__name", "mentee__name")
    autocomplete_fields = ("mentor", "mentee", "cohort")
    actions = ["export_as_csv"]


@admin.register(ScienceFairProject, site=admin_site)
class ScienceFairProjectAdmin(ExportCsvMixin, admin.ModelAdmin):
    csv_filename = "science-fair-projects"
    list_display = ("title", "school", "district", "category", "stage", "review_score", "cohort")
    list_filter = ("stage", "category", "cohort", "district")
    search_fields = ("title", "school", "teacher_mentor", "notes")
    autocomplete_fields = ("registration", "cohort")
    filter_horizontal = ("students",)
    actions = ["export_as_csv"]
