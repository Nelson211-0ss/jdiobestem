"""
Bursaries, and the money that goes out under them.

A bursary is not an event. It is a commitment to one student that runs for
years: they start in a particular class, at a particular school, and money goes
to that school term after term until they finish or the award stops. The question the Foundation has to be able to answer
is "what has actually been paid for this child, and to whom", which needs the
payments kept as their own rows rather than a running total somebody edits.

So there are three things here. The bursary is the enduring record. A payment
is one transfer to the school, kept for good. A benefit is something the award
carries besides fees — uniform, books, transport — which varies per student and
is therefore a list rather than a set of columns.

The existing Scholarships board tracked something different: opportunities to
apply for, with deadlines and reviewers. This is the student side of it.
"""

from decimal import Decimal

from django.contrib.auth.models import User
from django.db import models

from core.countries import country_field
from core.models import TimeStampedModel
from core.validators import phone_validator
from operations.models import Office


class Scholarship(TimeStampedModel):
    """One student's bursary, followed from award to completion."""

    class Status(models.TextChoices):
        PENDING = "pending", "Pending start"
        ACTIVE = "active", "Active"
        SUSPENDED = "suspended", "Suspended"
        COMPLETED = "completed", "Completed"
        TERMINATED = "terminated", "Terminated"

    class Gender(models.TextChoices):
        FEMALE = "female", "Female"
        MALE = "male", "Male"
        OTHER = "other", "Prefer not to say"

    # --- the student -----------------------------------------------------
    # Issued by the application, never typed. `editable=False` is what makes
    # that true through the API as well as the form: DRF renders a
    # non-editable field read-only, so the reference is returned but cannot be
    # set or changed by anyone.
    reference = models.CharField(
        max_length=20,
        unique=True,
        blank=True,
        editable=False,
        help_text="Issued automatically when the bursary is created.",
    )
    student_name = models.CharField(max_length=200, db_index=True)
    photo = models.CharField(
        max_length=500,
        blank=True,
        help_text="A photograph of the student.",
    )
    gender = models.CharField(max_length=10, choices=Gender.choices, blank=True)
    date_of_birth = models.DateField(null=True, blank=True)
    student_phone = models.CharField(max_length=50, blank=True, validators=[phone_validator])

    # --- the school ------------------------------------------------------
    # One shared record rather than a name retyped for every award. The level,
    # the phone number and the account fees are sent to describe the school,
    # not the bursary, so they live on the school and are recorded once.
    school = models.ForeignKey(
        "programmes.School", on_delete=models.PROTECT, related_name="scholarships"
    )
    # School Pay issues a code per pupil, not per school: it is how this
    # student's fees are identified when money is sent. The school's own route
    # may carry a general code as well, which is a different thing.
    school_pay_code = models.CharField(
        max_length=60,
        blank=True,
        db_index=True,
        help_text="This student's own School Pay code, where their school uses one.",
    )

    # The class they were in when the award started never changes, which is what
    # makes progress answerable years later; the current one moves with them.
    class_at_award = models.CharField(
        max_length=60,
        blank=True,
        help_text="The class they were in when the bursary started, e.g. S2.",
    )
    current_class = models.CharField(max_length=60, blank=True)

    # --- the award -------------------------------------------------------
    amount_per_term = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        null=True,
        blank=True,
        help_text="What the bursary covers each term, before any extras.",
    )
    total_committed = models.DecimalField(
        max_digits=12, decimal_places=2, null=True, blank=True,
        help_text="The whole commitment, if one was agreed up front.",
    )
    currency = models.CharField(max_length=8, blank=True, help_text="e.g. UGX, SSP, USD.")

    started_on = models.DateField(null=True, blank=True)
    # How long it is expected to run. Kept as a date rather than a number of
    # years so "when does this finish" needs no arithmetic.
    expected_end_on = models.DateField(
        null=True, blank=True, help_text="When the bursary is expected to finish."
    )

    status = models.CharField(
        max_length=20, choices=Status.choices, default=Status.PENDING, db_index=True
    )

    # --- if it stops -----------------------------------------------------
    ended_on = models.DateField(
        null=True, blank=True, help_text="When it actually ended, whether completed or stopped."
    )
    termination_reason = models.TextField(
        blank=True, help_text="Why it ended. Required in practice whenever it ended early."
    )

    # --- parent or guardian ----------------------------------------------
    guardian_name = models.CharField(max_length=200, blank=True)
    guardian_relationship = models.CharField(
        max_length=60, blank=True, help_text="Mother, father, aunt, grandparent…"
    )
    guardian_phone = models.CharField(max_length=50, blank=True, validators=[phone_validator])
    guardian_address = models.CharField(max_length=300, blank=True)

    # --- everything else -------------------------------------------------
    country = country_field()
    office = models.ForeignKey(
        Office, null=True, blank=True, on_delete=models.SET_NULL, related_name="scholarships"
    )

    class Meta:
        ordering = ["student_name"]

    def __str__(self):
        return f"{self.student_name} — {self.school.name}"

    def save(self, *args, **kwargs):
        if not self.reference:
            self.reference = self._next_reference()
        # Country decides who may see this record, so it has to be set — but it
        # is the school's country, not a separate fact. The school is therefore
        # the source of truth and overwrites rather than merely filling a gap:
        # country_field defaults to GLOBAL, so "unset" is indistinguishable from
        # a deliberate "everywhere", and a bursary is never global anyway.
        if self.school_id and self.school.country:
            self.country = self.school.country
        super().save(*args, **kwargs)

    @staticmethod
    def _next_reference() -> str:
        """`BUR-0001`, counting from the highest already issued.

        Taken from the highest existing number rather than from the row count,
        so deleting a record cannot hand its reference to a different student.
        """
        last = (
            Scholarship.objects.filter(reference__startswith="BUR-")
            .order_by("-reference")
            .values_list("reference", flat=True)
            .first()
        )
        n = 0
        if last:
            try:
                n = int(last.split("-")[1])
            except (IndexError, ValueError):
                n = 0
        return f"BUR-{n + 1:04d}"

    @property
    def total_paid(self):
        """What has actually reached the school, summed from the payments."""
        return sum((p.amount for p in self.payments.all()), start=Decimal("0"))

    @property
    def total_due(self):
        """What the terms recorded against this bursary come to."""
        return sum((t.due for t in self.terms.all()), start=Decimal("0"))

    @property
    def outstanding(self):
        """Fees owed: what the terms come to, less what has been sent.

        Never negative — an overpayment on one term is not a credit the school
        owes back, and showing a minus here would read as though it were.
        """
        return max(self.total_due - self.total_paid, Decimal("0"))


