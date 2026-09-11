"""
Who to ring about a payment.

On the route rather than on the school: a school paying through both a bank
and School Pay may have a different person answering for each.
"""

from django.db import migrations, models

import core.validators


class Migration(migrations.Migration):

    dependencies = [
        ("programmes", "0011_schoolpaymentdetail"),
    ]

    operations = [
        migrations.AddField(
            model_name="schoolpaymentdetail",
            name="bursar_phone",
            field=models.CharField(
                blank=True,
                max_length=50,
                help_text="Whoever answers about fees for this route.",
                validators=[core.validators.phone_validator],
            ),
        ),
    ]
