"""
Mentorship pairings and Science Fair projects.

Written to record what the Foundation does, not to prescribe it. The Foundation
has not put a matching process, a cycle length, or a review rubric in writing,
so none is encoded here: a pairing is two people, a cohort, and dates, and staff
decide what those mean. The one exception is the Science Fair stage list, which
is published on /secondary-research and so is modelled exactly as stated there.

Anything that would need a policy to fill in — vetting status, safeguarding
checks, minimum commitment — is deliberately absent rather than guessed at.
"""

from django.db import models
from django.db.models.functions import Lower

from core.models import TimeStampedModel
from core.validators import phone_validator
from submissions.models import ProjectProposal


class Cohort(TimeStampedModel):
    """A named intake. Free-form on purpose — the Foundation runs by academic
    year (the handbooks are '2026/27') but has not defined cohort rules."""

    name = models.CharField(max_length=120, unique=True, help_text="e.g. 2026/27")
    starts_on = models.DateField(null=True, blank=True)
    ends_on = models.DateField(null=True, blank=True)
    is_active = models.BooleanField(default=True, db_index=True)
    notes = models.TextField(blank=True)

    class Meta:
        ordering = ["-starts_on", "name"]

    def __str__(self):
        return self.name


from core.countries import Country  # noqa: E402  (shared vocabulary)


class School(TimeStampedModel):
    """
    A school the Foundation works with, recorded once.

    Every programme touches the same schools: a bursary is paid to one, a
    Science Fair project is entered by one, a mentee attends one. Each of those
    used to keep its own free-text name, so one school could be spelled three
    ways and nothing could be counted across programmes.

    Public Science Fair registrations still capture the school as plain text.
    An applicant may name a school the Foundation has never worked with, and
    that must not require someone to create a record before the form will send.
    """

    class Level(models.TextChoices):
        PRIMARY = "primary", "Primary"
        SECONDARY = "secondary", "Secondary"
        COMBINED = "combined", "Combined (Primary & Secondary)"
        VOCATIONAL = "vocational", "Vocational / Technical"
        TERTIARY = "tertiary", "Tertiary"

    class Status(models.TextChoices):
        ACTIVE = "active", "Active"
        PROSPECTIVE = "prospective", "Prospective"
        DORMANT = "dormant", "Dormant"

    #: Uganda's four regions and South Sudan's three — the countries the
    #: Foundation runs school programmes in. Not a scheme invented here.
    class Region(models.TextChoices):
        CENTRAL = "central", "Central"
        EASTERN = "eastern", "Eastern"
        NORTHERN = "northern", "Northern"
        WESTERN = "western", "Western"
        BAHR_EL_GHAZAL = "bahr_el_ghazal", "Bahr el Ghazal"
        EQUATORIA = "equatoria", "Equatoria"
        UPPER_NILE = "upper_nile", "Upper Nile"

    name = models.CharField(max_length=200, db_index=True)
    level = models.CharField(max_length=20, choices=Level.choices, blank=True)
    country = models.CharField(max_length=2, choices=Country.choices, blank=True, db_index=True)
    region = models.CharField(max_length=20, choices=Region.choices, blank=True)
    district = models.CharField(max_length=120, blank=True)
    # The school's number. A head teacher moves on and the number stays, which
    # is why this is not named after whoever answers it.
    phone = models.CharField(max_length=50, blank=True, validators=[phone_validator])
    # When the Foundation began working with this school, not when the school
    # itself was founded.
    partnership_started_on = models.DateField(null=True, blank=True)
    status = models.CharField(
        max_length=20, choices=Status.choices, default=Status.ACTIVE, db_index=True
    )

    class Meta:
        ordering = ["name"]
        constraints = [
            # One record per school. Two schools may share a name in different
            # districts, which is common, so the district is part of the key.
            models.UniqueConstraint(
                Lower("name"), "district", name="unique_school_name_per_district"
            )
        ]

    def __str__(self):
        return f"{self.name}{f' — {self.district}' if self.district else ''}"


