"""Permissions for the dashboard API."""

from rest_framework.permissions import BasePermission, SAFE_METHODS

from .auth import has_valid_service_key


class IsStaff(BasePermission):
    """
    Signed-in staff only.

    Deliberately does not accept the service key: that key exists so the public
    website can post form submissions, and it lives in the site's environment.
    If it also unlocked the dashboard's CRUD endpoints, leaking one deployment
    variable would hand over every record the Foundation holds.
    """

    message = "Sign in as staff to use the dashboard API."

    def has_permission(self, request, view):
        user = getattr(request, "user", None)
        return bool(user and user.is_authenticated and user.is_staff)


class IsStaffOrServiceRead(BasePermission):
    """Staff for writes; the website's service key may also read.

    Used for published content, which the site fetches to render pages.
    """

    def has_permission(self, request, view):
        user = getattr(request, "user", None)
        if user and user.is_authenticated and user.is_staff:
            return True
        return request.method in SAFE_METHODS and has_valid_service_key(request)


class ResourcePermission(BasePermission):
    """
    Attribute-based authorisation for a dashboard ViewSet.

    The ViewSet declares which resource it is; this maps the HTTP verb to an
    action and asks the policy. Row-level country scoping is applied separately,
    in the ViewSet's get_queryset — a person can be allowed to view mentees in
    general and still see only their own country's.
    """

    ACTION_FOR_METHOD = {
        "GET": "view",
        "HEAD": "view",
        "OPTIONS": "view",
        "POST": "add",
        "PUT": "change",
        "PATCH": "change",
        "DELETE": "delete",
    }

    def has_permission(self, request, view):
        from accounts import policy

        user = getattr(request, "user", None)
        if not (user and user.is_authenticated and user.is_staff):
            return False

        resource = getattr(view, "resource", None)
        if not resource:
            return False

        action = self.ACTION_FOR_METHOD.get(request.method, "view")
        if policy.can(user, resource, action):
            return True

        self.message = (
            f"Your role does not allow you to {action} {resource.replace('-', ' ')}."
        )
        return False
