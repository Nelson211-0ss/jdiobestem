from rest_framework import serializers

from .models import ActivityLog


class ActivityLogSerializer(serializers.ModelSerializer):
    action_display = serializers.CharField(source="get_action_display", read_only=True)
    summary = serializers.SerializerMethodField()
    change_summary = serializers.SerializerMethodField()

    class Meta:
        model = ActivityLog
        fields = [
            "id", "actor", "actor_name", "action", "action_display",
            "resource", "object_id", "object_label", "changes", "change_summary",
            "detail", "summary", "ip_address", "user_agent", "country", "created_at",
        ]

    def get_summary(self, obj):
        """One line, readable without opening the entry."""
        who = obj.actor_name or "Someone"
        verb = obj.get_action_display().lower()
        what = obj.object_label or obj.resource.replace("-", " ")
        return f"{who} {verb} {what}".strip() if what else f"{who} {verb}"

    def get_change_summary(self, obj):
        """'status: new → contacted' — the part people actually read."""
        if not isinstance(obj.changes, dict) or not obj.changes:
            return ""
        parts = []
        for field, change in list(obj.changes.items())[:6]:
            if isinstance(change, dict) and "to" in change:
                parts.append(f"{field}: {change.get('from')} → {change.get('to')}")
            else:
                parts.append(f"{field}: {change}")
        extra = len(obj.changes) - len(parts)
        return "; ".join(parts) + (f" (+{extra} more)" if extra > 0 else "")
