"""
Drop School.enrollment.

It recorded the school's total roll, which reads as though it were the number
of students the Foundation supports there. That figure is already answerable
from the records pointing at the school, so the column was ambiguous without
being useful. No school records exist yet, so nothing is lost.
"""

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("programmes", "0007_school"),
    ]

    operations = [
        migrations.RemoveField(model_name="school", name="enrollment"),
    ]
