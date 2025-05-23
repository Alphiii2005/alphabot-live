from django.shortcuts import render, redirect
from django.contrib.auth.decorators import login_required
from django.contrib.auth import authenticate, login, logout
from django.conf import settings
from django.contrib.auth.models import User
from django.contrib import messages
from django.http import JsonResponse
from django.core.exceptions import ValidationError
from django.core.validators import validate_email
from django.views.decorators.csrf import csrf_exempt
import os
import json
import re
import requests
from dotenv import load_dotenv
from .models import Message


# Load environment variables
load_dotenv()

def index(request):
    return render(request, "alphabot/index.html")



def cv_gen(request):
    return render(request, "alphabot/cv_gen.html")





def validate_uk_phone(phone):
    phone = phone.strip().replace(" ", "").replace("-", "")
    if phone.startswith("+44"):
        phone = "0" + phone[3:]

    if not re.match(r"^07\d{9}$", phone):
        raise ValidationError("Phone must start with 07 and be 11 digits (UK format)")
    
def validate_custom_email(email):
    validate_email(email)
    if len(email) > 254:
        raise ValidationError("Email is too long")



@login_required
@csrf_exempt
def generate_cv(request):
    if request.method != "POST":
        return JsonResponse({"error": "POST method required"}, status=405)

    try:
        data = json.loads(request.body)
        
        # Required fields with defaults
        required_fields = {
    'fullName': '',
    'email': '',
    'phone': '',
    'summary': '',
    'skills': '',
    'experience': '',
    'education': ''
}

        for field in required_fields:
            if field in data:
                required_fields[field] = data[field].strip()
            else:
                return JsonResponse({"error": f"Missing required field: {field}"}, status=400)

     # Validate email and phone
        validate_custom_email(data['email'])
        validate_uk_phone(data['phone'])


        # Prepare the AI prompt with structured data
        prompt = f"""
        Generate a professional CV with these details:
        
        Name: {required_fields['fullName']}
        Email: {required_fields['email']}
        Phone: {required_fields['phone']}
        
        Professional Summary:
        {data['summary']}
        
        Skills:
        {data['skills']}
        
        Work Experience:
        {data['experience']}
        
        Education:
        {data['education']}
        
        Certifications:
        {data.get('certification', 'N/A')}
        
        Requirements:
        - Use Markdown formatting
        - Include section headings
        - Use bullet points for lists
        - Keep it concise (1-2 pages)
        - Optimize for ATS systems
        - Add professional spacing
        """

        api_key = os.getenv("OPENROUTER_API_KEY")
        if not api_key:
            return JsonResponse({"error": "API configuration error"}, status=500)

        headers = {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json",
            "HTTP-Referer": request.build_absolute_uri('/')
        }

        payload = {
            "model": "deepseek/deepseek-chat",
            "messages": [
                {
                    "role": "system",
                    "content": """You are a professional career advisor. 
ALWAYS respond ONLY in Markdown (do NOT use any HTML tags).
Use:
- `#` for headings
- `**bold**` for job titles, company names, and degrees
- `*italic*` for dates or locations
- Bullet points for lists

Example:
# Professional Summary
Motivated professional with 5+ years of experience...

# Work Experience
**Software Engineer** – *Jan 2020 – Present*, **TechCorp**
- Developed new features for the main product
- Improved system performance by 30%

# Skills
- **Python**
- **Project Management**

Now, generate the CV using the provided details, following this Markdown style strictly.
"""
                },
                {
                    "role": "user",
                    "content": prompt
                }
            ],
            "temperature": 0.3  # Less creative, more factual
        }

        response = requests.post(
            "https://openrouter.ai/api/v1/chat/completions",
            headers=headers,
            json=payload,
            timeout=10  # Add timeout
        )

        if response.status_code != 200:
            error_msg = f"API Error {response.status_code}"
            try:
                error_details = response.json().get('error', {}).get('message', '')
                if error_details:
                    error_msg += f": {error_details}"
            except:
                pass
            return JsonResponse({"error": error_msg}, status=500)

        result = response.json()
        content = result["choices"][0]["message"]["content"]
        
        # Calculate success score (simple version)
        score = calculate_cv_score(data, content)
        
        return JsonResponse({
            "cv": content,
            "score": score,
            "improvement_suggestions": generate_improvement_suggestions(data, content)
        })

    except json.JSONDecodeError:
        return JsonResponse({"error": "Invalid JSON data"}, status=400)
    except ValidationError as e:
        return JsonResponse({"error": str(e)}, status=400)
    except requests.Timeout:
        return JsonResponse({"error": "API timeout"}, status=504)
    except Exception as e:
        return JsonResponse({"error": f"Server error: {str(e)}"}, status=500)

