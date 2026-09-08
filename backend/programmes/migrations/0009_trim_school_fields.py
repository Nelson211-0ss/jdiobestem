"""
Drop School.email, School.bank_account and School.notes.

Kept out rather than left empty: the Foundation reaches schools by phone, fees
go through the bursary payments that already record where the money went, and
a free-text notes box on a reference record collects things nobody looks for
again. No school records exist yet, so nothing is lost.
"""

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ("programmes", "0008_remove_school_enrollment"),
    ]

    operations = [
        migrations.RemoveField(model_name="school", name="email"),
        migrations.RemoveField(model_name="school", name="bank_account"),
        migrations.RemoveField(model_name="school", name="notes"),
    ]
