"""
The access rules.

Two questions, answered separately:

  1. May this person perform this action on this kind of record?  -> `can()`
  2. Which rows of it may they see?                               -> `scope()`

Keeping them apart is what makes country scoping work. A mentorship coordinator
in Uganda and one in South Sudan both answer yes to question one for mentees;
they get different answers to question two.

A superuser bypasses both. That is the escape hatch, and it is the only one.
"""

from django.db.models import Q

from .models import Role

VIEW, ADD, CHANGE, DELETE = "view", "add", "change", "delete"
ALL_ACTIONS = (VIEW, ADD, CHANGE, DELETE)
READ_ONLY = (VIEW,)
NO_DELETE = (VIEW, ADD, CHANGE)

# Every resource the dashboard exposes. Names match the API's route segments.
RESOURCES = (
    "volunteers", "contact-messages", "proposals", "subscribers", "donations",
    "news", "team", "magazine", "stats", "newsletters", "programmes", "page-blocks",
    "documents", "document-editions", "activity",
    "cohorts", "mentors", "mentees", "pairings", "projects",
    "boards",
    "countries",
    "offices",
    "users",
)

# Convenience bundles, so the matrix below reads as intent rather than lists.
INBOX = ("volunteers", "contact-messages", "proposals", "subscribers")
CONTENT = ("news", "team", "magazine", "stats", "newsletters", "programmes", "page-blocks")
PROGRAMMES = ("cohorts", "mentors", "mentees", "pairings", "projects")
#: The monday.com operations boards, as one resource. Per-board permissions are
#: a finer grain than the Foundation has asked for; this is deliberately all or
#: nothing, and can be split later without changing how the engine works.
OPERATIONS = ("boards", "countries", "offices", "documents", "document-editions")
MENTORSHIP = ("cohorts", "mentors", "mentees", "pairings")
SCIENCE_FAIR = ("cohorts", "projects", "proposals")

#: role -> {resource: allowed actions}
MATRIX: dict[str, dict[str, tuple[str, ...]]] = {
    Role.SUPERADMIN: {r: ALL_ACTIONS for r in RESOURCES},
    Role.DIRECTOR: {
        **{r: NO_DELETE for r in INBOX},
        **{r: ALL_ACTIONS for r in CONTENT},
        **{r: ALL_ACTIONS for r in PROGRAMMES},
        "donations": READ_ONLY,
        **{r: ALL_ACTIONS for r in OPERATIONS},
        "users": READ_ONLY,  # can see who has access, cannot grant it
    },
    Role.COUNTRY_DIRECTOR: {
        **{r: NO_DELETE for r in INBOX},
        **{r: NO_DELETE for r in PROGRAMMES},
        **{r: READ_ONLY for r in CONTENT},
        "donations": READ_ONLY,
        **{r: NO_DELETE for r in OPERATIONS},
        "users": READ_ONLY,
    },
    Role.PROGRAMME_MANAGER: {
        **{r: NO_DELETE for r in INBOX},
        **{r: NO_DELETE for r in PROGRAMMES},
        **{r: READ_ONLY for r in CONTENT},
        **{r: NO_DELETE for r in OPERATIONS},
    },
    Role.MENTORSHIP_COORDINATOR: {
        **{r: NO_DELETE for r in MENTORSHIP},
        "volunteers": NO_DELETE,  # mentors arrive as volunteer applications
        "proposals": READ_ONLY,
        "projects": READ_ONLY,
        **{r: NO_DELETE for r in OPERATIONS},
    },
    Role.SCIENCE_FAIR_COORDINATOR: {
        **{r: NO_DELETE for r in SCIENCE_FAIR},
        "mentors": READ_ONLY,
        "mentees": NO_DELETE,
        **{r: NO_DELETE for r in OPERATIONS},
    },
    Role.CONTENT_EDITOR: {
        **{r: ALL_ACTIONS for r in CONTENT},
        "subscribers": READ_ONLY,
        # The Content & Media Calendar, Campaigns and Events boards are theirs.
        **{r: NO_DELETE for r in OPERATIONS},
    },
    Role.FINANCE: {
        "donations": READ_ONLY,
        "subscribers": READ_ONLY,
        **{r: NO_DELETE for r in OPERATIONS},
    },
    Role.VIEWER: {r: READ_ONLY for r in RESOURCES if r != "users"},
}

