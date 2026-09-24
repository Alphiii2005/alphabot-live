import json

from django.conf import settings
from django.contrib.auth import login, logout
from django.contrib.auth.models import User
from django.http import JsonResponse
from django.utils import timezone
from django.views.decorators.csrf import csrf_exempt

from .models import EmailVerification
from .utils import create_verification


@csrf_exempt
def register_api(request):
    if request.method != "POST":
        return JsonResponse(
            {"error": "POST request required"},
            status=405,
        )

    try:
        data = json.loads(request.body)
    except json.JSONDecodeError:
        return JsonResponse(
            {"error": "Invalid JSON"},
            status=400,
        )

    username = data.get("username", "").strip()
    email = data.get("email", "").strip().lower()
    password = data.get("password", "")
    confirm_password = data.get("confirm_password", "")

    if not username or not email or not password:
        return JsonResponse(
            {"error": "Username, email and password are required"},
            status=400,
        )

    if password != confirm_password:
        return JsonResponse(
            {"error": "Passwords do not match"},
            status=400,
        )

    if User.objects.filter(username=username).exists():
        return JsonResponse(
            {"error": "Username already exists"},
            status=400,
        )

    if User.objects.filter(email=email).exists():
        return JsonResponse(
            {"error": "Email already exists"},
            status=400,
        )

    user = User.objects.create_user(
        username=username,
        email=email,
        password=password,
    )

    user.is_active = False
    user.save(update_fields=["is_active"])

    create_verification(user)

    return JsonResponse(
        {
            "message": "Account created. Please check your email to verify your account."
        },
        status=201,
    )


@csrf_exempt
def verify_email_api(request):
    if request.method != "POST":
        return JsonResponse(
            {"error": "POST request required"},
            status=405,
        )

    try:
        data = json.loads(request.body)
    except json.JSONDecodeError:
        return JsonResponse(
            {"error": "Invalid JSON"},
            status=400,
        )

    token = data.get("token")

    if not token:
        return JsonResponse(
            {"error": "Verification token is required"},
            status=400,
        )

    try:
        verification = EmailVerification.objects.select_related("user").get(
            token=token
        )
    except EmailVerification.DoesNotExist:
        return JsonResponse(
            {"error": "Invalid verification token"},
            status=400,
        )

    timeout = getattr(settings, "EMAIL_VERIFICATION_TIMEOUT", 86400)

    if timezone.now() > verification.created_at + timezone.timedelta(
        seconds=timeout
    ):
        verification.delete()

        return JsonResponse(
            {"error": "Verification link has expired"},
            status=400,
        )

    user = verification.user
    user.is_active = True
    user.save(update_fields=["is_active"])

    verification.delete()

    return JsonResponse(
        {"message": "Email verified successfully"},
        status=200,
    )


@csrf_exempt
def resend_verification_api(request):
    if request.method != "POST":
        return JsonResponse(
            {"error": "POST request required"},
            status=405,
        )

    try:
        data = json.loads(request.body)
    except json.JSONDecodeError:
        return JsonResponse(
            {"error": "Invalid JSON"},
            status=400,
        )

    email = data.get("email", "").strip().lower()

    if not email:
        return JsonResponse(
            {"error": "Email is required"},
            status=400,
        )

    try:
        user = User.objects.get(email=email)
    except User.DoesNotExist:
        return JsonResponse(
            {
                "message": "If an account exists with that email, a verification email has been sent."
            },
            status=200,
        )

    if user.is_active:
        return JsonResponse(
            {"message": "This account is already verified."},
            status=200,
        )

    create_verification(user)

    return JsonResponse(
        {"message": "Verification email sent."},
        status=200,
    )


@csrf_exempt
def login_api(request):
    if request.method != "POST":
        return JsonResponse(
            {"error": "POST request required"},
            status=405,
        )

    try:
        data = json.loads(request.body)
    except json.JSONDecodeError:
        return JsonResponse(
            {"error": "Invalid JSON"},
            status=400,
        )

    email = data.get("email", "").strip().lower()
    password = data.get("password", "")

    if not email or not password:
        return JsonResponse(
            {"error": "Email and password are required"},
            status=400,
        )

    try:
        user = User.objects.get(email=email)
    except User.DoesNotExist:
        return JsonResponse(
            {"error": "Invalid email or password"},
            status=401,
        )

    if not user.check_password(password):
        return JsonResponse(
            {"error": "Invalid email or password"},
            status=401,
        )

    if not user.is_active:
        return JsonResponse(
            {"error": "Please verify your email before logging in"},
            status=403,
        )

    login(request, user)

    return JsonResponse(
        {
            "message": "Login successful",
            "user": {
                "id": user.id,
                "username": user.username,
                "email": user.email,
            },
        },
        status=200,
    )


def current_user_api(request):
    if not request.user.is_authenticated:
        return JsonResponse(
            {"authenticated": False},
            status=401,
        )

    return JsonResponse(
        {
            "authenticated": True,
            "user": {
                "id": request.user.id,
                "username": request.user.username,
                "email": request.user.email,
            },
        },
        status=200,
    )


@csrf_exempt
def logout_api(request):
    if request.method != "POST":
        return JsonResponse(
            {"error": "POST request required"},
            status=405,
        )

    logout(request)

    return JsonResponse(
        {"message": "Logout successful"},
        status=200,
    )