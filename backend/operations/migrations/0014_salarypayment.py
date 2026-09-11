"""
What a colleague was paid, for a period.

Its own row per period rather than a figure on the person: pay changes, and a
record overwritten each month cannot answer what was paid in March. The Salary
Management board held these columns and never held a record.
"""

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("operations", "0013_existing_expenses_are_single"),
        ("content_cms", "0008_teammember_employment"),
    ]

    operations = [
        migrations.CreateModel(
            name="SalaryPayment",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("period", models.CharField(help_text="What it covers, e.g. July 2026.", max_length=60)),
                ("amount", models.DecimalField(decimal_places=2, max_digits=14)),
                ("bonus", models.DecimalField(blank=True, decimal_places=2, max_digits=14, null=True)),
                ("currency", models.CharField(blank=True, help_text="e.g. UGX.", max_length=8)),
                ("paid_on", models.DateField(blank=True, null=True)),
                ("status", models.CharField(db_index=True, default="unpaid", max_length=20,
                    choices=[("unpaid", "Unpaid"), ("part_paid", "Part paid"), ("paid", "Paid")])),
                ("reference", models.CharField(blank=True, help_text="Bank or mobile money reference.", max_length=120)),
                ("person", models.ForeignKey(on_delete=django.db.models.deletion.PROTECT,
                    related_name="salary_payments", to="content_cms.teammember")),
            ],
            options={"ordering": ["-paid_on", "-id"]},
        ),
        migrations.AddConstraint(
            model_name="salarypayment",
            constraint=models.UniqueConstraint(fields=("person", "period"), name="unique_salary_per_period"),
        ),
    ]
