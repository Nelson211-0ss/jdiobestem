"""
Django settings for the Jdiobe STEM Foundation backend.

Three surfaces come out of one project:

  * the API that the Next.js site calls server-to-server, at /api/
  * the staff dashboard, which is Django admin on its own subdomain
  * Postgres, which is the first place any of this data has ever been kept —
    every form on the site currently emails once and forgets.

Configuration is environment-driven with safe local defaults, so a fresh clone
runs with `docker compose up` and no .env at all.
"""

import os
from pathlib import Path

from dotenv import load_dotenv

BASE_DIR = Path(__file__).resolve().parent.parent
load_dotenv(BASE_DIR / ".env")


def env(name: str, default: str = "") -> str:
    return os.environ.get(name, default)


def env_bool(name: str, default: bool = False) -> bool:
    raw = os.environ.get(name)
    if raw is None:
        return default
    return raw.strip().lower() in {"1", "true", "yes", "on"}


def env_list(name: str, default: str = "") -> list[str]:
    return [item.strip() for item in env(name, default).split(",") if item.strip()]


# --------------------------------------------------------------- core

# Generated per-environment. The insecure fallback only applies with DEBUG on,
# and startup refuses to continue without a real key when DEBUG is off.
SECRET_KEY = env("DJANGO_SECRET_KEY", "dev-only-insecure-key-change-me")
DEBUG = env_bool("DJANGO_DEBUG", True)

if not DEBUG and SECRET_KEY == "dev-only-insecure-key-change-me":
    raise RuntimeError("DJANGO_SECRET_KEY must be set when DJANGO_DEBUG is off.")

ALLOWED_HOSTS = env_list(
    "DJANGO_ALLOWED_HOSTS",
    "localhost,127.0.0.1,0.0.0.0,admin.localhost,api.localhost",
)

# The subdomain the dashboard answers on. Everything else gets the API only.
ADMIN_HOST = env("ADMIN_HOST", "admin.localhost")

CSRF_TRUSTED_ORIGINS = env_list(
    "DJANGO_CSRF_TRUSTED_ORIGINS",
    "http://localhost:8000,http://admin.localhost:8000,http://127.0.0.1:8000",
)

INSTALLED_APPS = [
    # core first: it swaps in the branded admin site before django.contrib.admin
    # autodiscovers, so every ModelAdmin lands on ours.
    "core",
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",
    "rest_framework",
    "rest_framework.authtoken",
    "django_filters",
    "corsheaders",
    "accounts",
    "operations",
    "submissions",
    "donations",
    "content_cms",
    "programmes",
    "newsletters",
    "documents",
    "activity",
]

MIDDLEWARE = [
    "django.middleware.security.SecurityMiddleware",
    "whitenoise.middleware.WhiteNoiseMiddleware",
    "corsheaders.middleware.CorsMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
    # Routes by hostname: admin.* gets the dashboard, everything else the API.
    "core.middleware.AdminSubdomainMiddleware",
]

ROOT_URLCONF = "config.urls"

TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [BASE_DIR / "core" / "templates"],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ],
        },
    },
]

WSGI_APPLICATION = "config.wsgi.application"

# --------------------------------------------------------------- database

DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.postgresql",
        "NAME": env("POSTGRES_DB", "jdiobe"),
        "USER": env("POSTGRES_USER", "jdiobe"),
        "PASSWORD": env("POSTGRES_PASSWORD", "jdiobe"),
        "HOST": env("POSTGRES_HOST", "localhost"),
        "PORT": env("POSTGRES_PORT", "5432"),
        "CONN_MAX_AGE": 60,
    }
}

DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"

AUTH_PASSWORD_VALIDATORS = [
    {"NAME": "django.contrib.auth.password_validation.UserAttributeSimilarityValidator"},
    {"NAME": "django.contrib.auth.password_validation.MinimumLengthValidator"},
    {"NAME": "django.contrib.auth.password_validation.CommonPasswordValidator"},
    {"NAME": "django.contrib.auth.password_validation.NumericPasswordValidator"},
]

# --------------------------------------------------------------- i18n

LANGUAGE_CODE = "en-gb"
TIME_ZONE = env("DJANGO_TIME_ZONE", "Africa/Kampala")
USE_I18N = True
USE_TZ = True

# --------------------------------------------------------------- static / media

STATIC_URL = "static/"
STATIC_ROOT = BASE_DIR / "staticfiles"
STATICFILES_DIRS = [BASE_DIR / "core" / "static"]

MEDIA_URL = "media/"
MEDIA_ROOT = BASE_DIR / "media"

# --- monday.com ----------------------------------------------------------
#
# A personal API token from monday.com (avatar -> Developers -> My access
# tokens). Only the sync command uses it; without one the operations boards
# simply stay at whatever was last imported.
MONDAY_API_TOKEN = env("MONDAY_API_TOKEN", "")

# --- object storage: Cloudflare R2 --------------------------------------
#
# R2 speaks the S3 API, so django-storages' S3 backend drives it — the only
# differences that matter are a custom endpoint, `auto` as the region, and no
# ACLs (R2 rejects them; buckets are private and served through a public bucket
# URL or a Worker instead).
#
# Uploads fall back to the local filesystem when no R2 credentials are present,
# so a fresh clone still runs and a developer is never forced to hold live
# storage keys.

R2_BUCKET = env("R2_BUCKET_NAME", "")
R2_ACCOUNT_ID = env("R2_ACCOUNT_ID", "")
R2_ACCESS_KEY_ID = env("R2_ACCESS_KEY_ID", "")
R2_SECRET_ACCESS_KEY = env("R2_SECRET_ACCESS_KEY", "")

