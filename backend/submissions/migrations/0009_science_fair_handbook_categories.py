"""
Science Fair categories: the nine in the Student Project Handbook 2026/27.

The handbook (3 September 2026) replaced the Proposal Workbook's provisional
list of six. The earlier six stay as choices so registrations made before the
change remain valid; only new registrations use the nine.
"""

from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [("submissions", "0008_alter_volunteerapplication_options_and_more")]

    operations = [
        migrations.AlterField(
            model_name="projectproposal",
            name="category",
            field=models.CharField(
                choices=[
                    ("engineering_design", "Engineering and Design"),
                    ("robotics", "Robotics and Automation"),
                    ("computing_ai", "Computer Science and Artificial Intelligence"),
                    ("physical", "Physical Sciences"),
                    ("biological", "Biological and Life Sciences"),
                    ("environment", "Environmental Science and Climate"),
                    ("agriculture", "Agriculture and Food Security"),
                    ("health", "Health and Biomedical Innovation"),
                    ("mathematics", "Mathematics and Data Science"),
                    ("life", "Life & Environmental Sciences (earlier list)"),
                    ("engineering", "Engineering & Technology (earlier list)"),
                    ("software", "Computer Science & Software (earlier list)"),
                    ("innovation", "Innovation & Entrepreneurship (earlier list)"),
                    ("community", "Community & Social Impact Projects (earlier list)"),
                ],
                max_length=40,
            ),
        ),
    ]
