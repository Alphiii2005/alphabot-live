from django.urls import path

from .views import (
    register_api,
    verify_email_api,
    resend_verification_api,
    login_api,
    current_user_api,
    logout_api,
)

urlpatterns = [
    path("register/", register_api, name="register"),
    path("login/", login_api, name="login"),
    path("verify/", verify_email_api, name="verify"),
    path("resend-verification/", resend_verification_api, name="resend-verification"),
    path("me/", current_user_api, name="me"),
    path("logout/", logout_api, name="logout"),
]