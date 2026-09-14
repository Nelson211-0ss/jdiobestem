"""Board and record endpoints for the dashboard."""

import django_filters
from django.db.models import Q
from django.utils import timezone
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
    Invoice,
    Office,
    OperatingCountry,
    Record,
    SalaryPayment,
)
from .serializers import (
    BoardDetailSerializer,
    BoardSerializer,
    ExchangeRateSerializer,
    InvoiceSerializer,
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

    # A page a programme has claimed is read on that programme, so listing it
    # here as well would be two ways to the same records and a category row
    # holding one page nobody goes to that way.
    from content_cms.models import Programme

    claimed = set(Programme.objects.exclude(board="").values_list("board", flat=True))

    grouped: dict[str, list] = {}
    boards = Board.objects.filter(is_visible=True).order_by("category", "name")
    for board in boards:
        if board.slug in claimed:
            continue
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


class InvoiceFilter(django_filters.FilterSet):
    """
    The two questions anybody opens this screen to ask.

    Settled and overdue are derived from dates rather than stored, so they
    cannot be plain field filters — but they are the only filters that matter
    for chasing a bill, so they are spelled out here rather than left to
    whoever is reading the list to work out by eye.
    """

    settled = django_filters.BooleanFilter(method="filter_settled")
    overdue = django_filters.BooleanFilter(method="filter_overdue")
    supplier = django_filters.CharFilter(lookup_expr="icontains")

    class Meta:
        model = Invoice
        fields = ["status", "currency", "country", "office", "expense", "supplier"]

    def _settled(self):
        return Q(paid_on__isnull=False) | Q(expense__isnull=False)

    def filter_settled(self, queryset, name, value):
        return queryset.filter(self._settled()) if value else queryset.exclude(self._settled())

    def filter_overdue(self, queryset, name, value):
        late = (
            Q(due_on__isnull=False)
            & Q(due_on__lt=timezone.localdate())
            & ~Q(status=Invoice.Status.CANCELLED)
        ) & ~self._settled()
        return queryset.filter(late) if value else queryset.exclude(late)


class InvoiceViewSet(ExportableMixin, LoggedViewSetMixin, viewsets.ModelViewSet):
    """
    Bills received, and whether they have been settled.

    Ordered by due date rather than by when they were entered: the useful
    reading of this list is "what is late and what is next", and that is the
    order somebody chasing payments works in.
    """

    permission_classes = [ResourcePermission]
    resource = "invoices"
    queryset = Invoice.objects.select_related("office", "expense")
    serializer_class = InvoiceSerializer
    filterset_class = InvoiceFilter
    search_fields = ["supplier", "number", "description", "notes"]
    ordering_fields = ["issued_on", "due_on", "amount", "supplier"]
    ordering = ["-issued_on"]

    def export_detail_tables(self, obj):
        """What settled it, so a report of one invoice answers that too."""
        expense = obj.expense
        if expense is None:
            return []
        amount = next(
            (
                (expense.values or {}).get(c.monday_id)
                for c in expense.board.columns.all()
                if c.title == "Amount"
            ),
            None,
        )
        return [
            (
                "Settled by",
                [("expense", "Expense"), ("amount", "Amount"), ("paid", "Paid")],
                [
                    {
                        "expense": expense.name,
                        "amount": amount or "",
                        "paid": obj.paid_on.strftime("%d %b %Y") if obj.paid_on else "",
                    }
                ],
            )
        ]


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


#: What a school year is divided into, by the level the school teaches. A
#: university student sits semesters and a secondary student sits terms, and
#: offering "Term 3" against a degree is how a record ends up meaning nothing.
TERM_PERIODS = {
    "tertiary": ["Semester 1", "Semester 2"],
}
DEFAULT_PERIODS = ["Term 1", "Term 2", "Term 3"]


def _term_options():
    """
    Every term a payment could settle, per bursary.

    Two kinds of entry. The terms that exist carry their id. The periods the
    bursary has not been given yet carry `new:` and their name — choosing one
    creates it, so a payment can say what it is for on the day it goes out
    rather than waiting on somebody to set the year up first.
    """
    from scholarships.models import Scholarship

    rows = []
    bursaries = Scholarship.objects.select_related("school").prefetch_related("terms")
    for bursary in bursaries:
        who = str(bursary.pk)
        named = set()
        for term in sorted(
            bursary.terms.all(), key=lambda t: (t.starts_on is None, t.starts_on or "", t.label)
        ):
            named.add(term.label.strip().lower())
            rows.append({"value": str(term.pk), "label": str(term)[:140], "scholarship": who})
        for period in TERM_PERIODS.get(bursary.school.level, DEFAULT_PERIODS):
            if period.strip().lower() in named:
                continue
            rows.append(
                {
                    "value": f"new:{period}",
                    "label": f"{period} — not set up yet",
                    "scholarship": who,
                }
            )
    return rows


#: How far each stage runs, by country. Uganda takes seven years of primary
#: and six of secondary; South Sudan takes eight and four. A single list would
#: be wrong in one country or the other, and P8 quietly missing is a South
#: Sudanese pupil who cannot be recorded in the class they are actually in.
STAGES = {
    "UG": {"primary": 7, "secondary": 6},
    "SS": {"primary": 8, "secondary": 4},
}
DEFAULT_STAGES = {"primary": 7, "secondary": 6}


def _classes_for(level: str, country: str) -> list[str]:
    stages = STAGES.get(country, DEFAULT_STAGES)
    if level == "tertiary":
        return [f"Year {n}" for n in range(1, 6)]
    if level == "vocational":
        return [f"Year {n}" for n in range(1, 4)]
    primary = [f"P{n}" for n in range(1, stages["primary"] + 1)]
    secondary = [f"S{n}" for n in range(1, stages["secondary"] + 1)]
    if level == "primary":
        return primary
    if level == "secondary":
        return secondary
    # Combined, or a school whose level nobody has filled in: offer both rather
    # than nothing, because an empty select is worse than a long one.
    return primary + secondary


def _class_options():
    """The classes a bursary can name, per school.

    Tagged with the school rather than the bursary because the bursary form
    asks for the school first and the class after it, so that is the answer
    already on the screen when this list is needed.
    """
    from programmes.models import School
    from scholarships.models import Scholarship

    in_use: dict[int, set[str]] = {}
    for school_id, at_award, now in Scholarship.objects.values_list(
        "school_id", "class_at_award", "current_class"
    ):
        for value in (at_award, now):
            if value:
                in_use.setdefault(school_id, set()).add(value)

    rows = []
    for school in School.objects.all():
        names = _classes_for(school.level, school.country)
        # Whatever is already recorded stays offered, so editing a bursary
        # cannot silently drop a class this school actually uses.
        names += sorted(n for n in in_use.get(school.pk, set()) if n not in names)
        rows.extend({"value": n, "label": n, "school": str(school.pk)} for n in names)
    return rows


def _period_options():
    """What a term can be called, per bursary.

    The periods that student's school runs, plus anything already in use on
    that bursary — a school with an unusual calendar has its wording kept
    rather than replaced the next time somebody edits the term.
    """
    from scholarships.models import Scholarship

    rows = []
    for bursary in Scholarship.objects.select_related("school").prefetch_related("terms"):
        who = str(bursary.pk)
        names = list(TERM_PERIODS.get(bursary.school.level, DEFAULT_PERIODS))
        for term in bursary.terms.all():
            if term.label and term.label not in names:
                names.append(term.label)
        rows.extend({"value": n, "label": n, "scholarship": who} for n in names)
    return rows


def _expense_options():
    """Recent expenses, labelled the way somebody holding the bill would read
    them — what it was, when, and for how much."""
    board = Board.objects.filter(slug="expenses").prefetch_related("columns").first()
    if board is None:
        return []
    by_title = {c.title: c.monday_id for c in board.columns.all()}
    date_id, amount_id = by_title.get("Date Incurred"), by_title.get("Amount")
    rows = []
    for record in board.records.order_by("-created_at")[:300]:
        values = record.values or {}
        bits = [record.name]
        when = str(values.get(date_id) or "")[:10] if date_id else ""
        if when:
            bits.append(when)
        spent = values.get(amount_id) if amount_id else None
        if spent:
            bits.append(str(spent))
        rows.append({"value": str(record.pk), "label": " — ".join(bits)[:140]})
    return rows


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
            # A payment settles a term, so the form needs the list — narrowed
            # to the bursary it belongs to, which is what `scholarship` is for.
            # The periods a bursary has not been given yet are offered too; see
            # _term_options.
            "terms": _term_options(),
            # What to call a term, for the form that sets one up. Same
            # vocabulary as the payment select and drawn from the same place,
            # so the two can never start offering different words.
            "periods": _period_options(),
            # The pages a programme's activity can be recorded on.
            "boards": [
                {"value": b.slug, "label": b.name}
                for b in Board.objects.filter(is_visible=True, is_subitem_board=False).order_by("name")
            ],
            # What class a student can be in, which depends on the school they
            # are at — see _class_options.
            "classes": _class_options(),
            # The expenses an invoice can be settled by. Only the expenses
            # page, and only the most recent few hundred: a select listing
            # every expense the Foundation has ever recorded is a select
            # nobody can find anything in.
            "expenses": _expense_options(),
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
