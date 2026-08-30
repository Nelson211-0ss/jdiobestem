"""
The parts of the site that are already lists of records, moved into the database
so staff can publish without a deploy.

Three things qualify: news stories, the team directory, and magazine issues —
all three live in the repo today as arrays of objects, which is a CMS with extra
steps. The programme pages are hand-written prose and are deliberately left in
the codebase; turning them into database rows would buy nothing and lose the
layout.

One real difference: a story body in the repo is JSX, which cannot be stored as
data. Bodies here are Markdown, so the two existing articles need converting
once when they move across.
"""

from django.db import models
from django.utils.text import slugify


def unique_slug(model, base, limit, exclude_pk=None):
    """`base`, or `base-2`, `base-3`… — whichever is free.

    A derived slug can collide (two stories both called "Annual report"), and a
    collision on a unique column raises IntegrityError, which reaches the user
    as a 500 rather than as anything they can act on.
    """
    slug = (base or "item")[:limit]
    rows = model.objects.exclude(pk=exclude_pk) if exclude_pk else model.objects
    if not rows.filter(slug=slug).exists():
        return slug
    for n in range(2, 1000):
        suffix = f"-{n}"
        candidate = f"{slug[: limit - len(suffix)]}{suffix}"
        if not rows.filter(slug=candidate).exists():
            return candidate
    raise ValueError("Could not find a free slug.")

from core.countries import Country, country_field
from core.models import TimeStampedModel


class PublishedQuerySet(models.QuerySet):
    def published(self):
        return self.filter(is_published=True)


class NewsStory(TimeStampedModel):
    slug = models.SlugField(max_length=200, unique=True)
    title = models.CharField(max_length=255)
    category = models.CharField(max_length=100)
    date = models.DateField(db_index=True, help_text="The date the story is about.")
    date_label = models.CharField(max_length=60, blank=True, help_text="Display date. Derived if left blank.")
    reading_time = models.CharField(max_length=40, blank=True)
    excerpt = models.TextField(help_text="One-sentence standfirst, used on the card and under the headline.")
    body = models.TextField(help_text="Markdown.")

    # Optional by design: a story with no photograph of our own is better than
    # one with a stock image that misrepresents where it happened.
    image = models.CharField(max_length=300, blank=True, help_text="Path under /public, or an uploaded file below.")
    image_upload = models.ImageField(upload_to="news/", blank=True)
    image_alt = models.CharField(max_length=300, blank=True)
    caption = models.CharField(max_length=300, blank=True)

    is_published = models.BooleanField(default=False, db_index=True)
    country = country_field()

    objects = PublishedQuerySet.as_manager()

    class Meta:
        ordering = ["-date"]
        verbose_name_plural = "news stories"

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = unique_slug(NewsStory, slugify(self.title), 200, self.pk)
        if not self.date_label and self.date:
            self.date_label = self.date.strftime("%d %B %Y")
        super().save(*args, **kwargs)

    def __str__(self):
        return self.title


class NewsGalleryImage(models.Model):
    story = models.ForeignKey(NewsStory, related_name="gallery", on_delete=models.CASCADE)
    src = models.CharField(max_length=300, blank=True)
    upload = models.ImageField(upload_to="news/gallery/", blank=True)
    alt = models.CharField(max_length=300)
    caption = models.CharField(max_length=300, blank=True)
    order = models.PositiveSmallIntegerField(default=0)

    class Meta:
        ordering = ["order", "id"]

    def __str__(self):
        return self.alt


class NewsLink(models.Model):
    story = models.ForeignKey(NewsStory, related_name="links", on_delete=models.CASCADE)
    label = models.CharField(max_length=120)
    href = models.CharField(max_length=300)
    icon = models.CharField(max_length=60, blank=True, help_text="Feather icon name.")
    order = models.PositiveSmallIntegerField(default=0)

    class Meta:
        ordering = ["order", "id"]

    def __str__(self):
        return self.label


