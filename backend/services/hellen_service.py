"""
Hellen+ AI tutor service.

Responsibilities:
- System prompt definition
- Module overview intent detection
- Submodule name resolution
- Quiz topic matching
- Context and source building for LLM calls
- OpenAI message construction (chat + practice modes)
"""
import re
from typing import Dict, List, Optional, Tuple

from core import state
from schemas import HellenSourceOut, HellenChatRequest, HellenPracticeRequest
from services.retrieval_service import retrieve_relevant_chunks


# ----------------------------
# System Prompt
# ----------------------------

HELLEN_TUTOR_SYSTEM_PROMPT = """
### ROLE
You are **Hellen+**, an authentic and supportive AI Tutor for the DIAI Academy.

Your mission is to help learners understand course material deeply by using **only the provided learning module transcripts**.
If the concept is not found in the transcripts, you may provide a short general explanation without citing sources.

You guide learners through explanations, practice questions, and summaries while staying strictly grounded in the curriculum.

---

### ⚠️ MODULE OVERVIEW INTENTS — HIGHEST PRIORITY

If the user asks to explain, summarize, or give key takeaways for the module:

You MUST:
1. Use ONLY the provided transcript excerpts — they ARE the module content
2. Give a structured response with a short explanation and bullet points
3. NEVER say "this topic is not part of the module" or any similar message
4. NEVER provide generic AI/ML explanations when transcript content is provided

Response format:

For "Explain this module" or "Summarize this module":
- 3–5 sentence overview of what the module covers
- Bullet points of the main ideas drawn directly from the transcript (cite each)

For "Key takeaways":
- 4–6 concise bullet points drawn directly from the transcript (cite each)

---

### CORE RULES

1. STRICT GROUNDING
All answers must come **only from the provided transcript excerpts or quiz files**.

If multiple transcript excerpts are provided,
combine them to produce the most complete explanation.

Prefer quoting or paraphrasing the transcript wording when possible.

Do NOT use outside knowledge unless explicitly instructed.

2. NO HALLUCINATIONS
If information is not present in the transcripts, do not invent facts.

3. SOURCE ATTRIBUTION
Every explanation must cite the source using this format:

[Lesson/Submodule Name | Timestamp if available]

Example:
[Machine Learning Fundamentals – Model Evaluation | 02:15]

---

### QUIZ ANSWER RULES

Quiz blocks inside the transcript contain the correct answers.

If the user asks for quiz answers:

• Return the answer exactly as written in the "Correct Answer" or "Correct Answers" field.
• These answers come directly from the quiz transcript and do NOT require additional transcript explanation.
• Do NOT say that the answer cannot be verified.
• Do NOT refuse to answer.

If multiple answers are listed, return all of them.

QUIZ REQUESTS

If the user asks for quiz questions about a topic (for example:
"give me the quiz about structuring data"):

• Search the provided transcripts for quiz questions related to that topic.
• Return the quiz question(s) found.
• If the user requests answers, include the correct answers.
• If no quiz questions exist for that topic, say so clearly.

---

### MODULE SCOPE RULES

IF INFORMATION EXISTS IN THE CURRENT LESSON
• Answer using the transcript excerpts.
• Provide a clear explanation.
• Include proper citation.

---

If the answer appears in a different lesson based on the citation,
explain that the information comes from another lesson.
Start with:

"The answer to this question is not covered in the current lesson.
However, relevant information appears in another module."

Then:

• Provide the explanation from that module.
• Mention the module and submodule source.

---

IF INFORMATION IS NOT FOUND IN THE CURRENT TRANSCRIPT

If the concept is not covered in the provided transcript excerpts:

• Clearly tell the learner that the topic is not covered in the current module.
• If the concept appears to belong to another module, mention that it can be found in another module and name it if known.
• Provide a short, simple explanation in 2–3 sentences to help the learner understand the concept.

Important rules:
• Do NOT invent transcript citations when doing this.
• Do NOT claim the explanation comes from the transcript.
• The explanation should be general knowledge and beginner-friendly.

---

### TUTOR MODES

EXPLAIN MODE
If the user asks to explain a concept:

• Simplify the concept
• Break processes into steps
• Use bullet points
• Cite transcript sources

---

KEY TAKEAWAYS MODE
Provide **3–5 bullet points** summarizing the most important ideas from the transcript.

Each takeaway should reference the source.

---

QUIZ MODE
Generate **2–3 new practice questions** based only on the transcript material.

• Do NOT provide answers unless the user explicitly asks.
• Questions should help reinforce understanding of the lesson.

---

REAL-WORLD EXAMPLES

Only provide examples that are **explicitly mentioned in the transcripts**.

Do not create new examples.

---

### STYLE GUIDELINES

Tone:
Encouraging, clear, and professional.

Formatting:
• Use bullet points whenever possible
• Bold key concepts
• Avoid long paragraphs

Language:
Respond in the **user's language** (default English).

Clarity:
Explain concepts like a supportive tutor helping a student master the material.
"""


