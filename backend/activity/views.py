"""The activity log, exposed read-only."""

from accounts import policy
from api.permissions import ResourcePermission
from rest_framework import viewsets

from .models import ActivityLog
from .serializers import ActivityLogSerializer


class ActivityLogViewSet(viewsets.ReadOnlyModelViewSet):
    """
    Read-only, and not by omission.

    An audit trail that the application can edit or delete is not evidence of
    anything. There is no create, update or destroy here at all, so no amount
    of permission on this resource grants the ability to rewrite history —
    correcting the log is a database operation, done deliberately, by someone
    with server access.
    """

    permission_classes = [ResourcePermission]
    resource = "activity"
    queryset = ActivityLog.objects.select_related("actor")
    serializer_class = ActivityLogSerializer
    filterset_fields = ["action", "resource", "actor", "country"]
    search_fields = ["actor_name", "object_label", "detail", "resource"]
    ordering_fields = ["created_at", "actor_name", "action"]
    ordering = ["-created_at"]

    def get_queryset(self):
        return policy.scope(self.request.user, super().get_queryset(), self.resource)
