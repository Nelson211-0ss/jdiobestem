"""
A rate the Foundation has decided to use, for a date.

Conversion has to be auditable: a figure converted at a rate nobody recorded
cannot be checked a year later, and a rate fetched live at render time cannot
be checked at all.
"""

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("operations", "0010_board_slug"),
    ]

    operations = [
        migrations.CreateModel(
            name="ExchangeRate",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("base", models.CharField(help_text="The currency being converted from, e.g. UGX.", max_length=8)),
                ("quote", models.CharField(help_text="The currency being converted to, e.g. USD.", max_length=8)),
                ("rate", models.DecimalField(decimal_places=6, max_digits=18,
                    help_text="One unit of the base currency in the quote currency.")),
                ("effective_from", models.DateField(db_index=True,
                    help_text="The rate applies to money dated on or after this.")),
                ("note", models.CharField(blank=True, max_length=200,
                    help_text="Where the rate came from, e.g. Bank of Uganda mid-rate.")),
            ],
            options={"ordering": ["-effective_from", "base", "quote"]},
        ),
        migrations.AddConstraint(
            model_name="exchangerate",
            constraint=models.UniqueConstraint(
                fields=("base", "quote", "effective_from"), name="unique_rate_per_day"
            ),
        ),
    ]
