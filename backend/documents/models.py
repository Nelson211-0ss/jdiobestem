"""
Documents and their editions.

The Foundation's paperwork — handbooks, policies, forms, reports — is not a
single file that gets overwritten. A handbook has a 2026/27 edition and a
2027/28 one, and the question "which version was in force last March?" has to
stay answerable. So the document is the enduring thing and each edition is a
separate row with its own file, and replacing an edition never destroys the one
before it.
"""

from django.contrib.auth.models import User
from django.db import models
from django.utils.text import slugify

from core.countries import country_field
from core.models import TimeStampedModel
from operations.models import Office


class Document(TimeStampedModel):
    """A document as a thing that persists across its versions."""

    class Category(models.TextChoices):
        HANDBOOK = "handbook", "Handbook"
        POLICY = "policy", "Policy"
        FORM = "form", "Form"
        REPORT = "report", "Report"
        TEMPLATE = "template", "Template"
        GOVERNANCE = "governance", "Governance"
        FINANCE = "finance", "Finance"
        OTHER = "other", "Other"

    title = models.CharField(max_length=200)
    slug = models.SlugField(max_length=200, unique=True, blank=True)
    description = models.TextField(blank=True, help_text="What this document is for.")
    category = models.CharField(
        max_length=30, choices=Category.choices, default=Category.OTHER, db_index=True
    )

    country = country_field()
    office = models.ForeignKey(
        Office, null=True, blank=True, on_delete=models.SET_NULL, related_name="documents"
    )
    owner = models.ForeignKey(
        User, null=True, blank=True, on_delete=models.SET_NULL, related_name="documents",
        help_text="Who is responsible for keeping this current.",
    )

    # Archived rather than deleted: a document that is no longer used is still
    # part of the record of how the Foundation operated.
    is_archived = models.BooleanField(
        default=False, db_index=True, help_text="Keeps it out of the way without destroying it."
    )
    is_public = models.BooleanField(
        default=False,
        db_index=True,
        help_text="Published on the website. Leave off for anything internal.",
    )
    notes = models.TextField(blank=True)

    class Meta:
        ordering = ["title"]

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.title)[:200]
        super().save(*args, **kwargs)

    def __str__(self):
        return self.title

    @property
    def current_edition(self):
        return self.editions.filter(is_current=True).first()


class DocumentEdition(TimeStampedModel):
    """One version of a document, with the file that was in force."""

    document = models.ForeignKey(
        Document, on_delete=models.CASCADE, related_name="editions"
    )
    version = models.CharField(
        max_length=60, help_text="How this edition is referred to, e.g. 2026/27 or v2.1."
    )

    # Either an uploaded file or a link to one held elsewhere. Both are allowed
    # to be empty while an edition is being prepared.
    file = models.FileField(upload_to="documents/", blank=True)
    external_url = models.URLField(
        blank=True, max_length=500, help_text="If the file lives in Drive or OneDrive instead."
    )

    effective_date = models.DateField(
        null=True, blank=True, help_text="When this edition took effect."
    )
    is_current = models.BooleanField(
        default=False, db_index=True, help_text="The edition in force. Only one per document."
    )

    # Rendered from the first page of whichever file this edition points at.
    preview_image = models.CharField(max_length=500, blank=True, editable=False)
    preview_source = models.CharField(max_length=500, blank=True, editable=False)

    summary = models.TextField(blank=True, help_text="What changed in this edition.")
    uploaded_by = models.ForeignKey(
        User, null=True, blank=True, on_delete=models.SET_NULL, related_name="document_editions"
    )

    class Meta:
        ordering = ["-effective_date", "-created_at"]
        constraints = [
            models.UniqueConstraint(
                fields=["document"],
                condition=models.Q(is_current=True),
                name="one_current_edition_per_document",
            ),
            models.UniqueConstraint(
                fields=["document", "version"], name="one_row_per_document_version"
            ),
        ]

    def __str__(self):
        return f"{self.document.title} — {self.version}"