# The activity log is append-only for everyone, superusers included. It is
# written by the application as things happen and read by people afterwards;
# nobody edits it through the dashboard, because a trail that can be corrected
# from the inside is not evidence of anything. The API backs this up by
# exposing no write routes at all — this is the second of the two locks, not
# the only one.
# Who may read it: the roles accountable for how the organisation is run. A
# country director sees their own country's activity and not another office's,
# which is what the `country` column on each entry is for.
_MAY_READ_ACTIVITY = (
    Role.SUPERADMIN,
    Role.DIRECTOR,
    Role.COUNTRY_DIRECTOR,
)
for _role in MATRIX:
    if _role in _MAY_READ_ACTIVITY:
        MATRIX[_role]["activity"] = READ_ONLY
    else:
        MATRIX[_role].pop("activity", None)

#: Resources carrying a country, and the field to filter on. Anything absent
#: here is global — content and the mailing list belong to the whole Foundation,
#: not to one office.
COUNTRY_FIELD = {
    "volunteers": "country",
    "contact-messages": "country",
    "proposals": "country",
    "subscribers": "country",
    "newsletters": "country",
    "programmes": "country",
    "page-blocks": "country",
    "documents": "country",
    "document-editions": "document__country",
    "activity": "country",
    "donations": "country",
    "news": "country",
    "team": "country",
    "magazine": "country",
    "boards": "country",
    "mentors": "country",
    "mentees": "country",
    "projects": "country",
    "pairings": "mentee__country",
}


def profile_of(user):
    return getattr(user, "staff_profile", None)


def role_of(user) -> str:
    if user.is_superuser:
        return Role.SUPERADMIN
    profile = profile_of(user)
    return profile.role if profile else Role.VIEWER


def country_of(user) -> str:
    """Empty string means every country."""
    if user.is_superuser:
        return ""
    profile = profile_of(user)
    return profile.country if profile else ""


def role_actions(user, resource: str) -> tuple[str, ...]:
    """What the role alone grants, before any per-user exception."""
    if user.is_superuser:
        return ALL_ACTIONS
    return MATRIX.get(role_of(user), {}).get(resource, ())


def overrides_for(user) -> dict[tuple[str, str], str]:
    """{(resource, action): effect} for one person, in one query."""
    if not user or not user.is_authenticated:
        return {}
    cached = getattr(user, "_override_cache", None)
    if cached is None:
        cached = {
            (o.resource, o.action): o.effect
            for o in user.permission_overrides.all()
        }
        user._override_cache = cached
    return cached


def allowed_actions(user, resource: str) -> tuple[str, ...]:
    """
    The effective permissions: the role, then the exceptions.

    Resolution order is deliberate — deny is checked last and wins outright.
    An explicit denial is usually there because somebody must not see
    something, and a later grant quietly overturning it would be the wrong
    failure.
    """
    if user.is_superuser:
        return ALL_ACTIONS

    granted = set(role_actions(user, resource))
    exceptions = overrides_for(user)

    for action in ALL_ACTIONS:
        effect = exceptions.get((resource, action))
        if effect == "allow":
            granted.add(action)
        elif effect == "deny":
            granted.discard(action)

    # Anything beyond view implies being able to see it at all.
    if granted and "view" not in granted and exceptions.get((resource, "view")) != "deny":
        granted.add("view")

    return tuple(a for a in ALL_ACTIONS if a in granted)


def can(user, resource: str, action: str) -> bool:
    return action in allowed_actions(user, resource)


def explain(user, resource: str) -> dict[str, dict]:
    """
    Per-action detail for the access screen: what the role gives, what
    exception applies, and what the person can actually do.
    """
    exceptions = overrides_for(user)
    from_role = set(role_actions(user, resource))
    effective = set(allowed_actions(user, resource))
    return {
        action: {
            "role": action in from_role,
            "override": exceptions.get((resource, action)),
            "effective": action in effective,
        }
        for action in ALL_ACTIONS
    }


def scope(user, queryset, resource: str):
    """
    Narrow a queryset to the rows this person may see.

    A country-scoped user gets their own country plus anything not yet assigned
    to one. Unassigned rows have to stay visible — a new volunteer application
    arrives with no country on it, and a coordinator who could not see it could
    never act on it. Assigning the country is how it leaves their view.
    """
    country = country_of(user)
    if not country:
        return queryset

    field = COUNTRY_FIELD.get(resource)
    if not field:
        return queryset

    # Their office, plus what belongs to everyone, plus what nobody has claimed.
    return queryset.filter(
        Q(**{field: country}) | Q(**{field: "GL"}) | Q(**{field: ""})
    )


def permissions_for(user) -> dict[str, list[str]]:
    """The whole matrix for one person, for the dashboard to render from.

    The UI hides what it is told to hide; the API refuses regardless. This is
    for the interface, never the enforcement.
    """
    return {resource: list(allowed_actions(user, resource)) for resource in RESOURCES}
