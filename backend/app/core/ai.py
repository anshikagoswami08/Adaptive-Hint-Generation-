import os
from openai import OpenAI

client = OpenAI(
    api_key=os.environ.get("GROQ_API_KEY"),
    base_url="https://api.groq.com/openai/v1",
)


def generate_ai_hint(problem, mastery_score, attempt_count, user_code):

    if not os.environ.get("GROQ_API_KEY"):
        return "GROQ_API_KEY not configured."

    if mastery_score < 40:
        level = "beginner"
    elif mastery_score < 70:
        level = "intermediate"
    else:
        level = "advanced"

    prompt = f"""
    You are an adaptive AI tutor.

    Problem Title:
    {problem.title}

    Problem Description:
    {problem.description}

    Student mastery level: {mastery_score}%
    Attempt number: {attempt_count}

    Student's latest submission:
    {user_code}

    Generate a progressive hint suitable for a {level} learner.
    DO NOT give the full solution.
    Only guide the student.
    """

    response = client.responses.create(
        model="openai/gpt-oss-20b",  
        input=prompt,
        temperature=0.7,
    )

    return response.output_text


def generate_pdf_hint(question: str, level: int):

    level_instruction = {
        1: "Give a small directional hint without revealing approach.",
        2: "Give structured guidance with step breakdown.",
        3: "Give almost complete solution but do not reveal final answer."
    }.get(level, "Give helpful guidance.")

    prompt = f"""
You are an expert AI tutor.

Problem:
{question}

Generate a Level {level} hint.

Instructions:
- {level_instruction}
- Do NOT reveal final answer.
- Keep explanation clear and concise.
"""

    response = client.chat.completions.create(
        model="openai/gpt-oss-20b",
        messages=[
            {"role": "system", "content": "You are a helpful problem-solving tutor."},
            {"role": "user", "content": prompt}
        ],
        temperature=0.4,
    )


    return response.choices[0].message.content.strip()
