"""
Trim the Schools board to the fields the programme team actually fills in.

Four columns came over from the monday export that nobody uses: the village
and sub-county duplicate what District already records, and the head teacher's
name and the EMIS number were never collected. They are hidden rather than
deleted, so the definitions (and any value a record might hold) survive.

The phone number is the school's, not one person's — a head teacher moves on
and the number stays — so it is renamed to match what it holds.
"""

from django.db import migrations

BOARD = "5100929697"
HIDE = ["Town / Village", "Sub-county / Payam", "Head Teacher", "EMIS / Centre Number"]
RENAME = ("Head Teacher Phone", "School Phone")


def apply(apps, schema_editor):
    BoardColumn = apps.get_model("operations", "BoardColumn")
    BoardColumn.objects.filter(board__monday_id=BOARD, title__in=HIDE).update(
        is_hidden=True, show_in_list=False
    )
    BoardColumn.objects.filter(board__monday_id=BOARD, title=RENAME[0]).update(title=RENAME[1])


def undo(apps, schema_editor):
    BoardColumn = apps.get_model("operations", "BoardColumn")
    BoardColumn.objects.filter(board__monday_id=BOARD, title=RENAME[1]).update(title=RENAME[0])
    BoardColumn.objects.filter(board__monday_id=BOARD, title__in=HIDE).update(
        is_hidden=False, show_in_list=True
    )


class Migration(migrations.Migration):

    dependencies = [
        ("operations", "0008_boardcolumn_is_hidden_alter_boardcolumn_show_in_list"),
    ]

    operations = [migrations.RunPython(apply, undo)]
