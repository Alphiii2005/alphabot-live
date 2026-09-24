from django.conf import settings
from django.db import transaction
from django.db.models import F
from django.utils import timezone

from usage.models import AIUsage


def get_daily_limit():
    return settings.ALPHABOT_DAILY_AI_LIMIT


def get_usage(user):
    today = timezone.localdate()
    limit = get_daily_limit()

    usage, _ = AIUsage.objects.get_or_create(
        user=user,
        date=today,
    )

    return {
        "used": usage.used,
        "remaining": max(limit - usage.used, 0),
        "limit": limit,
    }


def reserve_quota(user):
    """
    Reserve one AI generation.

    Returns:
        True  -> quota available
        False -> quota exhausted
    """

    today = timezone.localdate()
    limit = get_daily_limit()

    usage, _ = AIUsage.objects.get_or_create(
        user=user,
        date=today,
    )

    updated = AIUsage.objects.filter(
        id=usage.id,
        used__lt=limit,
    ).update(
        used=F("used") + 1
    )

    return updated == 1


def release_quota(user):
    """
    Give the quota back if the AI request fails.
    """

    today = timezone.localdate()

    AIUsage.objects.filter(
        user=user,
        date=today,
        used__gt=0,
    ).update(
        used=F("used") - 1
    )


def quota_response(user):
    return get_usage(user)