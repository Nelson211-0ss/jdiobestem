from django.contrib import admin

from .models import StaffProfile


class StaffProfileInline(admin.StackedInline):
    model = StaffProfile
    can_delete = False
    extra = 0
    fields = ("role", "country", "position", "department", "phone")
