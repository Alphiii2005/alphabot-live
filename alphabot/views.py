from django.shortcuts import render, redirect
from django.contrib.auth.decorators import login_required
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.models import User
from django.contrib import messages
from django.http import JsonResponse
from django.core.exceptions import ValidationError
from django.core.validators import validate_email
from django.views.decorators.csrf import csrf_exempt

import json
import re

from .models import Message
from .ai.client import generate_response
from .ai.rate_limit import rate_limit


# ============================================================
# MODELS
# ============================================================

GENERAL_MODEL = "openrouter/free"

CODER_MODEL = "nvidia/nemotron-3-ultra-550b-a55b:free"


# ============================================================
# BASIC PAGES
# ============================================================

def index(request):
    return render(request, "alphabot/index.html")


def cv_gen(request):
    return render(request, "alphabot/cv_gen.html")


def coder(request):
    return render(request, "alphabot/coder.html")


def content_writer(request):
    return render(request, "alphabot/content_writer.html")


def script_writer(request):
    return render(request, "alphabot/script_writer.html")


def paraphraser_input(request):
    return render(request, "alphabot/paraphraser_input.html")


def chat_view(request):
    return render(request, "alphabot/chat.html")


# ============================================================
# VALIDATION
# ============================================================

def validate_uk_phone(phone):
    phone = phone.strip().replace(" ", "").replace("-", "")

    if phone.startswith("+44"):
        phone = "0" + phone[3:]

    if not re.match(r"^07\d{9}$", phone):
        raise ValidationError(
            "Phone must start with 07 and be 11 digits (UK format)"
        )


def validate_custom_email(email):
    validate_email(email)

    if len(email) > 254:
        raise ValidationError("Email is too long")


# ============================================================
# CHAT HISTORY HELPER
# ============================================================

def get_recent_history(user, chat_type, limit=20):
    """
    Get only the most recent messages.

    We don't want to send the entire database history
    to the AI on every request.
    """

    messages = (
        Message.objects
        .filter(user=user, chat_type=chat_type)
        .order_by("-timestamp")[:limit]
    )

    messages = reversed(list(messages))

    return [
        {
            "role": "assistant" if message.sender == "AlphaBot" else "user",
            "content": message.text,
        }
        for message in messages
    ]


# ============================================================
# CV GENERATOR
# ============================================================

@login_required
@csrf_exempt
@rate_limit("cv", limit=5, period=3600)
def generate_cv(request):

    if request.method != "POST":
        return JsonResponse(
            {"error": "POST method required"},
            status=405
        )

    try:
        data = json.loads(request.body)

        required_fields = {
            "fullName": "",
            "email": "",
            "phone": "",
            "summary": "",
            "skills": "",
            "experience": "",
            "education": "",
        }

        for field in required_fields:

            if field not in data:
                return JsonResponse(
                    {"error": f"Missing required field: {field}"},
                    status=400
                )

            required_fields[field] = str(data[field]).strip()

        validate_custom_email(required_fields["email"])
        validate_uk_phone(required_fields["phone"])

        prompt = f"""
Generate a professional CV using the following information.

Name:
{required_fields['fullName']}

Email:
{required_fields['email']}

Phone:
{required_fields['phone']}

Professional Summary:
{required_fields['summary']}

Skills:
{required_fields['skills']}

Work Experience:
{required_fields['experience']}

Education:
{required_fields['education']}

Certifications:
{data.get('certification', 'N/A')}

Requirements:

- Use Markdown only.
- Do not use HTML.
- Use clear section headings.
- Use bullet points.
- Keep the CV concise.
- Target approximately 1-2 pages.
- Optimize for ATS systems.
- Use strong professional language.
- Include measurable achievements where appropriate.
"""

        messages = [
            {
                "role": "system",
                "content": """
You are AlphaBot's professional CV generator.

Create polished, professional and ATS-friendly CVs.

Always respond using Markdown only.

Use:
# for headings
**bold** for important titles
*italic* for dates or locations
- for bullet points

Do not add explanations before or after the CV.
Return only the CV.
"""
            },
            {
                "role": "user",
                "content": prompt
            }
        ]

        content = generate_response(
            messages=messages,
            model=GENERAL_MODEL,
            temperature=0.3
        )

        score = calculate_cv_score(data, content)

        return JsonResponse({
            "cv": content,
            "score": score,
            "improvement_suggestions":
                generate_improvement_suggestions(data, content)
        })

    except json.JSONDecodeError:
        return JsonResponse(
            {"error": "Invalid JSON data"},
            status=400
        )

    except ValidationError as e:
        return JsonResponse(
            {"error": str(e)},
            status=400
        )

    except Exception as e:
        return JsonResponse(
            {"error": str(e)},
            status=500
        )


