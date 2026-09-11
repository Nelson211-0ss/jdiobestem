"""Board and record endpoints for the dashboard."""

from django.db.models import Q
from django.http import Http404
from activity.recorder import LoggedViewSetMixin
from core.exporting import ExportableMixin
from rest_framework import viewsets
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response

from django.contrib.auth.models import User

from documents.models import Document
from scholarships.models import Scholarship, ScholarshipTerm
from content_cms.models import TeamMember
from programmes.models import School, ScienceFairProject

from api.permissions import IsStaff, ResourcePermission

from .models import (
    Board,
    ExchangeRate,
    Office,
    OperatingCountry,
    Record,
    SalaryPayment,
)
from .serializers import (
    BoardDetailSerializer,
    BoardSerializer,
    ExchangeRateSerializer,
    OfficeSerializer,
    OperatingCountrySerializer,
    RecordSerializer,
    SalaryPaymentSerializer,
)


class BoardViewSet(viewsets.ReadOnlyModelViewSet):

    """
    Boards are read-only here.

    Their structure comes from monday and is rewritten on every sync, so editing
    a column in the dashboard would be silently undone. Records are editable;
    the schema is not.
    """

    permission_classes = [ResourcePermission]
    resource = "boards"
    queryset = Board.objects.filter(is_visible=True).prefetch_related("columns", "groups")
    serializer_class = BoardSerializer
    # Addressed by slug; the monday id still resolves so links kept from
    # before the rename do not break.
    lookup_field = "slug"
    lookup_value_regex = "[^/]+"
    filterset_fields = ["category"]
    search_fields = ["name", "description"]
    ordering = ["category", "name"]
    pagination_class = None

    def get_object(self):
        key = self.kwargs[self.lookup_field]
        board = (
            self.filter_queryset(self.get_queryset())
            .filter(Q(slug=key) | Q(monday_id=key))
            .first()
        )
        if board is None:
            raise Http404("No such board.")
        self.check_object_permissions(self.request, board)
        return board

    def get_serializer_class(self):
        return BoardDetailSerializer if self.action == "retrieve" else BoardSerializer


class RecordViewSet(ExportableMixin, LoggedViewSetMixin, viewsets.ModelViewSet):
    permission_classes = [ResourcePermission]
    resource = "boards"
    serializer_class = RecordSerializer
    search_fields = ["name"]
    ordering = ["-monday_updated_at", "-created_at"]

    def export_slug(self, request) -> str:
        """Every board shares the `boards` resource key, so name the file after
        the board itself — "expenses-2026-09-08.csv", not "boards-..."."""
        return str(self.kwargs.get("board_monday_id") or "board")

    def get_queryset(self):
        # Either address: the slug the dashboard now uses, or the monday id
        # that older links and bookmarks still carry.
        key = self.kwargs.get("board_monday_id")
        qs = Record.objects.filter(
            Q(board__slug=key) | Q(board__monday_id=key), parent_record__isnull=True
        ).select_related("board")

        group = self.request.query_params.get("group")
        if group:
            qs = qs.filter(group_id=group)

        search = self.request.query_params.get("search")
        if search:
            # Records are one JSONB row each, so a text match has to cover the
            # name and the values together.
            qs = qs.filter(Q(name__icontains=search) | Q(values__icontains=search))

        # Filter on any column: ?col.<monday_column_id>=value
        for key, value in self.request.query_params.items():
            if key.startswith("col.") and value:
                qs = qs.filter(**{f"values__{key[4:]}__icontains": value})

        return qs

    def board_in_scope(self):
        """The board this request is about, by either address."""
        key = self.kwargs.get("board_monday_id")
        return Board.objects.filter(Q(slug=key) | Q(monday_id=key)).first()

    def get_serializer_context(self):
        # The serializer needs the board to know whether an expense is
        # compound, and on create there is no instance to read it from.
        return {**super().get_serializer_context(), "board": self.board_in_scope()}

    def perform_create(self, serializer):
        board = self.board_in_scope()
        if board is None:
            raise Http404("No such page.")
        user = self.request.user
        # Created here, not yet in monday. The sync command leaves these alone.
        # The name is stored alongside the reference so the attribution reads
        # correctly even after an account is deleted.
        serializer.save(
            board=board,
            is_local=True,
            created_by=user,
            created_by_name=(user.get_full_name() or user.username) if user else "",
        )