class SchoolPaymentDetail(TimeStampedModel):
    """
    Where money for a school is actually sent.

    A separate record per route rather than columns on the school, because a
    school commonly has more than one: a bank account for fees and a School Pay
    code for the same student, sometimes a mobile money line as well. Which
    fields matter depends on the route, so they are all optional and the method
    says which ones to read.

    `is_primary` is what a bursar needs in practice — "where does this school's
    money go by default" — without deleting the others.
    """

    class Method(models.TextChoices):
        BANK = "bank", "Bank transfer"
        SCHOOL_PAY = "school_pay", "School Pay"
        MOBILE_MONEY = "mobile_money", "Mobile money"
        OTHER = "other", "Other"

    school = models.ForeignKey(
        School, on_delete=models.CASCADE, related_name="payment_details"
    )
    method = models.CharField(max_length=20, choices=Method.choices, default=Method.BANK)

    # School Pay issues a code per school; nothing else here applies to it.
    payment_code = models.CharField(
        max_length=60,
        blank=True,
        help_text=(
            "The school's own code, where it has one. A pupil's individual "
            "School Pay code belongs on their bursary, not here."
        ),
    )

    bank_name = models.CharField(max_length=120, blank=True)
    bank_account_name = models.CharField(
        max_length=200, blank=True, help_text="Exactly as the bank holds it, or a transfer bounces."
    )
    bank_account_number = models.CharField(max_length=60, blank=True)

    # The person to ring about a payment. Kept on the route rather than on the
    # school: a school paying through both a bank and School Pay may well have
    # a different person answering for each.
    bursar_name = models.CharField(
        max_length=200, blank=True, help_text="Who to ask for."
    )
    bursar_phone = models.CharField(
        max_length=50,
        blank=True,
        validators=[phone_validator],
        help_text="Whoever answers about fees for this route.",
    )

    is_primary = models.BooleanField(
        default=False, help_text="Use this route unless told otherwise."
    )
    is_active = models.BooleanField(default=True, db_index=True)

    class Meta:
        ordering = ["school__name", "-is_primary", "method"]

    def __str__(self):
        return f"{self.school.name} — {self.get_method_display()}"


class Mentor(TimeStampedModel):
    """A volunteer mentor. Usually arrives as a VolunteerApplication with
    'Mentorship' as the area, and may also appear on the public team page."""

    class Mode(models.TextChoices):
        IN_PERSON = "in_person", "In person"
        REMOTE = "remote", "Remote"
        BOTH = "both", "Either"

    name = models.CharField(max_length=200)
    email = models.EmailField(blank=True)
    phone = models.CharField(max_length=50, blank=True)
    profession = models.CharField(max_length=200, blank=True, help_text="e.g. Senior Civil Engineer")
    organisation = models.CharField(max_length=200, blank=True)
    expertise = models.CharField(max_length=300, blank=True, help_text="Comma-separated fields they can speak to.")
    mode = models.CharField(max_length=20, choices=Mode.choices, default=Mode.BOTH)
    office = models.ForeignKey(
        "operations.Office", null=True, blank=True, on_delete=models.SET_NULL, related_name="+"
    )
    country = models.CharField(max_length=2, choices=Country.choices, blank=True)
    is_active = models.BooleanField(default=True, db_index=True)
    notes = models.TextField(blank=True)

    application = models.ForeignKey(
        "submissions.VolunteerApplication",
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="mentors",
        help_text="The volunteer application this mentor came from, if any.",
    )
    team_member = models.OneToOneField(
        "content_cms.TeamMember",
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="mentor_record",
        help_text="Link if this mentor is also published on the team page.",
    )

    class Meta:
        ordering = ["name"]

    def __str__(self):
        return f"{self.name}{f' — {self.profession}' if self.profession else ''}"


class Mentee(TimeStampedModel):
    """A student in the programme."""

    name = models.CharField(max_length=200)
    email = models.EmailField(blank=True)
    phone = models.CharField(max_length=50, blank=True)
    guardian_contact = models.CharField(max_length=255, blank=True)
    school = models.ForeignKey(
        School, null=True, blank=True, on_delete=models.PROTECT, related_name="mentees"
    )
    class_stream = models.CharField("class / stream", max_length=100, blank=True)
    district = models.CharField(max_length=120, blank=True)
    country = models.CharField(max_length=2, choices=Country.choices, blank=True)
    interests = models.CharField(max_length=300, blank=True)
    office = models.ForeignKey(
        "operations.Office", null=True, blank=True, on_delete=models.SET_NULL, related_name="+"
    )
    is_active = models.BooleanField(default=True, db_index=True)
    notes = models.TextField(blank=True)

    class Meta:
        ordering = ["name"]

    def __str__(self):
        return f"{self.name}{f' — {self.school.name}' if self.school_id else ''}"


class MentorshipPairing(TimeStampedModel):
    class PairingStatus(models.TextChoices):
        PROPOSED = "proposed", "Proposed"
        ACTIVE = "active", "Active"
        PAUSED = "paused", "Paused"
        COMPLETED = "completed", "Completed"
        ENDED = "ended", "Ended early"

    mentor = models.ForeignKey(Mentor, on_delete=models.PROTECT, related_name="pairings")
    mentee = models.ForeignKey(Mentee, on_delete=models.PROTECT, related_name="pairings")
    cohort = models.ForeignKey(Cohort, null=True, blank=True, on_delete=models.SET_NULL, related_name="pairings")
    status = models.CharField(
        max_length=20, choices=PairingStatus.choices, default=PairingStatus.PROPOSED, db_index=True
    )
    started_on = models.DateField(null=True, blank=True)
    ended_on = models.DateField(null=True, blank=True)
    notes = models.TextField(blank=True)

    class Meta:
        ordering = ["-created_at"]
        constraints = [
            models.UniqueConstraint(
                fields=["mentor", "mentee", "cohort"], name="unique_pairing_per_cohort"
            )
        ]

    def __str__(self):
        return f"{self.mentor.name} → {self.mentee.name}"


