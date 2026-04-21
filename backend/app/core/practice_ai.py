import os
from openai import OpenAI

client = OpenAI(
    api_key=os.environ.get("GROQ_API_KEY"),
    base_url="https://api.groq.com/openai/v1",
)


def generate_practice_problem(topic, mastery_score):

    if mastery_score < 40:
        difficulty = "easy"
    elif mastery_score < 70:
        difficulty = "medium"
    else:
        difficulty = "hard"

    prompt = f"""
    You are an AI coding tutor.

    Generate a NEW coding practice problem.

    Topic: {topic}
    Difficulty level: {difficulty}
    Student mastery level: {mastery_score}%

    Provide output strictly in this format:

    Title: <title>
    Description: <problem description>
    Input Format: <input format>
    Output Format: <output format>
    Constraints: <constraints>

    Do NOT provide solution.
    """

    response = client.responses.create(
        model="openai/gpt-oss-20b",
        input=prompt,
        temperature=0.8,
    )

    return response.output_text
