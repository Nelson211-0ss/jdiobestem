"""
Serializers for the dashboard.

Separate from the public form serializers on purpose: those describe what a
visitor may send, these describe what a staff member may see and change. Keeping
them apart means widening the dashboard can never accidentally widen the public
endpoint.
"""

from django.contrib.auth.models import User
from rest_framework import serializers

from content_cms.models import (
    MagazineIssue,
    MagazineStory,
    NewsGalleryImage,
    NewsLink,
    NewsStory,
    PageBlock,
    Programme,
    SiteStat,
    TeamMember,
)
from donations.models import Donation
from programmes.models import Cohort, Mentee, Mentor, MentorshipPairing, ProjectAward, ScienceFairProject
from submissions.models import (
    ContactMessage,
    NewsletterSubscriber,
    ProjectProposal,
    VolunteerApplication,
)


class LabelledChoicesMixin:
    """Send the human label alongside the stored value.

    Without this every list in the dashboard would show `in_review` where a
    person expects `In review`, and each screen would have to keep its own copy
    of the choice map.
    """

    def to_representation(self, instance):
        data = super().to_representation(instance)
        for field in instance._meta.fields:
            if field.choices and field.name in data:
                getter = getattr(instance, f"get_{field.name}_display", None)
                if getter:
                    data[f"{field.name}_display"] = getter()
        return data


class VolunteerApplicationAdminSerializer(LabelledChoicesMixin, serializers.ModelSerializer):
    office_name = serializers.CharField(source="office.name", read_only=True, default="")
    class Meta:
        model = VolunteerApplication
        fields = "__all__"
        # The submission itself is a record of what someone sent. Only the
        # triage fields are writable.
        read_only_fields = ["name", "email", "phone", "interest", "message", "created_at", "updated_at", "notified_at"]


class ContactMessageAdminSerializer(LabelledChoicesMixin, serializers.ModelSerializer):
    office_name = serializers.CharField(source="office.name", read_only=True, default="")
    class Meta:
        model = ContactMessage
        fields = "__all__"
        read_only_fields = ["name", "email", "topic", "message", "created_at", "updated_at", "notified_at"]


class ProjectProposalAdminSerializer(LabelledChoicesMixin, serializers.ModelSerializer):
    office_name = serializers.CharField(source="office.name", read_only=True, default="")
    class Meta:
        model = ProjectProposal
        fields = "__all__"
        read_only_fields = [
            f.name for f in ProjectProposal._meta.fields
            if f.name not in {"status", "staff_notes"}
        ]


class NewsletterSubscriberAdminSerializer(LabelledChoicesMixin, serializers.ModelSerializer):
    class Meta:
        model = NewsletterSubscriber
        fields = "__all__"
        read_only_fields = ["created_at", "updated_at"]


class DonationAdminSerializer(LabelledChoicesMixin, serializers.ModelSerializer):
    amount = serializers.DecimalField(max_digits=12, decimal_places=2, read_only=True)
    amount_display = serializers.CharField(read_only=True)
    recorded_by_name = serializers.CharField(
        source="recorded_by.get_full_name", read_only=True, default=""
    )
    # Money is typed in the units people use and stored in minor units, so no
    # form ever asks anybody to enter a number of cents.
    amount_major = serializers.DecimalField(max_digits=12, decimal_places=2, required=False)

    class Meta:
        model = Donation
        fields = "__all__"
        # Stripe owns what it processed. Everything below is for a gift somebody
        # recorded by hand, and a Stripe row is refused outright in validate().
        read_only_fields = [
            "amount_cents",
            "stripe_session_id",
            "stripe_payment_intent",
            "livemode",
            "receipt_url",
            "raw_event",
            "recorded_by",
            "created_at",
            "updated_at",
        ]

    def to_representation(self, instance):
        # Filled from the stored minor units, so opening a gift to correct it
        # shows the amount rather than an empty box.
        data = super().to_representation(instance)
        data["amount_major"] = f"{instance.amount:.2f}"
        return data

    def validate(self, attrs):
        # A local edit to a Stripe gift would produce a total that quietly
        # disagrees with the payment processor.
        if self.instance and self.instance.source == Donation.Source.ONLINE:
            raise serializers.ValidationError(
                "This gift came through Stripe and is a copy of their record. "
                "It cannot be edited here."
            )
        if not self.instance and not attrs.get("amount_major"):
            raise serializers.ValidationError({"amount_major": "Give the amount."})
        if attrs.get("amount_major") is not None and attrs["amount_major"] <= 0:
            raise serializers.ValidationError({"amount_major": "A gift has to be more than zero."})
        return attrs

    def _apply_amount(self, validated):
        major = validated.pop("amount_major", None)
        if major is not None:
            validated["amount_cents"] = int(round(float(major) * 100))
        return validated

    def create(self, validated_data):
        validated_data = self._apply_amount(validated_data)
        # Anything typed into this form is by definition not a Stripe payment.
        validated_data["source"] = Donation.Source.OFFLINE
        return super().create(validated_data)

    def update(self, instance, validated_data):
        return super().update(instance, self._apply_amount(validated_data))


class NewsGalleryImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = NewsGalleryImage
        fields = ["id", "src", "alt", "caption", "order"]


class NewsLinkSerializer(serializers.ModelSerializer):
    class Meta:
        model = NewsLink
        fields = ["id", "label", "href", "icon", "order"]


class ThumbnailMixin(serializers.Serializer):
    """
    One resolved `thumbnail` URL, so tables do not each have to work out where
    a record's picture lives.

    Most of these models hold artwork twice: an uploaded file and a path to
    something already under /public. The fields are listed best-first and the
    first one with a value wins, which is the same order the site renders them
    in. Not every thumbnail is an image — a document's is its PDF — so the
    value is a URL and the table decides how to show it.
    """

    thumbnail = serializers.SerializerMethodField()

    #: Checked in order. May name a FileField or a plain path/URL field.
    thumbnail_fields: tuple[str, ...] = ("image_upload", "image")

    def get_thumbnail(self, obj) -> str:
        for name in self.thumbnail_fields:
            value = getattr(obj, name, None)
            if not value:
                continue
            url = getattr(value, "url", None)
            if url:
                return url
            if isinstance(value, str):
                return value
        return ""


class NewsStoryAdminSerializer(ThumbnailMixin, serializers.ModelSerializer):
    gallery = NewsGalleryImageSerializer(many=True, required=False)
    links = NewsLinkSerializer(many=True, required=False)

    class Meta:
        model = NewsStory
        fields = "__all__"
        read_only_fields = ["created_at", "updated_at"]
        # Left blank, the model makes one from the headline. Without this the
        # field is required and that never happens.
        extra_kwargs = {"slug": {"required": False, "allow_blank": True}}

    def _write_children(self, story, gallery, links):
        if gallery is not None:
            story.gallery.all().delete()
            for i, item in enumerate(gallery):
                NewsGalleryImage.objects.create(story=story, order=item.get("order", i), **{
                    k: v for k, v in item.items() if k not in {"id", "order"}
                })
        if links is not None:
            story.links.all().delete()
            for i, item in enumerate(links):
                NewsLink.objects.create(story=story, order=item.get("order", i), **{
                    k: v for k, v in item.items() if k not in {"id", "order"}
                })

    def create(self, validated_data):
        gallery = validated_data.pop("gallery", None)
        links = validated_data.pop("links", None)
        story = super().create(validated_data)
        self._write_children(story, gallery, links)
        return story

    def update(self, instance, validated_data):
        gallery = validated_data.pop("gallery", None)
        links = validated_data.pop("links", None)
        story = super().update(instance, validated_data)
        self._write_children(story, gallery, links)
        return story


class TeamMemberAdminSerializer(ThumbnailMixin, LabelledChoicesMixin, serializers.ModelSerializer):
    class Meta:
        model = TeamMember
        fields = "__all__"
        read_only_fields = ["created_at", "updated_at"]


class MagazineStorySerializer(serializers.ModelSerializer):
    class Meta:
        model = MagazineStory
        fields = ["id", "title", "blurb", "order"]