class TeamMember(TimeStampedModel):
    class Group(models.TextChoices):
        LEADERSHIP = "leadership", "Leadership"
        MENTORS = "mentors", "Mentors"
        # Volunteers the Foundation wants to recognise by name. They appear on
        # /volunteers rather than /team: the team page is who runs the
        # organisation, and a volunteer is not staff.
        VOLUNTEERS = "volunteers", "Outstanding volunteers"

    name = models.CharField(max_length=200)
    role = models.CharField(max_length=200)
    group = models.CharField(max_length=20, choices=Group.choices, default=Group.LEADERSHIP, db_index=True)
    image = models.CharField(max_length=300, blank=True, help_text="Path under /public, or an uploaded file below.")
    image_upload = models.ImageField(upload_to="team/", blank=True)
    alt = models.CharField(max_length=300, blank=True)
    focus = models.CharField(max_length=60, blank=True, help_text="CSS object-position, e.g. 'center 20%'.")
    bio = models.TextField(blank=True)
    linkedin = models.URLField(blank=True)
    email = models.EmailField(blank=True)
    order = models.PositiveSmallIntegerField(default=0)
    is_published = models.BooleanField(default=True, db_index=True)
    country = country_field()

    objects = PublishedQuerySet.as_manager()

    class Meta:
        ordering = ["group", "order", "name"]

    def __str__(self):
        return f"{self.name} — {self.role}"


class MagazineIssue(TimeStampedModel):
    class IssueStatus(models.TextChoices):
        PUBLISHED = "published", "Published"
        IN_PRODUCTION = "in-production", "In production"

    class FileContains(models.TextChoices):
        FULL_ISSUE = "Full issue", "Full issue"
        COVER = "Cover", "Cover"

    issue_id = models.SlugField(max_length=60, unique=True, help_text="e.g. 2026")
    label = models.CharField(max_length=60, help_text="Issue line as printed on the cover, e.g. 11/2026.")
    name = models.CharField(max_length=120, help_text="How the issue is referred to in prose.")
    status = models.CharField(max_length=20, choices=IssueStatus.choices, default=IssueStatus.IN_PRODUCTION)

    cover = models.CharField(max_length=300, blank=True)
    cover_upload = models.ImageField(upload_to="magazine/", blank=True)
    cover_alt = models.CharField(max_length=300, blank=True)
    wrap = models.CharField(max_length=300, blank=True, help_text="Full wrap: back cover, spine, front.")
    wrap_alt = models.CharField(max_length=300, blank=True)

    summary = models.TextField(blank=True)

    file_href = models.CharField(max_length=300, blank=True)
    file_upload = models.FileField(upload_to="magazine/", blank=True)
    file_filename = models.CharField(max_length=200, blank=True, help_text="Filename the browser saves it as.")
    file_size = models.CharField(max_length=40, blank=True)
    file_contains = models.CharField(
        max_length=20,
        choices=FileContains.choices,
        blank=True,
        help_text="What the file actually holds, so the page never overstates it.",
    )

    epigraph_quote = models.TextField(blank=True)
    epigraph_attribution = models.CharField(max_length=200, blank=True)
    epigraph_source = models.CharField(max_length=200, blank=True)

    # What "newest" means. Without it the newest issue was whichever slug
    # sorted highest as text — fine while they are called 2026 and 2027,
    # wrong the first time somebody writes "spring-2027".
    published_on = models.DateField(
        null=True,
        blank=True,
        help_text="The issue date. The most recent issue leads the magazine page.",
    )
    order = models.PositiveSmallIntegerField(
        default=0,
        help_text="Leave at 0 to let the date decide. Raise it to push an issue down the page.",
    )
    country = country_field()

    class Meta:
        # Date first, so adding an issue features it without anyone touching
        # `order`. Issues with no date fall to the back rather than jumping
        # the queue, which is what a plain DESC does with NULLs in Postgres.
        ordering = [
            "order",
            models.F("published_on").desc(nulls_last=True),
            "-issue_id",
        ]

    def __str__(self):
        return f"{self.name} ({self.label})"


class MagazineStory(models.Model):
    issue = models.ForeignKey(MagazineIssue, related_name="stories", on_delete=models.CASCADE)
    title = models.CharField(max_length=255)
    blurb = models.TextField(blank=True)
    order = models.PositiveSmallIntegerField(default=0)

    class Meta:
        ordering = ["order", "id"]
        verbose_name_plural = "magazine stories"

    def __str__(self):
        return self.title


