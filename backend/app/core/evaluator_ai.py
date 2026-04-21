import os
from openai import OpenAI

client = OpenAI(
    api_key=os.environ.get("GROQ_API_KEY"),
    base_url="https://api.groq.com/openai/v1",
)


def evaluate_with_ai(problem, user_code):

    prompt = f"""
    You are a strict coding judge.

    Problem Title:
    {problem.title}

    Problem Description:
    {problem.description}

    Student Code:
    {user_code}

    Analyze the code logically.

    Respond ONLY in this JSON format:

    {{
        "verdict": "correct" or "wrong",
        "score": number between 0 and 100,
        "feedback": "short explanation"
    }}

    Do not include anything outside JSON.
    """

    response = client.responses.create(
        model="openai/gpt-oss-20b",
        input=prompt,
        temperature=0.2,
    )

    return response.output_text
