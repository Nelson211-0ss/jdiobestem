"""
Remove the boards the Foundation decided not to carry over from monday.com.

The fixture in operations/fixtures/board-structures.json is a faithful export,
so re-importing it on a fresh database brings these back. Rather than editing
the export and losing the record of what monday actually held, the removals
live here as an explicit, re-runnable decision.

Run after `import_from_monday --schema-only`.
"""

from django.core.management.base import BaseCommand

from operations.models import Board

# Dropped as unnecessary for how the Foundation now works.
RETIRED = [
    "Grants Pipeline",
    "Subitems of Grants Pipeline",
    "Safeguarding Concerns",
    "Policies & Risk Register",
    "Data Access and Privacy - Open Items",
    "Monday Structure and Conventions",
    "Volunteer registration management",
    "Volunteer Applications",
    "Partner Institutions",
]

# Superseded: these are proper tables now, and one place for a thing beats two
# that disagree. Contact submissions are the Contact messages resource; office
# details are the Offices resource, which absorbed this board's columns.
SUPERSEDED = [
    "Website Inquiries",
    "Country Office Profiles",
    # Vacancies are the Positions resource under Hiring, which also carries the
    # applications against them. Two lists of open posts would disagree within
    # a week.
    "Positions",
    # Volunteers are the Volunteers section: applications and the people the
    # Foundation recognises, in one place.
    "Volunteers",
    "Mentees",
    "Sessions",
    # Duplicates of proper tables: proposals are the Applications page, and the
    # rest are the student projects lifecycle.
    "Project Proposals",
    "Projects",
    "Mentors",
    "Applicants Management",
    # The Youth STEM School is a programme on the website, described there.
    "Youth STEM Program",
]

# Scratch boards from trying out monday's app builder.
SCRATCH = ["Build Vibe app"]

DOOMED = RETIRED + SUPERSEDED + SCRATCH


class Command(BaseCommand):
    help = "Delete the boards not carried over from monday.com."

    def add_arguments(self, parser):
        parser.add_argument(
            "--dry-run",
            action="store_true",
            help="Report what would be deleted without touching anything.",
        )

    def handle(self, *args, **options):
        dry = options["dry_run"]
        total = 0

        for name in DOOMED:
            qs = Board.objects.filter(name=name)
            count = qs.count()
            if not count:
                continue
            total += count
            self.stdout.write(f"  {'would delete' if dry else 'deleted'}  {name} x{count}")
            if not dry:
                qs.delete()

        remaining = Board.objects.count()
        verb = "would remove" if dry else "removed"
        self.stdout.write(
            self.style.SUCCESS(f"{verb} {total} board(s); {remaining} remain")
        )
