"""
One shared School record, replacing the free-text name each programme kept.

The school columns change type (text to a foreign key), so each is dropped and
re-added rather than altered: Postgres will not cast a varchar to an integer
without an explicit USING clause, and Django's AlterField does not emit one.
Both tables are empty, so nothing is lost by doing it that way.

ScienceFairProject.school is required. It is added nullable and then tightened
in the same migration, which avoids inventing a one-off default for rows that
do not exist.
"""

import django.db.models.deletion
from django.db import migrations, models
from django.db.models.functions import Lower

import core.validators


class Migration(migrations.Migration):

    dependencies = [
        ("programmes", "0006_alter_sciencefairproject_stage_projectaward"),
    ]

    operations = [
        migrations.CreateModel(
            name="School",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("created_at", models.DateTimeField(auto_now_add=True, db_index=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                ("name", models.CharField(db_index=True, max_length=200)),
                ("level", models.CharField(blank=True, choices=[
                    ("primary", "Primary"), ("secondary", "Secondary"),
                    ("combined", "Combined (Primary & Secondary)"),
                    ("vocational", "Vocational / Technical"), ("tertiary", "Tertiary"),
                ], max_length=20)),
                ("country", models.CharField(blank=True, choices=[
                    ("GL", "Global — all countries"), ("UG", "Uganda"),
                    ("SS", "South Sudan"), ("US", "United States"),
                ], db_index=True, max_length=2)),
                ("region", models.CharField(blank=True, choices=[
                    ("central", "Central"), ("eastern", "Eastern"),
                    ("northern", "Northern"), ("western", "Western"),
                    ("bahr_el_ghazal", "Bahr el Ghazal"), ("equatoria", "Equatoria"),
                    ("upper_nile", "Upper Nile"),
                ], max_length=20)),
                ("district", models.CharField(blank=True, max_length=120)),
                ("phone", models.CharField(blank=True, max_length=50,
                    validators=[core.validators.phone_validator])),
                ("email", models.EmailField(blank=True, max_length=254)),
                ("enrollment", models.PositiveIntegerField(blank=True, null=True,
                    help_text="Pupils on roll, if known.")),
                ("established_on", models.DateField(blank=True, null=True)),
                ("bank_account", models.CharField(blank=True, max_length=200,
                    help_text="Where bursary fees are sent, so a transfer can be checked against it.")),
                ("status", models.CharField(choices=[
                    ("active", "Active"), ("prospective", "Prospective"), ("dormant", "Dormant"),
                ], db_index=True, default="active", max_length=20)),
                ("notes", models.TextField(blank=True)),
            ],
            options={"ordering": ["name"]},
        ),
        migrations.AddConstraint(
            model_name="school",
            constraint=models.UniqueConstraint(
                Lower("name"), models.F("district"), name="unique_school_name_per_district"
            ),
        ),
        migrations.RemoveField(model_name="mentee", name="school"),
        migrations.AddField(
            model_name="mentee",
            name="school",
            field=models.ForeignKey(
                blank=True, null=True, on_delete=django.db.models.deletion.PROTECT,
                related_name="mentees", to="programmes.school",
            ),
        ),
        migrations.RemoveField(model_name="sciencefairproject", name="school"),
        migrations.AddField(
            model_name="sciencefairproject",
            name="school",
            field=models.ForeignKey(
                null=True, on_delete=django.db.models.deletion.PROTECT,
                related_name="science_fair_projects", to="programmes.school",
            ),
        ),
        migrations.AlterField(
            model_name="sciencefairproject",
            name="school",
            field=models.ForeignKey(
                on_delete=django.db.models.deletion.PROTECT,
                related_name="science_fair_projects", to="programmes.school",
            ),
        ),
    ]
