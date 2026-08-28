"""Board and record endpoints for the dashboard."""

from django.db.models import Q
from activity.recorder import LoggedViewSetMixin
from rest_framework import viewsets
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response

from django.contrib.auth.models import User

from documents.models import Document

from api.permissions import IsStaff, ResourcePermission

from .models import Board, Office, OperatingCountry, Record
from .serializers import (
    BoardDetailSerializer,
    BoardSerializer,
    OfficeSerializer,
    OperatingCountrySerializer,
    RecordSerializer,
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
    lookup_field = "monday_id"
    filterset_fields = ["category"]
    search_fields = ["name", "description"]
    ordering = ["category", "name"]
    pagination_class = None

    def get_serializer_class(self):
        return BoardDetailSerializer if self.action == "retrieve" else BoardSerializer


class RecordViewSet(LoggedViewSetMixin, viewsets.ModelViewSet):
    permission_classes = [ResourcePermission]
    resource = "boards"
    serializer_class = RecordSerializer
    search_fields = ["name"]
    ordering = ["-monday_updated_at", "-created_at"]

    def get_queryset(self):
        board_id = self.kwargs.get("board_monday_id")
        qs = Record.objects.filter(board__monday_id=board_id, parent_record__isnull=True).select_related("board")

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

    def perform_create(self, serializer):
        board = Board.objects.get(monday_id=self.kwargs["board_monday_id"])
        # Created here, not yet in monday. The sync command leaves these alone.
        serializer.save(board=board, is_local=True)


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
                "name": board.name,
                "description": board.description,
                "item_count": board.item_count,
                "synced_at": board.synced_at,
            }
        )
    return Response({"categories": [{"name": k, "boards": v} for k, v in grouped.items()]})


class OperatingCountryViewSet(LoggedViewSetMixin, viewsets.ModelViewSet):
    """The countries the Foundation works in. Country and currency selects
    everywhere else are drawn from this table."""

    permission_classes = [ResourcePermission]
    resource = "countries"
    # Prefetched because the serializer summarises each country's offices.
    queryset = OperatingCountry.objects.prefetch_related("offices")
    serializer_class = OperatingCountrySerializer
    search_fields = ["name", "code", "currency_code", "offices__name"]
    ordering = ["order", "name"]


class OfficeViewSet(LoggedViewSetMixin, viewsets.ModelViewSet):
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
            "staff": [
                {"value": str(u.pk), "label": u.get_full_name() or u.username}
                for u in User.objects.filter(is_active=True, is_staff=True).order_by("username")
            ],
        }
    )
