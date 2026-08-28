"""
Who did what, and when.

An audit trail is only worth having if it is trustworthy, which imposes three
rules on everything below.

It is append-only. Entries are never edited or deleted through the application
— the API exposes them read-only — because a log somebody can quietly correct
answers no question worth asking.

It never blocks the work. Writing an entry is best-effort: if logging fails,
the action it was recording still succeeds. Losing a donation record because an
audit row could not be written would be the worse outcome by far.

It records what changed, not merely that something did. "Updated volunteer 12"
is nearly useless three months later; "status: new → contacted" is the thing
somebody actually needs.
"""

from django.contrib.auth.models import User
from django.db import models

from core.countries import country_field
from core.models import TimeStampedModel


class ActivityLog(TimeStampedModel):
    """One recorded action."""

    class Action(models.TextChoices):
        CREATE = "create", "Created"
        UPDATE = "update", "Updated"
        DELETE = "delete", "Deleted"
        LOGIN = "login", "Signed in"
        LOGIN_FAILED = "login_failed", "Failed sign-in"
        LOGOUT = "logout", "Signed out"
        SEND = "send", "Sent"
        ACCESS_CHANGE = "access_change", "Changed access"
        UPLOAD = "upload", "Uploaded a file"

    # Kept even if the account is later removed: the trail has to survive the
    # person leaving, so the name is stored alongside the reference.
    actor = models.ForeignKey(
        User, null=True, blank=True, on_delete=models.SET_NULL, related_name="activity"
    )
    actor_name = models.CharField(max_length=150, blank=True)

    action = models.CharField(max_length=30, choices=Action.choices, db_index=True)

    #: The dashboard resource this concerns, e.g. "volunteers". Blank for
    #: actions that are not about a record, such as signing in.
    resource = models.CharField(max_length=60, blank=True, db_index=True)
    object_id = models.CharField(max_length=60, blank=True, db_index=True)
    #: How the record read at the time. Kept verbatim so a deleted record is
    #: still identifiable by name in the log.
    object_label = models.CharField(max_length=300, blank=True)

    #: {field: {"from": old, "to": new}} for updates; the created values for a
    #: create. Long text and anything sensitive is trimmed before it lands here.
    changes = models.JSONField(default=dict, blank=True)

    #: Free text for actions a diff does not describe, e.g. "Sent to 240
    #: subscribers".
    detail = models.CharField(max_length=500, blank=True)

    ip_address = models.GenericIPAddressField(null=True, blank=True)
    user_agent = models.CharField(max_length=300, blank=True)

    #: Copied from the record where it has one, so a country-scoped person sees
    #: their own country's activity and not another office's.
    country = country_field()

    class Meta:
        ordering = ["-created_at"]
        verbose_name = "activity log entry"
        verbose_name_plural = "activity log"
        indexes = [
            models.Index(fields=["resource", "object_id"]),
            models.Index(fields=["-created_at"]),
        ]

    def __str__(self):
        who = self.actor_name or "Someone"
        what = self.object_label or self.resource or ""
        return f"{who} {self.get_action_display().lower()} {what}".strip()
