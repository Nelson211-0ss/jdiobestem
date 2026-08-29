"""
API endpoints.

Two kinds. The write endpoints take what the public forms send, store it, and
then notify — in that order, so a flaky email provider can never cost the
Foundation a submission. The read endpoints hand the published CMS records back
to Next.js.

Everything is behind the service key or a staff session; see api/auth.py.
"""

import logging

from django.conf import settings
from django.utils import timezone
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.generics import ListAPIView
from rest_framework.permissions import AllowAny
from rest_framework.response import Response

from content_cms.models import (
    MagazineIssue,
    NewsStory,
    PageBlock,
    Programme,
    SiteStat,
    TeamMember,
)
from donations.models import Donation
from submissions.models import NewsletterSubscriber

from . import notifications
from .serializers import (
    ContactMessageSerializer,
    DonationSerializer,
    NewsletterSubscriberSerializer,
    ProjectProposalSerializer,
    VolunteerApplicationSerializer,
)

logger = logging.getLogger(__name__)


def _store_then_notify(serializer, subject, lines_from, reply_to_field=None):
    """Save the submission first, then try to email. Never the other way round."""
    obj = serializer.save()
    sent = notifications.send_notification(
        subject=subject,
        lines=lines_from(obj),
        reply_to=getattr(obj, reply_to_field, "") if reply_to_field else "",
    )
    if sent:
        obj.notified_at = timezone.now()
        obj.save(update_fields=["notified_at"])
    return obj


@api_view(["GET"])
@permission_classes([AllowAny])
def health(request):
    """Unauthenticated on purpose, so a load balancer can call it."""
    return Response({"status": "ok"})


@api_view(["POST"])
def volunteer_create(request):
    serializer = VolunteerApplicationSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    obj = _store_then_notify(
        serializer,
        "New volunteer application",
        lambda o: [
            ("Name", o.name),
            ("Email", o.email),
            ("Phone", o.phone),
            ("Area of interest", o.get_interest_display()),
            ("Message", o.message),
        ],
        reply_to_field="email",
    )
    return Response(VolunteerApplicationSerializer(obj).data, status=status.HTTP_201_CREATED)


@api_view(["POST"])
def contact_create(request):
    serializer = ContactMessageSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    obj = _store_then_notify(
        serializer,
        "New contact message",
        lambda o: [("Name", o.name), ("Email", o.email), ("Topic", o.topic), ("Message", o.message)],
        reply_to_field="email",
    )
    return Response(ContactMessageSerializer(obj).data, status=status.HTTP_201_CREATED)


@api_view(["POST"])
def project_proposal_create(request):
    serializer = ProjectProposalSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    obj = _store_then_notify(
        serializer,
        "Science Fair project registration",
        lambda o: [
            ("Student", o.student_name),
            ("School", o.school),
            ("District", o.district),
            ("Class / stream", o.class_stream),
            ("Student email", o.student_email),
            ("Guardian contact", o.guardian_contact),
            ("Teacher mentor", o.teacher_mentor),
            ("Project title", o.project_title),
            ("Category", o.get_category_display()),
            ("Problem", o.summary),
            ("Declaration", "Confirmed"),
        ],
        reply_to_field="student_email",
    )
    return Response(ProjectProposalSerializer(obj).data, status=status.HTTP_201_CREATED)


@api_view(["POST"])
def newsletter_subscribe(request):
    """
    Idempotent. Signing up twice is normal behaviour, not an error, and someone
    who unsubscribed and came back should simply be subscribed again.
    """
    serializer = NewsletterSubscriberSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    email = serializer.validated_data["email"].strip().lower()

    subscriber, created = NewsletterSubscriber.objects.get_or_create(
        email=email,
        defaults={"source": serializer.validated_data.get("source", "")},
    )
    if not created and subscriber.status != NewsletterSubscriber.SubscriptionStatus.SUBSCRIBED:
        subscriber.status = NewsletterSubscriber.SubscriptionStatus.SUBSCRIBED
        subscriber.unsubscribed_at = None
        subscriber.save(update_fields=["status", "unsubscribed_at"])

    return Response(
        NewsletterSubscriberSerializer(subscriber).data,
        status=status.HTTP_201_CREATED if created else status.HTTP_200_OK,
    )


@api_view(["POST"])
def donation_upsert(request):
    """
    Called by the Stripe webhook route once a signature has been verified.

    Keyed on the Checkout session id so Stripe's at-least-once delivery updates
    the existing row instead of creating a second copy of the same gift.
    """
    serializer = DonationSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    data = serializer.validated_data
    session_id = data.pop("stripe_session_id")

    donation, created = Donation.objects.update_or_create(
        stripe_session_id=session_id, defaults=data
    )
    if created and donation.status == Donation.DonationStatus.SUCCEEDED:
        notifications.send_notification(
            "New donation",
            [
                ("Amount", donation.amount_display),
                ("Donor", donation.donor_name),
                ("Email", donation.donor_email),
                ("Mode", "live" if donation.livemode else "test"),
                ("Session", donation.stripe_session_id),
            ],
        )
    return Response(
        DonationSerializer(donation).data,
        status=status.HTTP_201_CREATED if created else status.HTTP_200_OK,
    )


