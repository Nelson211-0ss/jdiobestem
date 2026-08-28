"""Host-based routing, so the dashboard genuinely lives on its own subdomain."""

from django.conf import settings


class AdminSubdomainMiddleware:
    """
    Serve the dashboard on ADMIN_HOST and the API everywhere else.

    Two hostnames, two URLconfs. A request to api.example.org/admin/ 404s
    because those routes are not mounted there at all — the dashboard is not
    just unlinked from the API host, it is absent from it. Locally that is
    admin.localhost:8000 (which resolves to 127.0.0.1 without touching
    /etc/hosts in every current browser).
    """

    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        host = request.get_host().split(":")[0].lower()
        if host == settings.ADMIN_HOST.lower() or host.startswith("admin."):
            request.urlconf = "config.admin_urls"
        return self.get_response(request)
