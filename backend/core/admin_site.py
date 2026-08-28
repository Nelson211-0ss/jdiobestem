"""
The staff dashboard.

A branded AdminSite rather than the default one, so the subdomain reads as part
of the Foundation's site instead of a stock Django install, and so app ordering
on the index can follow how staff actually work: what came in from the website
first, then the money, then the things they publish.
"""

from django.contrib.admin import AdminSite

APP_ORDER = ["submissions", "donations", "programmes", "content_cms", "auth"]


class JdiobeAdminSite(AdminSite):
    site_title = "Jdiobe STEM Foundation"
    site_header = "Jdiobe STEM Foundation"
    index_title = "Dashboard"
    enable_nav_sidebar = True

    def get_app_list(self, request, app_label=None):
        app_list = super().get_app_list(request, app_label)
        order = {label: i for i, label in enumerate(APP_ORDER)}
        return sorted(app_list, key=lambda app: order.get(app["app_label"], len(order)))


admin_site = JdiobeAdminSite(name="jdiobe_admin")
