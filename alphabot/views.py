import json
import re

from django.contrib.auth.decorators import login_required
from django.core.exceptions import ValidationError
from django.core.validators import validate_email
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt

from .models import Message
from .ai.client import generate_response
from .ai.quota import (
    get_usage,
    reserve_quota,
    release_quota,
)


# ============================================================
# CONFIG
# ============================================================

GENERAL_MODEL = "openrouter/free"
CODER_MODEL = "nvidia/nemotron-3-ultra-550b-a55b:free"


# ============================================================
# VALIDATION
# ============================================================

def validate_uk_phone(phone):
    phone = phone.strip().replace(" ", "").replace("-", "")

    if phone.startswith("+44"):
        phone = "0" + phone[3:]

    if not re.match(r"^07\d{9}$", phone):
        raise ValidationError(
            "Phone must start with 07 and be 11 digits (UK format)."
        )


def validate_custom_email(email):
    validate_email(email)

    if len(email) > 254:
        raise ValidationError("Email is too long.")


# ============================================================
# HELPERS
# ============================================================

def get_recent_history(user, chat_type="chat", limit=20):
    messages = (
        Message.objects
        .filter(
            user=user,
            chat_type=chat_type,
        )
        .order_by("-timestamp")[:limit]
    )

    messages = reversed(list(messages))

    return [
        {
            "role": (
                "assistant"
                if message.sender == "AlphaBot"
                else "user"
            ),
            "content": message.text,
        }
        for message in messages
    ]


def ai_error_response(error):
    return JsonResponse(
        {
            "error": str(error)
        },
        status=500,
    )


# ============================================================
# QUOTA
# ============================================================

@login_required
def quota_api(request):
    return JsonResponse(
        get_usage(request.user)
    )


# ============================================================
# CHAT
# ============================================================

@csrf_exempt
@login_required
def ai_chat_api(request):

    if request.method != "POST":
        return JsonResponse(
            {"error": "POST method required."},
            status=405,
        )

    try:
        data = json.loads(request.body)

    except json.JSONDecodeError:
        return JsonResponse(
            {"error": "Invalid JSON."},
            status=400,
        )

    user_message = data.get("message", "").strip()
    command = data.get("command", "normal").strip().lower()

    if not user_message:
        return JsonResponse(
            {"error": "Message required."},
            status=400,
        )

    allowed_commands = {
        "normal",
        "rewrite",
        "humanise",
        "code",
        "formalise",
        "script",
    }

    if command not in allowed_commands:
        return JsonResponse(
            {
                "error": (
                    f"Unknown command. "
                    f"Allowed commands: "
                    f"{', '.join(sorted(allowed_commands))}."
                )
            },
            status=400,
        )

    # --------------------------------------------------------
    # Reserve quota
    # --------------------------------------------------------

    if not reserve_quota(request.user):
        usage = get_usage(request.user)

        return JsonResponse(
            {
                "error": "Daily AI limit reached.",
                **usage,
            },
            status=429,
        )

    try:

        history = get_recent_history(
            request.user,
            chat_type="chat",
            limit=20,
        )

        # ----------------------------------------------------
        # Command-specific behaviour
        # ----------------------------------------------------

        system_prompts = {

            "normal": """
You are AlphaBot, a friendly and intelligent AI assistant.

You help users with:
- General questions
- Programming
- Learning
- Ideas
- Productivity
- Writing
- Problem solving

Be helpful, conversational and accurate.

If you don't know something, say so rather than inventing information.
""",

            "rewrite": """
You are AlphaBot's rewriting assistant.

Rewrite the user's text to make it clearer, smoother and more natural.

Preserve the original meaning.
Do not add unnecessary information.
Return only the rewritten text.
""",

            "humanise": """
You are AlphaBot's humanisation assistant.

Rewrite the user's text so it sounds natural, personal and human.

Avoid robotic or overly formal language.
Preserve the original meaning.
Return only the improved text.
""",

            "code": """
You are AlphaBot's programming assistant.

You help with:
- Python
- Django
- JavaScript
- React
- Next.js
- HTML
- CSS
- SQL
- PostgreSQL
- APIs
- Git
- Software engineering
- Debugging
- Algorithms and data structures

Explain problems clearly and provide useful code when appropriate.

When debugging, explain the actual cause before giving the fix.
Do not unnecessarily rewrite working code.
""",

            "formalise": """
You are AlphaBot's professional writing assistant.

Rewrite the user's text in a professional and polished tone.

Preserve the original meaning.
Do not add unnecessary information.
Return only the rewritten text.
""",

            "script": """
You are AlphaBot's script-writing assistant.

You specialize in:
- YouTube scripts
- Short films
- Movies
- Dialogue
- Scene writing
- Story structure

Create engaging, natural and well-structured scripts.

Follow the user's requested format and tone.
""",
        }

        messages = [
            {
                "role": "system",
                "content": system_prompts[command],
            }
        ]

        messages.extend(history)

        messages.append(
            {
                "role": "user",
                "content": user_message,
            }
        )

        model = (
            CODER_MODEL
            if command == "code"
            else GENERAL_MODEL
        )

        temperature = {
            "normal": 0.7,
            "rewrite": 0.5,
            "humanise": 0.7,
            "code": 0.3,
            "formalise": 0.4,
            "script": 0.8,
        }[command]

        bot_reply = generate_response(
            messages=messages,
            model=model,
            temperature=temperature,
        )

        # ----------------------------------------------------
        # Save successful conversation
        # ----------------------------------------------------

        Message.objects.create(
            user=request.user,
            sender="user",
            text=user_message,
            chat_type="chat",
        )

        Message.objects.create(
            user=request.user,
            sender="AlphaBot",
            text=bot_reply,
            chat_type="chat",
        )

        usage = get_usage(request.user)

        return JsonResponse(
            {
                "response": bot_reply,
                "command": command,
                **usage,
            }
        )

    except Exception as error:

        # AI failed, so return the quota.
        release_quota(request.user)

        return ai_error_response(error)


