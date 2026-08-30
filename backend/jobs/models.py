"""
Vacancies, and the applications that come in for them.

A posting is public content: it appears on /careers while it is open and stops
appearing when it is not. An application is somebody's candidacy, which moves
through stages until a decision is reached.

Two things shape the model.

An application outlives its posting. A vacancy filled two years ago is still
the reason a person's CV is on file, so a posting is closed rather than deleted
and an application keeps the title it was made against even if the posting is
later renamed.

The stage is the record. Every move is written to the activity log by the
viewset that made it, so "who moved this to interview, and when" is answerable
without anyone having to remember to write it down.
"""

from django.contrib.auth.models import User
from django.db import models
from django.utils import timezone
from django.utils.text import slugify

from core.countries import country_field
from core.models import TimeStampedModel
from core.validators import COVER_LETTER_MAX, phone_validator
from operations.models import Office


class JobPosting(TimeStampedModel):
    """A vacancy, as the website advertises it."""

    class EmploymentType(models.TextChoices):
        FULL_TIME = "full_time", "Full time"
        PART_TIME = "part_time", "Part time"
        CONTRACT = "contract", "Contract"
        INTERNSHIP = "internship", "Internship"
        VOLUNTEER = "volunteer", "Volunteer"

    title = models.CharField(max_length=200)
    slug = models.SlugField(max_length=200, unique=True, blank=True)
    summary = models.TextField(help_text="One or two sentences. This is the card on /careers.")
    description = models.TextField(blank=True, help_text="The full description. Markdown.")

    # One per line, rather than prose: they are lists on the page and lists in
    # everyone's head, and keeping them apart makes postings comparable.
    responsibilities = models.TextField(
        blank=True, help_text="What the role involves. One per line."
    )
    requirements = models.TextField(
        blank=True, help_text="What is required. One per line."
    )

    employment_type = models.CharField(
        max_length=20, choices=EmploymentType.choices, default=EmploymentType.FULL_TIME
    )
    country = country_field()
    office = models.ForeignKey(
        Office, null=True, blank=True, on_delete=models.SET_NULL, related_name="postings"
    )

    # Closed rather than deleted: an application on file needs the posting it
    # was made against to still exist.
    is_open = models.BooleanField(
        default=True, db_index=True, help_text="Open postings appear on the careers page."
    )
    posted_on = models.DateField(default=timezone.localdate)
    order = models.PositiveSmallIntegerField(default=0)

    class Meta:
        ordering = ["order", "-posted_on", "title"]

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.title)[:200]
        super().save(*args, **kwargs)

    def __str__(self):
        return self.title

    @property
    def responsibility_list(self) -> list[str]:
        return [line.strip() for line in self.responsibilities.splitlines() if line.strip()]

    @property
    def requirement_list(self) -> list[str]:
        return [line.strip() for line in self.requirements.splitlines() if line.strip()]


class JobApplication(TimeStampedModel):
    """One person's candidacy, and where it has got to."""

    class Stage(models.TextChoices):
        NEW = "new", "New"
        SCREENING = "screening", "Screening"
        INTERVIEW = "interview", "Interview"
        OFFER = "offer", "Offer"
        HIRED = "hired", "Hired"
        REJECTED = "rejected", "Not taken forward"
        WITHDRAWN = "withdrawn", "Withdrawn"

    #: Stages that end the process. Reaching one stamps `decided_at`.
    CLOSED_STAGES = {Stage.HIRED, Stage.REJECTED, Stage.WITHDRAWN}

    posting = models.ForeignKey(
        JobPosting, null=True, blank=True, on_delete=models.SET_NULL, related_name="applications"
    )
    # Kept alongside the reference so a closed or renamed posting does not
    # leave an application describing a job nobody can identify.
    posting_title = models.CharField(max_length=200, blank=True)

    name = models.CharField(max_length=200)
    email = models.EmailField()
    phone = models.CharField(max_length=50, blank=True, validators=[phone_validator])

    cover_letter = models.TextField(blank=True, max_length=COVER_LETTER_MAX)
    cv = models.CharField(
        max_length=500, blank=True, help_text="The applicant's CV, in object storage."
    )

    stage = models.CharField(
        max_length=20, choices=Stage.choices, default=Stage.NEW, db_index=True
    )
    notes = models.TextField(blank=True, help_text="Internal. Never shown to the applicant.")
    decided_at = models.DateTimeField(null=True, blank=True)
    decided_by = models.ForeignKey(
        User, null=True, blank=True, on_delete=models.SET_NULL, related_name="job_decisions"
    )

    country = country_field()

    class Meta:
        ordering = ["-created_at"]

    def save(self, *args, **kwargs):
        if self.posting and not self.posting_title:
            self.posting_title = self.posting.title
        # Stamped when the process ends, and cleared if it is reopened, so the
        # date always means "when this was decided" and never "when it last
        # happened to be closed".
        if self.stage in self.CLOSED_STAGES and self.decided_at is None:
            self.decided_at = timezone.now()
        if self.stage not in self.CLOSED_STAGES:
            self.decided_at = None
            self.decided_by = None
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.name} — {self.posting_title or 'no posting'}"
