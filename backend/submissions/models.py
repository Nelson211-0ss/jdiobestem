"""
Everything the public forms send in.

Until now each of these was relayed to an inbox once and then gone — there was
no record of who volunteered last year or which schools registered projects.
These models are that record. Field names and choices are taken from the live
forms rather than invented, so nothing is captured that the form never asked
for and nothing the form does ask for is dropped.
"""

import uuid

from django.db import models

from core.models import TimeStampedModel

from core.countries import Country  # noqa: E402


class Status(models.TextChoices):
    """One shared workflow. Deliberately generic — the Foundation has not
    written down a review process, so this stays a simple triage state rather
    than a pipeline invented here."""

    NEW = "new", "New"
    IN_REVIEW = "in_review", "In review"
    CONTACTED = "contacted", "Contacted"
    CLOSED = "closed", "Closed"
    SPAM = "spam", "Spam"


class SubmissionBase(TimeStampedModel):
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.NEW, db_index=True)
    country = models.CharField(
        max_length=2,
        choices=Country.choices,
        blank=True,
        default="",
        db_index=True,
        help_text="Blank until somebody assigns this to an office.",
    )
    office = models.ForeignKey(
        "operations.Office",
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="+",
        help_text="Which office is handling this.",
    )
    staff_notes = models.TextField(blank=True, help_text="Internal only. Never shown on the website.")
    notified_at = models.DateTimeField(
        null=True, blank=True, help_text="When the notification email went out, if it did."
    )

    class Meta:
        abstract = True
        ordering = ["-created_at"]


class VolunteerApplication(SubmissionBase):
    """From /volunteers. The five fields are exactly what the form collects."""

    class Interest(models.TextChoices):
        MENTORSHIP = "mentorship", "Mentorship"
        EVENT = "event", "Event organization"
        TUTORING = "tutoring", "STEM tutoring"
        OUTREACH = "outreach", "Community outreach"
        OTHER = "other", "Other"

    name = models.CharField(max_length=200)
    email = models.EmailField()
    phone = models.CharField(max_length=50, blank=True)
    interest = models.CharField(max_length=20, choices=Interest.choices)
    message = models.TextField(help_text="Why do you want to volunteer?")

    class Meta(SubmissionBase.Meta):
        verbose_name = "volunteer application"

    def __str__(self):
        return f"{self.name} — {self.get_interest_display()}"


class NewsletterSubscriber(TimeStampedModel):
    """From the footer signup. Kept separate from the triage models: a mailing
    list is a standing state, not a task to work through."""

    class SubscriptionStatus(models.TextChoices):
        SUBSCRIBED = "subscribed", "Subscribed"
        UNSUBSCRIBED = "unsubscribed", "Unsubscribed"
        BOUNCED = "bounced", "Bounced"

    email = models.EmailField(unique=True)
    status = models.CharField(
        max_length=20, choices=SubscriptionStatus.choices, default=SubscriptionStatus.SUBSCRIBED, db_index=True
    )
    country = models.CharField(
        max_length=2,
        choices=Country.choices,
        blank=True,
        default=Country.GLOBAL,
        db_index=True,
        help_text="Which office's list this address belongs to.",
    )
    source = models.CharField(max_length=100, blank=True, help_text="Which page or form it came from.")
    unsubscribed_at = models.DateTimeField(null=True, blank=True)

    # Every newsletter carries a one-click unsubscribe link built from this.
    # It is a random token rather than the address itself so that the link
    # cannot be guessed for someone else's email.
    unsubscribe_token = models.UUIDField(default=uuid.uuid4, unique=True, editable=False)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return self.email


class ContactMessage(SubmissionBase):
    """From /contact.

    Note: the site's contact form currently opens the visitor's own mail client
    rather than posting anywhere, so this table stays empty until that form is
    pointed at /api/contact/. The endpoint is ready for it.
    """

    name = models.CharField(max_length=200)
    email = models.EmailField()
    topic = models.CharField(max_length=120, blank=True)
    message = models.TextField()

    class Meta(SubmissionBase.Meta):
        verbose_name = "contact message"

    def __str__(self):
        return f"{self.name} — {self.topic or 'General'}"


class ProjectProposal(SubmissionBase):
    """
    From the Science Fair registration form on /secondary-research.

    Sections 1 and 3 of the Proposal Workbook. This is the online registration,
    not the formal submission — that is the signed workbook, which needs a
    mentor's evaluation, a head teacher's endorsement and a school stamp.
    """

    CATEGORY_CHOICES = [
        ("physical", "Physical Sciences (Physics, Chemistry, Materials)"),
        ("life", "Life & Environmental Sciences (Biology, Agriculture, Ecology, Public Health)"),
        ("engineering", "Engineering & Technology (Devices, Mechanical/Electrical Systems, Renewable Energy)"),
        ("software", "Computer Science & Software (Applications, Websites, Data Systems, AI Tools)"),
        ("innovation", "Innovation & Entrepreneurship (New Products, Business Models with a Technical Core)"),
        ("community", "Community & Social Impact Projects"),
    ]

    # Section 1 — student
    student_name = models.CharField(max_length=200)
    gender = models.CharField(max_length=40, blank=True)
    age = models.PositiveSmallIntegerField(null=True, blank=True)
    class_stream = models.CharField("class / stream", max_length=100)
    school = models.CharField(max_length=200, db_index=True)
    district = models.CharField(max_length=120, db_index=True)
    region = models.CharField(max_length=120, blank=True)
    student_email = models.EmailField()
    student_phone = models.CharField(max_length=50, blank=True)
    guardian_contact = models.CharField("parent / guardian contact", max_length=255)
    teacher_mentor = models.CharField(max_length=200)
    head_teacher = models.CharField(max_length=200, blank=True)

    # Section 3 — project
    project_title = models.CharField(max_length=300)
    category = models.CharField(max_length=40, choices=CATEGORY_CHOICES)
    project_type = models.CharField(max_length=255, blank=True, help_text="Comma-separated; the form allows several.")
    keywords = models.CharField(max_length=255, blank=True)
    duration = models.CharField(max_length=120, blank=True)
    team_size = models.CharField(max_length=60, blank=True, help_text="Individual or team project.")
    summary = models.TextField("problem the student wants to work on")

    declaration = models.BooleanField(
        default=False,
        help_text="Own original work, and any AI use to be declared in Section 12 of the workbook.",
    )

    class Meta(SubmissionBase.Meta):
        verbose_name = "science fair registration"

    def __str__(self):
        return f"{self.project_title} — {self.school}"
