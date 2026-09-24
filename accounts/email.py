
import os

import resend


resend.api_key = os.getenv("RESEND_API_KEY")


def send_verification_email(to_email, verification_url):
    resend.Emails.send(
        {
            "from": os.getenv("DEFAULT_FROM_EMAIL"),
            "to": [to_email],
            "subject": "Verify your AlphaBot email",
            "html": f"""
                <h2>Welcome to AlphaBot 👽</h2>

                <p>
                    Thanks for creating your AlphaBot account.
                </p>

                <p>
                    Please verify your email address by clicking the
                    button below:
                </p>

                <p>
                    <a href="{verification_url}">
                        Verify my email
                    </a>
                </p>

                <p>
                    This verification link expires in 24 hours.
                </p>
            """,
        }
    )

