"""Say which code belongs where, so the two are not confused."""

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [("programmes", "0013_schoolpaymentdetail_bursar_name")]

    operations = [
        migrations.AlterField(
            model_name="schoolpaymentdetail",
            name="payment_code",
            field=models.CharField(
                blank=True, max_length=60,
                help_text=(
                    "The school's own code, where it has one. A pupil's individual "
                    "School Pay code belongs on their bursary, not here."
                ),
            ),
        ),
    ]
