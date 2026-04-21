import os
import json
from openai import OpenAI

client = OpenAI(
    api_key=os.environ.get("GROQ_API_KEY"),
    base_url="https://api.groq.com/openai/v1",
)


def generate_ai_response(message, last_problem=None):

    if last_problem:
        context_block = f"""
        Previous Problem:
        {last_problem}
        """
    else:
        context_block = "No previous problem."

    prompt = f"""
    You are an AI tutoring assistant.

    {context_block}

    User Message:
    {message}

    Your tasks:

    1. Classify the user message into one of:
       - new_problem
       - solution_attempt
       - general_chat

    2. If it is a new_problem:
       - Identify the topic (e.g., Algebra, Calculus, Geometry, DSA, Graphs, DP, Physics, etc.)
       - If topic is unclear, ask user to specify topic.
       - Ask the student to attempt their own solution first.
       - Do NOT give hints yet.

    3. If it is a solution_attempt:
       - Give a helpful hint only.
       - Do NOT reveal the full solution.
       - Keep the hint concise and guiding.

    4. If general_chat:
       - Ask what problem they would like help with.

    IMPORTANT:
    Return JSON format ONLY:
    {{
        "type": "...",
        "topic": "...",
        "response": "..."
    }}

    If no topic applies, return topic as null.
    """

    response = client.responses.create(
        model="openai/gpt-oss-20b",
        input=prompt,
        temperature=0.3,
    )

    try:
        return json.loads(response.output_text)
    except Exception:
        return {
            "type": "general_chat",
            "topic": None,
            "response": "I'm having trouble understanding. Could you please rephrase your question?"
        }