# ---------------------------------------------------------------- content


class NewsStoryList(ListAPIView):
    """Published stories, newest first — the order the index relies on."""

    queryset = NewsStory.objects.published().prefetch_related("gallery", "links")
    pagination_class = None

    def list(self, request, *args, **kwargs):
        stories = [
            {
                "slug": s.slug,
                "title": s.title,
                "category": s.category,
                "date": s.date.isoformat(),
                "dateLabel": s.date_label,
                "readingTime": s.reading_time,
                "excerpt": s.excerpt,
                "body": s.body,
                "image": s.image_upload.url if s.image_upload else (s.image or None),
                "imageAlt": s.image_alt or None,
                "caption": s.caption or None,
                "gallery": [
                    {"src": g.upload.url if g.upload else g.src, "alt": g.alt, "caption": g.caption or None}
                    for g in s.gallery.all()
                ],
                "links": [{"href": l.href, "label": l.label, "icon": l.icon} for l in s.links.all()],
            }
            for s in self.get_queryset()
        ]
        return Response(stories)


def _person(m):
    """One team member, shaped the way every page that shows people expects."""
    return {
        "name": m.name,
        "role": m.role,
        "group": m.group,
        "img": m.image_upload.url if m.image_upload else (m.image or None),
        "alt": m.alt,
        "focus": m.focus or None,
        "bio": m.bio or None,
        "links": [
            {"kind": kind, "href": href}
            for kind, href in (("linkedin", m.linkedin), ("email", m.email))
            if href
        ],
    }


class TeamMemberList(ListAPIView):
    """Who runs the organisation. Recognised volunteers are deliberately not
    here — they are not staff, and the team page says who the staff are."""

    queryset = TeamMember.objects.published().exclude(group=TeamMember.Group.VOLUNTEERS)
    pagination_class = None

    def list(self, request, *args, **kwargs):
        return Response([_person(m) for m in self.get_queryset()])


class RecognisedVolunteerList(ListAPIView):
    """The volunteers named on /volunteers, in the order the Foundation sets."""

    queryset = TeamMember.objects.published().filter(group=TeamMember.Group.VOLUNTEERS)
    pagination_class = None

    def list(self, request, *args, **kwargs):
        return Response([_person(m) for m in self.get_queryset()])


class MagazineIssueList(ListAPIView):
    queryset = MagazineIssue.objects.prefetch_related("stories")
    pagination_class = None

    def list(self, request, *args, **kwargs):
        issues = [
            {
                "id": i.issue_id,
                "label": i.label,
                "name": i.name,
                "status": i.status,
                "cover": i.cover_upload.url if i.cover_upload else i.cover,
                "coverAlt": i.cover_alt,
                "wrap": i.wrap or None,
                "wrapAlt": i.wrap_alt or None,
                "summary": i.summary,
                "file": (
                    {
                        "href": i.file_upload.url if i.file_upload else i.file_href,
                        "filename": i.file_filename,
                        "size": i.file_size,
                        "contains": i.file_contains,
                    }
                    if (i.file_href or i.file_upload)
                    else None
                ),
                "stories": [{"title": s.title, "blurb": s.blurb} for s in i.stories.all()],
                "epigraph": (
                    {
                        "quote": i.epigraph_quote,
                        "attribution": i.epigraph_attribution,
                        "source": i.epigraph_source,
                    }
                    if i.epigraph_quote
                    else None
                ),
            }
            for i in self.get_queryset()
        ]
        return Response(issues)


class SiteStatList(ListAPIView):
    """The home page figures, in display order."""

    queryset = SiteStat.objects.published()
    pagination_class = None

    def list(self, request, *args, **kwargs):
        return Response(
            [
                {"label": s.label, "value": s.value, "suffix": s.suffix}
                for s in self.get_queryset()
            ]
        )


class ProgrammeList(ListAPIView):
    """The programmes as the website shows them, in display order."""

    queryset = Programme.objects.published()
    pagination_class = None

    def list(self, request, *args, **kwargs):
        return Response(
            [
                {
                    "slug": p.slug,
                    "name": p.name,
                    "tagline": p.tagline,
                    "summary": p.summary,
                    "href": p.href,
                    "image": p.image_upload.url if p.image_upload else p.image,
                    "image_alt": p.image_alt,
                    "icon": p.icon,
                    "pathway_stage": p.pathway_stage,
                    "pathway_label": p.pathway_label or p.name,
                }
                for p in self.get_queryset()
            ]
        )


class PageBlockList(ListAPIView):
    """
    The editable copy for one page, as a flat {key: value} map.

    `?page=about` is required: a page asks for its own blocks and nothing else,
    so one page's content can never be held up by another's.
    """

    queryset = PageBlock.objects.published()
    pagination_class = None

    def list(self, request, *args, **kwargs):
        page = request.query_params.get("page", "").strip()
        if not page:
            return Response({})
        blocks = self.get_queryset().filter(page=page)
        return Response({b.key: b.value for b in blocks})
