from django.urls import path
from . import views

urlpatterns = [
    # Chat
    path("api/chat/", views.ai_chat_api, name="ai_chat_api"),
    path("api/chat/history/", views.chat_history, name="chat_history"),
    path("api/chat/reset/", views.reset_chat, name="reset_chat"),

    # CV
    path("api/cv/generate/", views.generate_cv, name="generate_cv"),

    # Usage / Quota
    path("api/quota/", views.quota_api, name="quota_api"),
]