def calculate_cv_score(data, cv_text):

    score = 50

    summary = data.get("summary", "")
    experience = data.get("experience", "")
    education = data.get("education", "")
    skills = data.get("skills", "")

    if len(summary) > 100:
        score += 5

    if len(experience) > 300:
        score += 10

    if len(education) > 100:
        score += 5

    cv_text_lower = cv_text.lower()

    if "achieved" in cv_text_lower or "improved" in cv_text_lower:
        score += 10

    if any(
        word in cv_text_lower
        for word in ["led", "managed", "developed"]
    ):
        score += 10

    skills_count = len(
        [s for s in skills.split(",") if s.strip()]
    ) if skills else 0

    score += min(skills_count * 2, 10)

    return min(score, 100)


def generate_improvement_suggestions(data, cv_text):

    suggestions = []

    if len(data.get("summary", "")) < 50:
        suggestions.append(
            "Your professional summary could be more detailed."
        )

    if not any(
        char.isdigit()
        for char in data.get("experience", "")
    ):
        suggestions.append(
            "Add quantifiable achievements, such as "
            "'Increased sales by 20%'."
        )

    if (
        "http" not in data.get("linkedin", "")
        and "http" not in data.get("github", "")
    ):
        suggestions.append(
            "Consider adding LinkedIn or GitHub links."
        )

    if "\n\n" not in cv_text:
        suggestions.append(
            "Add more spacing between sections."
        )

    if "**" not in cv_text and "*" not in cv_text:
        suggestions.append(
            "Use bold and italic formatting to improve readability."
        )

    return suggestions[:5]


# ============================================================
# CODER
# ============================================================

@csrf_exempt
def coder_reset_chat(request):

    if not request.user.is_authenticated:
        return JsonResponse(
            {"error": "Unauthorized"},
            status=401
        )

    Message.objects.filter(
        user=request.user,
        chat_type="coder"
    ).delete()

    return JsonResponse({
        "status": "Chat reset."
    })


@csrf_exempt
def coder_history(request):

    if not request.user.is_authenticated:
        return JsonResponse(
            {"error": "Unauthorized"},
            status=401
        )

    messages = (
        Message.objects
        .filter(
            user=request.user,
            chat_type="coder"
        )
        .order_by("timestamp")
    )

    history = [
        {
            "sender": message.sender,
            "text": message.text
        }
        for message in messages
    ]

    return JsonResponse({
        "history": history
    })


@login_required
@csrf_exempt
@rate_limit("coder", limit=15, period=3600)
def coder_chat_api(request):

    if request.method != "POST":
        return JsonResponse(
            {"error": "Invalid method"},
            status=405
        )

    try:

        data = json.loads(request.body)

        user_message = data.get(
            "message",
            ""
        ).strip()

        if not user_message:
            return JsonResponse(
                {"error": "Message required"},
                status=400
            )

        messages = get_recent_history(
            request.user,
            "coder",
            limit=20
        )

        messages.insert(
            0,
            {
                "role": "system",
                "content": """
You are AlphaBot 🤖, an expert programming assistant.

You help with:

- Python
- Django
- JavaScript
- React
- HTML
- CSS
- SQL
- PostgreSQL
- APIs
- Git
- Software engineering
- Debugging
- Algorithms and data structures

Give accurate explanations and useful code.

When debugging code, explain the actual cause of the problem and then provide the fix.

Do not unnecessarily rewrite working code.
"""
            }
        )

        messages.append(
            {
                "role": "user",
                "content": user_message
            }
        )

        bot_reply = generate_response(
            messages=messages,
            model=CODER_MODEL,
            temperature=0.3
        )

        Message.objects.create(
            user=request.user,
            sender="user",
            text=user_message,
            chat_type="coder"
        )

        Message.objects.create(
            user=request.user,
            sender="AlphaBot",
            text=bot_reply,
            chat_type="coder"
        )

        return JsonResponse({
            "response": bot_reply
        })

    except json.JSONDecodeError:
        return JsonResponse(
            {"error": "Invalid JSON"},
            status=400
        )

    except Exception as e:
        return JsonResponse(
            {"error": str(e)},
            status=500
        )


