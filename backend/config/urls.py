"""
Public URLconf — the API only.

The dashboard is not reachable here. `core.middleware.AdminSubdomainMiddleware`
swaps in `config.admin_urls` when the request arrives on the admin host, which
keeps /admin off the API hostname entirely rather than merely unlinked.
"""

from django.conf import settings
from django.conf.urls.static import static
from django.urls import include, path

urlpatterns = [
    path("api/", include("api.urls")),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
