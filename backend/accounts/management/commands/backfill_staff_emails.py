"""
Give staff accounts the work address their team record already holds.

Sign-in is by `@jdiobestem.org` email, so the address is the credential. The
team page has been the place the Foundation maintains people's addresses all
along, and the accounts were seeded before sign-in worked this way — so several
have a linked team record with an address and no address of their own.

This copies it across, once, on purpose.

It is deliberately **not** a live sync. A team record is website content, and
editing it is something a content editor may do; the account's address is what
somebody signs in with. Wiring one to the other would let anyone who can edit
the team page change who is able to sign in as whom, which is a larger power
than editing a page ought to carry. Copying the address is an administrator's
decision, taken here or on the access screen.

Refuses anything it should not silently accept: a foreign domain, an address
already in use by another account, and any account that already has one.
"""

from django.conf import settings
from django.contrib.auth.models import User
from django.core.management.base import BaseCommand

from accounts.models import StaffProfile


class Command(BaseCommand):
    help = "Copy work addresses from team records onto the staff accounts linked to them."

    def add_arguments(self, parser):
        parser.add_argument(
            "--dry-run",
            action="store_true",
            help="Report what would change without touching anything.",
        )
        parser.add_argument(
            "--overwrite",
            action="store_true",
            help="Replace an address the account already has. Off by default: "
            "the account's own address is the credential and wins.",
        )

    def handle(self, *args, **options):
        dry = options["dry_run"]
        overwrite = options["overwrite"]
        domain = settings.STAFF_EMAIL_DOMAIN
        changed = 0

        profiles = StaffProfile.objects.select_related("user", "team_member")
        for profile in profiles:
            user = profile.user
            member = profile.team_member
            name = user.username

            if not member:
                self.stdout.write(f"  {name:22} no team record linked")
                continue

            address = (member.email or "").strip()
            if not address:
                self.stdout.write(f"  {name:22} team record has no address")
                continue

            if not address.lower().endswith(f"@{domain}"):
                self.stderr.write(f"  {name:22} team address is not @{domain}: {address}")
                continue

            if user.email and not overwrite:
                same = user.email.lower() == address.lower()
                self.stdout.write(
                    f"  {name:22} {'already set' if same else f'kept its own ({user.email})'}"
                )
                continue

            clash = User.objects.filter(email__iexact=address).exclude(pk=user.pk).first()
            if clash:
                self.stderr.write(f"  {name:22} {address} already belongs to {clash.username}")
                continue

            if not dry:
                user.email = address
                user.save(update_fields=["email"])
            changed += 1
            self.stdout.write(f"  {name:22} {'would set' if dry else 'set'} {address}")

        self.stdout.write(
            f"\n  {changed} account(s) {'would be' if dry else ''} given an address."
        )
        if not dry:
            missing = [
                u.username
                for u in User.objects.filter(is_staff=True)
                if not u.email.lower().endswith(f"@{domain}")
            ]
            if missing:
                self.stdout.write(
                    f"  Still without a work address, so still unable to sign in: {', '.join(missing)}"
                )
