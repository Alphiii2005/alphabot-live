import os
import requests
from dotenv import load_dotenv

load_dotenv()

OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions"

DEFAULT_MODEL = "openrouter/free"


def generate_response(
    messages,
    model=DEFAULT_MODEL,
    temperature=0.7,
    timeout=30,
):
    api_key = os.getenv("OPENROUTER_API_KEY")

    if not api_key:
        raise ValueError("OPENROUTER_API_KEY is not configured.")

    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json",
        "HTTP-Referer": "http://127.0.0.1:8000/",
        "X-Title": "AlphaBot",
    }

    payload = {
        "model": model,
        "messages": messages,
        "temperature": temperature,
    }

    response = requests.post(
        OPENROUTER_URL,
        headers=headers,
        json=payload,
        timeout=timeout,
    )

    if response.status_code != 200:
        try:
            error_data = response.json()
            error_message = error_data.get("error", {}).get(
                "message",
                "Unknown OpenRouter error",
            )
        except ValueError:
            error_message = response.text

        raise RuntimeError(
            f"OpenRouter API error {response.status_code}: {error_message}"
        )

    result = response.json()

    try:
        return result["choices"][0]["message"]["content"]
    except (KeyError, IndexError):
        raise RuntimeError("OpenRouter returned an unexpected response.")