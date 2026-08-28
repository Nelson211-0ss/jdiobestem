"""
One country vocabulary for the whole application.

Every record that can belong to an office carries this, and every record that
belongs to the Foundation as a whole carries GLOBAL. That distinction is what
lets a country-scoped person work without seeing another office's data, while
still seeing the things that are nobody's alone — a news story, a magazine
issue, a policy.

Previously an empty country meant "not assigned yet", which conflated two very
different states: nobody has decided, and it belongs to everyone. GLOBAL is the
second of those, said out loud.
"""

from django.db import models


class Country(models.TextChoices):
    GLOBAL = "GL", "Global — all countries"
    UGANDA = "UG", "Uganda"
    SOUTH_SUDAN = "SS", "South Sudan"
    UNITED_STATES = "US", "United States"


#: Countries a person can be scoped to. GLOBAL is not one of them: a person is
#: either tied to an office or has no country restriction at all.
STAFF_SCOPES = [
    ("", "All countries"),
    (Country.UGANDA.value, "Uganda"),
    (Country.SOUTH_SUDAN.value, "South Sudan"),
    (Country.UNITED_STATES.value, "United States"),
]

COUNTRY_HELP = (
    "Which office this belongs to. Choose Global when it belongs to the "
    "Foundation as a whole rather than one country."
)


def country_field(default=Country.GLOBAL, blank=True, **kwargs):
    """A country column with consistent choices, help text and indexing."""
    return models.CharField(
        max_length=2,
        choices=Country.choices,
        default=default,
        blank=blank,
        db_index=True,
        help_text=kwargs.pop("help_text", COUNTRY_HELP),
        **kwargs,
    )
