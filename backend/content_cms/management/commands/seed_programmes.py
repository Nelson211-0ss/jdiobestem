"""
Move the programme cards off the /programs page and into the database.

Every value here is lifted verbatim from content/programs.tsx — the same names,
taglines, blurbs, images and links the page already showed. Nothing is invented
and nothing is dropped, so seeding changes where the page reads its content
from and not what it says.
"""

from django.core.management.base import BaseCommand

from content_cms.models import Programme

PROGRAMMES = [
    {
        "slug": "youth-stem",
        "name": "Youth STEM School Program",
        "tagline": "Inspiring curiosity early",
        "summary": "Hands-on STEM workshops for primary and middle school students.",
        "href": "/youth-stem",
        "image": "/images/hero-diy-stem-car.png",
        "image_alt": "Student-built STEM car project",
        "icon": "users",
        "pathway_stage": "Inspire",
        "order": 1,
    },
    {
        "slug": "community-outreach",
        "name": "Community STEM Outreach",
        "tagline": "Beyond the classroom",
        "summary": "Workshops, demos, and events with schools and community partners.",
        "href": "/community-outreach",
        "image": "/images/teachers.jpeg",
        "image_alt": "Community STEM outreach workshop",
        "icon": "globe",
        "pathway_stage": "Engage",
        "order": 2,
    },
    {
        "slug": "secondary-research",
        "name": "Secondary School Research",
        "tagline": "Tomorrow’s researchers",
        "summary": "Mentored research projects building critical thinking and innovation skills.",
        "href": "/secondary-research",
        "image": "/images/robot.jpeg",
        "image_alt": "Secondary school research and robotics",
        "icon": "book-open",
        "pathway_stage": "Develop",
        "order": 3,
    },
    {
        "slug": "scholarship",
        "name": "Dr. Ron and Cara Beer STEM Scholarship",
        "tagline": "Supporting promising STEM students",
        "summary": (
            "Providing financial support, mentorship, and leadership development "
            "for students pursuing STEM education."
        ),
        "href": "/scholarship",
        "image": "/images/scholarship-students.jpg",
        "image_alt": "STEM scholarship recipients",
        "icon": "award",
        "pathway_stage": "Support",
        # The pathway strip calls this one by a shorter name than the card does.
        "pathway_label": "STEM Scholarships",
        "order": 4,
    },
]


class Command(BaseCommand):
    help = "Create or update the programmes shown on /programs."

    def handle(self, *args, **options):
        for entry in PROGRAMMES:
            obj, created = Programme.objects.update_or_create(
                slug=entry["slug"], defaults=entry
            )
            self.stdout.write(f"  {'created' if created else 'updated'}  {obj}")
        self.stdout.write(
            self.style.SUCCESS(f"{Programme.objects.count()} programmes")
        )
