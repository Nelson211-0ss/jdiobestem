"""
Dashboard API: authentication, statistics, and CRUD over every model.

One ViewSet per model, each declaring what may be searched, filtered and
ordered. The Next.js dashboard is generic — it renders whatever a resource
declares — so this file is where a screen's behaviour is actually decided.
"""

from django.contrib.auth import authenticate
from django.contrib.auth.models import User
from django.db.models import Count, Sum
from django.utils import timezone
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError as DjangoValidationError

from activity.models import ActivityLog
from activity.recorder import LoggedViewSetMixin, record
from rest_framework import status, viewsets
from rest_framework.authtoken.models import Token
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response

from content_cms.models import (
    MagazineIssue,
    NewsStory,
    PageBlock,
    Programme,
    SiteStat,
    TeamMember,
)
from donations.models import Donation
from programmes.models import Cohort, Mentee, Mentor, MentorshipPairing, ProjectAward, ScienceFairProject
from submissions.models import (
    ContactMessage,
    NewsletterSubscriber,
    ProjectProposal,
    VolunteerApplication,
)

from . import admin_serializers as s
from accounts import policy

from .permissions import IsStaff, ResourcePermission


# ---------------------------------------------------------------- auth


@api_view(["POST"])
@permission_classes([AllowAny])
def login(request):
    """
    Exchange staff credentials for an API token.

    The dashboard stores the token in an httpOnly cookie, so it is never
    readable from JavaScript. Non-staff accounts are refused here rather than
    later: an authenticated non-staff token would otherwise be a valid
    credential with nothing to use it on.
    """
    username = str(request.data.get("username", "")).strip()
    password = str(request.data.get("password", ""))

    if not username or not password:
        return Response(
            {"detail": "Enter your username and password."}, status=status.HTTP_400_BAD_REQUEST
        )

    user = authenticate(request, username=username, password=password)
    if user is None or not user.is_active:
        # The username is recorded but never the password, and the response
        # stays identical either way so this cannot be used to discover which
        # usernames exist.
        record(
            request,
            action=ActivityLog.Action.LOGIN_FAILED,
            detail=f"Failed sign-in for '{username[:60]}'",
        )
        return Response(
            {"detail": "Those details were not recognised."}, status=status.HTTP_401_UNAUTHORIZED
        )
    if not user.is_staff:
        record(
            request,
            actor=user,
            action=ActivityLog.Action.LOGIN_FAILED,
            detail="Signed in with an account that has no dashboard access",
        )
        return Response(
            {"detail": "This account does not have dashboard access."},
            status=status.HTTP_403_FORBIDDEN,
        )

    token, _ = Token.objects.get_or_create(user=user)
    user.last_login = timezone.now()
    user.save(update_fields=["last_login"])

    record(request, actor=user, action=ActivityLog.Action.LOGIN, detail="Signed in")

    return Response({"token": token.key, "user": _identity(user)})


@api_view(["POST"])
@permission_classes([IsStaff])
def logout(request):
    """Destroy the token, so signing out invalidates it everywhere."""
    record(request, action=ActivityLog.Action.LOGOUT, detail="Signed out")
    Token.objects.filter(user=request.user).delete()
    return Response({"ok": True})



