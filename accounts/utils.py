import uuid

import resend
from django.conf import settings

from .models import EmailVerification


class VerificationEmailError(Exception):
    """Raised when a verification email cannot be sent."""


def create_verification(user):
    EmailVerification.objects.filter(
        user=user
    ).delete()

    verification = EmailVerification.objects.create(
        user=user,
        token=uuid.uuid4(),
    )

    frontend_url = str(
        getattr(settings, "FRONTEND_URL", "")
    ).rstrip("/")

    if not frontend_url:
        raise VerificationEmailError(
            "Frontend URL is not configured"
        )

    verification_url = (
        f"{frontend_url}/verify-email"
        f"?token={verification.token}"
    )

    try:
        resend.api_key = settings.RESEND_API_KEY
        resend.Emails.send(
            {
                "from": settings.DEFAULT_FROM_EMAIL,
                "to": [user.email],
                "subject": "Verify your AlphaBot account",
                "text": (
                    "Welcome to AlphaBot!\n\n"
                    "Please verify your email address by opening this link:\n\n"
                    f"{verification_url}\n\n"
                    "This link expires in 24 hours."
                ),
            }
        )
    except Exception as exc:
        raise VerificationEmailError(
            "Failed to send verification email"
        ) from exc

    return verification