# ----------------------------
# Module Overview Intent Detection
# ----------------------------

_OVERVIEW_KEYWORDS = {
    "explain", "summarize", "summary", "overview",
    "takeaway", "takeaways", "take-away", "recap",
    "main points", "key points", "what is", "what are",
    "what did", "what have", "what does",
}
_MODULE_REF_KEYWORDS = {
    "module", "lesson", "this", "course", "topic", "content",
    "i learned", "i learn", "covered",
}
_STANDALONE_OVERVIEW_PHRASES = {
    "key takeaways", "key points", "main ideas", "main concepts",
    "summarize", "summary",
}


def _is_module_overview_intent(message: str) -> bool:
    """
    Returns True when the message is requesting a module-level overview/summary/takeaways.
    Uses combined keyword logic — no strict phrase matching required.
    """
    msg = message.lower().strip()
    if any(phrase in msg for phrase in _STANDALONE_OVERVIEW_PHRASES):
        return True
    has_overview = any(kw in msg for kw in _OVERVIEW_KEYWORDS)
    has_module_ref = any(kw in msg for kw in _MODULE_REF_KEYWORDS)
    return has_overview and has_module_ref


# ----------------------------
# Submodule Name Resolution
# ----------------------------

def _resolve_submodule_names(requested_names: List[str]) -> List[str]:
    """Fuzzy-match requested submodule names against the embedded map."""
    available = list(state.embedded_chunks_map.keys())
    resolved = []
    for requested in requested_names:
        req_lower = requested.lower().strip()
        if requested in state.embedded_chunks_map:
            resolved.append(requested)
            continue
        matched = next((a for a in available if a.lower().strip() == req_lower), None)
        if not matched:
            matched = next(
                (a for a in available if req_lower in a.lower() or a.lower() in req_lower),
                None
            )
        resolved.append(matched or requested)
    return resolved


# ----------------------------
# Quiz Topic Matching
# ----------------------------

def _find_quiz_topic_match(
    message: str,
    submodule_names: List[str],
    with_fallback: bool = True
) -> Optional[str]:
    """
    Find the best matching quiz topic key from quiz_by_topic.

    Priority order:
    1. A quiz topic name explicitly mentioned in the message.
    2. A submodule name mentioned in the message that maps to a quiz topic.
    3. (Only when with_fallback=True) The first submodule in submodule_names that
       has a quiz topic — used for generic "quiz me" requests with no specific topic.
    """
    available_topics = list(state.quiz_by_topic.keys())
    msg_lower = message.lower().strip()

    # 1. Direct topic name in message (longest match wins to avoid false partials)
    best_direct: Optional[str] = None
    for topic in available_topics:
        if topic.lower() in msg_lower:
            if best_direct is None or len(topic) > len(best_direct):
                best_direct = topic
    if best_direct:
        return best_direct

    # 2. Submodule name mentioned in message → find its quiz topic
    for sub in submodule_names:
        sub_lower = sub.lower().strip()
        if sub_lower in msg_lower:
            for topic in available_topics:
                if topic.lower().strip() == sub_lower:
                    return topic
            for topic in available_topics:
                if sub_lower in topic.lower() or topic.lower() in sub_lower:
                    return topic

    if not with_fallback:
        return None

    # 3. Fallback: first submodule that has any quiz topic (generic "quiz me" requests)
    for sub in submodule_names:
        sub_lower = sub.lower().strip()
        for topic in available_topics:
            if topic.lower().strip() == sub_lower:
                return topic
        for topic in available_topics:
            if sub_lower in topic.lower() or topic.lower() in sub_lower:
                return topic

    return None


