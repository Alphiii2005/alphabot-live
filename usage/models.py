from django.conf import settings
from django.db import models


class AIUsage(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="ai_usage",
    )
    date = models.DateField()
    used = models.PositiveIntegerField(default=0)

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=["user", "date"],
                name="unique_ai_usage_per_user_per_day",
            )
        ]

    def __str__(self):
        return f"{self.user.username} - {self.date}: {self.used}"