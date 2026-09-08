"""
Address a board by a readable slug instead of its monday id.

"/admin/operations/5100927389" tells a reader nothing and cannot be guessed,
shared or recognised. The monday id stays on the record — it is how a row is
traced back to where it came from — but it is no longer how the dashboard
refers to a board.

Existing boards are slugged from their names here, so no URL has to be
constructed by hand afterwards.
"""

from django.db import migrations, models
from django.utils.text import slugify


def fill(apps, schema_editor):
    Board = apps.get_model("operations", "Board")
    seen = set()
    for board in Board.objects.all().order_by("pk"):
        base = slugify(board.name)[:130] or "board"
        candidate, n = base, 2
        while candidate in seen:
            candidate = f"{base}-{n}"
            n += 1
        seen.add(candidate)
        board.slug = candidate
        board.save(update_fields=["slug"])


def clear(apps, schema_editor):
    apps.get_model("operations", "Board").objects.update(slug="")


class Migration(migrations.Migration):

    dependencies = [
        ("operations", "0009_schools_board_fields"),
    ]

    operations = [
        # db_index=False on the way in: SlugField indexes by default, and the
        # later unique constraint builds the same varchar_pattern_ops index, so
        # leaving it on makes Django create one relation twice in one migration.
        migrations.AddField(
            model_name="board",
            name="slug",
            field=models.SlugField(blank=True, db_index=False, max_length=140, null=True),
        ),
        migrations.RunPython(fill, clear),
        migrations.AlterField(
            model_name="board",
            name="slug",
            field=models.SlugField(blank=True, max_length=140, unique=True),
        ),
    ]
