import os
import requests
from dotenv import load_dotenv

load_dotenv()

api_key = os.getenv("OPENROUTER_API_KEY")

response = requests.post(
    "https://openrouter.ai/api/v1/chat/completions",
    headers={
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json",
    },
    json={
        "model": "openrouter/free",
        "messages": [
            {
                "role": "system",
                "content": "You are AlphaBot, a helpful AI assistant.",
            },
            {
                "role": "user",
                "content": "Reply with exactly: Hello, I am AlphaBot!",
            },
        ],
    },
)

print("Status:", response.status_code)

data = response.json()

print("Model used:", data.get("model"))
print("Response:", data.get("choices", [{}])[0].get("message", {}).get("content"))