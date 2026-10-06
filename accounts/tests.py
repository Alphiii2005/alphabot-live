from unittest.mock import patch

from django.contrib.auth.models import User
from django.test import TestCase, override_settings


@override_settings(
    FRONTEND_URL="http://localhost:3000",
    SESSION_COOKIE_SECURE=False,
    SESSION_COOKIE_SAMESITE="Lax",
)
class AuthApiTests(TestCase):
    def test_frontend_url_is_configured(self):
        from django.conf import settings

        self.assertTrue(hasattr(settings, "FRONTEND_URL"))
        self.assertEqual(settings.FRONTEND_URL, "http://localhost:3000")

    @patch("accounts.utils.resend.Emails.send")
    def test_register_creates_inactive_user_when_email_sends(
        self,
        mock_send,
    ):
        mock_send.return_value = {"id": "email_test"}

        response = self.client.post(
            "/api/auth/register/",
            {
                "username": "alphin",
                "email": "alphin@example.com",
                "password": "a-strong-password",
                "confirm_password": "a-strong-password",
            },
            content_type="application/json",
        )

        self.assertEqual(response.status_code, 201)
        user = User.objects.get(email="alphin@example.com")
        self.assertFalse(user.is_active)
        mock_send.assert_called_once()

    @patch("accounts.utils.resend.Emails.send")
    def test_register_rolls_back_user_if_email_fails(
        self,
        mock_send,
    ):
        mock_send.side_effect = RuntimeError("resend down")

        response = self.client.post(
            "/api/auth/register/",
            {
                "username": "alphin",
                "email": "alphin@example.com",
                "password": "a-strong-password",
                "confirm_password": "a-strong-password",
            },
            content_type="application/json",
        )

        self.assertEqual(response.status_code, 503)
        self.assertIn(
            "verification email could not be sent",
            response.json()["error"],
        )
        self.assertFalse(
            User.objects.filter(email="alphin@example.com").exists()
        )

        mock_send.return_value = {"id": "email_test"}
        mock_send.side_effect = None

        retry = self.client.post(
            "/api/auth/register/",
            {
                "username": "alphin",
                "email": "alphin@example.com",
                "password": "a-strong-password",
                "confirm_password": "a-strong-password",
            },
            content_type="application/json",
        )

        self.assertEqual(retry.status_code, 201)
        self.assertEqual(
            User.objects.filter(email="alphin@example.com").count(),
            1,
        )

    @patch("accounts.utils.resend.Emails.send")
    def test_login_sets_session_and_me_returns_user(
        self,
        mock_send,
    ):
        mock_send.return_value = {"id": "email_test"}

        self.client.post(
            "/api/auth/register/",
            {
                "username": "alphin",
                "email": "alphin@example.com",
                "password": "a-strong-password",
                "confirm_password": "a-strong-password",
            },
            content_type="application/json",
        )

        user = User.objects.get(email="alphin@example.com")
        user.is_active = True
        user.save(update_fields=["is_active"])

        login_response = self.client.post(
            "/api/auth/login/",
            {
                "email": "alphin@example.com",
                "password": "a-strong-password",
            },
            content_type="application/json",
        )

        self.assertEqual(login_response.status_code, 200)
        self.assertIn("sessionid", login_response.cookies)

        me_response = self.client.get("/api/auth/me/")
        self.assertEqual(me_response.status_code, 200)
        self.assertTrue(me_response.json()["authenticated"])
        self.assertEqual(
            me_response.json()["user"]["email"],
            "alphin@example.com",
        )

    def test_login_unverified_user_returns_backend_error(self):
        user = User.objects.create_user(
            username="alphin",
            email="alphin@example.com",
            password="a-strong-password",
        )
        user.is_active = False
        user.save(update_fields=["is_active"])

        response = self.client.post(
            "/api/auth/login/",
            {
                "email": "alphin@example.com",
                "password": "a-strong-password",
            },
            content_type="application/json",
        )

        self.assertEqual(response.status_code, 403)
        self.assertEqual(response.json()["code"], "EMAIL_NOT_VERIFIED")
        self.assertIn("verify your email", response.json()["error"])