def calculate_cv_score(data, cv_text):
    """Calculate a success score (0-100) for the CV"""
    score = 50  # Base score
    
    # Safely get values with defaults
    summary = data.get('summary', '')
    experience = data.get('experience', '')
    education = data.get('education', '')
    skills = data.get('skills', '')
    
    # Length checks
    if len(summary) > 100:
        score += 5
    if len(experience) > 300:
        score += 10
    if len(education) > 100:
        score += 5
        
    # Content quality checks
    cv_text_lower = cv_text.lower()
    if "achieved" in cv_text_lower or "improved" in cv_text_lower:
        score += 10
    if any(word in cv_text_lower for word in ["led", "managed", "developed"]):
        score += 10
        
    # Skills check - safely handle missing or empty skills
    skills_count = len([s for s in skills.split(',') if s.strip()]) if skills else 0
    score += min(skills_count * 2, 10)  # Max 10 points for skills
        
    return min(score, 100)  # Cap at 100

def generate_improvement_suggestions(data, cv_text):
    """Generate AI-powered improvement suggestions"""
    suggestions = []
    
    # Check for common issues
    if len(data['summary']) < 50:
        suggestions.append("Your professional summary could be more detailed")
    if not any(char.isdigit() for char in data['experience']):
        suggestions.append("Add quantifiable achievements (e.g., 'Increased sales by 20%')")
    if "http" not in data.get('linkedin', '') and "http" not in data.get('github', ''):
        suggestions.append("Consider adding links to your professional profiles")
        
    # Formatting suggestions
    if "\n\n" not in cv_text:
        suggestions.append("Add more spacing between sections for better readability")
    if "**" not in cv_text and "*" not in cv_text:
        suggestions.append("Use bold/italic formatting to highlight key achievements")
        
    return suggestions[:5]  # Return top 5 suggestions
    
def coder(request):
    chat_history = request.session.get("chat_history", [])
    return render(request, "alphabot/coder.html")


# Chat-related API views
@csrf_exempt
def coder_reset_chat(request):
    if request.user.is_authenticated:
        Message.objects.filter(user=request.user, chat_type="coder").delete()  # Only coder messages
        return JsonResponse({"status": "Chat reset."})
    return JsonResponse({"error": "Unauthorized"}, status=401)

@csrf_exempt
def coder_history(request):
    if request.user.is_authenticated:
        messages = Message.objects.filter(user=request.user, chat_type="coder").order_by("timestamp")  # Only coder messages
        history = [{"sender": msg.sender, "text": msg.text} for msg in messages]
        return JsonResponse({"history": history})
    return JsonResponse({"error": "Unauthorized"}, status=401)

@login_required
@csrf_exempt
def coder_chat_api(request):
    if request.method == "POST":
        try:
            if not request.user.is_authenticated:
                return JsonResponse({"error": "Unauthorized"}, status=401)

            data = json.loads(request.body)
            user_message = data.get("message", "")

            if not user_message:
                return JsonResponse({"error": "Message required"}, status=400)

            api_key = os.getenv("OPENROUTER_API_KEY")
            if not api_key:
                return JsonResponse({"error": "OpenRouter API key not set"}, status=500)

            # Retrieve past chat
            history = Message.objects.filter(user=request.user, chat_type="coder").order_by("timestamp")
            history_text = "\n".join([f"{m.sender}: {m.text}" for m in history])

            # Prompt template
            prompt = f"You are AlphaBot 🤖, a coding assistant. Chat history:\n{history_text}\nUser: {user_message}"

            # Model
            model = "deepseek/deepseek-chat:free"

            response = requests.post(
                "https://openrouter.ai/api/v1/chat/completions",
                headers={
                    "Authorization": f"Bearer {api_key}",
                    "Content-Type": "application/json"
                },
                json={
                    "model": model,
                    "messages": [
                        {"role": "system", "content": "You are AlphaBot, a coding genius who helps with anything related to coding in python, javascript or something else."},
                        {"role": "user", "content": prompt}
                    ]
                }
            )

            if response.status_code == 200:
                result = response.json()
                bot_reply = result["choices"][0]["message"]["content"]
            else:
                bot_reply = f"Error: {response.status_code} - {response.text}"

            Message.objects.create(user=request.user, sender="user", text=user_message, chat_type="coder")
            Message.objects.create(user=request.user, sender="AlphaBot", text=bot_reply, chat_type="coder")

            return JsonResponse({"response": bot_reply})

        except Exception as e:
            return JsonResponse({"error": str(e)}, status=500)

    return JsonResponse({"error": "Invalid method"}, status=405)


