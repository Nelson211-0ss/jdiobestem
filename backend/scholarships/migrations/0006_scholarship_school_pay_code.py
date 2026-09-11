"""
A pupil's own School Pay code.

School Pay issues a code per pupil rather than per school: it is how this
student's fees are identified when money is sent. The school's payment route
may carry a general code as well, which is a different thing and stays there.
"""

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [("scholarships", "0005_scholarshipterm")]

    operations = [
        migrations.AddField(
            model_name="scholarship",
            name="school_pay_code",
            field=models.CharField(
                blank=True, db_index=True, max_length=60,
                help_text="This student's own School Pay code, where their school uses one.",
            ),
        ),
    ]
