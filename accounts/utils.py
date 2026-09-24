import uuid

import resend
from django.conf import settings

from .models import EmailVerification


def create_verification(user):

    EmailVerification.objects.filter(
        user=user
    ).delete()

    verification = EmailVerification.objects.create(
        user=user,
        token=uuid.uuid4(),
    )

    verification_url = (
        f"http://localhost:3000/verify-email"
        f"?token={verification.token}"
    )

    resend.api_key = settings.RESEND_API_KEY

    resend.Emails.send({
        "from": settings.DEFAULT_FROM_EMAIL,
        "to": [user.email],
        "subject": "Verify your AlphaBot account",
        "text": (
            "Welcome to AlphaBot!\n\n"
            "Please verify your email address by opening this link:\n\n"
            f"{verification_url}\n\n"
            "This link expires in 24 hours."
        ),
    })

    return verification