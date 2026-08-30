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

# Dropped on review of the dashboard: each was an empty board whose job is
# already done elsewhere, and an empty board in the sidebar reads as a section
# somebody forgot to fill in rather than one nobody needs.
DROPPED = [
    # Finance. The figures come from Expenses, Budget and Gifts & Pledges; a
    # separate "dashboard" board would be a fourth place to keep them in step.
    "Accounting Dashboard",
    # Governance. Meetings and their minutes are documents, which the Documents
    # section holds with their editions.
    "Board of Directors & Governance Meetings",
    # People & HR. Onboarding is a checklist against a person, not a board of
    # its own.
    "Onboarding & Training",
    # Programmes. What actually happens is recorded on Community Outreach and
    # the programme boards themselves.
    "Activities",
    # Superseded by the Scholarships section: proper bursary records, with the
    # payments to each school kept as their own rows. The board tracked
    # opportunities to apply for, which is a different thing and was empty.
    "Scholarships",
    # Folded into the Donations page. A cheque and a card payment are the same
    # fact — somebody gave the Foundation something — and keeping them in two
    # lists meant "what did we receive this year" needed both added together.
    "Gifts & Pledges",
    # Programmes. Empty, and the people it would have held are recorded where
    # their programme records them — bursary students under Scholarships,
    # outreach as counts on Community Outreach.
    "Beneficiaries / Students",
    # Fundraising. Both empty, and both a layer of record-keeping above the
    # gifts themselves that the Foundation has not asked for.
    "Campaigns",
    "Donors' Activities",
]

# Scratch boards from trying out monday's app builder.
SCRATCH = ["Build Vibe app"]

DOOMED = RETIRED + SUPERSEDED + DROPPED + SCRATCH


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
