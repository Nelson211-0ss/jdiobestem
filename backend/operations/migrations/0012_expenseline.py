"""
Compound expenses, recorded as lines rather than as one figure.

Also adds the column that says which kind an expense is. It is added here
rather than left to be created by hand so that every environment has it, and
seeded with its two labels so the form offers them immediately.
"""

import django.db.models.deletion
from django.db import migrations, models

TYPE_TITLE = "Expense type"
LABELS = {"0": "Single", "1": "Compound"}


def add_column(apps, schema_editor):
    Board = apps.get_model("operations", "Board")
    BoardColumn = apps.get_model("operations", "BoardColumn")
    board = Board.objects.filter(name="Expenses").first()
    if not board:
        return
    if BoardColumn.objects.filter(board=board, title=TYPE_TITLE).exists():
        return
    # Sits straight after the name, because it decides how the rest is filled in.
    BoardColumn.objects.filter(board=board, position__gte=1).update(
        position=models.F("position") + 1
    )
    BoardColumn.objects.create(
        board=board,
        monday_id="local_expense_type",
        title=TYPE_TITLE,
        column_type="status",
        position=1,
        settings={
            "labels": LABELS,
            "labels_positions_v2": {"0": 0, "1": 1},
        },
    )


def drop_column(apps, schema_editor):
    Board = apps.get_model("operations", "Board")
    apps.get_model("operations", "BoardColumn").objects.filter(
        board__name="Expenses", title=TYPE_TITLE
    ).delete()


class Migration(migrations.Migration):

    dependencies = [
        ("operations", "0011_exchangerate"),
    ]

    operations = [
        migrations.CreateModel(
            name="ExpenseLine",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("name", models.CharField(max_length=200)),
                ("incurred_on", models.DateField()),
                ("amount", models.DecimalField(decimal_places=2, max_digits=14)),
                ("order", models.PositiveSmallIntegerField(default=0)),
                ("record", models.ForeignKey(
                    on_delete=django.db.models.deletion.CASCADE,
                    related_name="expense_lines", to="operations.record")),
            ],
            options={"ordering": ["incurred_on", "order", "id"]},
        ),
        migrations.RunPython(add_column, drop_column),
    ]