class SiteStat(TimeStampedModel):
    """
    The figures on the home page.

    Deliberately edited rather than counted. "120+ students supported" is a
    real-world total the Foundation stands behind, covering years of work and
    records that were never in this database; deriving it from a row count
    would put a smaller and wrong number on the front page. Editable here means
    it can be kept current without a deploy, while staying something a person
    has vouched for.
    """

    label = models.CharField(max_length=120)
    value = models.PositiveIntegerField()
    suffix = models.CharField(max_length=8, blank=True, help_text="e.g. + for '120+'.")
    order = models.PositiveSmallIntegerField(default=0)
    is_published = models.BooleanField(default=True, db_index=True)
    country = country_field()
    note = models.TextField(blank=True, help_text="Internal: where this figure comes from.")

    objects = PublishedQuerySet.as_manager()

    class Meta:
        ordering = ["order", "id"]
        verbose_name = "home page statistic"

    def __str__(self):
        return f"{self.value}{self.suffix} {self.label}"


class Programme(TimeStampedModel):
    """
    A programme as the website presents it.

    Distinct from the `programmes` app, which holds the operational records —
    who is enrolled, which cohort, which project. This is the public
    description: the card on /programs, its place in the pathway, and where it
    links to.

    The long-form detail pages keep their own bespoke layouts. What lives here
    is the part that is genuinely repeated data, so a programme can be added,
    reordered, renamed or unpublished without a deploy.
    """

    slug = models.SlugField(max_length=120, unique=True)
    name = models.CharField(max_length=200)
    tagline = models.CharField(
        max_length=200, blank=True, help_text="The short line under the title on the card."
    )
    summary = models.TextField(help_text="One or two sentences. This is the card's body.")

    href = models.CharField(
        max_length=200,
        blank=True,
        help_text="Where the card links. Leave blank if the programme has no page of its own yet.",
    )
    image = models.CharField(
        max_length=300, blank=True, help_text="Path under /public, or upload one below."
    )
    image_upload = models.ImageField(upload_to="programmes/", blank=True)
    image_alt = models.CharField(max_length=300, blank=True)
    icon = models.CharField(
        max_length=60, blank=True, help_text="Icon name, e.g. users, globe, book-open, award."
    )

    # The pathway strip on /programs: one stage per programme, in order.
    pathway_stage = models.CharField(
        max_length=60,
        blank=True,
        help_text="Its step in the pathway, e.g. Inspire. Blank keeps it out of the pathway strip.",
    )
    pathway_label = models.CharField(
        max_length=200, blank=True, help_text="Name shown in the pathway strip. Defaults to the name."
    )

    order = models.PositiveSmallIntegerField(default=0)
    is_published = models.BooleanField(default=True, db_index=True)
    country = country_field()

    objects = PublishedQuerySet.as_manager()

    class Meta:
        ordering = ["order", "name"]

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = unique_slug(Programme, slugify(self.name), 120, self.pk)
        super().save(*args, **kwargs)

    def __str__(self):
        return self.name


class PageBlock(TimeStampedModel):
    """
    One editable piece of copy on an otherwise hand-built page.

    The prose pages — About, Impact, Uganda, South Sudan and the programme
    detail pages — are bespoke layouts, not article bodies. Flattening them into
    a rich-text field would trade a considered design for an editable blob, and
    a generic section builder would mean rebuilding the design system as data.

    So the layout stays in code and only the words move: each block is addressed
    by (page, key), and the page asks for it by that key. A block with no row
    falls back to the text compiled into the page, which means this table can be
    filled in gradually and a missing or unpublished row can never leave a hole
    on the site.
    """

    page = models.CharField(
        max_length=80, db_index=True, help_text="Which page, e.g. about, uganda, impact."
    )
    key = models.CharField(
        max_length=120, help_text="Which piece of that page, e.g. hero.heading."
    )
    value = models.TextField(blank=True)

    label = models.CharField(
        max_length=200, blank=True, help_text="What this is, in plain words, for whoever edits it."
    )
    is_published = models.BooleanField(
        default=True, db_index=True, help_text="Unpublished falls back to the built-in text."
    )
    country = country_field()

    objects = PublishedQuerySet.as_manager()

    class Meta:
        ordering = ["page", "key"]
        constraints = [
            models.UniqueConstraint(fields=["page", "key"], name="one_block_per_page_key")
        ]

    def __str__(self):
        return f"{self.page}.{self.key}"