# ============================================================
# CHAT HISTORY
# ============================================================

@login_required
def chat_history(request):

    messages = (
        Message.objects
        .filter(
            user=request.user,
            chat_type="chat",
        )
        .order_by("timestamp")
    )

    history = [
        {
            "sender": message.sender,
            "text": message.text,
            "timestamp": message.timestamp,
        }
        for message in messages
    ]

    return JsonResponse(
        {
            "history": history,
        }
    )


# ============================================================
# RESET CHAT
# ============================================================

@csrf_exempt
@login_required
def reset_chat(request):

    if request.method != "POST":
        return JsonResponse(
            {"error": "POST method required."},
            status=405,
        )

    Message.objects.filter(
        user=request.user,
        chat_type="chat",
    ).delete()

    return JsonResponse(
        {
            "success": True,
            "message": "Chat reset.",
        }
    )


# ============================================================
# CV GENERATOR
# ============================================================

@csrf_exempt
@login_required
def generate_cv(request):

    if request.method != "POST":
        return JsonResponse(
            {"error": "POST method required."},
            status=405,
        )

    # --------------------------------------------------------
    # Reserve shared AI quota
    # --------------------------------------------------------

    if not reserve_quota(request.user):
        usage = get_usage(request.user)

        return JsonResponse(
            {
                "error": "Daily AI limit reached.",
                **usage,
            },
            status=429,
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
                release_quota(request.user)

                return JsonResponse(
                    {
                        "error": (
                            f"Missing required field: {field}"
                        )
                    },
                    status=400,
                )

            required_fields[field] = (
                str(data[field]).strip()
            )

        validate_custom_email(
            required_fields["email"]
        )

        validate_uk_phone(
            required_fields["phone"]
        )

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
""",
            },
            {
                "role": "user",
                "content": prompt,
            },
        ]

        content = generate_response(
            messages=messages,
            model=GENERAL_MODEL,
            temperature=0.3,
        )

        score = calculate_cv_score(
            data,
            content,
        )

        suggestions = generate_improvement_suggestions(
            data,
            content,
        )

        usage = get_usage(request.user)

        return JsonResponse(
            {
                "cv": content,
                "score": score,
                "improvement_suggestions": suggestions,
                **usage,
            }
        )

    except json.JSONDecodeError:

        release_quota(request.user)

        return JsonResponse(
            {"error": "Invalid JSON data."},
            status=400,
        )

    except ValidationError as error:

        release_quota(request.user)

        return JsonResponse(
            {"error": str(error)},
            status=400,
        )

    except Exception as error:

        release_quota(request.user)

        return ai_error_response(error)


# ============================================================
# CV SCORING
# ============================================================

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

    if (
        "achieved" in cv_text_lower
        or "improved" in cv_text_lower
    ):
        score += 10

    if any(
        word in cv_text_lower
        for word in [
            "led",
            "managed",
            "developed",
        ]
    ):
        score += 10

    skills_count = len(
        [
            skill
            for skill in skills.split(",")
            if skill.strip()
        ]
    )

    score += min(
        skills_count * 2,
        10,
    )

    return min(score, 100)


def generate_improvement_suggestions(
    data,
    cv_text,
):

    suggestions = []

    if len(
        data.get("summary", "")
    ) < 50:

        suggestions.append(
            "Your professional summary could be more detailed."
        )

    if not any(
        char.isdigit()
        for char in data.get(
            "experience",
            "",
        )
    ):

        suggestions.append(
            "Add quantifiable achievements, "
            "such as 'Increased sales by 20%'."
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

    if (
        "**" not in cv_text
        and "*" not in cv_text
    ):

        suggestions.append(
            "Use bold and italic formatting "
            "to improve readability."
        )

    return suggestions[:5]