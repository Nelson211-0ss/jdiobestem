"""
Access control for the API.

Every endpoint is closed by default. Two ways in:

  * a shared service key in `X-API-Key`, used by the Next.js route handlers.
    Those run on the server, so the key never reaches a browser — it must not
    be exposed through a NEXT_PUBLIC_* variable.
  * a signed-in staff session, so someone logged into the dashboard can read
    the same endpoints in a browser.

Comparison is constant-time; a plain `==` on a secret leaks its length and
prefix to anyone willing to time the responses.
"""

import hmac

from django.conf import settings
from rest_framework.permissions import BasePermission

SERVICE_KEY_HEADER = "HTTP_X_API_KEY"


def has_valid_service_key(request) -> bool:
    presented = request.META.get(SERVICE_KEY_HEADER, "")
    expected = settings.SERVICE_API_KEY
    if not presented or not expected:
        return False
    return hmac.compare_digest(presented, expected)


class HasServiceKeyOrIsStaff(BasePermission):
    message = "A valid X-API-Key header or a staff session is required."

    def has_permission(self, request, view):
        if has_valid_service_key(request):
            return True
        user = getattr(request, "user", None)
        return bool(user and user.is_authenticated and user.is_staff)
