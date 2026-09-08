"""
A bursary points at a School record instead of naming one.

The level, the contact number and the account fees are paid into describe the
school rather than the award, so they move onto the school and are recorded
once. The table is empty, so the four text columns are simply dropped.

The link is required. It is added nullable and tightened immediately after, so
no one-off default has to be invented for rows that do not exist.
"""

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("scholarships", "0002_remove_scholarship_guardian_email_and_more"),
        ("programmes", "0007_school"),
    ]

    operations = [
        migrations.RemoveField(model_name="scholarship", name="school_name"),
        migrations.RemoveField(model_name="scholarship", name="school_level"),
        migrations.RemoveField(model_name="scholarship", name="school_contact"),
        migrations.RemoveField(model_name="scholarship", name="school_account"),
        migrations.AddField(
            model_name="scholarship",
            name="school",
            field=models.ForeignKey(
                null=True, on_delete=django.db.models.deletion.PROTECT,
                related_name="scholarships", to="programmes.school",
            ),
        ),
        migrations.AlterField(
            model_name="scholarship",
            name="school",
            field=models.ForeignKey(
                on_delete=django.db.models.deletion.PROTECT,
                related_name="scholarships", to="programmes.school",
            ),
        ),
    ]