# The bucket's public hostname — an r2.dev URL or your own custom domain. Media
# URLs are built from it, so it is what ends up in the website's <img src>.
R2_PUBLIC_URL = env("R2_PUBLIC_URL", "").rstrip("/")

USE_R2 = bool(R2_BUCKET and R2_ACCESS_KEY_ID and R2_SECRET_ACCESS_KEY and R2_ACCOUNT_ID)

if USE_R2:
    STORAGES = {
        "default": {
            "BACKEND": "storages.backends.s3.S3Storage",
            "OPTIONS": {
                "bucket_name": R2_BUCKET,
                "access_key": R2_ACCESS_KEY_ID,
                "secret_key": R2_SECRET_ACCESS_KEY,
                "endpoint_url": env(
                    "R2_ENDPOINT_URL", f"https://{R2_ACCOUNT_ID}.r2.cloudflarestorage.com"
                ),
                "region_name": "auto",
                # R2 has no ACLs. Asking for public-read makes every upload fail.
                "default_acl": None,
                "querystring_auth": not bool(R2_PUBLIC_URL),
                "custom_domain": R2_PUBLIC_URL.replace("https://", "").replace("http://", "") or None,
                "file_overwrite": False,
                "signature_version": "s3v4",
                "object_parameters": {"CacheControl": "public, max-age=31536000, immutable"},
            },
        },
        "staticfiles": {"BACKEND": "whitenoise.storage.CompressedManifestStaticFilesStorage"},
    }
    if R2_PUBLIC_URL:
        MEDIA_URL = f"{R2_PUBLIC_URL}/"
else:
    STORAGES = {
        "default": {"BACKEND": "django.core.files.storage.FileSystemStorage"},
        "staticfiles": {"BACKEND": "whitenoise.storage.CompressedManifestStaticFilesStorage"},
    }

# What an upload endpoint will accept. Enforced server-side, never trusted from
# the browser's Content-Type header alone.
UPLOAD_MAX_BYTES = int(env("UPLOAD_MAX_BYTES", str(15 * 1024 * 1024)))
UPLOAD_ALLOWED_TYPES = {
    "image/jpeg": ".jpg",
    "image/png": ".png",
    "image/webp": ".webp",
    "image/gif": ".gif",
    "image/svg+xml": ".svg",
    "application/pdf": ".pdf",
}

# --------------------------------------------------------------- DRF

REST_FRAMEWORK = {
    # Nothing is public by default. Three ways in, in order of who uses them:
    # the site's route handlers send a shared service key; the dashboard sends a
    # token issued at sign-in; a staff session works for browsing in a browser.
    "DEFAULT_PERMISSION_CLASSES": ["api.auth.HasServiceKeyOrIsStaff"],
    "DEFAULT_AUTHENTICATION_CLASSES": [
        "rest_framework.authentication.TokenAuthentication",
        "rest_framework.authentication.SessionAuthentication",
    ],
    "DEFAULT_RENDERER_CLASSES": ["rest_framework.renderers.JSONRenderer"],
    "DEFAULT_PAGINATION_CLASS": "rest_framework.pagination.PageNumberPagination",
    "DEFAULT_FILTER_BACKENDS": [
        "django_filters.rest_framework.DjangoFilterBackend",
        "rest_framework.filters.SearchFilter",
        "rest_framework.filters.OrderingFilter",
    ],
    "PAGE_SIZE": 25,
}

# Shared secret the Next.js route handlers send as X-API-Key. Server-to-server
# only — it must never reach the browser, so keep it out of NEXT_PUBLIC_*.
SERVICE_API_KEY = env("SERVICE_API_KEY", "dev-service-key-change-me")

if not DEBUG and SERVICE_API_KEY == "dev-service-key-change-me":
    raise RuntimeError("SERVICE_API_KEY must be set when DJANGO_DEBUG is off.")

# The public site's origin, for CORS and for links back from the admin.
SITE_ORIGIN = env("SITE_ORIGIN", "http://localhost:3000")
CORS_ALLOWED_ORIGINS = env_list("CORS_ALLOWED_ORIGINS", SITE_ORIGIN)

# --------------------------------------------------------------- outbound email
#
# The site relays through Resend today. The backend keeps that arrangement:
# it stores the submission, then hands the notification to Resend the same way,
# so nothing about the emails staff already receive changes.

# Where a link in an outgoing email should point. Unsubscribe links live here,
# so it must be an origin a recipient's browser can actually reach — the API's
# own public origin by default, or the website once that is deployed.
PUBLIC_BASE_URL = env("PUBLIC_BASE_URL", env("SITE_ORIGIN", "http://localhost:8000")).rstrip("/")

RESEND_API_KEY = env("RESEND_API_KEY", "")
RESEND_API_URL = env("RESEND_API_URL", "https://api.resend.com/emails")
NOTIFY_FROM = env("NOTIFY_FROM", "Jdiobe STEM Foundation <onboarding@resend.dev>")
NOTIFY_TO = env("NOTIFY_TO", "info@jdiobestem.org")

# --------------------------------------------------------------- production hardening

if not DEBUG:
    SECURE_SSL_REDIRECT = env_bool("DJANGO_SECURE_SSL_REDIRECT", True)
    SESSION_COOKIE_SECURE = True
    CSRF_COOKIE_SECURE = True
    SECURE_HSTS_SECONDS = 60 * 60 * 24 * 30
    SECURE_HSTS_INCLUDE_SUBDOMAINS = True
    SECURE_PROXY_SSL_HEADER = ("HTTP_X_FORWARDED_PROTO", "https")

LOGGING = {
    "version": 1,
    "disable_existing_loggers": False,
    "handlers": {"console": {"class": "logging.StreamHandler"}},
    "root": {"handlers": ["console"], "level": env("DJANGO_LOG_LEVEL", "INFO")},
}