class ScienceFairProject(TimeStampedModel):
    """
    A project moving through the Science Fair.

    The stages are exactly the eight published on /secondary-research, in order.
    Dates for each stage are announced to schools each year, so none is fixed
    here.
    """

    class Stage(models.TextChoices):
        HANDBOOK_RELEASED = "handbook_released", "1. Handbook released to schools"
        PROJECT_CHOSEN = "project_chosen", "2. Choose a project, find a mentor"
        PROPOSAL_SUBMITTED = "proposal_submitted", "3. Submit your proposal"
        UNDER_REVIEW = "under_review", "4. Review and feedback"
        RESEARCH_AND_BUILD = "research_and_build", "5. Research and build"
        SCHOOL_FAIR = "school_fair", "6. School-level fair"
        REGIONAL_FAIR = "regional_fair", "7. Regional fair"
        NATIONAL_FAIR = "national_fair", "8. National fair"
        COMPLETED = "completed", "9. Completed"
        WITHDRAWN = "withdrawn", "Withdrawn"

    registration = models.OneToOneField(
        ProjectProposal,
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="project",
        help_text="The online registration this project came from, if any.",
    )

    title = models.CharField(max_length=300)
    category = models.CharField(max_length=40, choices=ProjectProposal.CATEGORY_CHOICES)
    school = models.ForeignKey(
        School, on_delete=models.PROTECT, related_name="science_fair_projects"
    )
    district = models.CharField(max_length=120, blank=True)
    country = models.CharField(max_length=2, choices=Country.choices, blank=True, default="", db_index=True)
    cohort = models.ForeignKey(Cohort, null=True, blank=True, on_delete=models.SET_NULL, related_name="projects")

    stage = models.CharField(
        max_length=30, choices=Stage.choices, default=Stage.PROPOSAL_SUBMITTED, db_index=True
    )
    teacher_mentor = models.CharField(max_length=200, blank=True)
    students = models.ManyToManyField(Mentee, blank=True, related_name="projects")

    # Two independent reviewers score out of 100 against a standard rubric.
    # Scores are recorded; the pass mark is not set here because none is published.
    review_score = models.PositiveSmallIntegerField(
        null=True, blank=True, help_text="Out of 100, from the review stage."
    )
    review_feedback = models.TextField(blank=True)
    notes = models.TextField(blank=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.title} — {self.school.name}"


class ProjectAward(TimeStampedModel):
    """
    What a student got for their work.

    Kept as rows against the project rather than a field on it, because one
    project earns several things — a placement at the fair, then a scholarship,
    then equipment for the school — at different times and from different
    people. A single "prize" field would record the first and lose the rest.

    The money is stored with its currency. A bare number is meaningless across
    three countries, and the Foundation has already been caught out by figures
    that turned out to be in the wrong one.
    """

    class Kind(models.TextChoices):
        PLACEMENT = "placement", "Placement at a fair"
        PRIZE = "prize", "Prize"
        SCHOLARSHIP = "scholarship", "Scholarship"
        EQUIPMENT = "equipment", "Equipment"
        CERTIFICATE = "certificate", "Certificate"
        MENTORSHIP = "mentorship", "Mentorship place"
        OTHER = "other", "Other"

    project = models.ForeignKey(
        ScienceFairProject, on_delete=models.CASCADE, related_name="awards"
    )
    kind = models.CharField(max_length=30, choices=Kind.choices, default=Kind.PRIZE, db_index=True)
    title = models.CharField(max_length=200, help_text="e.g. First place, regional fair.")
    description = models.TextField(blank=True)

    amount = models.DecimalField(
        max_digits=12, decimal_places=2, null=True, blank=True,
        help_text="If it carries money. Leave blank if it does not.",
    )
    currency = models.CharField(
        max_length=3, blank=True, help_text="Required when there is an amount."
    )

    awarded_on = models.DateField(null=True, blank=True)
    awarded_by = models.CharField(
        max_length=200, blank=True, help_text="Who gave it — the Foundation, a partner, a sponsor."
    )
    #: Recorded rather than assumed: a scholarship promised in March and paid in
    #: June are different facts, and only one of them is money out of the door.
    is_delivered = models.BooleanField(
        default=False, db_index=True, help_text="Whether the student has actually received it."
    )
    notes = models.TextField(blank=True)

    class Meta:
        ordering = ["-awarded_on", "-created_at"]

    def __str__(self):
        return f"{self.title} — {self.project.title}"
