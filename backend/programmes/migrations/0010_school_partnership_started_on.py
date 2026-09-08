"""
Rename School.established_on to partnership_started_on.

The column read as the school's founding date. What the Foundation actually
wants recorded is when it started working with the school, which is a
different fact and the one every programme asks about.

A rename rather than a drop and re-add, so any value already entered moves
with it.
"""

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ("programmes", "0009_trim_school_fields"),
    ]

    operations = [
        migrations.RenameField(
            model_name="school",
            old_name="established_on",
            new_name="partnership_started_on",
        ),
    ]