@api_view(["GET"])
@permission_classes([IsStaff])
def board_index(request):
    """Every visible board, grouped by category, for the dashboard nav."""
    from accounts import policy

    if not policy.can(request.user, "boards", "view"):
        return Response({"categories": []})

    boards = Board.objects.filter(is_visible=True).order_by("category", "name")
    grouped: dict[str, list] = {}
    for board in boards:
        grouped.setdefault(board.get_category_display(), []).append(
            {
                "monday_id": board.monday_id,
                "slug": board.slug,
                "name": board.name,
                "description": board.description,
                "item_count": board.item_count,
                "synced_at": board.synced_at,
            }
        )
    return Response({"categories": [{"name": k, "boards": v} for k, v in grouped.items()]})


class OperatingCountryViewSet(ExportableMixin, LoggedViewSetMixin, viewsets.ModelViewSet):
    """The countries the Foundation works in. Country and currency selects
    everywhere else are drawn from this table."""

    permission_classes = [ResourcePermission]
    resource = "countries"
    # Prefetched because the serializer summarises each country's offices.
    queryset = OperatingCountry.objects.prefetch_related("offices")
    serializer_class = OperatingCountrySerializer
    search_fields = ["name", "code", "currency_code", "offices__name"]
    ordering = ["order", "name"]


class SalaryPaymentViewSet(ExportableMixin, LoggedViewSetMixin, viewsets.ModelViewSet):
    """
    What colleagues were paid. Granted to the Executive and Finance only —
    see the access matrix, where it is deliberately absent from every other
    role including the read-only one.
    """

    permission_classes = [ResourcePermission]
    resource = "salaries"
    queryset = SalaryPayment.objects.select_related("person")
    serializer_class = SalaryPaymentSerializer
    filterset_fields = ["person", "status", "currency"]
    search_fields = ["person__name", "period", "reference"]
    ordering_fields = ["paid_on", "amount", "period"]
    ordering = ["-paid_on"]


class ExchangeRateViewSet(ExportableMixin, LoggedViewSetMixin, viewsets.ModelViewSet):
    """
    The rates the Foundation has decided to use.

    Entered rather than fetched: a figure converted at a rate nobody recorded
    cannot be checked a year later, and one fetched live at render time cannot
    be checked at all.
    """

    permission_classes = [ResourcePermission]
    resource = "exchange-rates"
    queryset = ExchangeRate.objects.all()
    serializer_class = ExchangeRateSerializer
    filterset_fields = ["base", "quote"]
    search_fields = ["base", "quote", "note"]
    ordering_fields = ["effective_from", "base", "quote"]
    ordering = ["-effective_from"]


class OfficeViewSet(ExportableMixin, LoggedViewSetMixin, viewsets.ModelViewSet):
    def export_detail_tables(self, obj):
        """What this branch actually carries, for a per-office report."""
        from programmes.models import Mentee
        from scholarships.models import Scholarship

        return [
            (
                "Bursaries run from here",
                [("reference", "Ref"), ("student", "Student"), ("school", "School"),
                 ("status", "Status")],
                [
                    {"reference": s.reference, "student": s.student_name,
                     "school": s.school.name, "status": s.get_status_display()}
                    for s in Scholarship.objects.filter(office=obj)
                    .select_related("school").order_by("student_name")
                ],
            ),
            (
                "Mentees",
                [("name", "Name"), ("school", "School"), ("district", "District")],
                [
                    {"name": m.name, "school": m.school.name if m.school_id else "",
                     "district": m.district}
                    for m in Mentee.objects.filter(office=obj).select_related("school").order_by("name")
                ],
            ),
        ]

    """Offices, one main per country."""

    permission_classes = [ResourcePermission]
    resource = "offices"
    queryset = Office.objects.select_related("country")
    serializer_class = OfficeSerializer
    filterset_fields = ["country", "is_main", "is_active"]
    search_fields = ["name", "city", "region", "email"]
    ordering = ["country__order", "-is_main", "order", "name"]


