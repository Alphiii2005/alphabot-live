from functools import wraps

from django.core.cache import cache
from django.http import JsonResponse


def rate_limit(key_prefix, limit=20, period=3600):

    def decorator(view_func):

        @wraps(view_func)
        def wrapper(request, *args, **kwargs):

            if not request.user.is_authenticated:
                return JsonResponse(
                    {"error": "Unauthorized"},
                    status=401
                )

            cache_key = (
                f"alphabot:rate:{key_prefix}:"
                f"{request.user.id}"
            )

            current_count = cache.get(
                cache_key,
                0
            )

            if current_count >= limit:

                return JsonResponse(
                    {
                        "error": (
                            "Rate limit exceeded. "
                            "Please try again later."
                        ),
                        "limit": limit,
                        "period": period
                    },
                    status=429
                )

            cache.set(
                cache_key,
                current_count + 1,
                timeout=period
            )

            return view_func(
                request,
                *args,
                **kwargs
            )

        return wrapper

    return decorator