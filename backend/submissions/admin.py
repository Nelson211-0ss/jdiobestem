from django.contrib import admin

from core.admin import ExportCsvMixin
from core.admin_site import admin_site

from .models import ContactMessage, NewsletterSubscriber, ProjectProposal, VolunteerApplication


class SubmissionAdmin(ExportCsvMixin, admin.ModelAdmin):
    """
    Shared shape for everything that arrives from a form.

    The submitted fields are read-only: this is a record of what someone sent,
    and staff editing it after the fact would quietly destroy that. Only the
    triage fields — status and notes — can be changed.
    """

    actions = ["export_as_csv", "mark_in_review", "mark_contacted", "mark_closed"]
    list_filter = ("status", "created_at")
    date_hierarchy = "created_at"
    readonly_fields = ("created_at", "updated_at", "notified_at")

    @admin.action(description="Mark as in review")
    def mark_in_review(self, request, queryset):
        updated = queryset.update(status="in_review")
        self.message_user(request, f"{updated} marked in review.")

    @admin.action(description="Mark as contacted")
    def mark_contacted(self, request, queryset):
        updated = queryset.update(status="contacted")
        self.message_user(request, f"{updated} marked contacted.")

    @admin.action(description="Mark as closed")
    def mark_closed(self, request, queryset):
        updated = queryset.update(status="closed")
        self.message_user(request, f"{updated} closed.")


@admin.register(VolunteerApplication, site=admin_site)
class VolunteerApplicationAdmin(SubmissionAdmin):
    csv_filename = "volunteer-applications"
    list_display = ("name", "email", "phone", "interest", "status", "created_at")
    list_filter = ("interest", "status", "created_at")
    search_fields = ("name", "email", "phone", "message")
    readonly_fields = SubmissionAdmin.readonly_fields + ("name", "email", "phone", "interest", "message")
    fieldsets = (
        ("Applicant", {"fields": ("name", "email", "phone", "interest", "message")}),
        ("Handling", {"fields": ("status", "staff_notes")}),
        ("Record", {"fields": ("created_at", "updated_at", "notified_at"), "classes": ("collapse",)}),
    )


@admin.register(ContactMessage, site=admin_site)
class ContactMessageAdmin(SubmissionAdmin):
    csv_filename = "contact-messages"
    list_display = ("name", "email", "topic", "status", "created_at")
    search_fields = ("name", "email", "topic", "message")
    readonly_fields = SubmissionAdmin.readonly_fields + ("name", "email", "topic", "message")
    fieldsets = (
        ("Message", {"fields": ("name", "email", "topic", "message")}),
        ("Handling", {"fields": ("status", "staff_notes")}),
        ("Record", {"fields": ("created_at", "updated_at", "notified_at"), "classes": ("collapse",)}),
    )


@admin.register(ProjectProposal, site=admin_site)
class ProjectProposalAdmin(SubmissionAdmin):
    csv_filename = "science-fair-registrations"
    list_display = ("project_title", "student_name", "school", "district", "category", "status", "created_at")
    list_filter = ("category", "status", "district", "created_at")
    search_fields = ("project_title", "student_name", "school", "teacher_mentor", "summary", "keywords")
    readonly_fields = SubmissionAdmin.readonly_fields + (
        "student_name", "gender", "age", "class_stream", "school", "district", "region",
        "student_email", "student_phone", "guardian_contact", "teacher_mentor", "head_teacher",
        "project_title", "category", "project_type", "keywords", "duration", "team_size",
        "summary", "declaration",
    )
    fieldsets = (
        ("Section 1 — student", {
            "fields": ("student_name", "gender", "age", "class_stream", "school", "district",
                       "region", "student_email", "student_phone", "guardian_contact",
                       "teacher_mentor", "head_teacher"),
        }),
        ("Section 3 — project", {
            "fields": ("project_title", "category", "project_type", "keywords", "duration",
                       "team_size", "summary", "declaration"),
        }),
        ("Handling", {"fields": ("status", "staff_notes")}),
        ("Record", {"fields": ("created_at", "updated_at", "notified_at"), "classes": ("collapse",)}),
    )


@admin.register(NewsletterSubscriber, site=admin_site)
class NewsletterSubscriberAdmin(ExportCsvMixin, admin.ModelAdmin):
    csv_filename = "newsletter-subscribers"
    list_display = ("email", "status", "source", "created_at", "unsubscribed_at")
    list_filter = ("status", "created_at")
    search_fields = ("email",)
    date_hierarchy = "created_at"
    readonly_fields = ("created_at", "updated_at")
    actions = ["export_as_csv", "mark_unsubscribed"]

    @admin.action(description="Mark as unsubscribed")
    def mark_unsubscribed(self, request, queryset):
        from django.utils import timezone

        updated = queryset.update(status="unsubscribed", unsubscribed_at=timezone.now())
        self.message_user(request, f"{updated} unsubscribed.")
