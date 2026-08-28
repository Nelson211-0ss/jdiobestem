"""
Staff accounts and the attributes access is decided from.

Access is attribute-based rather than a flat list of permissions: what somebody
may do is computed from their role, the country they work in, and the resource
they are reaching for. That matters here because the Foundation works in two
countries — a Uganda coordinator and a South Sudan coordinator hold the same
role but must not see each other's students.

Django's own permission system is left in place for the Django admin; this sits
alongside it and governs the dashboard API.
"""

from django.contrib.auth.models import User
from django.db import models

from core.models import TimeStampedModel


from core.countries import STAFF_SCOPES  # noqa: E402


class Country(models.TextChoices):
    """Kept for the admin's choice list. A staff member is scoped to one office
    or to none — never to GLOBAL, which describes records rather than people."""

    ALL = "", "All countries"
    UGANDA = "UG", "Uganda"
    SOUTH_SUDAN = "SS", "South Sudan"
    UNITED_STATES = "US", "United States"


class Role(models.TextChoices):
    """
    Roles as the Foundation is actually organised, not as a permissions library
    imagines organisations to be.
    """

    SUPERADMIN = "superadmin", "Super administrator"
    DIRECTOR = "director", "Executive director"
    COUNTRY_DIRECTOR = "country_director", "Country director"
    PROGRAMME_MANAGER = "programme_manager", "Programme manager"
    MENTORSHIP_COORDINATOR = "mentorship_coordinator", "Mentorship coordinator"
    SCIENCE_FAIR_COORDINATOR = "science_fair_coordinator", "Science Fair coordinator"
    CONTENT_EDITOR = "content_editor", "Content editor"
    FINANCE = "finance", "Finance"
    VIEWER = "viewer", "Viewer"


class StaffProfile(TimeStampedModel):
    """The attributes every access decision is made from."""

    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="staff_profile")
    role = models.CharField(max_length=40, choices=Role.choices, default=Role.VIEWER, db_index=True)

    # Blank means every country. A country-scoped user only ever sees rows for
    # their own country, plus rows not yet assigned to one.
    country = models.CharField(
        max_length=2,
        choices=Country.choices,
        blank=True,
        default="",
        help_text="Leave blank for access across all countries.",
    )

    position = models.CharField(max_length=150, blank=True, help_text="Job title, as they would write it.")
    department = models.CharField(max_length=150, blank=True)
    phone = models.CharField(max_length=50, blank=True)

    class Meta:
        ordering = ["user__username"]
        verbose_name = "staff profile"

    def __str__(self):
        return f"{self.user.username} — {self.get_role_display()}"

    @property
    def country_label(self):
        return self.get_country_display() if self.country else "All countries"


class PermissionOverride(TimeStampedModel):
    """
    An exception to what a role grants, for one person.

    A role is a sensible default, not a straitjacket: a mentorship coordinator
    who also handles the newsletter, or a programme manager who must not see
    donations, should not need a whole new role invented for them.

    Deny always beats allow. If somebody has been explicitly denied something,
    no role and no other grant can put it back — which is the property you want
    when the reason for the denial is that they should not see it.
    """

    class Effect(models.TextChoices):
        ALLOW = "allow", "Allow"
        DENY = "deny", "Deny"

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="permission_overrides")
    resource = models.CharField(max_length=40, db_index=True)
    action = models.CharField(
        max_length=10,
        choices=[("view", "View"), ("add", "Add"), ("change", "Change"), ("delete", "Delete")],
    )
    effect = models.CharField(max_length=10, choices=Effect.choices, default=Effect.ALLOW)
    reason = models.CharField(
        max_length=255, blank=True, help_text="Why this exception exists. Worth writing down."
    )
    granted_by = models.ForeignKey(
        User, null=True, blank=True, on_delete=models.SET_NULL, related_name="permissions_granted"
    )

    class Meta:
        ordering = ["resource", "action"]
        constraints = [
            models.UniqueConstraint(
                fields=["user", "resource", "action"], name="unique_override_per_user_action"
            )
        ]

    def __str__(self):
        return f"{self.user.username}: {self.effect} {self.action} {self.resource}"