# ============================================================
# CONTENT WRITER
# ============================================================

@login_required
@csrf_exempt
@rate_limit("content", limit=10, period=3600)
def generate_content(request):

    if request.method != "POST":
        return JsonResponse(
            {"error": "Invalid method"},
            status=405
        )

    try:

        data = json.loads(request.body)

        topic = data.get(
            "topic",
            ""
        ).strip()

        if not topic:
            return JsonResponse(
                {"error": "Missing topic"},
                status=400
            )

        messages = [
            {
                "role": "system",
                "content": """
You are AlphaBot, a professional content-writing assistant.

Write clear, engaging and informative content.

Use appropriate headings and paragraphs.

Do not mention that you are an AI unless specifically asked.
"""
            },
            {
                "role": "user",
                "content": f"""
Write a short, informative article about:

{topic}
"""
            }
        ]

        content = generate_response(
            messages=messages,
            model=GENERAL_MODEL,
            temperature=0.7
        )

        return JsonResponse({
            "response": content
        })

    except json.JSONDecodeError:
        return JsonResponse(
            {"error": "Invalid JSON"},
            status=400
        )

    except Exception as e:
        return JsonResponse(
            {"error": str(e)},
            status=500
        )


# ============================================================
# SCRIPT WRITER
# ============================================================

@login_required
@csrf_exempt
@rate_limit("script", limit=10, period=3600)
def generate_script(request):

    if request.method != "POST":
        return JsonResponse(
            {"error": "Invalid method"},
            status=400
        )

    try:

        data = json.loads(request.body)

        prompt = data.get(
            "prompt",
            ""
        ).strip()

        if not prompt:
            return JsonResponse(
                {"error": "No prompt provided"},
                status=400
            )

        messages = [
            {
                "role": "system",
                "content": """
You are AlphaBot, a professional screenwriter.

You specialize in:

- YouTube scripts
- Short films
- Movies
- Dialogue
- Scene writing
- Story structure

Create engaging, cinematic and natural scripts.

Follow the user's requested format and tone.
"""
            },
            {
                "role": "user",
                "content": prompt
            }
        ]

        reply = generate_response(
            messages=messages,
            model=GENERAL_MODEL,
            temperature=0.8
        )

        return JsonResponse({
            "response": reply
        })

    except json.JSONDecodeError:
        return JsonResponse(
            {"error": "Invalid JSON"},
            status=400
        )

    except Exception as e:
        return JsonResponse(
            {"error": str(e)},
            status=500
        )


# ============================================================
# PARAPHRASER
# ============================================================

@login_required
@csrf_exempt
@rate_limit("paraphraser", limit=20, period=3600)
def paraphraser_api(request):

    if request.method != "POST":
        return JsonResponse(
            {"error": "Only POST method allowed."},
            status=405
        )

    try:

        data = json.loads(request.body)

        original_text = data.get(
            "message",
            ""
        ).strip()

        if not original_text:
            return JsonResponse(
                {"error": "No input provided."},
                status=400
            )

        messages = [
            {
                "role": "system",
                "content": """
You are AlphaBot, a professional paraphrasing assistant.

Rewrite the user's text clearly and naturally.

Preserve the original meaning.

Do not add unnecessary information.

Do not use emojis unless the user specifically asks for them.
"""
            },
            {
                "role": "user",
                "content": f"""
Paraphrase this text:

{original_text}
"""
            }
        ]

        paraphrased = generate_response(
            messages=messages,
            model=GENERAL_MODEL,
            temperature=0.5
        )

        return JsonResponse({
            "response": paraphrased
        })

    except json.JSONDecodeError:
        return JsonResponse(
            {"error": "Invalid JSON"},
            status=400
        )

    except Exception as e:
        return JsonResponse(
            {"error": str(e)},
            status=500
        )


