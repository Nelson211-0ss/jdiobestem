"""
Terms of a bursary, and payments that settle them.

Fees fall due term by term, so "is anything owed right now" needs the dates and
an amount per term. A payment used to name its term in prose, which meant what
was still owed could only be worked out by reading; it points at the term now,
so the answer is a sum.

No payments exist yet, so the text columns are simply dropped.
"""

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("scholarships", "0004_trim_scholarship_fields"),
    ]

    operations = [
        migrations.CreateModel(
            name="ScholarshipTerm",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("created_at", models.DateTimeField(auto_now_add=True, db_index=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                ("academic_year", models.CharField(blank=True, help_text="e.g. 2026.", max_length=20)),
                ("label", models.CharField(help_text="e.g. Term 1.", max_length=40)),
                ("starts_on", models.DateField(db_index=True)),
                ("ends_on", models.DateField()),
                ("amount_due", models.DecimalField(
                    blank=True, decimal_places=2, max_digits=12, null=True,
                    help_text="Left empty, the bursary's amount per term is used.")),
                ("scholarship", models.ForeignKey(
                    on_delete=django.db.models.deletion.CASCADE,
                    related_name="terms", to="scholarships.scholarship")),
            ],
            options={"ordering": ["-starts_on", "label"]},
        ),
        migrations.AddConstraint(
            model_name="scholarshipterm",
            constraint=models.UniqueConstraint(
                fields=("scholarship", "academic_year", "label"),
                name="unique_term_per_bursary_year",
            ),
        ),
        migrations.RemoveField(model_name="scholarshippayment", name="academic_year"),
        migrations.RemoveField(model_name="scholarshippayment", name="term"),
        migrations.AddField(
            model_name="scholarshippayment",
            name="term",
            field=models.ForeignKey(
                blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL,
                related_name="payments", to="scholarships.scholarshipterm",
                help_text="The term this payment settles.",
            ),
        ),
    ]
