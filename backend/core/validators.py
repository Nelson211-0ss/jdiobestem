"""
Shared field rules.

Kept in one place so a phone number means the same thing on a volunteer
application, a job application and a Science Fair registration — three forms
that all ask for one, and previously all accepted anything.
"""

from django.core.validators import MaxValueValidator, MinValueValidator, RegexValidator

# A number after its country code has been chosen: digits and the separators
# people actually type between them. Deliberately loose on punctuation and
# strict on length, because the failure worth catching is a number too short to
# dial, not an unusual way of spacing it.
phone_validator = RegexValidator(
    regex=r"^\+?[\d\s()-]{6,20}$",
    message="Enter a valid phone number.",
)

# A secondary-school student. Wide enough for a repeated year or an early
# starter; narrow enough to catch a year of birth typed into an age box.
age_validators = [MinValueValidator(5), MaxValueValidator(30)]

# What a person can reasonably be expected to have written into a form field.
# Not a security limit — the request body is capped upstream — but a submission
# longer than this is a paste accident, and truncating it silently would be
# worse than saying so.
MESSAGE_MAX = 4000
COVER_LETTER_MAX = 6000