def content_writer(request):
    return render(request, "alphabot/content_writer.html")

@login_required
@csrf_exempt
def generate_content(request):
    if request.method != "POST":
        return JsonResponse({"error": "Invalid method"}, status=405)

    try:
        data = json.loads(request.body)
    except json.JSONDecodeError:
        return JsonResponse({"error": "Invalid JSON"}, status=400)

    topic = data.get("topic", "").strip()
    if not topic:
        return JsonResponse({"error": "Missing topic"}, status=400)

    api_key = os.getenv("OPENROUTER_API_KEY")
    if not api_key:
        return JsonResponse({"error": "Missing OpenRouter API key"}, status=500)

    try:
        response = requests.post(
            "https://openrouter.ai/api/v1/chat/completions",
            headers={
                "Authorization": f"Bearer {api_key}",
                "Content-Type": "application/json"
            },
            json={
                "model": "deepseek/deepseek-chat:free", 
                "messages": [
                    {"role": "system", "content": "You are a helpful writing assistant."},
                    {"role": "user", "content": f"Write a short, informative article on: {topic}"}
                ]
            }
        )

        if response.status_code == 200:
            result = response.json()
            content = result["choices"][0]["message"]["content"]
            return JsonResponse({"response": content})
        else:
            return JsonResponse({"error": f"API Error {response.status_code}: {response.text}"}, status=response.status_code)

    except Exception as e:
        return JsonResponse({"error": f"Server error: {str(e)}"}, status=500)


def script_writer(request):
    return render(request, "alphabot/script_writer.html")

@login_required
def generate_script(request):
    if request.method == "POST":
        try:
            data = json.loads(request.body)
            prompt = data.get("prompt")

            if not prompt:
                return JsonResponse({"error": "No prompt provided"}, status=400)

            headers = {
                "Authorization": f"Bearer {os.getenv('OPENROUTER_API_KEY')}",
                "Content-Type": "application/json"
            }

            body = {
                "model": "deepseek/deepseek-chat:free",
                "messages": [
                    {"role": "system", "content": "You are a professional scriptwriter for YouTube videos and short films."},
                    {"role": "user", "content": prompt}
                ]
            }

            response = requests.post("https://openrouter.ai/api/v1/chat/completions", headers=headers, json=body)

            if response.status_code == 200:
                reply = response.json()["choices"][0]["message"]["content"]
                return JsonResponse({"response": reply})
            else:
                return JsonResponse({"error": "OpenRouter API error"}, status=response.status_code)

        except Exception as e:
            return JsonResponse({"error": str(e)}, status=500)
    return JsonResponse({"error": "Invalid request"}, status=400)


def paraphraser_input(request):
    return render(request, "alphabot/paraphraser_input.html")

@csrf_exempt
def paraphraser_api(request):
    if request.method == "POST":
        try:
            data = json.loads(request.body)
            original_text = data.get("message", "").strip()

            if not original_text:
                return JsonResponse({"error": "No input provided."}, status=400)

            api_key = os.getenv("OPENROUTER_API_KEY")
            if not api_key:
                return JsonResponse({"error": "Missing OpenRouter API key."}, status=500)

            prompt = f"Paraphrase the following text clearly and concisely without emojis:\n\n{original_text}"

            response = requests.post(
                "https://openrouter.ai/api/v1/chat/completions",
                headers={
                    "Authorization": f"Bearer {api_key}",
                    "Content-Type": "application/json"
                },
                json={
                    "model": "qwen/qwen2.5-vl-3b-instruct:free",
                    "messages": [
                        {"role": "system", "content": "You are AlphaBot, a helpful paraphrasing assistant."},
                        {"role": "user", "content": prompt}
                    ]
                }
            )

            if response.status_code == 200:
                result = response.json()
                paraphrased = result["choices"][0]["message"]["content"]
                return JsonResponse({"response": paraphrased})
            else:
                return JsonResponse({"error": f"API Error: {response.status_code} - {response.text}"}, status=500)

        except Exception as e:
            return JsonResponse({"error": str(e)}, status=500)

    return JsonResponse({"error": "Only POST method allowed."}, status=405)






