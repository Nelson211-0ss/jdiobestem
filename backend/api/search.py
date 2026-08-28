"""
Search across the dashboard.

One query, every area the person is allowed to open. Results are scoped exactly
like the lists are — a Uganda coordinator searching for a name finds Uganda's
records and nothing from the South Sudan office — because this runs the same
policy scope rather than a parallel one that could drift out of agreement.
"""

from django.db.models import Q
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response

from accounts import policy
from content_cms.models import MagazineIssue, NewsStory, TeamMember
from donations.models import Donation
from operations.models import Record
from programmes.models import Cohort, Mentee, Mentor, ScienceFairProject
from submissions.models import (
    ContactMessage,
    NewsletterSubscriber,
    ProjectProposal,
    VolunteerApplication,
)

from .permissions import IsStaff

#: resource -> (model, label, fields to match, how to title a hit)
TARGETS = [
    ("volunteers", VolunteerApplication, "Volunteer application", ["name", "email", "message"], lambda o: o.name),
    ("contact-messages", ContactMessage, "Contact message", ["name", "email", "topic", "message"], lambda o: o.name),
    ("proposals", ProjectProposal, "Science Fair registration", ["project_title", "student_name", "school"], lambda o: o.project_title),
    ("subscribers", NewsletterSubscriber, "Newsletter subscriber", ["email"], lambda o: o.email),
    ("donations", Donation, "Donation", ["donor_name", "donor_email", "stripe_session_id"], lambda o: f"{o.donor_name or 'Anonymous'} — {o.amount_display}"),
    ("news", NewsStory, "News story", ["title", "excerpt", "body"], lambda o: o.title),
    ("team", TeamMember, "Team member", ["name", "role", "bio"], lambda o: o.name),
    ("magazine", MagazineIssue, "Magazine issue", ["name", "label", "summary"], lambda o: o.name),
]

PER_TARGET = 4
TOTAL_LIMIT = 20


@api_view(["GET"])
@permission_classes([IsStaff])
def search(request):
    term = (request.query_params.get("q") or "").strip()
    if len(term) < 2:
        return Response({"query": term, "results": []})

    user = request.user
    results = []

    for resource, model, label, fields, title_of in TARGETS:
        if len(results) >= TOTAL_LIMIT:
            break
        if not policy.can(user, resource, "view"):
            continue

        query = Q()
        for field in fields:
            query |= Q(**{f"{field}__icontains": term})

        scoped = policy.scope(user, model.objects.filter(query), resource)
        for obj in scoped[:PER_TARGET]:
            results.append(
                {
                    "resource": resource,
                    "kind": label,
                    "id": obj.pk,
                    "title": title_of(obj) or f"#{obj.pk}",
                    "href": f"/admin/{resource}/{obj.pk}",
                }
            )

    # Operations boards: one search over every record's name and values.
    if policy.can(user, "boards", "view") and len(results) < TOTAL_LIMIT:
        records = (
            Record.objects.filter(Q(name__icontains=term) | Q(values__icontains=term))
            .select_related("board")
            .filter(board__is_visible=True)[: TOTAL_LIMIT - len(results)]
        )
        for record in records:
            results.append(
                {
                    "resource": "boards",
                    "kind": record.board.name,
                    "id": record.pk,
                    "title": record.name,
                    "href": f"/admin/boards/{record.board.monday_id}/{record.pk}",
                }
            )

    return Response({"query": term, "results": results[:TOTAL_LIMIT]})
