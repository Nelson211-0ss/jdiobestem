"""
One-time migration of the monday.com boards into Postgres.

    python manage.py import_from_monday                # every board, with records
    python manage.py import_from_monday --schema-only  # boards, groups, columns
    python manage.py import_from_monday --board 5100927443
    python manage.py import_from_monday --from-file export.json

This is a **migration**, not a sync. The Foundation is leaving monday.com;
Postgres is the system of record from here on, and nothing is ever written back.
The monday ids are kept only so a re-run updates rather than duplicates, and so
anyone can trace a record to where it came from.

Once the import is done and verified, MONDAY_API_TOKEN can be deleted.
"""

import json
from pathlib import Path

from django.core.management.base import BaseCommand, CommandError
from django.utils import timezone
from django.utils.dateparse import parse_datetime

from operations.models import Board, BoardColumn, BoardGroup, Record
from operations.monday import NOT_IN_LIST, MondayClient, MondayError, categorise, normalise_value

#: Where an imported board covers the same ground as a typed table that the
#: public website already writes to. Recorded so the duplication is deliberate
#: and visible rather than something someone rediscovers in six months. The
#: typed table stays the system of record for anything the website submits.
OVERLAPS = {
    "Volunteer Applications": "submissions.VolunteerApplication (written by the website form)",
    "Volunteer registration management": "submissions.VolunteerApplication",
    "Marketing Contacts": "submissions.NewsletterSubscriber",
    "Donors": "donations.Donation (Stripe is the source of truth for the money itself)",
    "Mentees": "programmes.Mentee",
    "Mentors": "programmes.Mentor",
    "Project Proposals": "submissions.ProjectProposal",
    "Beneficiaries / Students": "programmes.Mentee (the master student record)",
}