def register_view(request):
    if request.method == "POST":
        username = request.POST["username"]
        email = request.POST["email"]
        password = request.POST["password"]
        confirm = request.POST["confirm"]

        if password != confirm:
            messages.error(request, "Passwords do not match.")
            return render(request, "alphabot/register.html")

        if User.objects.filter(username=username).exists():
            messages.error(request, "Username already exists.")
            return render(request, "alphabot/register.html")

        user = User.objects.create_user(username=username, email=email, password=password)
        login(request, user)
        return redirect("index")

    return render(request, "alphabot/register.html")

def login_view(request):
    if request.method == "POST":
        username = request.POST["username"]
        password = request.POST["password"]

        user = authenticate(request, username=username, password=password)

        if user is not None:
            login(request, user)
            return redirect("index")
        else:
            messages.error(request, "Invalid credentials.")
            return render(request, "alphabot/login.html")

    return render(request, "alphabot/login.html")

def logout_view(request):
    logout(request)
    return redirect("index")  

def chat_view(request):
    chat_history = request.session.get("chat_history", [])
    return render(request, "alphabot/chat.html")

# Chat-related API views
@csrf_exempt
def reset_chat(request):
    if request.user.is_authenticated:
        Message.objects.filter(user=request.user, chat_type="chat").delete()  # Only chat messages
        return JsonResponse({"status": "Chat reset."})
    return JsonResponse({"error": "Unauthorized"}, status=401)

@csrf_exempt
def chat_history(request):
    if request.user.is_authenticated:
        messages = Message.objects.filter(user=request.user, chat_type="chat").order_by("timestamp")  # Only chat messages
        history = [{"sender": msg.sender, "text": msg.text} for msg in messages]
        return JsonResponse({"history": history})
    return JsonResponse({"error": "Unauthorized"}, status=401)


@csrf_exempt
def ai_chat_api(request):
    if request.method == "POST":
        try:
            if not request.user.is_authenticated:
                return JsonResponse({"error": "Unauthorized"}, status=401)

            data = json.loads(request.body)
            user_message = data.get("message", "")

            if not user_message:
                return JsonResponse({"error": "Message required"}, status=400)

            api_key = os.getenv("OPENROUTER_API_KEY")
            if not api_key:
                return JsonResponse({"error": "OpenRouter API key not set"}, status=500)

            # Retrieve past chat
            history = Message.objects.filter(user=request.user, chat_type="chat").order_by("timestamp")
            history_text = "\n".join([f"{m.sender}: {m.text}" for m in history])

            # Prompt template
            prompt = f"You are AlphaBot 🤖, a friendly and helpful assistant. Chat history:\n{history_text}\nUser: {user_message}"

            # Model
            model = "meta-llama/llama-4-maverick:free"

            response = requests.post(
                "https://openrouter.ai/api/v1/chat/completions",
                headers={
                    "Authorization": f"Bearer {api_key}",
                    "Content-Type": "application/json"
                },
                json={
                    "model": model,
                    "messages": [
                        {"role": "system", "content": "You are AlphaBot, a friendly assistant who helps with anything. You were created by Alphin a single person"},
                        {"role": "user", "content": prompt}
                    ]
                }
            )

            if response.status_code == 200:
                result = response.json()
                bot_reply = result["choices"][0]["message"]["content"]
            else:
                bot_reply = f"Error: {response.status_code} - {response.text}"

            Message.objects.create(user=request.user, sender="user", text=user_message, chat_type="chat")
            Message.objects.create(user=request.user, sender="AlphaBot", text=bot_reply, chat_type="chat")

            return JsonResponse({"response": bot_reply})

        except Exception as e:
            return JsonResponse({"error": str(e)}, status=500)

    return JsonResponse({"error": "Invalid method"}, status=405)
