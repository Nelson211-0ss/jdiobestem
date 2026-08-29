"""
The access screen's API.

One endpoint returns everything the screen needs to render a person's access —
their profile, what their role grants, the exceptions on top, and the effective
result — and one accepts changes. Keeping it in a single round trip means the
matrix can never render half-updated.
"""

from django.contrib.auth.models import User
from django.db import transaction
from activity.models import ActivityLog
from activity.recorder import diff, record
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response

from api.permissions import IsStaff

from . import policy
from .models import Country, PermissionOverride, Role, StaffProfile

#: Human labels for the resources, so the matrix does not read like a URL.
RESOURCE_LABELS = {
    "volunteers": "Volunteer applications",
    "contact-messages": "Contact messages",
    "proposals": "Science Fair registrations",
    "subscribers": "Newsletter subscribers",
    "donations": "Donations",
    "news": "News stories",
    "team": "Team members",
    "recognised-volunteers": "Recognised volunteers",
    "magazine": "Magazine issues",
    "cohorts": "Cohorts",
    "mentors": "Mentors",
    "mentees": "Mentees",
    "pairings": "Mentorship pairings",
    "projects": "Student projects",
    "project-awards": "Project awards",
    "boards": "Operations boards",
    "countries": "Countries",
    "offices": "Offices",
    "documents": "Documents",
    "document-editions": "Document editions",
    "stats": "Home page figures",
    "programmes": "Programmes",
    "page-blocks": "Page copy",
    "newsletters": "Newsletters",
    "job-postings": "Positions",
    "job-applications": "Job applications",
    "activity": "Activity log",
    "users": "Staff access",
}

RESOURCE_GROUPS = [
    (
        "From the website",
        [
            "volunteers", "recognised-volunteers", "contact-messages",
            "proposals", "subscribers", "job-applications",
        ],
    ),
    ("Giving", ["donations"]),
    ("Programmes", ["cohorts", "mentors", "mentees", "pairings", "projects", "project-awards"]),
    ("Operations", ["boards", "countries", "offices", "documents", "document-editions"]),
    (
        "Website content",
        ["news", "team", "magazine", "stats", "programmes", "page-blocks", "newsletters", "job-postings"],
    ),
    ("Administration", ["users", "activity"]),
]


def _require_superuser(request):
    if not request.user.is_superuser:
        return Response(
            {"detail": "Only a superuser can change who has access to what."},
            status=status.HTTP_403_FORBIDDEN,
        )
    return None


def _access_payload(user):
    profile = policy.profile_of(user)
    return {
        "user": {
            "id": user.id,
            "username": user.username,
            "email": user.email,
            "first_name": user.first_name,
            "last_name": user.last_name,
            "is_active": user.is_active,
            "is_staff": user.is_staff,
            "is_superuser": user.is_superuser,
            "last_login": user.last_login,
        },
        "profile": {
            "role": profile.role if profile else Role.VIEWER,
            "role_display": profile.get_role_display() if profile else "Viewer",
            "country": profile.country if profile else "",
            "country_label": profile.country_label if profile else "All countries",
            "position": profile.position if profile else "",
            "department": profile.department if profile else "",
            "phone": profile.phone if profile else "",
        },
        "matrix": [
            {
                "group": group,
                "resources": [
                    {
                        "key": key,
                        "label": RESOURCE_LABELS.get(key, key),
                        "actions": policy.explain(user, key),
                    }
                    for key in keys
                ],
            }
            for group, keys in RESOURCE_GROUPS
        ],
        "options": {
            "roles": [{"value": v, "label": l} for v, l in Role.choices],
            "countries": [{"value": v, "label": l or "All countries"} for v, l in Country.choices],
            "actions": list(policy.ALL_ACTIONS),
        },
        # A superuser bypasses the whole policy, so the matrix is meaningless
        # for them. The screen says so rather than showing a grid of ticks that
        # cannot be changed.
        "bypasses_policy": user.is_superuser,
    }


@api_view(["GET"])
@permission_classes([IsStaff])
def user_access(request, pk):
    try:
        user = User.objects.select_related("staff_profile").get(pk=pk)
    except User.DoesNotExist:
        return Response({"detail": "No such account."}, status=status.HTTP_404_NOT_FOUND)

    if not (request.user.is_superuser or policy.can(request.user, "users", "view")):
        return Response({"detail": "Not permitted."}, status=status.HTTP_403_FORBIDDEN)

    return Response(_access_payload(user))


