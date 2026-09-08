"""
Where money for a school is actually sent.

A record per route rather than columns on the school: a school commonly has a
bank account and a School Pay code at the same time, sometimes mobile money as
well. Which fields matter depends on the route, so all of them are optional and
`method` says which ones to read.
"""

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("programmes", "0010_school_partnership_started_on"),
    ]

    operations = [
        migrations.CreateModel(
            name="SchoolPaymentDetail",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("created_at", models.DateTimeField(auto_now_add=True, db_index=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                ("method", models.CharField(choices=[
                    ("bank", "Bank transfer"), ("school_pay", "School Pay"),
                    ("mobile_money", "Mobile money"), ("other", "Other"),
                ], default="bank", max_length=20)),
                ("payment_code", models.CharField(blank=True, max_length=60,
                    help_text="The School Pay code, where the school uses one.")),
                ("bank_name", models.CharField(blank=True, max_length=120)),
                ("bank_account_name", models.CharField(blank=True, max_length=200,
                    help_text="Exactly as the bank holds it, or a transfer bounces.")),
                ("bank_account_number", models.CharField(blank=True, max_length=60)),
                ("is_primary", models.BooleanField(default=False,
                    help_text="Use this route unless told otherwise.")),
                ("is_active", models.BooleanField(db_index=True, default=True)),
                ("school", models.ForeignKey(
                    on_delete=django.db.models.deletion.CASCADE,
                    related_name="payment_details", to="programmes.school")),
            ],
            options={"ordering": ["school__name", "-is_primary", "method"]},
        ),
    ]
