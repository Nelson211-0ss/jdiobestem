"""URLconf served on the admin subdomain: the dashboard, and nothing else."""

from django.conf import settings
from django.conf.urls.static import static
from django.urls import path

from core.admin_site import admin_site

urlpatterns = [
    path("", admin_site.urls),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