@api_view(["PATCH"])
@permission_classes([IsStaff])
def update_user_access(request, pk):
    denied = _require_superuser(request)
    if denied:
        return denied

    try:
        user = User.objects.select_related("staff_profile").get(pk=pk)
    except User.DoesNotExist:
        return Response({"detail": "No such account."}, status=status.HTTP_404_NOT_FOUND)

    data = request.data or {}

    # Guard against locking the last way in. Removing your own superuser flag,
    # or standing down the only remaining superuser, is refused rather than
    # merely warned about.
    if user.pk == request.user.pk and data.get("user", {}).get("is_superuser") is False:
        return Response(
            {"detail": "You cannot remove your own superuser access."},
            status=status.HTTP_400_BAD_REQUEST,
        )
    if data.get("user", {}).get("is_superuser") is False and user.is_superuser:
        others = User.objects.filter(is_superuser=True, is_active=True).exclude(pk=user.pk).count()
        if others == 0:
            return Response(
                {"detail": "This is the only superuser. Promote somebody else first."},
                status=status.HTTP_400_BAD_REQUEST,
            )

    # Captured before the write so the entry can say what actually moved.
    before_flags = {
        "is_active": user.is_active,
        "is_staff": user.is_staff,
        "is_superuser": user.is_superuser,
    }
    before_profile = {
        f: getattr(getattr(user, "staff_profile", None), f, "")
        for f in ("role", "country", "position", "department")
    }
    before_overrides = sorted(
        f"{o.resource}.{o.action}={o.effect}"
        for o in PermissionOverride.objects.filter(user=user)
    )

    with transaction.atomic():
        account = data.get("user") or {}
        for field in ("email", "first_name", "last_name"):
            if field in account:
                setattr(user, field, str(account[field] or "").strip())
        for flag in ("is_active", "is_staff", "is_superuser"):
            if flag in account:
                setattr(user, flag, bool(account[flag]))
        user.save()

        profile_data = data.get("profile") or {}
        if profile_data:
            profile, _ = StaffProfile.objects.get_or_create(user=user)
            for field in ("role", "country", "position", "department", "phone"):
                if field in profile_data:
                    setattr(profile, field, profile_data[field] or "")
            if "team_member" in profile_data:
                # Cleared as well as set: an empty value means "go back to
                # matching by email or name", not "leave whatever was there".
                value = profile_data["team_member"]
                profile.team_member_id = int(value) if value else None
            profile.save()

        # Overrides arrive as the complete set for this person, so the screen is
        # always the whole truth rather than a series of patches.
        if "overrides" in data:
            PermissionOverride.objects.filter(user=user).delete()
            for entry in data["overrides"] or []:
                resource = entry.get("resource")
                action = entry.get("action")
                effect = entry.get("effect")
                if resource not in RESOURCE_LABELS or action not in policy.ALL_ACTIONS:
                    continue
                if effect not in {"allow", "deny"}:
                    continue
                PermissionOverride.objects.create(
                    user=user,
                    resource=resource,
                    action=action,
                    effect=effect,
                    reason=str(entry.get("reason") or "")[:255],
                    granted_by=request.user,
                )

    user.refresh_from_db()
    if hasattr(user, "_override_cache"):
        del user._override_cache

    # Who can do what is the most consequential thing anyone changes here, so
    # it is logged with the before and after of every flag, role and override.
    after_flags = {
        "is_active": user.is_active,
        "is_staff": user.is_staff,
        "is_superuser": user.is_superuser,
    }
    after_profile = {
        f: getattr(getattr(user, "staff_profile", None), f, "")
        for f in ("role", "country", "position", "department")
    }
    after_overrides = sorted(
        f"{o.resource}.{o.action}={o.effect}"
        for o in PermissionOverride.objects.filter(user=user)
    )

    changes = diff({**before_flags, **before_profile}, {**after_flags, **after_profile})
    if before_overrides != after_overrides:
        changes["overrides"] = {"from": before_overrides, "to": after_overrides}

    if changes:
        record(
            request,
            action=ActivityLog.Action.ACCESS_CHANGE,
            resource="users",
            object_id=str(user.pk),
            object_label=user.get_full_name() or user.username,
            changes=changes,
            detail=f"Changed access for {user.username}",
        )

    return Response(_access_payload(user))
