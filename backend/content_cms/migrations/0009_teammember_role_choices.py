"""
Job titles become a list.

The stored value is the title itself, so every record keeps exactly the words
it had and the website prints what it printed before.
"""

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [("content_cms", "0008_teammember_employment")]

    operations = [
        migrations.AlterField(
            model_name="teammember",
            name="role",
            field=models.CharField(max_length=200, choices=[
                ("Founder & Executive Director", "Founder & Executive Director"),
                ("Executive Director", "Executive Director"),
                ("Country Director", "Country Director"),
                ("Programs Director", "Programs Director"),
                ("Projects Manager", "Projects Manager"),
                ("Programs Coordinator", "Programs Coordinator"),
                ("Project Coordinator", "Project Coordinator"),
                ("Finance Manager", "Finance Manager"),
                ("Accountant", "Accountant"),
                ("Administrator", "Administrator"),
                ("Communications Officer", "Communications Officer"),
                ("Fundraising Officer", "Fundraising Officer"),
                ("Monitoring & Evaluation Officer", "Monitoring & Evaluation Officer"),
                ("Field Officer", "Field Officer"),
                ("IT Officer", "IT Officer"),
                ("Senior Civil Engineer", "Senior Civil Engineer"),
                ("Trainer", "Trainer"),
                ("Mentor", "Mentor"),
                ("Volunteer", "Volunteer"),
                ("Board Member", "Board Member"),
                ("Advisor", "Advisor"),
                ("Driver", "Driver"),
            ]),
        ),
    ]