@api_view(["POST"])
@permission_classes([IsStaff])
def change_password(request):
    """
    Change your own password. Nobody else's — that is a separate, deliberate act
    by an administrator, not something this endpoint quietly allows.

    The current password is required even though the caller is already
    authenticated: a token left behind on a shared machine should not be enough
    to take an account over.
    """
    current = str(request.data.get("current_password", ""))
    new = str(request.data.get("new_password", ""))
    confirm = str(request.data.get("confirm_password", ""))

    if not current or not new:
        return Response(
            {"detail": "Enter your current password and a new one."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    if not request.user.check_password(current):
        record(
            request,
            action=ActivityLog.Action.LOGIN_FAILED,
            detail="Failed password change: current password was wrong",
        )
        return Response(
            {"current_password": ["That is not your current password."]},
            status=status.HTTP_400_BAD_REQUEST,
        )

    if confirm and new != confirm:
        return Response(
            {"confirm_password": ["The two new passwords do not match."]},
            status=status.HTTP_400_BAD_REQUEST,
        )

    if new == current:
        return Response(
            {"new_password": ["Your new password must be different from the current one."]},
            status=status.HTTP_400_BAD_REQUEST,
        )

    try:
        validate_password(new, user=request.user)
    except DjangoValidationError as exc:
        return Response({"new_password": list(exc.messages)}, status=status.HTTP_400_BAD_REQUEST)

    request.user.set_password(new)
    request.user.save(update_fields=["password"])

    # Changing a password should end every other session. The token is reissued
    # so the person doing it stays signed in here, and anyone holding the old
    # one is turned out.
    Token.objects.filter(user=request.user).delete()
    token, _created = Token.objects.get_or_create(user=request.user)

    record(
        request,
        action=ActivityLog.Action.ACCESS_CHANGE,
        resource="users",
        object_id=str(request.user.pk),
        object_label=request.user.get_full_name() or request.user.username,
        detail="Changed their own password",
    )

    return Response(
        {
            "detail": "Password changed. Any other signed-in sessions have been ended.",
            "token": token.key,
        }
    )

def _identity(user):
    """Who someone is, plus everything the dashboard needs to render for them.

    `permissions` is for the interface — it decides which nav items and buttons
    to draw. The API re-checks every request regardless; a hidden button is a
    convenience, never a control.
    """
    profile = policy.profile_of(user)
    return {
        "id": user.id,
        "username": user.username,
        "email": user.email,
        "name": user.get_full_name() or user.username,
        "is_superuser": user.is_superuser,
        "role": policy.role_of(user),
        "role_display": (
            "Super administrator" if user.is_superuser
            else (profile.get_role_display() if profile else "Viewer")
        ),
        "country": policy.country_of(user),
        "country_label": profile.country_label if profile else "All countries",
        # Comes from the team page rather than being uploaded twice, so a
        # person's photograph is maintained in one place.
        "avatar": profile.profile_photo if profile else "",
        "position": profile.position if profile else "",
        "department": profile.department if profile else "",
        "permissions": policy.permissions_for(user),
    }


@api_view(["GET"])
@permission_classes([IsStaff])
def me(request):
    return Response(_identity(request.user))


# ---------------------------------------------------------------- overview


def _schools_by_country(user):
    """
    Schools live on an operations board rather than in a table of their own,
    so they are counted by reading that board's Country column. Returns zeros
    when the board is absent or the column has not been filled in — which is
    honest, rather than quietly leaving schools off the map.
    """
    from accounts import policy
    from operations.models import Board, Record

    if not policy.can(user, "boards", "view"):
        return {"UG": 0, "SS": 0, "US": 0}

    board = Board.objects.filter(name__iexact="Schools", is_visible=True).first()
    if not board:
        return {"UG": 0, "SS": 0, "US": 0}

    column = board.columns.filter(title__iexact="Country").first()
    if not column:
        return {"UG": 0, "SS": 0, "US": 0}

    counts = {"UG": 0, "SS": 0, "US": 0}
    for label, code in (("Uganda", "UG"), ("South Sudan", "SS"), ("United States", "US")):
        counts[code] = Record.objects.filter(
            board=board, **{f"values__{column.monday_id}__iexact": label}
        ).count()
    return counts


@api_view(["GET"])
@permission_classes([IsStaff])
def stats(request):
    """Counts for the dashboard overview, in one round trip."""
    now = timezone.now()
    last_30 = now - timezone.timedelta(days=30)

    can_see_giving = policy.can(request.user, "donations", "view")
    succeeded = Donation.objects.filter(status=Donation.DonationStatus.SUCCEEDED)
    if not can_see_giving:
        succeeded = succeeded.none()
    given_total = succeeded.aggregate(total=Sum("amount_cents"))["total"] or 0
    given_30 = succeeded.filter(created_at__gte=last_30).aggregate(total=Sum("amount_cents"))["total"] or 0

    user = request.user

    def visible(model, resource):
        return policy.scope(user, model.objects.all(), resource)

    def needs_attention(model, resource):
        if not policy.can(user, resource, "view"):
            return 0
        return visible(model, resource).filter(status="new").count()

    def counted(model, resource, **filters):
        if not policy.can(user, resource, "view"):
            return 0
        return visible(model, resource).filter(**filters).count()

    return Response(
        {
            "inbox": {
                "volunteers": needs_attention(VolunteerApplication, "volunteers"),
                "contact": needs_attention(ContactMessage, "contact-messages"),
                "proposals": needs_attention(ProjectProposal, "proposals"),
                "total": (
                    needs_attention(VolunteerApplication, "volunteers")
                    + needs_attention(ContactMessage, "contact-messages")
                    + needs_attention(ProjectProposal, "proposals")
                ),
            },
            "totals": {
                "volunteers": counted(VolunteerApplication, "volunteers"),
                "contact": counted(ContactMessage, "contact-messages"),
                "proposals": counted(ProjectProposal, "proposals"),
                "subscribers": counted(NewsletterSubscriber, "subscribers", status="subscribed"),
                "mentors": counted(Mentor, "mentors", is_active=True),
                "mentees": counted(Mentee, "mentees", is_active=True),
                "pairings": counted(MentorshipPairing, "pairings", status="active"),
                "projects": counted(ScienceFairProject, "projects"),
                "news": counted(NewsStory, "news"),
                "news_published": counted(NewsStory, "news", is_published=True),
                "team": counted(TeamMember, "team", is_published=True),
                "issues": counted(MagazineIssue, "magazine"),
            },
            "giving": {
                "total_cents": given_total,
                "last_30_cents": given_30,
                "count": succeeded.count(),
                "count_30": succeeded.filter(created_at__gte=last_30).count(),
                "currency": (succeeded.values_list("currency", flat=True).first() or "usd").upper(),
            },
            "schools_by_country": _schools_by_country(request.user),
            # Per-country figures for the map on the overview. Counted through
            # the same scope as everything else, so a country-scoped user does
            # not see totals for rows they cannot open.
            "by_country": [
                {
                    "code": code,
                    "label": label,
                    "mentees": counted(Mentee, "mentees", country=code, is_active=True),
                    "mentors": counted(Mentor, "mentors", country=code, is_active=True),
                    "projects": counted(ScienceFairProject, "projects", country=code),
                    "volunteers": counted(VolunteerApplication, "volunteers", country=code),
                }
                for code, label in (("UG", "Uganda"), ("SS", "South Sudan"), ("US", "United States"))
            ],
            "volunteers_by_interest": list(
                visible(VolunteerApplication, "volunteers").values("interest")
                .annotate(count=Count("id"))
                .order_by("-count")
            ),
            "projects_by_stage": list(
                visible(ScienceFairProject, "projects").values("stage").annotate(count=Count("id")).order_by("-count")
            ),
        }
    )


# ---------------------------------------------------------------- CRUD


class StaffViewSet(LoggedViewSetMixin, viewsets.ModelViewSet):
    """
    Base for every dashboard resource.

    Two layers, both required. `ResourcePermission` decides whether the action
    is allowed at all; `get_queryset` narrows the rows to the ones this person's
    country covers. Neither is sufficient alone — without scoping, a Uganda
    coordinator allowed to view mentees would see South Sudan's too.
    """

    permission_classes = [ResourcePermission]
    resource: str = ""

    def get_queryset(self):
        return policy.scope(self.request.user, super().get_queryset(), self.resource)


class VolunteerApplicationViewSet(StaffViewSet):
    queryset = VolunteerApplication.objects.all()
    resource = "volunteers"
    serializer_class = s.VolunteerApplicationAdminSerializer
    filterset_fields = ["status", "interest"]
    search_fields = ["name", "email", "phone", "message"]
    ordering_fields = ["created_at", "name", "status"]
    ordering = ["-created_at"]


class ContactMessageViewSet(StaffViewSet):
    queryset = ContactMessage.objects.all()
    resource = "contact-messages"
    serializer_class = s.ContactMessageAdminSerializer
    filterset_fields = ["status"]
    search_fields = ["name", "email", "topic", "message"]
    ordering_fields = ["created_at", "name", "status"]
    ordering = ["-created_at"]


class ProjectProposalViewSet(StaffViewSet):
    queryset = ProjectProposal.objects.all()
    resource = "proposals"
    serializer_class = s.ProjectProposalAdminSerializer
    filterset_fields = ["status", "category", "district"]
    search_fields = ["project_title", "student_name", "school", "teacher_mentor", "summary"]
    ordering_fields = ["created_at", "school", "status"]
    ordering = ["-created_at"]


class NewsletterSubscriberViewSet(StaffViewSet):
    queryset = NewsletterSubscriber.objects.all()
    resource = "subscribers"
    serializer_class = s.NewsletterSubscriberAdminSerializer
    filterset_fields = ["status"]
    search_fields = ["email", "source"]
    ordering_fields = ["created_at", "email", "status"]
    ordering = ["-created_at"]


class DonationViewSet(viewsets.ReadOnlyModelViewSet):
    """Read-only: Stripe owns this data, and a local edit would create a total
    that quietly disagrees with the payment processor."""

    permission_classes = [ResourcePermission]
    resource = "donations"
    queryset = Donation.objects.all()
    serializer_class = s.DonationAdminSerializer
    filterset_fields = ["status", "livemode", "currency"]
    search_fields = ["donor_name", "donor_email", "stripe_session_id"]
    ordering_fields = ["created_at", "amount_cents"]
    ordering = ["-created_at"]


class NewsStoryViewSet(StaffViewSet):
    queryset = NewsStory.objects.prefetch_related("gallery", "links")
    resource = "news"
    serializer_class = s.NewsStoryAdminSerializer
    filterset_fields = ["is_published", "category"]
    search_fields = ["title", "excerpt", "body", "slug"]
    ordering_fields = ["date", "title", "created_at"]
    ordering = ["-date"]


class SiteStatViewSet(StaffViewSet):
    resource = "stats"
    queryset = SiteStat.objects.all()
    serializer_class = s.SiteStatAdminSerializer
    filterset_fields = ["is_published"]
    search_fields = ["label", "note"]
    ordering = ["order"]


class ProgrammeViewSet(StaffViewSet):
    queryset = Programme.objects.all()
    resource = "programmes"
    serializer_class = s.ProgrammeAdminSerializer
    filterset_fields = ["is_published", "country"]
    search_fields = ["name", "tagline", "summary", "slug"]
    ordering_fields = ["order", "name"]
    ordering = ["order", "name"]


class PageBlockViewSet(StaffViewSet):
    """Copy on the hand-built pages. Filtered by page, because nobody edits
    'all blocks' — they edit the About page."""

    queryset = PageBlock.objects.all()
    resource = "page-blocks"
    serializer_class = s.PageBlockAdminSerializer
    filterset_fields = ["page", "is_published", "country"]
    search_fields = ["page", "key", "value", "label"]
    ordering_fields = ["page", "key"]
    ordering = ["page", "key"]


class TeamMemberViewSet(StaffViewSet):
    queryset = TeamMember.objects.all()
    resource = "team"
    serializer_class = s.TeamMemberAdminSerializer
    filterset_fields = ["group", "is_published"]
    search_fields = ["name", "role", "bio"]
    ordering_fields = ["order", "name", "group"]
    ordering = ["group", "order", "name"]


class RecognisedVolunteerViewSet(StaffViewSet):
    """
    Volunteers the Foundation names publicly.

    The same table as team members, narrowed to the volunteers group. It gets a
    page of its own because it is a different job: the team page is who runs the
    organisation, and this is who gave their time — and whoever is thanking a
    volunteer should not have to scroll past the executive director to do it.

    The group is set here rather than left to the form, so a record created on
    this page cannot accidentally become a staff profile.
    """

    queryset = TeamMember.objects.filter(group=TeamMember.Group.VOLUNTEERS)
    resource = "recognised-volunteers"
    serializer_class = s.TeamMemberAdminSerializer
    filterset_fields = ["is_published", "country"]
    search_fields = ["name", "role", "bio"]
    ordering_fields = ["order", "name"]
    ordering = ["order", "name"]

    def perform_create(self, serializer):
        super().perform_create(serializer)
        if serializer.instance.group != TeamMember.Group.VOLUNTEERS:
            serializer.instance.group = TeamMember.Group.VOLUNTEERS
            serializer.instance.save(update_fields=["group"])


class MagazineIssueViewSet(StaffViewSet):
    queryset = MagazineIssue.objects.prefetch_related("stories")
    resource = "magazine"
    serializer_class = s.MagazineIssueAdminSerializer
    filterset_fields = ["status"]
    search_fields = ["name", "label", "summary"]
    ordering_fields = ["order", "issue_id"]
    ordering = ["order", "-issue_id"]


class CohortViewSet(StaffViewSet):
    queryset = Cohort.objects.all()
    resource = "cohorts"
    serializer_class = s.CohortAdminSerializer
    filterset_fields = ["is_active"]
    search_fields = ["name", "notes"]
    ordering_fields = ["starts_on", "name"]
    ordering = ["-starts_on", "name"]


class MentorViewSet(StaffViewSet):
    queryset = Mentor.objects.all()
    resource = "mentors"
    serializer_class = s.MentorAdminSerializer
    filterset_fields = ["is_active", "mode", "country"]
    search_fields = ["name", "email", "profession", "organisation", "expertise"]
    ordering_fields = ["name", "created_at"]
    ordering = ["name"]


class MenteeViewSet(StaffViewSet):
    queryset = Mentee.objects.all()
    resource = "mentees"
    serializer_class = s.MenteeAdminSerializer
    filterset_fields = ["is_active", "country", "district"]
    search_fields = ["name", "email", "school", "district"]
    ordering_fields = ["name", "created_at"]
    ordering = ["name"]


class MentorshipPairingViewSet(StaffViewSet):
    queryset = MentorshipPairing.objects.select_related("mentor", "mentee", "cohort")
    resource = "pairings"
    serializer_class = s.MentorshipPairingAdminSerializer
    filterset_fields = ["status", "cohort"]
    search_fields = ["mentor__name", "mentee__name", "notes"]
    ordering_fields = ["created_at", "started_on"]
    ordering = ["-created_at"]


class ScienceFairProjectViewSet(StaffViewSet):
    queryset = ScienceFairProject.objects.select_related("cohort")
    resource = "projects"
    serializer_class = s.ScienceFairProjectAdminSerializer
    filterset_fields = ["stage", "category", "cohort", "district"]
    search_fields = ["title", "school", "teacher_mentor", "notes"]
    ordering_fields = ["created_at", "title", "review_score"]
    ordering = ["-created_at"]


class ProjectAwardViewSet(StaffViewSet):
    """What students received for their projects."""

    queryset = ProjectAward.objects.select_related("project")
    resource = "project-awards"
    serializer_class = s.ProjectAwardAdminSerializer
    filterset_fields = ["kind", "is_delivered", "project"]
    search_fields = ["title", "description", "awarded_by", "project__title"]
    ordering_fields = ["awarded_on", "created_at", "title"]
    ordering = ["-awarded_on", "-created_at"]


class UserViewSet(StaffViewSet):
    """Staff accounts. Superusers only — see get_queryset."""

    queryset = User.objects.all()
    resource = "users"
    serializer_class = s.UserAdminSerializer
    search_fields = ["username", "email", "first_name", "last_name"]
    ordering_fields = ["username", "date_joined"]
    ordering = ["username"]

    def get_queryset(self):
        # Anyone with dashboard access can see who else has it; only a
        # superuser should be able to change accounts.
        return super().get_queryset()

    def _guard(self, request):
        if not request.user.is_superuser:
            from rest_framework.exceptions import PermissionDenied

            raise PermissionDenied("Only a superuser can change staff accounts.")

    def create(self, request, *args, **kwargs):
        self._guard(request)
        return super().create(request, *args, **kwargs)

    def update(self, request, *args, **kwargs):
        self._guard(request)
        return super().update(request, *args, **kwargs)

    def partial_update(self, request, *args, **kwargs):
        self._guard(request)
        return super().partial_update(request, *args, **kwargs)

    def destroy(self, request, *args, **kwargs):
        self._guard(request)
        return super().destroy(request, *args, **kwargs)
