"""
The School Pay code quoted on a payment.

Kept on the payment as well as on the bursary: a pupil's code can be reissued
or change with their school, and a transfer has to say what was used at the
time — the same reason the bank reference sits beside the amount.
"""

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [("scholarships", "0006_scholarship_school_pay_code")]

    operations = [
        migrations.AddField(
            model_name="scholarshippayment",
            name="school_pay_code",
            field=models.CharField(
                blank=True, db_index=True, max_length=60,
                help_text="The School Pay code quoted on this payment.",
            ),
        ),
    ]
