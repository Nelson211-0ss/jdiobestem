"""
The access screen's API.

One endpoint returns everything the screen needs to render a person's access —
their profile, what their role grants, the exceptions on top, and the effective
result — and one accepts changes. Keeping it in a single round trip means the
matrix can never render half-updated.
"""

from django.conf import settings
from django.contrib.auth.models import User
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError as DjangoValidationError
from django.db import transaction
from rest_framework.authtoken.models import Token
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
            "volunteers", "contact-messages",
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
            # Seeded accounts are created with no usable password. Without this
            # the screen cannot say why an active account still cannot sign in.
            "has_password": user.has_usable_password(),
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


@api_view(["POST"])
@permission_classes([IsStaff])
def set_user_password(request, pk):
    """
    Set somebody else's password.

    Separate from `update_user_access` on purpose. Changing what a person may do
    and handing them the key to get in are different decisions, and one should
    not ride along inside a form submission about the other — an audit trail
    that cannot tell them apart is not much of a trail.

    Only a superuser, and the same strength rules everyone else is held to.
    """
    denied = _require_superuser(request)
    if denied:
        return denied

    try:
        user = User.objects.get(pk=pk)
    except User.DoesNotExist:
        return Response({"detail": "No such account."}, status=status.HTTP_404_NOT_FOUND)

    new = str(request.data.get("password", ""))
    if not new:
        return Response({"password": ["Enter a password."]}, status=status.HTTP_400_BAD_REQUEST)

    try:
        validate_password(new, user=user)
    except DjangoValidationError as exc:
        return Response({"password": list(exc.messages)}, status=status.HTTP_400_BAD_REQUEST)

    user.set_password(new)
    user.save(update_fields=["password"])

    # Any session that account already had is ended. If the password is being
    # set because something went wrong, leaving the old token alive would
    # defeat the point.
    Token.objects.filter(user=user).delete()

    record(
        request,
        action=ActivityLog.Action.ACCESS_CHANGE,
        resource="users",
        object_id=str(user.pk),
        object_label=user.get_full_name() or user.username,
        detail=f"Set the password for {user.username}",
    )

    return Response({"detail": f"Password set for {user.username}."})


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

    # Sign-in is by work email, so the address is the credential: it has to be
    # at the Foundation's domain, and it has to be unique. An account with a
    # blank or foreign address cannot sign in at all, and two accounts sharing
    # one would make the credential ambiguous.
    email = str((data.get("user") or {}).get("email", "")).strip()
    if email:
        domain = settings.STAFF_EMAIL_DOMAIN
        if not email.lower().endswith(f"@{domain}"):
            return Response(
                {"email": [f"Use their @{domain} address — that is what they sign in with."]},
                status=status.HTTP_400_BAD_REQUEST,
            )
        clash = User.objects.filter(email__iexact=email).exclude(pk=pk).first()
        if clash:
            return Response(
                {"email": [f"{clash.username} already uses that address."]},
                status=status.HTTP_400_BAD_REQUEST,
            )

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
    # Switched off through this form is switched off: end their sessions too,
    # as Revoke access does, or a browser left open keeps working.
    if before_flags["is_active"] and not user.is_active:
        _sign_out_everywhere(user)
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


# --- Accounts: creating, revoking, signing out --------------------------------
#
# Everything above changes what an existing account may do. These are the
# other half of looking after colleagues: giving somebody an account in the
# first place, taking access away when they leave, and ending their sessions
# when a laptop goes missing. All superuser-only, all on the activity log.


def _sign_out_everywhere(user) -> int:
    """
    End every way this account is currently signed in. Returns how many.

    The dashboard signs in with an API token; the Django admin uses a session.
    Both are removed — revoking somebody's access while a browser of theirs is
    still holding a live session would only look like revoking it.
    """
    from django.contrib.sessions.models import Session
    from django.utils import timezone

    ended, _ = Token.objects.filter(user=user).delete()
    for session in Session.objects.filter(expire_date__gt=timezone.now()).iterator():
        try:
            owner = session.get_decoded().get("_auth_user_id")
        except Exception:  # a corrupt session is nobody's
            continue
        if str(owner) == str(user.pk):
            session.delete()
            ended += 1
    return ended


def _free_username(email: str) -> str:
    """`jane.doe` from `jane.doe@…`, with a number added if it is taken."""
    base = (email.split("@")[0] or "staff").lower()[:140]
    candidate, n = base, 1
    while User.objects.filter(username__iexact=candidate).exists():
        n += 1
        candidate = f"{base}{n}"
    return candidate


