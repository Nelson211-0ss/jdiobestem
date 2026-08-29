"""
Give the people on the team page a staff account, linked to that profile.

Two things follow from the link: their photograph and job title come from the
one place the Foundation already maintains them, and an administrator opening
the access screen sees a person rather than a username.

Three deliberate choices about access, because this command hands out keys:

Every account is created **inactive, with no usable password**. Seeding says
who exists, not who may sign in. Somebody with authority activates the account
and sets a password; nothing here issues a credential.

Roles are mapped only where a job title says so plainly. Anything ambiguous
gets `viewer`, which can read and change nothing.

Nobody is made a superuser. That is the one role that can rewrite everyone
else's access, and it is not something a seed script should decide.
"""

from django.contrib.auth.models import User
from django.core.management.base import BaseCommand
from django.db import transaction

from accounts.models import Role, StaffProfile
from content_cms.models import TeamMember

#: Job title on the team page -> (role, country scope).
#: An empty country means every country, so it is used only where that is right.
TITLE_ROLES = {
    "Founder & Executive Director": (Role.DIRECTOR, ""),
    "Country Director": (Role.COUNTRY_DIRECTOR, "UG"),
    "Projects Manager": (Role.PROGRAMME_MANAGER, ""),
    "Project Coordinator": (Role.PROGRAMME_MANAGER, ""),
    "Programs Coordinator": (Role.PROGRAMME_MANAGER, ""),
}

#: People on the team page who are not staff. Rose Auma is a volunteer mentor;
#: a dashboard account is not something a volunteer should be handed.
NOT_STAFF = {"Rose Auma"}


def username_for(name: str) -> str:
    """first.last, lowercase, punctuation dropped."""
    cleaned = "".join(c for c in name if c.isalnum() or c.isspace()).strip()
    parts = [p for p in cleaned.split() if p.lower() not in {"phd", "dr", "madam", "mr", "mrs", "ms"}]
    if not parts:
        return "staff"
    if len(parts) == 1:
        return parts[0].lower()
    return f"{parts[0]}.{parts[-1]}".lower()


class Command(BaseCommand):
    help = "Create staff accounts for the team, linked to their public profiles."

    def add_arguments(self, parser):
        parser.add_argument(
            "--activate",
            action="store_true",
            help="Create the accounts active. They still have no password until one is set.",
        )

    @transaction.atomic
    def handle(self, *args, **options):
        activate = options["activate"]
        created_n = linked_n = skipped_n = 0

        for member in TeamMember.objects.all().order_by("order", "name"):
            if member.name in NOT_STAFF:
                skipped_n += 1
                self.stdout.write(f"  not staff, skipped   {member.name}")
                continue

            # An existing account for this person is linked, never overwritten:
            # somebody may already have set their role deliberately.
            existing = User.objects.filter(staff_profile__team_member=member).first()
            if existing is None and member.email:
                existing = User.objects.filter(email__iexact=member.email).first()

            role, country = TITLE_ROLES.get(member.role, (Role.VIEWER, ""))

            if existing:
                profile, _ = StaffProfile.objects.get_or_create(user=existing)
                profile.team_member = member
                if not profile.position:
                    profile.position = member.role
                profile.save()
                linked_n += 1
                self.stdout.write(
                    f"  linked existing      {existing.username:20} -> {member.name} "
                    f"(role left as {profile.role})"
                )
                continue

            username = username_for(member.name)
            if User.objects.filter(username=username).exists():
                username = f"{username}.{member.pk}"

            user = User.objects.create(
                username=username,
                email=member.email or "",
                first_name=member.name.split()[0],
                last_name=" ".join(member.name.split()[1:]),
                is_staff=True,
                is_active=activate,
            )
            # No password is set, so `check_password` can never succeed. The
            # account cannot be signed into until somebody sets one.
            user.set_unusable_password()
            user.save()

            StaffProfile.objects.update_or_create(
                user=user,
                defaults={
                    "team_member": member,
                    "role": role,
                    "country": country,
                    "position": member.role,
                },
            )
            created_n += 1
            self.stdout.write(
                f"  created              {username:20} {role:20} "
                f"{'all countries' if not country else country}"
            )

        self.stdout.write(
            self.style.SUCCESS(
                f"{created_n} created, {linked_n} linked to an existing account, "
                f"{skipped_n} skipped. "
                + ("Accounts are active but have no password yet."
                   if activate else
                   "Accounts are inactive and have no password — activate and set one to grant access.")
            )
        )
