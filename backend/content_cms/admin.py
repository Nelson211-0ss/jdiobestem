from django.contrib import admin
from django.utils.html import format_html

from core.admin_site import admin_site

from .models import (
    MagazineIssue,
    MagazineStory,
    NewsGalleryImage,
    NewsLink,
    NewsStory,
    TeamMember,
)


class NewsGalleryImageInline(admin.TabularInline):
    model = NewsGalleryImage
    extra = 1


class NewsLinkInline(admin.TabularInline):
    model = NewsLink
    extra = 1


@admin.register(NewsStory, site=admin_site)
class NewsStoryAdmin(admin.ModelAdmin):
    list_display = ("title", "category", "date", "is_published")
    list_filter = ("is_published", "category", "date")
    search_fields = ("title", "excerpt", "body")
    prepopulated_fields = {"slug": ("title",)}
    date_hierarchy = "date"
    inlines = [NewsGalleryImageInline, NewsLinkInline]
    fieldsets = (
        (None, {"fields": ("title", "slug", "category", "date", "date_label", "reading_time", "is_published")}),
        ("Copy", {"fields": ("excerpt", "body")}),
        (
            "Lead photograph",
            {
                "fields": ("image", "image_upload", "image_alt", "caption"),
                "description": "Optional. A story with no photograph of our own reads better than "
                "one with a stock image that misrepresents where it happened.",
            },
        ),
    )


@admin.register(TeamMember, site=admin_site)
class TeamMemberAdmin(admin.ModelAdmin):
    list_display = ("name", "role", "group", "order", "is_published")
    list_filter = ("group", "is_published")
    search_fields = ("name", "role", "bio")
    list_editable = ("order", "is_published")


class MagazineStoryInline(admin.TabularInline):
    model = MagazineStory
    extra = 1


@admin.register(MagazineIssue, site=admin_site)
class MagazineIssueAdmin(admin.ModelAdmin):
    list_display = ("name", "label", "status", "file_contains", "order")
    list_filter = ("status",)
    search_fields = ("name", "label", "summary")
    list_editable = ("order",)
    inlines = [MagazineStoryInline]
    fieldsets = (
        (None, {"fields": ("issue_id", "label", "name", "status", "order", "summary")}),
        ("Artwork", {"fields": ("cover", "cover_upload", "cover_alt", "wrap", "wrap_alt")}),
        (
            "Download",
            {
                "fields": ("file_href", "file_upload", "file_filename", "file_size", "file_contains"),
                "description": "Set 'what the file contains' honestly — the page uses it so it "
                "never offers a cover as though it were the full issue.",
            },
        ),
        ("Epigraph", {"fields": ("epigraph_quote", "epigraph_attribution", "epigraph_source"), "classes": ("collapse",)}),
    )
