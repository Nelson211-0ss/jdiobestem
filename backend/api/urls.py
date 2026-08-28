from django.urls import include, path
from rest_framework.routers import DefaultRouter

from accounts import access_api
from activity import views as activity_views
from documents import views as documents_views
from newsletters import views as newsletters_views
from operations import views as operations_views

from . import admin_views, search, uploads, views

app_name = "api"

router = DefaultRouter()
router.register("volunteers", admin_views.VolunteerApplicationViewSet, basename="volunteer")
router.register("contact-messages", admin_views.ContactMessageViewSet, basename="contact-message")
router.register("proposals", admin_views.ProjectProposalViewSet, basename="proposal")
router.register("subscribers", admin_views.NewsletterSubscriberViewSet, basename="subscriber")
router.register("donations", admin_views.DonationViewSet, basename="donation")
router.register("news", admin_views.NewsStoryViewSet, basename="news")
router.register("team", admin_views.TeamMemberViewSet, basename="team")
router.register("programmes", admin_views.ProgrammeViewSet, basename="programme")
router.register("page-blocks", admin_views.PageBlockViewSet, basename="page-block")
router.register("stats", admin_views.SiteStatViewSet, basename="stat")
router.register("magazine", admin_views.MagazineIssueViewSet, basename="magazine")
router.register("cohorts", admin_views.CohortViewSet, basename="cohort")
router.register("mentors", admin_views.MentorViewSet, basename="mentor")
router.register("mentees", admin_views.MenteeViewSet, basename="mentee")
router.register("pairings", admin_views.MentorshipPairingViewSet, basename="pairing")
router.register("projects", admin_views.ScienceFairProjectViewSet, basename="project")
router.register("users", admin_views.UserViewSet, basename="user")
router.register("boards", operations_views.BoardViewSet, basename="board")
router.register("countries", operations_views.OperatingCountryViewSet, basename="country")
router.register("offices", operations_views.OfficeViewSet, basename="office")
router.register("documents", documents_views.DocumentViewSet, basename="document")
router.register("document-editions", documents_views.DocumentEditionViewSet, basename="document-edition")
router.register("activity", activity_views.ActivityLogViewSet, basename="activity")
router.register("newsletters", newsletters_views.NewsletterViewSet, basename="newsletter")

urlpatterns = [
    path("health/", views.health, name="health"),

    # --- the public website posts here, with the service key ---------------
    path("volunteers/", views.volunteer_create, name="volunteer-create"),
    path("contact/", views.contact_create, name="contact-create"),
    path("project-proposals/", views.project_proposal_create, name="project-proposal-create"),
    path("newsletter/", views.newsletter_subscribe, name="newsletter-subscribe"),
    # Clicked from the footer of an outgoing newsletter; no login.
    path("newsletter/unsubscribe/<uuid:token>/", newsletters_views.unsubscribe, name="newsletter-unsubscribe"),
    path("donations/", views.donation_upsert, name="donation-upsert"),

    # --- the website reads published content --------------------------------
    path("content/news/", views.NewsStoryList.as_view(), name="news-list"),
    path("content/team/", views.TeamMemberList.as_view(), name="team-list"),
    path("content/stats/", views.SiteStatList.as_view(), name="stat-list"),
    path("content/programmes/", views.ProgrammeList.as_view(), name="programme-list"),
    path("content/page-blocks/", views.PageBlockList.as_view(), name="page-block-list"),
    path("content/magazine/", views.MagazineIssueList.as_view(), name="magazine-list"),

    # --- the dashboard ------------------------------------------------------
    path("auth/login/", admin_views.login, name="login"),
    path("auth/logout/", admin_views.logout, name="logout"),
    path("auth/me/", admin_views.me, name="me"),
    path("stats/", admin_views.stats, name="stats"),
    path("admin/search/", search.search, name="search"),
    path("uploads/", uploads.upload, name="upload"),
    path("admin/", include(router.urls)),
    path("admin/board-index/", operations_views.board_index, name="board-index"),
    path("admin/options/", operations_views.option_lists, name="options"),
    path("admin/users/<int:pk>/access/", access_api.user_access, name="user-access"),
    path("admin/users/<int:pk>/access/update/", access_api.update_user_access, name="user-access-update"),
    path(
        "admin/boards/<str:board_monday_id>/records/",
        operations_views.RecordViewSet.as_view({"get": "list", "post": "create"}),
        name="record-list",
    ),
    path(
        "admin/boards/<str:board_monday_id>/records/<int:pk>/",
        operations_views.RecordViewSet.as_view(
            {"get": "retrieve", "patch": "partial_update", "put": "update", "delete": "destroy"}
        ),
        name="record-detail",
    ),
]
