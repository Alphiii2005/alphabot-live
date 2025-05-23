from django.urls import path
from . import views

urlpatterns = [
    path("", views.index, name="index"),
    path("register/", views.register_view, name="register"),
    path("login/", views.login_view, name="login"),
    path("logout/", views.logout_view, name="logout"),

    path("chat/", views.chat_view, name="chat"),
    path("api/chat/", views.ai_chat_api, name="ai_chat_api"),
    path("api/chat/reset/", views.reset_chat, name="reset_chat"),
    path("api/chat/history/", views.chat_history, name="chat_history"),
   
    
    path("cv_gen", views.cv_gen, name="cv_gen"),
    path("api/cv/generate/", views.generate_cv, name="generate_cv"),

    path("content_writer/", views.content_writer, name="content_writer"),

    path("api/content/generate/", views.generate_content, name="generate_content"),


    path("script_writer/", views.script_writer, name="script_writer"),
    path("api/script/generate/", views.generate_script, name="generate_script"),

    path('paraphraser/', views.paraphraser_input, name='paraphraser'),
    path("api/paraphraser/", views.paraphraser_api, name="paraphraser_api"),

    path("coder/", views.coder, name="coder"),
    path("api/coder/chat/", views.coder_chat_api, name="coder_chat"),
    path("api/coder/chat/reset/", views.coder_reset_chat, name="coder_reset_chat"),
    path("api/coder/chat/history/", views.coder_history, name="coder_chat_history"),
]