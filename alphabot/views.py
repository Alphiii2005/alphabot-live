import json
import re
from functools import wraps

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
# AUTHENTICATION
# ============================================================

def api_login_required(view_func):
    @wraps(view_func)
    def wrapper(request, *args, **kwargs):
        if not request.user.is_authenticated:
            return JsonResponse(
                {
                    "error": "Authentication required.",
                    "code": "AUTH_REQUIRED",
                },
                status=401,
            )

        return view_func(request, *args, **kwargs)

    return wrapper


# ============================================================
# CONFIG
# ============================================================

GENERAL_MODEL = "openrouter/free"


# ============================================================
# VALIDATION
# ============================================================

def validate_uk_phone(phone):
    phone = (
        phone
        .strip()
        .replace(" ", "")
        .replace("-", "")
    )

    if phone.startswith("+44"):
        phone = "0" + phone[3:]

    if not re.match(r"^07\d{9}$", phone):
        raise ValidationError(
            "Phone must start with 07 and be 11 digits (UK format)."
        )


def validate_custom_email(email):
    validate_email(email)

    if len(email) > 254:
        raise ValidationError(
            "Email is too long."
        )


# ============================================================
# HELPERS
# ============================================================

def get_recent_history(
    user,
    chat_type="chat",
    limit=20,
):
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
            "error": str(error),
        },
        status=500,
    )


def clean_ai_json(content):
    """
    Clean common Markdown wrappers around JSON returned by AI.
    """

    if not content:
        return ""

    content = content.strip()

    if content.startswith("```"):
        content = re.sub(
            r"^```(?:json)?\s*",
            "",
            content,
            flags=re.IGNORECASE,
        )

        content = re.sub(
            r"\s*```$",
            "",
            content,
        )

    return content.strip()


def safe_list(value):
    """
    Ensure AI list fields always become Python lists.
    """

    if isinstance(value, list):
        return [
            str(item).strip()
            for item in value
            if str(item).strip()
        ]

    if isinstance(value, str) and value.strip():
        return [value.strip()]

    return []


# ============================================================
# QUOTA
# ============================================================

@api_login_required
def quota_api(request):
    return JsonResponse(
        get_usage(request.user)
    )


# ============================================================
# CHAT
# ============================================================

@csrf_exempt
@api_login_required
def ai_chat_api(request):

    if request.method != "POST":
        return JsonResponse(
            {
                "error": "POST method required.",
            },
            status=405,
        )

    try:
        data = json.loads(request.body)
    except json.JSONDecodeError:
        return JsonResponse(
            {
                "error": "Invalid JSON.",
            },
            status=400,
        )

    user_message = data.get(
        "message",
        "",
    ).strip()

    if not user_message:
        return JsonResponse(
            {
                "error": "Message required.",
            },
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

    command = "normal"

    if user_message.startswith("/"):
        parts = user_message.split(
            maxsplit=1
        )

        command_name = (
            parts[0][1:]
            .strip()
            .lower()
        )

        if command_name in allowed_commands:
            command = command_name

            user_message = (
                parts[1].strip()
                if len(parts) > 1
                else ""
            )

            if not user_message:
                return JsonResponse(
                    {
                        "error": (
                            f"Please provide some text "
                            f"after /{command}."
                        ),
                    },
                    status=400,
                )

        else:
            return JsonResponse(
                {
                    "error": (
                        f"Unknown command: /{command_name}. "
                        "Available commands: "
                        "/normal, /rewrite, /humanise, "
                        "/code, /formalise, /script."
                    ),
                },
                status=400,
            )

    elif data.get("command"):

        requested_command = (
            str(data.get("command"))
            .strip()
            .lower()
        )

        if requested_command not in allowed_commands:
            return JsonResponse(
                {
                    "error": (
                        "Unknown command. "
                        f"Allowed commands: "
                        f"{', '.join(sorted(allowed_commands))}."
                    ),
                },
                status=400,
            )

        command = requested_command

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
            model=GENERAL_MODEL,
            temperature=temperature,
        )

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

        release_quota(request.user)

        return ai_error_response(error)


