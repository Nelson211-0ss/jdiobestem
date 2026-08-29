"""Newsletter endpoints: the dashboard's CRUD plus the public unsubscribe link."""

from django.http import HttpResponse
from django.shortcuts import get_object_or_404
from django.utils import timezone
from django.views.decorators.clickjacking import xframe_options_deny
from django.views.decorators.csrf import csrf_exempt
from activity.models import ActivityLog
from activity.recorder import LoggedViewSetMixin, record
from rest_framework import status, viewsets
from rest_framework.generics import ListAPIView
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response

from accounts import policy
from api.permissions import IsStaffOrServiceRead, ResourcePermission
from submissions.models import NewsletterSubscriber

from . import services
from .emails import (
    RESEND_TEST_ADDRESSES,
    absolute,
    render_body,
    send_batch,
    sender_is_verified,
    wrap_email,
)
from .models import Newsletter, NewsletterDelivery
from .serializers import NewsletterDeliverySerializer, NewsletterSerializer


class NewsletterViewSet(LoggedViewSetMixin, viewsets.ModelViewSet):
    """Compose, preview, test and send."""

    permission_classes = [ResourcePermission]
    resource = "newsletters"
    queryset = Newsletter.objects.select_related("created_by")
    serializer_class = NewsletterSerializer
    filterset_fields = ["status", "country"]
    search_fields = ["subject", "body"]
    ordering_fields = ["created_at", "subject", "status"]
    ordering = ["-created_at"]

    def get_queryset(self):
        """Same two layers as every other resource: the permission decides
        whether the action is allowed, this decides which rows are in view. A
        Uganda-scoped person drafts and sends to Uganda's list only."""
        return policy.scope(self.request.user, super().get_queryset(), self.resource)

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)

    def perform_destroy(self, instance):
        """Deleting the record of what was sent to whom would leave the
        Foundation unable to answer 'did we email this person?'."""
        if instance.sent_count:
            from rest_framework.exceptions import ValidationError

            raise ValidationError(
                "This newsletter has been sent to people, so it cannot be deleted. "
                "It is the record of what they received."
            )
        instance.delete()

    @action(detail=True, methods=["get"])
    def preview(self, request, pk=None):
        """The exact HTML that would be mailed, with a dummy unsubscribe link."""
        newsletter = self.get_object()
        html = wrap_email(
            newsletter.subject,
            render_body(newsletter.body),
            unsubscribe_url="#",
            preheader=newsletter.preheader,
            pdf_url=absolute(newsletter.pdf),
            cover_url=absolute(newsletter.cover_image),
            issue_label=newsletter.issue_label,
        )
        return Response({"subject": newsletter.subject, "html": html})

    @action(detail=True, methods=["get"])
    def deliveries(self, request, pk=None):
        """Who it reached and who it did not. Failures first — that is what
        anyone opening this page is looking for."""
        newsletter = self.get_object()
        rows = newsletter.deliveries.all().order_by("status", "email")
        return Response(NewsletterDeliverySerializer(rows, many=True).data)

    @action(detail=True, methods=["post"])
    def test(self, request, pk=None):
        """Send one copy to a named address, without touching the real list."""
        newsletter = self.get_object()
        email = (request.data.get("email") or request.user.email or "").strip()
        if not email:
            return Response(
                {"detail": "Give an address to send the test to."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Resend's own sink addresses work without a verified domain, so a
        # test to one of those is allowed through as a way of checking the
        # template itself while the domain is still being set up.
        if email.lower() not in RESEND_TEST_ADDRESSES:
            ok, reason = sender_is_verified()
            if not ok:
                return Response({"detail": reason}, status=status.HTTP_400_BAD_REQUEST)

        # A stand-in subscriber object: never saved, so a test can never add
        # anyone to the mailing list or mark a delivery against it.
        stub = NewsletterSubscriber(email=email)
        ids, error = send_batch([services.build_message(newsletter, stub)])
        if error:
            return Response({"detail": error}, status=status.HTTP_502_BAD_GATEWAY)
        record(
            request,
            action=ActivityLog.Action.SEND,
            resource="newsletters",
            instance=newsletter,
            detail=f"Sent a test to {email}",
        )
        return Response({"detail": f"Test sent to {email}."})

    @action(detail=True, methods=["get"])
    def audience(self, request, pk=None):
        """What pressing send would actually do, before pressing it."""
        newsletter = self.get_object()
        total = newsletter.audience().count()
        already = newsletter.deliveries.filter(
            status=NewsletterDelivery.Status.SENT
        ).count()
        return Response(
            {
                "audience": total,
                "already_sent": already,
                "will_send": max(total - already, 0),
                "country": newsletter.country,
            }
        )

    @action(detail=True, methods=["post"])
    def send(self, request, pk=None):
        """
        Send it. Irreversible, so it will not proceed without an explicit
        confirmation in the request body.
        """
        newsletter = self.get_object()

        if not request.data.get("confirm"):
            return Response(
                {"detail": "Sending needs an explicit confirmation."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        if newsletter.status == Newsletter.Status.SENDING:
            return Response(
                {"detail": "This newsletter is already being sent."},
                status=status.HTTP_409_CONFLICT,
            )
        if not newsletter.subject.strip():
            return Response(
                {"detail": "A newsletter needs a subject before it can go out."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        if not newsletter.pdf.strip():
            return Response(
                {
                    "detail": (
                        "Attach the newsletter PDF first — the email is a covering "
                        "note pointing at it, so without one there is nothing to read."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Checked before anything is attempted. Without this the send marks
        # every recipient failed against a problem that has nothing to do with
        # them, and the campaign has to be retried once it is fixed.
        ok, reason = sender_is_verified()
        if not ok:
            return Response({"detail": reason}, status=status.HTTP_400_BAD_REQUEST)

        result = services.send(newsletter)

        # The one action here that reaches people outside the organisation, so
        # it is recorded with the numbers rather than as a bare "updated".
        record(
            request,
            action=ActivityLog.Action.SEND,
            resource="newsletters",
            instance=newsletter,
            detail=result["detail"][:500],
            changes={"sent": result["sent"], "failed": result["failed"]},
        )
        return Response({**result, "newsletter": NewsletterSerializer(newsletter).data})


@csrf_exempt
@xframe_options_deny
@api_view(["GET", "POST"])
@permission_classes([AllowAny])
def unsubscribe(request, token):
    """
    One click, from the footer of any newsletter.

    Deliberately not authenticated and deliberately not a form: the person
    clicking is holding an unguessable token for their own address, and making
    them log in to stop receiving email would be a dark pattern.
    """
    subscriber = get_object_or_404(NewsletterSubscriber, unsubscribe_token=token)

    if subscriber.status != NewsletterSubscriber.SubscriptionStatus.UNSUBSCRIBED:
        subscriber.status = NewsletterSubscriber.SubscriptionStatus.UNSUBSCRIBED
        subscriber.unsubscribed_at = timezone.now()
        subscriber.save(update_fields=["status", "unsubscribed_at", "updated_at"])

    # Mailbox providers fire One-Click unsubscribes as a POST with no browser
    # attached; they want a bare 200, not a page.
    if request.method == "POST":
        return Response({"detail": "Unsubscribed."})

    return HttpResponse(
        """<!doctype html><html><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Unsubscribed</title></head>
<body style="margin:0;background:#fff1e0;font-family:Arial,Helvetica,sans-serif">
<div style="max-width:520px;margin:12vh auto;background:#fff;border-radius:14px;padding:40px;text-align:center">
  <p style="font-size:12px;letter-spacing:1.5px;text-transform:uppercase;color:#fe5c00;font-weight:bold;margin:0 0 18px">
    Jdiobe STEM Foundation</p>
  <h1 style="font-size:24px;color:#3a3b47;margin:0 0 12px">You have been unsubscribed</h1>
  <p style="font-size:16px;line-height:1.6;color:#3a3b47;margin:0">
    You will not receive any more newsletters from us. If this was a mistake,
    you can sign up again from the foot of any page on our website.</p>
</div></body></html>""",
        content_type="text/html",
    )


class PublicIssueList(ListAPIView):
    """
    The issues the Foundation has chosen to publish.

    Only ones with a PDF: the page is a shelf of newsletters to read, and a
    row that links to nothing is worse than an absent row.
    """

    queryset = (
        Newsletter.objects.filter(is_public=True)
        .exclude(pdf="")
        .order_by("-published_on", "-created_at")
    )
    pagination_class = None
    permission_classes = [IsStaffOrServiceRead]

    def list(self, request, *args, **kwargs):
        return Response(
            [
                {
                    "id": n.id,
                    "subject": n.subject,
                    "issue_label": n.issue_label,
                    "published_on": n.published_on.isoformat() if n.published_on else "",
                    "summary": n.preheader or "",
                    "pdf": absolute(n.pdf),
                    "cover": absolute(n.cover_image) or n.preview_image or "",
                }
                for n in self.get_queryset()
            ]
        )
