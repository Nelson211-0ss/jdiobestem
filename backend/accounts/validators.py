"""
What counts as a strong password here.

Django's defaults catch the worst of it — too short, too common, all digits,
too like your own name. They stop at eight characters and say nothing about
variety, which is not enough for accounts that can read donor records and
change who else has access.

The rule is length plus variety, in that order of importance: a long passphrase
is stronger than a short one with a symbol wedged in, so the length floor does
most of the work and the character classes stop `password1234` style choices.
"""

import re

from django.core.exceptions import ValidationError
from django.utils.translation import gettext as _

MIN_LENGTH = 12
#: How many of the four classes a password must draw on.
REQUIRED_CLASSES = 3

CLASSES = (
    ("a lower-case letter", re.compile(r"[a-z]")),
    ("an upper-case letter", re.compile(r"[A-Z]")),
    ("a number", re.compile(r"[0-9]")),
    ("a symbol", re.compile(r"[^A-Za-z0-9]")),
)


class StrongPasswordValidator:
    """Length, then variety. Reports everything wrong at once."""

    def validate(self, password, user=None):
        problems = []

        if len(password) < MIN_LENGTH:
            problems.append(
                _("be at least %(min)d characters long") % {"min": MIN_LENGTH}
            )

        present = [name for name, rx in CLASSES if rx.search(password)]
        if len(present) < REQUIRED_CLASSES:
            missing = [name for name, rx in CLASSES if not rx.search(password)]
            problems.append(
                _("use at least %(need)d of: a lower-case letter, an upper-case letter, "
                  "a number, a symbol (missing %(missing)s)")
                % {"need": REQUIRED_CLASSES, "missing": ", ".join(missing)}
            )

        # A single character repeated is long but not strong.
        if len(set(password)) < 5 and password:
            problems.append(_("use more than a few different characters"))

        if problems:
            # One message listing every failure, so a password is not fixed and
            # rejected four times over.
            raise ValidationError(
                _("Your password must %(problems)s.") % {"problems": ", and ".join(problems)},
                code="password_not_strong",
            )

    def get_help_text(self):
        return _(
            "At least %(min)d characters, using at least %(need)d of: a lower-case "
            "letter, an upper-case letter, a number, a symbol."
        ) % {"min": MIN_LENGTH, "need": REQUIRED_CLASSES}