class ScholarshipTerm(TimeStampedModel):
    """
    One term of a bursary: when it runs, and what it costs.

    A bursary is agreed once, but fees fall due term by term. Without the dates
    the question the Foundation actually has — "is anything owed right now" —
    cannot be answered at all, and without an amount per term "outstanding" has
    no meaning. Payments point at the term they settle, so what is still owed
    is arithmetic rather than someone's recollection.
    """

    scholarship = models.ForeignKey(
        Scholarship, on_delete=models.CASCADE, related_name="terms"
    )
    academic_year = models.CharField(max_length=20, blank=True, help_text="e.g. 2026.")
    label = models.CharField(max_length=40, help_text="e.g. Term 1.")
    starts_on = models.DateField(db_index=True)
    ends_on = models.DateField()
    amount_due = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        null=True,
        blank=True,
        help_text="Left empty, the bursary's amount per term is used.",
    )

    class Meta:
        ordering = ["-starts_on", "label"]
        constraints = [
            models.UniqueConstraint(
                fields=["scholarship", "academic_year", "label"],
                name="unique_term_per_bursary_year",
            )
        ]

    def __str__(self):
        year = f" {self.academic_year}" if self.academic_year else ""
        return f"{self.label}{year}"

    @property
    def due(self):
        """The term's own figure, or the bursary's standing one."""
        if self.amount_due is not None:
            return self.amount_due
        return self.scholarship.amount_per_term or Decimal("0")

    @property
    def paid(self):
        return sum((p.amount for p in self.payments.all()), start=Decimal("0"))

    @property
    def outstanding(self):
        return max(self.due - self.paid, Decimal("0"))

    @property
    def is_settled(self):
        return self.outstanding <= 0


class ScholarshipPayment(TimeStampedModel):
    """One transfer of money to the school under a bursary.

    Kept as its own row, and never edited into a running total: "what did we
    pay in Term 2 of 2026" has to stay answerable, and a receipt belongs to the
    payment it evidences rather than to the student in general.
    """

    class Method(models.TextChoices):
        BANK = "bank", "Bank transfer"
        MOBILE = "mobile", "Mobile money"
        CHEQUE = "cheque", "Cheque"
        CASH = "cash", "Cash"
        OTHER = "other", "Other"

    scholarship = models.ForeignKey(
        Scholarship, on_delete=models.CASCADE, related_name="payments"
    )
    paid_on = models.DateField(db_index=True)
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    currency = models.CharField(max_length=8, blank=True)

    # Which term the money was for, which is not always the term it was sent
    # in. A link rather than prose, so "what is still owed on Term 1" is a sum
    # and not a text match.
    term = models.ForeignKey(
        "ScholarshipTerm",
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="payments",
        help_text="The term this payment settles.",
    )

    method = models.CharField(max_length=20, choices=Method.choices, default=Method.BANK)
    reference = models.CharField(
        max_length=120, blank=True, help_text="Bank or mobile money reference."
    )
    receipt = models.CharField(
        max_length=500, blank=True, help_text="The school's receipt for this payment."
    )
    paid_to = models.CharField(
        max_length=200,
        blank=True,
        help_text="Who received it, if not the school's usual account.",
    )
    notes = models.TextField(blank=True)

    recorded_by = models.ForeignKey(
        User, null=True, blank=True, on_delete=models.SET_NULL, related_name="scholarship_payments"
    )

    class Meta:
        ordering = ["-paid_on", "-created_at"]

    def __str__(self):
        return f"{self.scholarship.student_name} — {self.amount} on {self.paid_on}"


class ScholarshipBenefit(TimeStampedModel):
    """Something the bursary carries besides school fees.

    A list rather than a set of columns, because what a bursary covers is
    negotiated per student — one gets uniform and books, another gets transport
    and a boarding place — and columns for every possibility would be mostly
    empty.
    """

    scholarship = models.ForeignKey(
        Scholarship, on_delete=models.CASCADE, related_name="benefits"
    )
    label = models.CharField(max_length=120, help_text="e.g. Scholastic materials.")
    detail = models.CharField(max_length=300, blank=True)
    order = models.PositiveSmallIntegerField(default=0)

    class Meta:
        ordering = ["order", "id"]

    def __str__(self):
        return self.label
