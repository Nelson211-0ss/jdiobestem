"""
Every expense recorded before the type existed is a single one.

They were entered as one figure, which is precisely what a single expense is —
so this states what is already true rather than changing anything. Left unset,
they would read as "type not chosen", and a filter on single expenses would
quietly miss all of them.

Only untouched records: anything already marked is left exactly as it is.
"""

from django.db import migrations

TYPE_TITLE = "Expense type"
SINGLE = "Single"


def mark_single(apps, schema_editor):
    Board = apps.get_model("operations", "Board")
    BoardColumn = apps.get_model("operations", "BoardColumn")
    Record = apps.get_model("operations", "Record")

    board = Board.objects.filter(name="Expenses").first()
    if not board:
        return
    column = BoardColumn.objects.filter(board=board, title=TYPE_TITLE).first()
    if not column:
        return

    # The stored value is the label's key, not the word.
    labels = (column.settings or {}).get("labels") or {}
    key = next((k for k, text in labels.items() if str(text).strip() == SINGLE), None)
    if key is None:
        return

    for record in Record.objects.filter(board=board):
        values = record.values or {}
        if values.get(column.monday_id) not in (None, ""):
            continue
        values[column.monday_id] = key
        record.values = values
        record.save(update_fields=["values"])


def unmark(apps, schema_editor):
    """Reversing leaves the type unset, which is where these started."""
    Board = apps.get_model("operations", "Board")
    BoardColumn = apps.get_model("operations", "BoardColumn")
    Record = apps.get_model("operations", "Record")
    board = Board.objects.filter(name="Expenses").first()
    column = BoardColumn.objects.filter(board=board, title=TYPE_TITLE).first() if board else None
    if not column:
        return
    for record in Record.objects.filter(board=board):
        values = record.values or {}
        if column.monday_id in values:
            values.pop(column.monday_id)
            record.values = values
            record.save(update_fields=["values"])


class Migration(migrations.Migration):

    dependencies = [
        ("operations", "0012_expenseline"),
    ]

    operations = [migrations.RunPython(mark_single, unmark)]
