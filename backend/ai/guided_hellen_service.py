import os
import requests
from dotenv import load_dotenv

load_dotenv()


def generate_guided_message(topic: str, subtopic: str, previous_answers: list[str], step: int) -> str:
    """
    Generate a micro-teaching message for the Guided Hellen+ flow.
    Called for steps 3, 4, and 5 (step param is 3, 4, or 5).

    Step 3: Briefly explain the subtopic, ask if it makes sense.
    Step 4: Adapt based on previous answer — simplify if confused, go deeper if understood.
    Step 5: Continue adaptive explanation, then recommend creating a learning path.

    Returns the full teaching response (explanation + follow-up question or recommendation).
    """
    api_key = os.getenv("AZURE_OPENAI_API_KEY")
    azure_endpoint = os.getenv("AZURE_OPENAI_ENDPOINT")
    deployment = os.getenv("AZURE_OPENAI_DEPLOYMENT")
    api_version = os.getenv("AZURE_OPENAI_API_VERSION")

    openai_url = f"{azure_endpoint}/deployments/{deployment}/chat/completions?api-version={api_version}"

    formatted_answers = "\n".join(
        [f"Answer {i+1}: {ans}" for i, ans in enumerate(previous_answers)]
    ) if previous_answers else "None yet."

    last_answer = previous_answers[-1].lower().strip() if previous_answers else ""

    step_instruction = {
        3: (
            "Explain the subtopic in 1-2 simple sentences. "
            "Then ask: 'Does this explanation make sense to you?'"
        ),
        4: (
            f"The learner's last response was: '{last_answer}'. "
            "Decide whether they understood or not. "
            "If they did NOT understand (said no, confused, not really, etc.): re-explain using a simple analogy in 1-2 sentences, then ask 'Does this explanation make more sense?' "
            "If they DID understand (said yes, makes sense, got it, etc.): introduce one slightly deeper concept in 1-2 sentences, then ask 'Does this deeper explanation still make sense?'"
        ),
        5: (
            f"The learner's last response was: '{last_answer}'. "
            "Decide whether they understood or not. "
            "If they did NOT understand: simplify once more with an analogy in 1-2 sentences. "
            "If they DID understand: add one more layer of depth in 1-2 sentences. "
            "Then — regardless of understanding — end with this recommendation: "
            "'To fully understand this topic step-by-step, the best approach is to create a learning path. "
            "A learning path will guide you through structured modules covering this topic in depth. "
            "Inside each lesson, Guided Hellen+ will also be available so you can ask questions whenever something is unclear.'"
        ),
    }

    system_prompt = f"""You are Guided Hellen+, an AI tutor helping learners explore a topic before they create a learning path.

Your goal is to teach a concept gradually and check whether the learner understands.

Rules:
- Explain concepts in simple, plain language
- Keep explanations short: 1–3 sentences maximum
- Do NOT use labels like "Explanation:" or "Question:"
- Do NOT start with preamble like "Of course!" or "Sure!"
- Respond naturally, as a friendly tutor would
- Always end with exactly one question OR the final recommendation (for step 5)

Context:
Topic: {topic}
Subtopic: {subtopic}
Previous answers: {formatted_answers}
Current step: {step} of 5

Instruction for this step: {step_instruction.get(step, "")}"""

    messages = [
        {"role": "system", "content": system_prompt},
        {"role": "user", "content": "Generate the response for this step."}
    ]

    headers = {
        "Content-Type": "application/json",
        "api-key": api_key
    }
    body = {
        "messages": messages,
        "temperature": 0.5,
        "max_tokens": 300,
        "stream": False
    }

    response = requests.post(openai_url, headers=headers, json=body, timeout=30)
    response.raise_for_status()

    data = response.json()
    return data["choices"][0]["message"]["content"].strip()