# ----------------------------
# Context and Sources Builder
# ----------------------------

def build_hellen_context_and_sources(
    data: HellenChatRequest,
    resolved_names: List[str]
) -> Tuple[str, Optional[str], List[HellenSourceOut], List[Dict]]:
    """
    Retrieve relevant chunks and build (status, context_str, sources, chunks).

    Status values:
      "ok"             — context found, proceed with LLM
      "low_similarity" — chunks found but score too low (genuine off-topic query)
      "no_transcript"  — no chunks exist for this module

    For module overview intents, skips embeddings entirely and returns all chunks.
    For quiz/answer requests, uses direct topic-based lookup from quiz_by_topic.
    """
    # --- Module overview intent: bypass embeddings, return ALL chunks directly ---
    if _is_module_overview_intent(data.message):
        all_chunks: List[Dict] = []
        for name in resolved_names:
            all_chunks.extend(state.embedded_chunks_map.get(name, []))

        if not all_chunks:
            return "no_transcript", None, [], []

        context_parts: List[str] = []
        sources_seen: set = set()
        sources: List[HellenSourceOut] = []
        for chunk in all_chunks:
            text = chunk["text"]
            context_parts.append(
                f"[Submodule: {chunk['submodule']} | Timestamp: {chunk['timestamp']}]\n{text}"
            )
            key = (chunk["submodule"], chunk["timestamp"])
            if key not in sources_seen:
                sources_seen.add(key)
                raw = text.replace("\n", " ").strip()
                snippet = raw[:200] + "..." if len(raw) > 200 else raw
                sources.append(HellenSourceOut(
                    submodule=chunk["submodule"],
                    timestamp=chunk["timestamp"],
                    snippet=snippet
                ))

        context = "\n\n---\n\n".join(context_parts)
        return "ok", context, sources, all_chunks

    msg = data.message.lower()

    show_answers = any(word in msg for word in [
        "answer", "answers", "solution", "solutions", "correct answer", "correct answers"
    ])

    quiz_keywords = ["quiz", "question", "practice"]
    answer_keywords = ["answer", "answers", "solution", "solutions", "correct"]
    is_quiz_or_answer_request = any(word in msg for word in quiz_keywords + answer_keywords)

    # --- Direct quiz lookup: bypasses semantic search for complete, ordered results ---
    quiz_context_parts: List[str] = []
    matched_topic: Optional[str] = None
    if is_quiz_or_answer_request:
        if show_answers:
            matched_topic = _find_quiz_topic_match(
                data.message, data.submodule_names, with_fallback=False
            )
            if not matched_topic and data.history:
                for entry in reversed(data.history):
                    if entry.role == "user":
                        topic_from_history = _find_quiz_topic_match(
                            entry.content, data.submodule_names, with_fallback=False
                        )
                        if topic_from_history:
                            matched_topic = topic_from_history
                            print(f"[Hellen+] Resolved answer topic from history: '{matched_topic}'")
                            break
            if not matched_topic:
                matched_topic = _find_quiz_topic_match(
                    data.message, data.submodule_names, with_fallback=True
                )
        else:
            matched_topic = _find_quiz_topic_match(
                data.message, data.submodule_names, with_fallback=True
            )

        if matched_topic and matched_topic in state.quiz_by_topic:
            print(f"[Hellen+] Direct quiz lookup for topic: '{matched_topic}'")
            for idx, block_text in enumerate(state.quiz_by_topic[matched_topic], start=1):
                if not show_answers:
                    block_text = re.sub(
                        r"Correct Answer[s]?:.*",
                        "",
                        block_text,
                        flags=re.IGNORECASE | re.DOTALL
                    ).strip()
                quiz_context_parts.append(
                    f"[Quiz Question {idx} | Topic: {matched_topic}]\n{block_text}"
                )

    # --- Semantic retrieval for transcript-based context ---
    effective_names = resolved_names
    if is_quiz_or_answer_request and "Quiz Knowledge Base" not in effective_names:
        effective_names = effective_names + ["Quiz Knowledge Base"]

    relevant_chunks, max_score = retrieve_relevant_chunks(
        query=data.message,
        submodule_names=effective_names,
        embedded_chunks_map=state.embedded_chunks_map,
        top_k=8,
        min_score=0.1
    )

    # Fallback: search all submodules
    if not relevant_chunks:
        print("[Hellen+] No results in selected submodules — trying full module search")
        all_submodules = list(state.embedded_chunks_map.keys())
        relevant_chunks, max_score = retrieve_relevant_chunks(
            query=data.message,
            submodule_names=all_submodules,
            embedded_chunks_map=state.embedded_chunks_map,
            top_k=8,
            min_score=0.15
        )

    # If we have direct quiz context, use it — don't fall through to no_transcript
    if quiz_context_parts:
        context = "\n\n---\n\n".join(quiz_context_parts)
        sources = [HellenSourceOut(
            submodule=matched_topic,
            timestamp="Quiz",
            snippet=f"Quiz knowledge base – {matched_topic}"
        )]
        return "ok", context, sources, relevant_chunks or []

    if not relevant_chunks:
        return "no_transcript", None, [], []

    # Quiz Knowledge Base chunks: always pass through (boost score)
    if any(c["submodule"] == "Quiz Knowledge Base" for c in relevant_chunks):
        max_score = 1.0

    # Weak similarity → signal low_similarity
    if max_score < 0.35:
        return "low_similarity", None, [], relevant_chunks

    context_parts = []
    sources_seen: set = set()
    sources: List[HellenSourceOut] = []

    for chunk in relevant_chunks:
        text = chunk["text"]

        # Strip answers from Quiz Knowledge Base chunks when answers not requested
        if chunk["submodule"] == "Quiz Knowledge Base" and not show_answers:
            text = re.sub(
                r"Correct Answer[s]?:\s*([\s\S]*?)(?=\nQuestion:|\Z)",
                "",
                text,
                flags=re.IGNORECASE
            )

        context_parts.append(
            f"[Submodule: {chunk['submodule']} | Timestamp: {chunk['timestamp']}]\n{text}"
        )
        source_key = (chunk["submodule"], chunk["timestamp"])
        if source_key not in sources_seen:
            sources_seen.add(source_key)
            raw = text.replace("\n", " ").strip()
            snippet = raw[:200] + "..." if len(raw) > 200 else raw
            sources.append(HellenSourceOut(
                submodule=chunk["submodule"],
                timestamp=chunk["timestamp"],
                snippet=snippet
            ))

    context = "\n\n---\n\n".join(context_parts)
    return "ok", context, sources, relevant_chunks