# ============================================================
# NORMAL CHAT
# ============================================================

@csrf_exempt
def reset_chat(request):

    if not request.user.is_authenticated:
        return JsonResponse(
            {"error": "Unauthorized"},
            status=401
        )

    Message.objects.filter(
        user=request.user,
        chat_type="chat"
    ).delete()

    return JsonResponse({
        "status": "Chat reset."
    })


@csrf_exempt
def chat_history(request):

    if not request.user.is_authenticated:
        return JsonResponse(
            {"error": "Unauthorized"},
            status=401
        )

    messages = (
        Message.objects
        .filter(
            user=request.user,
            chat_type="chat"
        )
        .order_by("timestamp")
    )

    history = [
        {
            "sender": message.sender,
            "text": message.text
        }
        for message in messages
    ]

    return JsonResponse({
        "history": history
    })


@login_required
@csrf_exempt
@rate_limit("chat", limit=20, period=3600)
def ai_chat_api(request):

    if request.method != "POST":
        return JsonResponse(
            {"error": "Invalid method"},
            status=405
        )

    try:

        data = json.loads(request.body)

        user_message = data.get(
            "message",
            ""
        ).strip()

        if not user_message:
            return JsonResponse(
                {"error": "Message required"},
                status=400
            )

        messages = get_recent_history(
            request.user,
            "chat",
            limit=20
        )

        messages.insert(
            0,
            {
                "role": "system",
                "content": """
You are AlphaBot 🤖, a friendly and intelligent AI assistant.

You were created by Alphin.

Help the user with:

- General questions
- Programming
- Learning
- Ideas
- Productivity
- Writing
- Problem solving

Be helpful, conversational and accurate.

If you don't know something, say so rather than inventing information.
"""
            }
        )

        messages.append(
            {
                "role": "user",
                "content": user_message
            }
        )

        bot_reply = generate_response(
            messages=messages,
            model=GENERAL_MODEL,
            temperature=0.7
        )

        Message.objects.create(
            user=request.user,
            sender="user",
            text=user_message,
            chat_type="chat"
        )

        Message.objects.create(
            user=request.user,
            sender="AlphaBot",
            text=bot_reply,
            chat_type="chat"
        )

        return JsonResponse({
            "response": bot_reply
        })

    except json.JSONDecodeError:
        return JsonResponse(
            {"error": "Invalid JSON"},
            status=400
        )

    except Exception as e:
        return JsonResponse(
            {"error": str(e)},
            status=500
        )


# ============================================================
# AUTHENTICATION
# ============================================================

def register_view(request):

    if request.method == "POST":

        username = request.POST["username"]
        email = request.POST["email"]
        password = request.POST["password"]
        confirm = request.POST["confirm"]

        if password != confirm:

            messages.error(
                request,
                "Passwords do not match."
            )

            return render(
                request,
                "alphabot/register.html"
            )

        if User.objects.filter(
            username=username
        ).exists():

            messages.error(
                request,
                "Username already exists."
            )

            return render(
                request,
                "alphabot/register.html"
            )

        user = User.objects.create_user(
            username=username,
            email=email,
            password=password
        )

        login(request, user)

        return redirect("index")

    return render(
        request,
        "alphabot/register.html"
    )


def login_view(request):

    if request.method == "POST":

        username = request.POST["username"]
        password = request.POST["password"]

        user = authenticate(
            request,
            username=username,
            password=password
        )

        if user is not None:

            login(request, user)

            return redirect("index")

        messages.error(
            request,
            "Invalid credentials."
        )

        return render(
            request,
            "alphabot/login.html"
        )

    return render(
        request,
        "alphabot/login.html"
    )


def logout_view(request):

    logout(request)

    return redirect("index")