@api_view(["GET"])
@permission_classes([IsStaff])
def option_lists(request):
    """
    Every choice list the dashboard needs that comes from data rather than code.

    One request, so a form does not have to make three. GLOBAL is offered
    alongside the real countries because records can belong to the Foundation
    as a whole; staff scopes are a different list and do not include it.
    """
    countries = OperatingCountry.objects.filter(is_active=True)
    return Response(
        {
            "countries": (
                [{"value": "GL", "label": "Global — all countries"}]
                + [{"value": c.code, "label": c.name} for c in countries]
            ),
            "staff_scopes": (
                [{"value": "", "label": "All countries"}]
                + [{"value": c.code, "label": c.name} for c in countries]
            ),
            "offices": [
                {
                    "value": str(o.pk),
                    "label": o.name,
                    "country": o.country.code,
                    "is_main": o.is_main,
                }
                for o in Office.objects.select_related("country").filter(is_active=True)
            ],
            "currencies": [
                {"value": c.currency_code, "label": f"{c.currency_code} — {c.name}"}
                for c in countries
            ],
            # Editions belong to a document, so the form needs the list to
            # choose from. Archived ones are left out: a new edition of a
            # retired document is almost always a mistake.
            "documents": [
                {"value": str(d.pk), "label": d.title}
                for d in Document.objects.filter(is_archived=False).order_by("title")
            ],
            # A payment belongs to a bursary, so the form needs the list.
            # Ended awards are included: a final payment often lands after
            # the student has already finished.
            "scholarships": [
                {"value": str(s.pk), "label": f"{s.reference} — {s.student_name} ({s.school.name})"[:140]}
                for s in Scholarship.objects.select_related("school").order_by("student_name")
            ],
            # Every programme records the school a student is at, so the
            # list is shared rather than retyped per form.
            "schools": [
                {"value": str(sc.pk), "label": f"{sc.name}{f' — {sc.district}' if sc.district else ''}"[:140]}
                for sc in School.objects.order_by("name")
            ],
            # A payment settles a term, so the form needs the list. Labelled
            # with the student, because "Term 1 2026" alone belongs to nobody.
            "terms": [
                {
                    "value": str(t.pk),
                    "label": f"{t.scholarship.reference} {t.scholarship.student_name} — {t}"[:140],
                }
                for t in ScholarshipTerm.objects.select_related("scholarship").order_by(
                    "-starts_on"
                )
            ],
            # People, for a field that names one — "reports to" is another
            # team member, not a login account.
            "team": [
                {"value": str(t.pk), "label": f"{t.name} — {t.role}"[:140]}
                for t in TeamMember.objects.order_by("name")
            ],
            "projects": [
                {"value": str(p.pk), "label": f"{p.title} — {p.school.name}"[:120]}
                for p in ScienceFairProject.objects.select_related("school").order_by("title")
            ],
            # Every staff account, not only the ones that can currently sign in.
            # "Inactive" here means "no password set yet" as often as it means
            # "left" — and an expense was paid by a colleague whether or not
            # that colleague has a working login.
            "staff": [
                {"value": str(u.pk), "label": u.get_full_name() or u.username}
                for u in User.objects.filter(is_staff=True).order_by(
                    "first_name", "last_name", "username"
                )
            ],
        }
    )