class MagazineIssueAdminSerializer(ThumbnailMixin, LabelledChoicesMixin, serializers.ModelSerializer):
    stories = MagazineStorySerializer(many=True, required=False)
    thumbnail_fields = ("cover_upload", "cover")

    class Meta:
        model = MagazineIssue
        fields = "__all__"
        read_only_fields = ["created_at", "updated_at"]

    def _write_stories(self, issue, stories):
        if stories is None:
            return
        issue.stories.all().delete()
        for i, item in enumerate(stories):
            MagazineStory.objects.create(
                issue=issue, order=item.get("order", i),
                title=item.get("title", ""), blurb=item.get("blurb", ""),
            )

    def create(self, validated_data):
        stories = validated_data.pop("stories", None)
        issue = super().create(validated_data)
        self._write_stories(issue, stories)
        return issue

    def update(self, instance, validated_data):
        stories = validated_data.pop("stories", None)
        issue = super().update(instance, validated_data)
        self._write_stories(issue, stories)
        return issue


class CohortAdminSerializer(serializers.ModelSerializer):
    class Meta:
        model = Cohort
        fields = "__all__"
        read_only_fields = ["created_at", "updated_at"]


class MentorAdminSerializer(LabelledChoicesMixin, serializers.ModelSerializer):
    office_name = serializers.CharField(source="office.name", read_only=True, default="")
    pairing_count = serializers.IntegerField(source="pairings.count", read_only=True)

    class Meta:
        model = Mentor
        fields = "__all__"
        read_only_fields = ["created_at", "updated_at"]


class MenteeAdminSerializer(LabelledChoicesMixin, serializers.ModelSerializer):
    office_name = serializers.CharField(source="office.name", read_only=True, default="")
    pairing_count = serializers.IntegerField(source="pairings.count", read_only=True)

    class Meta:
        model = Mentee
        fields = "__all__"
        read_only_fields = ["created_at", "updated_at"]


class MentorshipPairingAdminSerializer(LabelledChoicesMixin, serializers.ModelSerializer):
    mentor_name = serializers.CharField(source="mentor.name", read_only=True)
    mentee_name = serializers.CharField(source="mentee.name", read_only=True)
    cohort_name = serializers.CharField(source="cohort.name", read_only=True, default="")

    class Meta:
        model = MentorshipPairing
        fields = "__all__"
        read_only_fields = ["created_at", "updated_at"]


class ProjectAwardAdminSerializer(LabelledChoicesMixin, serializers.ModelSerializer):
    project_title = serializers.CharField(source="project.title", read_only=True)
    student_school = serializers.CharField(source="project.school", read_only=True)

    class Meta:
        model = ProjectAward
        fields = "__all__"
        read_only_fields = ["created_at", "updated_at"]

    def validate(self, attrs):
        """An amount without a currency is a number nobody can act on."""
        amount = attrs.get("amount", getattr(self.instance, "amount", None))
        currency = attrs.get("currency", getattr(self.instance, "currency", ""))
        if amount is not None and not currency:
            raise serializers.ValidationError(
                {"currency": ["Say which currency this amount is in."]}
            )
        return attrs


class ScienceFairProjectAdminSerializer(LabelledChoicesMixin, serializers.ModelSerializer):
    cohort_name = serializers.CharField(source="cohort.name", read_only=True, default="")
    # Summaries so the table answers "did this project lead to anything?"
    # without opening every row.
    award_count = serializers.SerializerMethodField()
    awards_delivered = serializers.SerializerMethodField()

    class Meta:
        model = ScienceFairProject
        fields = "__all__"
        read_only_fields = ["created_at", "updated_at"]

    def get_award_count(self, obj):
        return obj.awards.count()

    def get_awards_delivered(self, obj):
        return obj.awards.filter(is_delivered=True).count()


class UserAdminSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "username", "email", "first_name", "last_name", "is_staff", "is_superuser", "is_active", "last_login", "date_joined"]
        read_only_fields = ["last_login", "date_joined"]


class SiteStatAdminSerializer(serializers.ModelSerializer):
    class Meta:
        model = SiteStat
        fields = "__all__"
        read_only_fields = ["created_at", "updated_at"]


class ProgrammeAdminSerializer(ThumbnailMixin, serializers.ModelSerializer):
    class Meta:
        model = Programme
        fields = "__all__"
        read_only_fields = ["created_at", "updated_at"]
        # As above: blank means "make one from the name".
        extra_kwargs = {"slug": {"required": False, "allow_blank": True}}


class PageBlockAdminSerializer(serializers.ModelSerializer):
    class Meta:
        model = PageBlock
        fields = "__all__"
        read_only_fields = ["created_at", "updated_at"]