# ============================================================
# CHAT HISTORY
# ============================================================

@api_login_required
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
@api_login_required
def reset_chat(request):

    if request.method != "POST":
        return JsonResponse(
            {
                "error": "POST method required.",
            },
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
# CV GENERATOR + AI ANALYSIS
# ============================================================

@csrf_exempt
@api_login_required
def generate_cv(request):

    if request.method != "POST":
        return JsonResponse(
            {
                "error": "POST method required.",
            },
            status=405,
        )

    # --------------------------------------------------------
    # Reserve ONE shared AI quota
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

        # ----------------------------------------------------
        # Parse request
        # ----------------------------------------------------

        try:
            data = json.loads(request.body)

        except json.JSONDecodeError:
            release_quota(request.user)

            return JsonResponse(
                {
                    "error": "Invalid JSON data.",
                },
                status=400,
            )

        # ----------------------------------------------------
        # Required fields
        # ----------------------------------------------------

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
                        ),
                    },
                    status=400,
                )

            required_fields[field] = str(
                data[field]
            ).strip()

        # ----------------------------------------------------
        # Optional fields
        # ----------------------------------------------------

        target_role = str(
            data.get("targetRole", "")
        ).strip()

        job_description = str(
            data.get("jobDescription", "")
        ).strip()

        projects = str(
            data.get("projects", "")
        ).strip()

        certifications = str(
            data.get("certification", "")
        ).strip()

        # ----------------------------------------------------
        # Target role
        # ----------------------------------------------------

        if not target_role:
            release_quota(request.user)

            return JsonResponse(
                {
                    "error": (
                        "Please provide the job role "
                        "you are targeting."
                    ),
                },
                status=400,
            )

        # ----------------------------------------------------
        # Validate email
        # ----------------------------------------------------

        validate_custom_email(
            required_fields["email"]
        )

        # ----------------------------------------------------
        # Validate UK phone
        # ----------------------------------------------------

        validate_uk_phone(
            required_fields["phone"]
        )

        # ----------------------------------------------------
        # Job context
        # ----------------------------------------------------

        if job_description:

            job_context = f"""
Target Job Role:
{target_role}

Job Description:
{job_description}
"""

        else:

            job_context = f"""
Target Job Role:
{target_role}

No specific job description was provided.

Analyse the CV against common expectations,
skills and responsibilities for this target role.

Do not invent requirements from a specific employer.
"""

        # ----------------------------------------------------
        # Optional sections
        # ----------------------------------------------------

        if projects:

            projects_section = f"""
Projects:
{projects}
"""

        else:

            projects_section = """
Projects:
[NOT PROVIDED]
"""

        if certifications:

            certifications_section = f"""
Certifications:
{certifications}
"""

        else:

            certifications_section = """
Certifications:
[NOT PROVIDED]
"""

        # ----------------------------------------------------
        # CV GENERATION + ANALYSIS PROMPT
        # ----------------------------------------------------

        prompt = f"""
You are AlphaBot's professional CV creator and ATS analyst.

Your task is to create a clean, professional, truthful,
ATS-friendly CV and then analyse that CV for the user's
target role.

The user's information is the ONLY source of truth.

============================================================
USER INFORMATION
============================================================

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

{projects_section}

{certifications_section}

{job_context}

============================================================
CV STRUCTURE
============================================================

The CV must follow this professional order:

1. Name and contact information
2. Professional Summary
3. Skills
4. Work Experience
5. Education
6. Projects
7. Certifications

However, ONLY include a section when the user actually
provided information for that section.

For example:

If Projects is [NOT PROVIDED]:

DO NOT output:

## Projects

Do not output an empty heading.
Do not output "None".
Do not output "N/A".
Do not output placeholder text.

Simply omit the Projects section completely.

The same rule applies to Certifications and every other
optional section.

============================================================
CONTACT HEADER
============================================================

The beginning of the CV should be compact and professional.

Use:

# Full Name

Then place the user's actual contact information directly
under the name.

Example:

# Alex Smith

alex@example.com | +44 7000 000000

Do not invent:
- LinkedIn
- GitHub
- Portfolio
- Location
- Website
- Social media
- Other contact details

Only display contact information actually supplied by the
user.

============================================================
PROFESSIONAL SUMMARY
============================================================

Use:

## Professional Summary

Write a concise professional summary using the user's
actual background.

Improve grammar and wording where appropriate.

Do not invent experience, achievements, technologies or
qualifications.

============================================================
SKILLS
============================================================

Use:

## Skills

Present the supplied skills clearly and concisely.

Do not add skills merely because they are common for the
target role.

Do not assume that knowledge of one technology means the
user knows another technology.

============================================================
WORK EXPERIENCE
============================================================

Use:

## Experience

Structure each supplied role clearly.

For example:

### Job Title | Company

Dates

- Responsibility or achievement from the user's information
- Responsibility or achievement from the user's information

Improve wording and grammar where appropriate.

Do not invent:
- Employers
- Job titles
- Dates
- Responsibilities
- Achievements
- Metrics
- Technologies

If the user supplied several roles, keep them as separate
entries.

============================================================
EDUCATION
============================================================

Use:

## Education

Structure the supplied education clearly.

For example:

### Degree | Institution

Dates

Only include information actually provided.

Do not invent:
- Grades
- Modules
- Awards
- Dates
- Classifications

============================================================
PROJECTS
============================================================

ONLY include this section if projects were provided.

Use:

## Projects

Give each supplied project its own heading.

Explain the project using only the user's supplied
information.

Do not invent:
- Technologies
- Features
- Users
- Results
- Metrics
- Responsibilities

============================================================
CERTIFICATIONS
============================================================

ONLY include this section if certifications were provided.

Use:

## Certifications

List the supplied certifications clearly.

Do not invent:
- Certification dates
- Issuing organisations
- Grades
- Expiry dates

============================================================
WRITING STYLE
============================================================

The CV should feel like a real professional CV written
for a human recruiter.

Use:

- Clear professional language
- Concise sentences
- Strong action verbs when supported by the user's
  information
- Short bullet points
- Consistent formatting
- Consistent tense
- Professional terminology
- ATS-friendly Markdown

Avoid:

- Fluffy language
- Generic motivational statements
- First-person pronouns where unnecessary
- Long paragraphs
- Repetition
- Decorative symbols
- Emojis
- Tables
- Columns
- Graphics
- Fake achievements
- Fake metrics
- Fake keywords

Do not write an introduction such as:

"Here is your CV."

The "cv" field must contain ONLY the CV.

============================================================
IMPORTANT TRUTHFULNESS RULE
============================================================

NEVER invent information to make the CV appear stronger.

If the user did not provide something, leave it out.

It is better to have a shorter truthful CV than a longer
CV containing fabricated information.

============================================================
ATS ANALYSIS
============================================================

After creating the CV, analyse it against:

- Target role
- Job description, if supplied
- Relevant skills
- Relevant keywords
- Summary relevance
- Experience relevance
- Projects
- Education
- Certifications
- Evidence of achievements
- Action verbs
- ATS structure
- Readability
- Completeness

The score must be between 0 and 100.

The score should represent the quality and relevance of
the supplied CV information for the target role.

Do not award points merely because a section exists.

Identify:

- strengths
- specific improvements
- missing relevant keywords
- missing information
- a concise explanation of the score

Suggestions must be specific to this user's information.

Do not automatically recommend LinkedIn, GitHub,
portfolio websites or other information unless it is
relevant to the supplied CV.

============================================================
RESPONSE FORMAT
============================================================

Return ONLY valid JSON.

Use exactly:

{{
    "cv": "FULL MARKDOWN CV HERE",
    "score": 0,
    "strengths": [
        "specific strength"
    ],
    "improvements": [
        "specific improvement"
    ],
    "missing_keywords": [
        "keyword"
    ],
    "missing_information": [
        "specific missing information"
    ],
    "analysis": "Short explanation of the score."
}}

Important:

- score must be an integer from 0 to 100.
- strengths must be an array of strings.
- improvements must be an array of strings.
- missing_keywords must be an array of strings.
- missing_information must be an array of strings.
- analysis must be a string.
- Do not wrap JSON in Markdown code fences.
- Do not add text outside the JSON.
"""

        # ----------------------------------------------------
        # AI REQUEST
        # ----------------------------------------------------

        messages = [
            {
                "role": "system",
                "content": """
You are AlphaBot's professional CV generation
and ATS analysis engine.

Create truthful, concise, professional CVs.

The user's supplied information is the only source of
truth.

Never invent:
- Experience
- Employers
- Job titles
- Dates
- Qualifications
- Technologies
- Responsibilities
- Achievements
- Metrics
- Skills
- Contact information

Never create empty CV sections.

If the user did not provide information for a section,
omit that section completely.

The final CV should be suitable for submission to a
real employer and should be easy for both recruiters
and ATS systems to read.

Return valid JSON when requested.
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

        # ----------------------------------------------------
        # Validate AI response
        # ----------------------------------------------------

        if not content or not content.strip():

            release_quota(request.user)

            return JsonResponse(
                {
                    "error": (
                        "AlphaBot could not generate "
                        "your CV. Please try again."
                    ),
                },
                status=502,
            )

        # ----------------------------------------------------
        # Parse AI JSON
        # ----------------------------------------------------

        cleaned_content = clean_ai_json(
            content
        )

        try:

            result = json.loads(
                cleaned_content
            )

        except json.JSONDecodeError:

            release_quota(request.user)

            return JsonResponse(
                {
                    "error": (
                        "AlphaBot returned an invalid CV "
                        "analysis. Please try again."
                    ),
                },
                status=502,
            )

        # ----------------------------------------------------
        # Validate generated CV
        # ----------------------------------------------------

        cv = str(
            result.get("cv", "")
        ).strip()

        if not cv:

            release_quota(request.user)

            return JsonResponse(
                {
                    "error": (
                        "AlphaBot generated an empty CV. "
                        "Please try again."
                    ),
                },
                status=502,
            )

        # ----------------------------------------------------
        # Validate score
        # ----------------------------------------------------

        raw_score = result.get(
            "score",
            0,
        )

        try:

            score = int(
                float(raw_score)
            )

        except (
            TypeError,
            ValueError,
        ):

            score = 0

        score = min(
            max(score, 0),
            100,
        )

        # ----------------------------------------------------
        # Analysis
        # ----------------------------------------------------

        strengths = safe_list(
            result.get(
                "strengths",
                [],
            )
        )

        improvements = safe_list(
            result.get(
                "improvements",
                [],
            )
        )

        missing_keywords = safe_list(
            result.get(
                "missing_keywords",
                [],
            )
        )

        missing_information = safe_list(
            result.get(
                "missing_information",
                [],
            )
        )

        analysis = str(
            result.get(
                "analysis",
                "",
            )
        ).strip()

        # ----------------------------------------------------
        # Final response
        # ----------------------------------------------------

        usage = get_usage(
            request.user
        )

        return JsonResponse(
            {
                "cv": cv,
                "score": score,
                "strengths": strengths[:5],
                "improvements": improvements[:5],
                "missing_keywords": missing_keywords[:10],
                "missing_information": missing_information[:5],
                "analysis": analysis,
                "target_role": target_role,
                "has_job_description": bool(
                    job_description
                ),
                **usage,
            }
        )

    # --------------------------------------------------------
    # Validation error
    # --------------------------------------------------------

    except ValidationError as error:

        release_quota(request.user)

        return JsonResponse(
            {
                "error": str(error),
            },
            status=400,
        )

    # --------------------------------------------------------
    # AI / unexpected error
    # --------------------------------------------------------

    except Exception as error:

        release_quota(request.user)

        return ai_error_response(
            error
        )