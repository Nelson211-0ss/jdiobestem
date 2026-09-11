"""
Who to ask for, beside the number to ring.

A phone number with no name attached tells whoever is sending the money what
to dial but not who they are expecting to answer.
"""

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("programmes", "0012_schoolpaymentdetail_bursar_phone"),
    ]

    operations = [
        migrations.AddField(
            model_name="schoolpaymentdetail",
            name="bursar_name",
            field=models.CharField(blank=True, help_text="Who to ask for.", max_length=200),
        ),
    ]
