"""
One record per person, instead of a team page and a staff list that drift.

The Employees and Employee Roles boards held these fields and never held a
record; the team page holds the six people who actually work here. So the
fields move to where the people are.

Not everybody here is an employee — an advisor or a volunteer appears on the
website too — and not every employee is shown on it, which is what
`is_published` already decided and continues to.
"""

import django.db.models.deletion
from django.db import migrations, models

import core.validators


class Migration(migrations.Migration):

    dependencies = [
        ("content_cms", "0007_storyday"),
    ]

    operations = [
        migrations.AddField(
            model_name="teammember",
            name="department",
            field=models.CharField(blank=True, max_length=20, choices=[
                ("executive", "Executive"), ("programmes", "Programmes"),
                ("finance", "Finance"), ("operations", "Operations"),
                ("fundraising", "Fundraising"), ("communications", "Communications"),
                ("people", "People & HR"),
            ]),
        ),
        migrations.AddField(
            model_name="teammember",
            name="employment_type",
            field=models.CharField(blank=True, max_length=20, choices=[
                ("full_time", "Full time"), ("part_time", "Part time"),
                ("contract", "Contract"), ("volunteer", "Volunteer"),
                ("intern", "Intern"), ("advisor", "Advisor or board member"),
            ]),
        ),
        migrations.AddField(
            model_name="teammember",
            name="standing",
            field=models.CharField(blank=True, db_index=True, max_length=20,
                help_text="Where they are in their time with the Foundation.",
                choices=[("onboarding", "Onboarding"), ("active", "Active"),
                         ("on_leave", "On leave"), ("left", "Left")]),
        ),
        migrations.AddField(
            model_name="teammember",
            name="started_on",
            field=models.DateField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name="teammember",
            name="ended_on",
            field=models.DateField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name="teammember",
            name="phone",
            field=models.CharField(blank=True, max_length=50,
                                   validators=[core.validators.phone_validator]),
        ),
        migrations.AddField(
            model_name="teammember",
            name="manager",
            field=models.ForeignKey(blank=True, null=True,
                on_delete=django.db.models.deletion.SET_NULL,
                related_name="reports", to="content_cms.teammember",
                help_text="Who they report to."),
        ),
        migrations.AlterField(
            model_name="teammember",
            name="is_published",
            field=models.BooleanField(default=True, db_index=True,
                help_text="Show this person on the website's team page."),
        ),
    ]
