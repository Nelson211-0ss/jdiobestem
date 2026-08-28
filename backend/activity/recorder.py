"""
Writing entries, and the mixin that makes every dashboard resource write them.

Everything here is wrapped so that a failure to log can never propagate into
the request. That is deliberate: the log is evidence about the work, not part
of it, and an audit row is not worth losing a donation over.
"""

from __future__ import annotations

import logging

from django.db import models

from .models import ActivityLog

logger = logging.getLogger(__name__)

#: Never copied into the log, whatever they are attached to. A password or a
#: token in an audit trail is a new place for it to leak from.
SENSITIVE = {
    "password", "new_password", "token", "api_key", "secret",
    "secret_key", "access_key", "csrfmiddlewaretoken",
}

#: Long prose makes the log unreadable and the table enormous. Enough is kept
#: to see what changed; the record itself holds the full text.
MAX_VALUE = 200


def _clean(value):
    """One field value, made safe and small enough to store."""
    if isinstance(value, models.Model):
        return str(value)
    if isinstance(value, (list, tuple)):
        return [_clean(v) for v in value][:20]
    if isinstance(value, dict):
        return {k: _clean(v) for k, v in list(value.items())[:20]}
    if value is None or isinstance(value, (bool, int, float)):
        return value
    text = str(value)
    return text if len(text) <= MAX_VALUE else text[:MAX_VALUE] + "…"


def _client(request):
    if request is None:
        return None, ""
    forwarded = request.META.get("HTTP_X_FORWARDED_FOR", "")
    ip = forwarded.split(",")[0].strip() or request.META.get("REMOTE_ADDR") or None
    return ip, (request.META.get("HTTP_USER_AGENT") or "")[:300]


def snapshot(instance) -> dict:
    """The stored fields of a record, ready to compare against."""
    if instance is None:
        return {}
    data = {}
    for field in instance._meta.fields:
        if field.name in SENSITIVE:
            continue
        try:
            data[field.name] = _clean(getattr(instance, field.attname, None))
        except Exception:  # noqa: BLE001 — a value we cannot read is not worth failing over
            continue
    return data


def diff(before: dict, after: dict) -> dict:
    """Only what actually moved. `updated_at` changes on every save and says
    nothing, so it is left out."""
    changes = {}
    for key, new in after.items():
        if key in ("updated_at", "created_at"):
            continue
        old = before.get(key)
        if old != new:
            changes[key] = {"from": old, "to": new}
    return changes


def record(
    request=None,
    *,
    action: str,
    resource: str = "",
    instance=None,
    object_id: str = "",
    object_label: str = "",
    changes: dict | None = None,
    detail: str = "",
    actor=None,
    country: str = "",
) -> ActivityLog | None:
    """Write one entry. Returns None if it could not be written."""
    try:
        user = actor if actor is not None else getattr(request, "user", None)
        if user is not None and not getattr(user, "is_authenticated", False):
            user = None

        if instance is not None:
            object_id = object_id or str(getattr(instance, "pk", "") or "")
            object_label = object_label or str(instance)[:300]
            country = country or str(getattr(instance, "country", "") or "")
            # A country held as a foreign key rather than a code.
            if country and not isinstance(country, str):
                country = str(country)

        ip, agent = _client(request)

        return ActivityLog.objects.create(
            actor=user,
            actor_name=(user.get_full_name() or user.username) if user else "",
            action=action,
            resource=resource or "",
            object_id=str(object_id or "")[:60],
            object_label=(object_label or "")[:300],
            changes=changes or {},
            detail=detail[:500],
            ip_address=ip,
            user_agent=agent,
            country=country if isinstance(country, str) else "",
        )
    except Exception:  # noqa: BLE001 — logging must never break the action
        logger.exception("Could not write an activity log entry for %s %s", action, resource)
        return None


class LoggedViewSetMixin:
    """
    Records create, update and delete for a dashboard resource.

    Mixed into the base view sets rather than bolted onto each one, so a new
    resource is logged the moment it exists and nobody has to remember.
    """

    def perform_create(self, serializer):
        super().perform_create(serializer)
        instance = serializer.instance
        record(
            self.request,
            action=ActivityLog.Action.CREATE,
            resource=getattr(self, "resource", "") or "",
            instance=instance,
            changes={k: v["to"] for k, v in diff({}, snapshot(instance)).items()},
        )

    def perform_update(self, serializer):
        # Read the stored row before saving: `serializer.instance` is mutated
        # in place, so reading it afterwards would compare a record with itself.
        before = {}
        try:
            before = snapshot(
                serializer.instance.__class__.objects.filter(pk=serializer.instance.pk).first()
            )
        except Exception:  # noqa: BLE001
            pass

        super().perform_update(serializer)
        instance = serializer.instance
        changes = diff(before, snapshot(instance))
        if not changes:
            return  # a save that changed nothing is not activity
        record(
            self.request,
            action=ActivityLog.Action.UPDATE,
            resource=getattr(self, "resource", "") or "",
            instance=instance,
            changes=changes,
        )

    def perform_destroy(self, instance):
        # Captured first: after deletion there is nothing left to describe.
        details = {
            "resource": getattr(self, "resource", "") or "",
            "object_id": str(getattr(instance, "pk", "") or ""),
            "object_label": str(instance)[:300],
            "country": str(getattr(instance, "country", "") or ""),
            "changes": snapshot(instance),
        }
        super().perform_destroy(instance)
        record(self.request, action=ActivityLog.Action.DELETE, **details)
