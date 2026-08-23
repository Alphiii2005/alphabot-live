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

    try:
        response = requests.post(
            OPENROUTER_URL,
            headers=headers,
            json=payload,
            timeout=timeout,
        )
    except requests.Timeout:
        raise RuntimeError(
            "AlphaBot took too long to respond. Please try again."
        )
    except requests.RequestException:
        raise RuntimeError(
            "Unable to connect to the AI service. Please try again later."
        )

    if response.status_code != 200:
        try:
            error_data = response.json()
            error_message = error_data.get(
                "error",
                {}
            ).get(
                "message",
                "The AI service returned an error."
            )
        except ValueError:
            error_message = "The AI service returned an invalid response."

        raise RuntimeError(
            f"OpenRouter API error {response.status_code}: {error_message}"
        )

    try:
        result = response.json()
    except ValueError:
        raise RuntimeError(
            "The AI service returned an invalid response."
        )

    try:
        choices = result.get("choices", [])

        if not choices:
            raise RuntimeError(
                "No response was generated. Please try again."
            )

        message = choices[0].get("message", {})
        content = message.get("content")

        if not content or not content.strip():
            raise RuntimeError(
                "The AI generated an empty response. Please try again."
            )

        return content.strip()

    except (AttributeError, IndexError, KeyError) as error:
        raise RuntimeError(
            "The AI returned an unexpected response. Please try again."
        ) from error