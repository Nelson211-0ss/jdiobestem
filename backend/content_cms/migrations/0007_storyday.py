"""
A daily tally of how a story was read.

Counted per day rather than per visit: the question is whether anyone is
reading, and a row per visit would collect times, addresses and devices to
answer it no better. Nothing recorded here identifies a reader.
"""

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("content_cms", "0006_alter_magazineissue_options_and_more"),
    ]

    operations = [
        migrations.CreateModel(
            name="StoryDay",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("day", models.DateField(db_index=True)),
                ("opens", models.PositiveIntegerField(default=0)),
                ("reads", models.PositiveIntegerField(default=0)),
                ("story", models.ForeignKey(
                    on_delete=django.db.models.deletion.CASCADE,
                    related_name="days", to="content_cms.newsstory")),
            ],
            options={"ordering": ["-day"]},
        ),
        migrations.AddConstraint(
            model_name="storyday",
            constraint=models.UniqueConstraint(fields=("story", "day"), name="unique_story_day"),
        ),
    ]