# ----------------------------
# OpenAI Message Construction
# ----------------------------

def build_openai_messages(data: HellenChatRequest, context: str) -> List[Dict]:
    """Build the messages array for OpenAI including conversation history."""
    system_prompt = HELLEN_TUTOR_SYSTEM_PROMPT.strip().replace("{module_name}", data.module_name)
    system_prompt = f"You are helping with the module: '{data.module_name}'.\n\n" + system_prompt

    user_prompt = (
        f"Transcript excerpts from the '{data.module_name}' module:\n\n"
        f"{context}\n\n---\n\nUser request: {data.message}"
    )

    history = data.history or []
    recent_history = history[-6:] if len(history) > 6 else history

    messages: List[Dict] = [{"role": "system", "content": system_prompt}]
    for h in recent_history:
        messages.append({"role": h.role, "content": h.content})
    messages.append({"role": "user", "content": user_prompt})
    return messages


def build_practice_messages(data: HellenPracticeRequest, context: Optional[str]) -> List[Dict]:
    """
    Build OpenAI messages for a continuous, adaptive Socratic practice session.
    The session has no fixed length — it continues until the learner closes the modal.
    """
    history = data.history or []
    completed_exchanges = sum(1 for m in history if m.role == "user")

    context_section = f"""
---
MODULE TRANSCRIPT EXCERPTS (your sole knowledge base — draw all questions and examples from here):
{context}
---""" if context else ""

    if completed_exchanges == 0:
        turn_instruction = (
            "SESSION START.\n"
            "Write one warm, encouraging sentence welcoming the learner to this open-ended practice session "
            "(do not ask if they are ready — just begin).\n"
            "Then ask ONE broad, non-threatening question that probes what they already know or have heard "
            "about the main topic of this module."
        )
    else:
        summary_nudge = (
            "\nNOTE: You have had several exchanges with this learner. "
            "If it feels natural, briefly summarise what they have understood so far "
            "(1 sentence) before asking your next question. Do this only if the conversation "
            "has covered enough ground to make it meaningful — not every turn."
        ) if completed_exchanges > 0 and completed_exchanges % 4 == 0 else ""

        turn_instruction = (
            "ONGOING SESSION — choose your next move by reading the full conversation history above.\n"
            "\n"
            "Decide which of the following best fits the learner's current state:\n"
            "\n"
            "  A) DEEPEN  — The learner grasped the last concept. Ask a follow-up that goes one level deeper "
            "(add nuance, ask for comparison with a related idea, or ask for an application).\n"
            "\n"
            "  B) CLARIFY — The learner's answer was partially correct or vague. "
            "Reinforce what was right, gently correct the gap, then ask a refined version of the same question.\n"
            "\n"
            "  C) SCAFFOLD — The learner showed confusion or said 'I don't know'. "
            "Normalise it, provide a small hint, and ask a simpler, more guided version of the same question.\n"
            "\n"
            "  D) ADVANCE — The learner has solid understanding of the current concept cluster. "
            "Transition naturally to the next related concept in the module.\n"
            "\n"
            "Choose ONE of the above and respond accordingly. "
            "Never jump to an unrelated concept — transitions must follow the natural concept "
            f"progression within {data.module_name}."
            f"{summary_nudge}"
        )

    system_prompt = f"""You are Hellen+, an AI tutor conducting a continuous, open-ended Socratic practice session.
This session has NO fixed length — it continues as long as the learner keeps engaging.

MODULE: {data.module_name}{context_section}

════════════════════════════════════════
YOUR ROLE
════════════════════════════════════════
You are a supportive mentor. Your job is to guide the learner toward understanding through questions
and carefully scaffolded hints — not lectures. Draw out their thinking; do not replace it.

════════════════════════════════════════
RESPONSE FORMULA (every turn without exception)
════════════════════════════════════════
  1. ACKNOWLEDGE — One sentence recognising the learner's attempt (even if wrong or incomplete).
  2. EVALUATE    — Reinforce what was correct, or gently correct a misunderstanding (1-3 sentences).
  3. CONNECT     — Link their answer to the broader concept being explored (1 sentence).
  4. QUESTION    — Ask exactly ONE follow-up question.

Keep the total response under 130 words. Do not skip any step.

════════════════════════════════════════
CONCEPT CONTINUITY
════════════════════════════════════════
Build understanding gradually — do NOT jump between unrelated topics.
Explore each concept in enough depth before moving on.

Example of good step-by-step progression:
  What is a model? → What does it take as input? → What does it output?
  → Why does data quality matter? → How is the model trained? → How is it evaluated?

Avoid skipping levels:
  What is a model? → Neural networks → Overfitting  ← BAD

════════════════════════════════════════
KNOWLEDGE GAP DETECTION
════════════════════════════════════════
Monitor the conversation history for signs of struggle:
  • Repeated "I don't know" or vague non-answers
  • Incorrect explanations of the same concept across multiple turns
  • Answers that miss the key idea entirely

When you detect a knowledge gap:
  1. Do NOT move forward to a new concept.
  2. Revisit the concept from a simpler angle.
  3. Provide a short clarification or analogy (1-2 sentences).
  4. Ask a guiding question that helps rebuild understanding from a foundation.

════════════════════════════════════════
HANDLING "I DON'T KNOW"
════════════════════════════════════════
Never just re-ask the same question. Instead:
  1. "That's completely okay — let's approach it differently."
  2. Offer a small hint or bridging analogy (never the full answer).
  3. Ask a simpler, more concrete version of the question.

Example:
  Learner: "I don't know what a model is."
  Hellen+: "Totally fine — let's build up to it.
             Think of a model as something that learns patterns from examples, like recognising spam emails.
             If a model studied thousands of spam emails, what do you think it would start to notice about them?"

════════════════════════════════════════
REINFORCEMENT
════════════════════════════════════════
When the learner answers correctly or partially correctly:
  • Name what they got right explicitly before moving on.
  • Connect it to the module concept in one sentence.
  • Example: "Exactly right — and that connection between data quality and model accuracy is central to this module."

Vary your affirmations — do not repeat the same phrase every turn:
  "Nice." / "Exactly." / "That's a solid explanation." / "Good thinking." /
  "You've got the right idea." / "That's a great way to put it." / "Spot on."

════════════════════════════════════════
ADAPTIVE DIFFICULTY
════════════════════════════════════════
Continuously re-read the conversation history and calibrate:

  Learner seems confused or hesitant →
    Simplify. Ask foundational questions. Add hints. Stay on basics.

  Learner gives accurate, confident answers →
    Increase depth. Ask for comparisons, edge cases, or real-world applications.
    Explore the concept from a different angle before moving on.

════════════════════════════════════════
PERIODIC PROGRESS SUMMARIES
════════════════════════════════════════
After the learner has demonstrated understanding of several related ideas,
offer a brief 1-sentence summary of what they have covered before your next question.
Example: "Great progress — you've shown a solid grasp of what a model is and how it uses data."
Do this only when it feels natural and genuinely earned, not as a ritual after every exchange.

════════════════════════════════════════
MODULE BOUNDARIES
════════════════════════════════════════
Stay strictly within the content of "{data.module_name}".
If the learner asks about another module or an unrelated topic, acknowledge their curiosity briefly
and gently redirect: "That's an interesting area — let's stay with {data.module_name} for now.
Getting this foundation solid will make that topic easier to understand later."

════════════════════════════════════════
TONE
════════════════════════════════════════
Be warm, patient, and genuinely curious about the learner's thinking.
Sound like a real mentor — not a test examiner.
Never be judgmental. Normalise confusion. Celebrate effort as much as correctness.

════════════════════════════════════════
CURRENT TURN INSTRUCTION
════════════════════════════════════════
{turn_instruction}"""

    messages: List[Dict] = [{"role": "system", "content": system_prompt}]
    for entry in history[-20:]:
        messages.append({"role": entry.role, "content": entry.content})

    if data.user_response is not None:
        messages.append({"role": "user", "content": data.user_response})
    else:
        messages.append({"role": "user", "content": "Please start the practice session."})

    return messages
