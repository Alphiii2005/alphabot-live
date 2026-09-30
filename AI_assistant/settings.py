"""
Django settings for AlphaBot.

Supports both local development and production deployment on Render.
"""

from pathlib import Path
import os

from dotenv import load_dotenv
from decouple import config
import dj_database_url


# ---------------------------------------------------------
# Base
# ---------------------------------------------------------

BASE_DIR = Path(__file__).resolve().parent.parent

load_dotenv()


# ---------------------------------------------------------
# Environment
# ---------------------------------------------------------

DEBUG = config("DEBUG", default=True, cast=bool)

SECRET_KEY = config("SECRET_KEY")

OPENROUTER_API_KEY = config("OPENROUTER_API_KEY")

ALPHABOT_DAILY_AI_LIMIT = config(
    "ALPHABOT_DAILY_AI_LIMIT",
    default=20,
    cast=int,
)


# ---------------------------------------------------------
# Hosts
# ---------------------------------------------------------

if DEBUG:
    ALLOWED_HOSTS = [
        "localhost",
        "127.0.0.1",
    ]
else:
    ALLOWED_HOSTS = [
        host.strip()
        for host in config("ALLOWED_HOSTS", default="").split(",")
        if host.strip()
    ]


# ---------------------------------------------------------
# Applications
# ---------------------------------------------------------

INSTALLED_APPS = [
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",

    "rest_framework",
    "corsheaders",

    "accounts",
    "usage",
    "alphabot",
]


# ---------------------------------------------------------
# Middleware
# ---------------------------------------------------------

MIDDLEWARE = [
    "django.middleware.security.SecurityMiddleware",
    "whitenoise.middleware.WhiteNoiseMiddleware",

    "django.contrib.sessions.middleware.SessionMiddleware",

    "corsheaders.middleware.CorsMiddleware",

    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",

    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
]


# ---------------------------------------------------------
# URLs / Templates / WSGI
# ---------------------------------------------------------

ROOT_URLCONF = "AI_assistant.urls"

TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [BASE_DIR / "alphabot" / "templates"],
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

WSGI_APPLICATION = "AI_assistant.wsgi.application"


# ---------------------------------------------------------
# Database
# ---------------------------------------------------------

DATABASES = {
    "default": dj_database_url.config(
        conn_max_age=600,
        conn_health_checks=True,
    )
}


# ---------------------------------------------------------
# Cache
# ---------------------------------------------------------

CACHES = {
    "default": {
        "BACKEND": "django.core.cache.backends.locmem.LocMemCache",
        "LOCATION": "alphabot-cache",
    }
}


# ---------------------------------------------------------
# Password validation
# ---------------------------------------------------------

AUTH_PASSWORD_VALIDATORS = [
    {
        "NAME": (
            "django.contrib.auth.password_validation."
            "UserAttributeSimilarityValidator"
        ),
    },
    {
        "NAME": (
            "django.contrib.auth.password_validation."
            "MinimumLengthValidator"
        ),
    },
    {
        "NAME": (
            "django.contrib.auth.password_validation."
            "CommonPasswordValidator"
        ),
    },
    {
        "NAME": (
            "django.contrib.auth.password_validation."
            "NumericPasswordValidator"
        ),
    },
]


# ---------------------------------------------------------
# Internationalization
# ---------------------------------------------------------

LANGUAGE_CODE = "en-us"

TIME_ZONE = "UTC"

USE_I18N = True
USE_TZ = True


# ---------------------------------------------------------
# Authentication
# ---------------------------------------------------------

AUTHENTICATION_BACKENDS = [
    "django.contrib.auth.backends.ModelBackend",
]


# ---------------------------------------------------------
# Static files
# ---------------------------------------------------------

STATIC_URL = "/static/"
STATIC_ROOT = BASE_DIR / "staticfiles"

STATICFILES_DIRS = [
    BASE_DIR / "alphabot" / "static",
]

STATICFILES_STORAGE = (
    "whitenoise.storage.CompressedManifestStaticFilesStorage"
)


# ---------------------------------------------------------
# Email / Resend
# ---------------------------------------------------------

EMAIL_BACKEND = "django.core.mail.backends.console.EmailBackend"

RESEND_API_KEY = config("RESEND_API_KEY")

DEFAULT_FROM_EMAIL = config(
    "DEFAULT_FROM_EMAIL",
    default="noreply@alphabot.alphy.com",
)

EMAIL_VERIFICATION_TIMEOUT = config(
    "EMAIL_VERIFICATION_TIMEOUT",
    default=86400,
    cast=int,
)


# ---------------------------------------------------------
# CORS
# ---------------------------------------------------------

if DEBUG:
    CORS_ALLOWED_ORIGINS = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ]
else:
    CORS_ALLOWED_ORIGINS = [
        origin.strip()
        for origin in config("FRONTEND_URL", default="").split(",")
        if origin.strip()
    ]

CORS_ALLOW_CREDENTIALS = True


# ---------------------------------------------------------
# CSRF
# ---------------------------------------------------------

if DEBUG:
    CSRF_TRUSTED_ORIGINS = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ]
else:
    CSRF_TRUSTED_ORIGINS = [
        origin.strip()
        for origin in config("FRONTEND_URL", default="").split(",")
        if origin.strip()
    ]


# ---------------------------------------------------------
# Security
# ---------------------------------------------------------

SESSION_COOKIE_HTTPONLY = True

SESSION_COOKIE_SECURE = not DEBUG

SESSION_COOKIE_SAMESITE = "Lax"

SESSION_COOKIE_PATH = "/"


if not DEBUG:
    SECURE_SSL_REDIRECT = True
    SECURE_PROXY_SSL_HEADER = ("HTTP_X_FORWARDED_PROTO", "https")

    SECURE_HSTS_SECONDS = 31536000
    SECURE_HSTS_INCLUDE_SUBDOMAINS = True
    SECURE_HSTS_PRELOAD = True

    SECURE_CONTENT_TYPE_NOSNIFF = True
    CSRF_COOKIE_SECURE = True
    X_FRAME_OPTIONS = "DENY"


# ---------------------------------------------------------
# Default primary key
# ---------------------------------------------------------

DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"


# ---------------------------------------------------------
# Redirects
# ---------------------------------------------------------

LOGIN_URL = "/login/"
LOGIN_REDIRECT_URL = "/"
LOGOUT_REDIRECT_URL = "/login/"
