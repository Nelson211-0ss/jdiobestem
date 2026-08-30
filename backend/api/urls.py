from django.urls import include, path
from rest_framework.routers import DefaultRouter

from accounts import access_api
from activity import views as activity_views
from documents import views as documents_views
from jobs import views as jobs_views
from newsletters import views as newsletters_views
from operations import views as operations_views
from scholarships import views as scholarships_views

from . import accounting, admin_views, chunked_uploads, search, uploads, views

app_name = "api"

router = DefaultRouter()
router.register("volunteers", admin_views.VolunteerApplicationViewSet, basename="volunteer")
router.register("contact-messages", admin_views.ContactMessageViewSet, basename="contact-message")
router.register("proposals", admin_views.ProjectProposalViewSet, basename="proposal")
router.register("subscribers", admin_views.NewsletterSubscriberViewSet, basename="subscriber")
router.register("donations", admin_views.DonationViewSet, basename="donation")
router.register("news", admin_views.NewsStoryViewSet, basename="news")
router.register("team", admin_views.TeamMemberViewSet, basename="team")
router.register("recognised-volunteers", admin_views.RecognisedVolunteerViewSet, basename="recognised-volunteer")
router.register("programmes", admin_views.ProgrammeViewSet, basename="programme")
router.register("page-blocks", admin_views.PageBlockViewSet, basename="page-block")
router.register("stats", admin_views.SiteStatViewSet, basename="stat")
router.register("magazine", admin_views.MagazineIssueViewSet, basename="magazine")
router.register("cohorts", admin_views.CohortViewSet, basename="cohort")
router.register("mentors", admin_views.MentorViewSet, basename="mentor")
router.register("mentees", admin_views.MenteeViewSet, basename="mentee")
router.register("pairings", admin_views.MentorshipPairingViewSet, basename="pairing")
router.register("projects", admin_views.ScienceFairProjectViewSet, basename="project")
router.register("project-awards", admin_views.ProjectAwardViewSet, basename="project-award")
router.register("users", admin_views.UserViewSet, basename="user")
router.register("boards", operations_views.BoardViewSet, basename="board")
router.register("countries", operations_views.OperatingCountryViewSet, basename="country")
router.register("offices", operations_views.OfficeViewSet, basename="office")
router.register("documents", documents_views.DocumentViewSet, basename="document")
router.register("document-editions", documents_views.DocumentEditionViewSet, basename="document-edition")
router.register("activity", activity_views.ActivityLogViewSet, basename="activity")
router.register("job-postings", jobs_views.JobPostingViewSet, basename="job-posting")
router.register("job-applications", jobs_views.JobApplicationViewSet, basename="job-application")
router.register("newsletters", newsletters_views.NewsletterViewSet, basename="newsletter")
router.register("scholarships", scholarships_views.ScholarshipViewSet, basename="scholarship")
router.register(
    "scholarship-payments",
    scholarships_views.ScholarshipPaymentViewSet,
    basename="scholarship-payment",
)

urlpatterns = [
    path("health/", views.health, name="health"),

    # --- the public website posts here, with the service key ---------------
    path("volunteers/", views.volunteer_create, name="volunteer-create"),
    path("jobs/apply/", jobs_views.apply, name="job-apply"),
    path("jobs/cv/", jobs_views.upload_cv, name="job-cv-upload"),
    path("contact/", views.contact_create, name="contact-create"),
    path("project-proposals/", views.project_proposal_create, name="project-proposal-create"),
    path("newsletter/", views.newsletter_subscribe, name="newsletter-subscribe"),
    # Clicked from the footer of an outgoing newsletter; no login.
    path("newsletter/unsubscribe/<uuid:token>/", newsletters_views.unsubscribe, name="newsletter-unsubscribe"),
    path("donations/", views.donation_upsert, name="donation-upsert"),

    # --- the website reads published content --------------------------------
    path("content/news/", views.NewsStoryList.as_view(), name="news-list"),
    path("content/team/", views.TeamMemberList.as_view(), name="team-list"),
    path("content/volunteers/", views.RecognisedVolunteerList.as_view(), name="recognised-volunteers"),
    path("content/jobs/", jobs_views.OpenPostingList.as_view(), name="open-postings"),
    path("content/newsletters/", newsletters_views.PublicIssueList.as_view(), name="public-newsletters"),
    path("content/stats/", views.SiteStatList.as_view(), name="stat-list"),
    path("content/programmes/", views.ProgrammeList.as_view(), name="programme-list"),
    path("content/page-blocks/", views.PageBlockList.as_view(), name="page-block-list"),
    path("content/magazine/", views.MagazineIssueList.as_view(), name="magazine-list"),

    # --- the dashboard ------------------------------------------------------
    path("auth/login/", admin_views.login, name="login"),
    path("auth/logout/", admin_views.logout, name="logout"),
    path("auth/change-password/", admin_views.change_password, name="change-password"),
    path("auth/me/", admin_views.me, name="me"),
    path("stats/", admin_views.stats, name="stats"),
    path("accounting/", accounting.accounting, name="accounting"),
    path("admin/search/", search.search, name="search"),
    path("uploads/", uploads.upload, name="upload"),
    # Resumable uploads, for files big enough that losing the connection
    # halfway matters.
    path("uploads/begin/", chunked_uploads.begin, name="upload-begin"),
    path("uploads/<str:upload_id>/status/", chunked_uploads.status_for, name="upload-status"),
    path("uploads/<str:upload_id>/part/", chunked_uploads.part, name="upload-part"),
    path("uploads/<str:upload_id>/finish/", chunked_uploads.finish, name="upload-finish"),
    path("admin/", include(router.urls)),
    path("admin/board-index/", operations_views.board_index, name="board-index"),
    path("admin/options/", operations_views.option_lists, name="options"),
    path("admin/users/<int:pk>/access/", access_api.user_access, name="user-access"),
    path("admin/users/<int:pk>/access/update/", access_api.update_user_access, name="user-access-update"),
    path("admin/users/<int:pk>/password/", access_api.set_user_password, name="user-set-password"),
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