class Command(BaseCommand):
    help = "One-time migration of monday.com boards, columns and items into Postgres."

    def add_arguments(self, parser):
        parser.add_argument("--schema-only", action="store_true", help="Boards, groups and columns only.")
        parser.add_argument("--board", action="append", dest="boards", help="Limit to this monday board id. Repeatable.")
        parser.add_argument("--from-file", help="Load a JSON export instead of calling the API.")

    def handle(self, *args, **options):
        if options.get("from_file"):
            payload = json.loads(Path(options["from_file"]).read_text())
            boards = payload["boards"]
            self.stdout.write(f"Loading {len(boards)} boards from file")
            client = None
        else:
            try:
                client = MondayClient()
            except MondayError as exc:
                raise CommandError(str(exc)) from exc
            boards = self._fetch_boards(client)

        wanted = set(options.get("boards") or [])
        if wanted:
            boards = [b for b in boards if str(b["id"]) in wanted]

        created, updated = 0, 0
        for payload in boards:
            board, was_created = self._upsert_board(payload)
            created += was_created
            updated += not was_created
            self._upsert_groups(board, payload.get("groups") or [])
            self._upsert_columns(board, payload.get("columns") or [])

        self._link_subitem_boards()
        self.stdout.write(self.style.SUCCESS(f"Boards: {created} created, {updated} updated"))

        if options["schema_only"] or client is None:
            if client is None and not options["schema_only"]:
                self._load_records_from_file(payload_boards=boards)
            return

        total = 0
        for board in Board.objects.all() if not wanted else Board.objects.filter(monday_id__in=wanted):
            total += self._sync_records(client, board)
        self.stdout.write(self.style.SUCCESS(f"Records synced: {total}"))

    # ------------------------------------------------------------------ fetch

    def _fetch_boards(self, client):
        boards, page = [], 1
        while True:
            data = client.query(
                """
                query Boards($limit: Int!, $page: Int!) {
                  boards(limit: $limit, page: $page) {
                    id name description state items_count
                    groups { id title color }
                    columns { id title type settings_str }
                  }
                }
                """,
                {"limit": 100, "page": page},
            )
            batch = data.get("boards") or []
            boards.extend(batch)
            if len(batch) < 100:
                break
            page += 1
        self.stdout.write(f"Fetched {len(boards)} boards")
        return boards

    # ----------------------------------------------------------------- upsert

    def _upsert_board(self, payload):
        name = payload.get("name") or "Untitled"
        is_subitem = name.lower().startswith("subitems of ")
        board, created = Board.objects.update_or_create(
            monday_id=str(payload["id"]),
            defaults={
                "name": name,
                "description": payload.get("description") or "",
                "category": categorise(name),
                "is_subitem_board": is_subitem,
                # Subitem boards are reached through their parent's records,
                # so they are synced but kept out of the navigation.
                "is_visible": not is_subitem,
                "item_count": payload.get("items_count") or 0,
                "synced_at": timezone.now(),
            },
        )
        return board, created

    def _upsert_groups(self, board, groups):
        seen = []
        for position, group in enumerate(groups):
            BoardGroup.objects.update_or_create(
                board=board,
                monday_id=group["id"],
                defaults={"title": group.get("title", ""), "color": group.get("color") or "", "position": position},
            )
            seen.append(group["id"])
        board.groups.exclude(monday_id__in=seen).delete()

    def _upsert_columns(self, board, columns):
        seen = []
        for position, column in enumerate(columns):
            settings = {}
            if column.get("settings_str"):
                try:
                    settings = json.loads(column["settings_str"])
                except (ValueError, TypeError):
                    settings = {}
            column_type = column.get("type", "text")
            BoardColumn.objects.update_or_create(
                board=board,
                monday_id=column["id"],
                defaults={
                    "title": column.get("title", ""),
                    "column_type": column_type,
                    "settings": settings,
                    "position": position,
                    "show_in_list": column_type not in NOT_IN_LIST,
                },
            )
            seen.append(column["id"])
        board.columns.exclude(monday_id__in=seen).delete()

    def _link_subitem_boards(self):
        """'Subitems of Expenses' belongs to 'Expenses'."""
        by_name = {b.name.lower(): b for b in Board.objects.filter(is_subitem_board=False)}
        for board in Board.objects.filter(is_subitem_board=True, parent_board__isnull=True):
            parent_name = board.name[len("Subitems of ") :].strip().lower()
            parent = by_name.get(parent_name)
            if parent:
                board.parent_board = parent
                board.save(update_fields=["parent_board"])

    # ---------------------------------------------------------------- records

    def _sync_records(self, client, board):
        cursor, count = None, 0
        column_types = {c.monday_id: c.column_type for c in board.columns.all()}

        while True:
            data = client.query(
                """
                query Items($boardId: ID!, $cursor: String) {
                  boards(ids: [$boardId]) {
                    items_page(limit: 100, cursor: $cursor) {
                      cursor
                      items {
                        id name updated_at
                        group { id }
                        column_values { id type text value }
                      }
                    }
                  }
                }
                """,
                {"boardId": board.monday_id, "cursor": cursor},
            )
            boards = data.get("boards") or []
            if not boards:
                break
            page = boards[0].get("items_page") or {}
            for item in page.get("items") or []:
                self._upsert_record(board, item, column_types)
                count += 1
            cursor = page.get("cursor")
            if not cursor:
                break

        board.item_count = count
        board.synced_at = timezone.now()
        board.save(update_fields=["item_count", "synced_at"])
        return count

    def _upsert_record(self, board, item, column_types):
        values = {}
        for cell in item.get("column_values") or []:
            column_type = column_types.get(cell["id"], cell.get("type", "text"))
            values[cell["id"]] = normalise_value(column_type, cell.get("text"), cell.get("value"))

        Record.objects.update_or_create(
            board=board,
            monday_id=str(item["id"]),
            defaults={
                "name": item.get("name") or "",
                "group_id": (item.get("group") or {}).get("id", "") or "",
                "values": values,
                "monday_updated_at": parse_datetime(item["updated_at"]) if item.get("updated_at") else None,
                "synced_at": timezone.now(),
                "is_local": False,
            },
        )

    def _load_records_from_file(self, payload_boards):
        """Records embedded in a --from-file export."""
        total = 0
        for payload in payload_boards:
            board = Board.objects.filter(monday_id=str(payload["id"])).first()
            if not board:
                continue
            column_types = {c.monday_id: c.column_type for c in board.columns.all()}
            for item in payload.get("items") or []:
                self._upsert_record(board, item, column_types)
                total += 1
            board.item_count = len(payload.get("items") or [])
            board.synced_at = timezone.now()
            board.save(update_fields=["item_count", "synced_at"])
        self.stdout.write(self.style.SUCCESS(f"Records loaded from file: {total}"))
