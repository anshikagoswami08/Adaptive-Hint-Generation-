import os
import json
from openai import OpenAI

client = OpenAI(
    api_key=os.environ.get("GROQ_API_KEY"),
    base_url="https://api.groq.com/openai/v1",
)


def extract_questions_from_text(text: str):

    response = client.chat.completions.create(
        model="openai/gpt-oss-20b",
        messages=[
            {
                "role": "system",
                "content": (
                    "You are a strict JSON generator. "
                    "Return ONLY valid JSON array. "
                    "No explanation. No reasoning. No markdown.\n\n"
                    "Each object must contain:\n"
                    "- question\n"
                    "- topic (short category name)\n"
                    "- difficulty (Easy, Medium, Hard)"
                )
            },
            {
                "role": "user",
                "content": f"""
Identify all sentences in the text that represent a problem,
exercise, or request to solve something.

Also classify each question:
- topic: generate a short relevant category (e.g., DSA, math, science, etc.)
- difficulty: Easy, Medium, or Hard

Return strictly:

[
  {{
    "question": "question text",
    "topic": "short category",
    "difficulty": "Easy"
  }}
]

Text:
{text}
"""
            }
        ],
        temperature=0,
    )

    raw_output = response.choices[0].message.content.strip()

    try:
        return json.loads(raw_output)
    except json.JSONDecodeError:
        return {
            "error": "Invalid JSON returned",
            "raw": raw_output
        }