@api_view(["GET", "POST"])
@permission_classes([IsStaff])
def staff_accounts(request):
    """
    GET: what the new-account form needs to offer.
    POST: create an account, its role and scope, in one step.

    An account made without its role was a Viewer that somebody then had to
    remember to promote; made without a password, it was one nobody could use.
    Both are asked for here, the password optionally — it can be set later
    from the account's page, as before.
    """
    denied = _require_superuser(request)
    if denied:
        return denied

    from content_cms.models import TeamMember

    if request.method == "GET":
        members = TeamMember.objects.filter(account__isnull=True).order_by("name")
        return Response(
            {
                "roles": [{"value": v, "label": l} for v, l in Role.choices],
                "countries": [{"value": v, "label": l or "All countries"} for v, l in Country.choices],
                "team_members": [
                    {"value": m.id, "label": m.name, "email": m.email or "", "role": m.get_role_display()}
                    for m in members
                ],
                "email_domain": settings.STAFF_EMAIL_DOMAIN,
            }
        )

    data = request.data or {}
    first_name = str(data.get("first_name") or "").strip()
    last_name = str(data.get("last_name") or "").strip()
    email = str(data.get("email") or "").strip().lower()
    role = str(data.get("role") or Role.VIEWER)
    country = str(data.get("country") or "")
    position = str(data.get("position") or "").strip()[:150]
    password = str(data.get("password") or "")
    member_id = data.get("team_member")

    errors: dict[str, list[str]] = {}
    if not first_name:
        errors["first_name"] = ["Enter their first name."]
    domain = settings.STAFF_EMAIL_DOMAIN
    if not email:
        errors["email"] = [f"Enter their @{domain} address — it is what they sign in with."]
    elif not email.endswith(f"@{domain}"):
        errors["email"] = [f"Use their @{domain} address — that is what they sign in with."]
    else:
        clash = User.objects.filter(email__iexact=email).first()
        if clash:
            errors["email"] = [f"{clash.username} already uses that address."]
    if role not in Role.values:
        errors["role"] = ["Choose a role."]
    if country not in Country.values:
        errors["country"] = ["Choose a country, or All countries."]

    member = None
    if member_id not in (None, "", 0, "0"):
        try:
            member = TeamMember.objects.get(pk=int(member_id))
        except (TeamMember.DoesNotExist, TypeError, ValueError):
            errors["team_member"] = ["That team member no longer exists."]
        else:
            if member.account_id:
                errors["team_member"] = [f"{member.name} already has an account."]

    username = _free_username(email) if email else ""
    if password:
        try:
            validate_password(
                password,
                user=User(username=username, email=email, first_name=first_name, last_name=last_name),
            )
        except DjangoValidationError as exc:
            errors["password"] = list(exc.messages)

    if errors:
        return Response(errors, status=status.HTTP_400_BAD_REQUEST)

    with transaction.atomic():
        user = User(
            username=username,
            email=email,
            first_name=first_name,
            last_name=last_name,
            is_staff=True,
            is_active=True,
        )
        if password:
            user.set_password(password)
        else:
            user.set_unusable_password()
        user.save()
        profile, _ = StaffProfile.objects.get_or_create(user=user)
        profile.role = role
        profile.country = country
        profile.position = position
        profile.team_member = member
        profile.save()
        if member is not None:
            member.account = user
            member.save(update_fields=["account"])

    record(
        request,
        action=ActivityLog.Action.CREATE,
        resource="users",
        object_id=str(user.pk),
        object_label=user.get_full_name() or user.username,
        detail=(
            f"Created an account for {user.username} as {profile.get_role_display()}, "
            f"{profile.country_label}" + ("" if password else " — no password set yet")
        ),
    )
    return Response({"id": user.pk, "username": user.username}, status=status.HTTP_201_CREATED)


@api_view(["POST"])
@permission_classes([IsStaff])
def set_account_active(request, pk):
    """
    Revoke or restore somebody's access — `{"active": false}` or `true`.

    Revoking switches the account off and signs it out everywhere at once. The
    account, its role and its history are kept: a colleague who leaves is
    still the person who recorded last year's payments, and somebody who comes
    back is restored rather than rebuilt.
    """
    denied = _require_superuser(request)
    if denied:
        return denied
    try:
        user = User.objects.select_related("staff_profile").get(pk=pk)
    except User.DoesNotExist:
        return Response({"detail": "No such account."}, status=status.HTTP_404_NOT_FOUND)

    active = bool((request.data or {}).get("active"))
    if not active and user.pk == request.user.pk:
        return Response(
            {"detail": "You cannot revoke your own access."}, status=status.HTTP_400_BAD_REQUEST
        )
    if not active and user.is_superuser:
        others = User.objects.filter(is_superuser=True, is_active=True).exclude(pk=user.pk).count()
        if others == 0:
            return Response(
                {"detail": "This is the only active superuser. Make someone else one first."},
                status=status.HTTP_400_BAD_REQUEST,
            )

    was_active = user.is_active
    user.is_active = active
    user.save(update_fields=["is_active"])
    ended = _sign_out_everywhere(user) if not active else 0

    if was_active != active:
        record(
            request,
            action=ActivityLog.Action.ACCESS_CHANGE,
            resource="users",
            object_id=str(user.pk),
            object_label=user.get_full_name() or user.username,
            changes={"is_active": {"from": was_active, "to": active}},
            detail=(
                f"Revoked access for {user.username} and ended {ended} signed-in session(s)"
                if not active
                else f"Restored access for {user.username}"
            ),
        )
    return Response(_access_payload(user))


@api_view(["POST"])
@permission_classes([IsStaff])
def sign_out_account(request, pk):
    """
    End somebody's sessions without touching their access — for a lost phone
    or a shared computer. They can sign straight back in with their password.
    """
    denied = _require_superuser(request)
    if denied:
        return denied
    try:
        user = User.objects.get(pk=pk)
    except User.DoesNotExist:
        return Response({"detail": "No such account."}, status=status.HTTP_404_NOT_FOUND)
    if user.pk == request.user.pk:
        return Response(
            {"detail": "To sign yourself out, use Sign out in your own menu."},
            status=status.HTTP_400_BAD_REQUEST,
        )
    ended = _sign_out_everywhere(user)
    record(
        request,
        action=ActivityLog.Action.LOGOUT,
        resource="users",
        object_id=str(user.pk),
        object_label=user.get_full_name() or user.username,
        detail=f"Signed {user.username} out everywhere ({ended} session(s) ended)",
    )
    return Response({"detail": f"{user.username} has been signed out everywhere.", "ended": ended})
