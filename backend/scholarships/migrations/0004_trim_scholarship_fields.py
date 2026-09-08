"""
Drop the sponsor columns, the manager link and notes from a bursary.

Who funds a student is tracked through Donations and Grants, which is where
the money actually is; repeating a sponsor name per bursary made a second
list that would drift from it. Who looks after the student is a staffing
question the dashboard answers elsewhere, and a free-text notes box collects
things nobody looks for again.

`country` stays: it is the row-level access key for this resource, so removing
it would hand a Uganda coordinator every country's bursaries. It is no longer
asked for on the form — Scholarship.save() takes it from the school, which is
the same fact recorded once.

No bursaries exist yet, so nothing is lost.
"""

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ("scholarships", "0003_scholarship_school"),
    ]

    operations = [
        migrations.RemoveField(model_name="scholarship", name="sponsor_name"),
        migrations.RemoveField(model_name="scholarship", name="sponsor_type"),
        migrations.RemoveField(model_name="scholarship", name="sponsor_contact"),
        migrations.RemoveField(model_name="scholarship", name="managed_by"),
        migrations.RemoveField(model_name="scholarship", name="notes"),
    ]
