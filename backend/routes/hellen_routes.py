"""
Hellen+ AI tutor endpoints.

Endpoints:
  POST /hellen-chat
  POST /hellen-chat-stream
  POST /hellen-practice-stream
  POST /guided-hellen/next-question
"""
import json
import os

import requests as http_requests
from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse as FastAPIStreamingResponse

from ai.guided_hellen_service import generate_guided_message
from schemas import (
    GuidedHellenRequest,
    HellenChatRequest,
    HellenChatResponse,
    HellenPracticeRequest,
)
from services.hellen_service import (
    _is_module_overview_intent,
    _resolve_submodule_names,
    build_hellen_context_and_sources,
    build_openai_messages,
    build_practice_messages,
)
from utils.helpers import detect_module_from_submodule

router = APIRouter(tags=["hellen"])


def _azure_url() -> tuple[str, str, dict]:
    """Return (openai_url, deployment, headers) from environment variables."""
    api_key = os.getenv("AZURE_OPENAI_API_KEY")
    azure_endpoint = os.getenv("AZURE_OPENAI_ENDPOINT")
    deployment = os.getenv("AZURE_OPENAI_DEPLOYMENT")
    api_version = os.getenv("AZURE_OPENAI_API_VERSION")
    url = f"{azure_endpoint}/deployments/{deployment}/chat/completions?api-version={api_version}"
    headers = {"Content-Type": "application/json", "api-key": api_key}
    return url, deployment, headers


@router.post("/hellen-chat", response_model=HellenChatResponse)
def hellen_chat(data: HellenChatRequest):
    """Module-specific AI tutor using semantic transcript retrieval."""

    resolved_names = _resolve_submodule_names(data.submodule_names)
    status, context, sources, chunks = build_hellen_context_and_sources(data, resolved_names)

    # Detect if ALL retrieved chunks come from outside the current module's submodules.
    # "Quiz Knowledge Base" is module-agnostic and never triggers cross-module detection.
    if chunks:
        current_submodule_set = set(data.submodule_names)
        in_module = [
            c for c in chunks
            if c["submodule"] in current_submodule_set or c["submodule"] == "Quiz Knowledge Base"
        ]
        out_of_module = [
            c for c in chunks
            if c["submodule"] not in current_submodule_set and c["submodule"] != "Quiz Knowledge Base"
        ]

        # Only fire cross-module when every chunk is from another module
        if out_of_module and not in_module:
            foreign_submodule = out_of_module[0]["submodule"]
            suggested_module = detect_module_from_submodule(foreign_submodule)
            if suggested_module == "Another AI Learning Module":
                suggested_module = foreign_submodule

            return HellenChatResponse(
                response=(
                    f"This question is not covered in the current module: **{data.module_name}**.\n\n"
                    f"You can find it in the module: **{suggested_module}**.\n\n"
                    "Here is a short explanation from that module:"
                ),
                sources=sources or []
            )

    # Handle non-"ok" statuses
    if status != "ok":

        # Module overview with no transcript loaded → clear error, no fallback
        if _is_module_overview_intent(data.message):
            return HellenChatResponse(
                response=(
                    "⚠️ **Module content not loaded.**\n\n"
                    "The transcript for this module hasn't been loaded yet. "
                    "Please try again after the module content is available."
                ),
                sources=[]
            )

        suggested_module = None

        if chunks:
            modules_found = {
                detect_module_from_submodule(c["submodule"])
                for c in chunks
            }
            if modules_found:
                suggested_module = list(modules_found)[0]

        module_hint = (
            f"This topic is typically covered in the module: {suggested_module}."
            if suggested_module else ""
        )

        messages = [
            {
                "role": "system",
                "content": (
                    f"You are Hellen+, an AI tutor.\n\n"
                    f"The user's question is NOT covered in the current module: {data.module_name}.\n\n"
                    f"{module_hint}\n\n"
                    "Explain the concept briefly in 2–3 simple sentences.\n\n"
                    "Start by telling the user that the topic is not part of this module.\n"
                    "Then give a short simple explanation anyway.\n\n"
                    "Keep the explanation clear and beginner-friendly."
                )
            },
            {"role": "user", "content": data.message}
        ]

        openai_url, _, headers = _azure_url()
        body = {"messages": messages, "temperature": 0.2, "max_tokens": 200}
        response = http_requests.post(openai_url, headers=headers, json=body, timeout=30)
        ai_response = response.json()["choices"][0]["message"]["content"]
        return HellenChatResponse(response=ai_response, sources=[])

    messages = build_openai_messages(data, context)
    openai_url, _, headers = _azure_url()
    body = {"messages": messages, "temperature": 0, "max_tokens": 1000}

    try:
        response = http_requests.post(openai_url, headers=headers, json=body, timeout=30)
        if response.status_code != 200:
            raise HTTPException(status_code=502, detail=f"Azure OpenAI error: {response.status_code}")
        ai_response = response.json()["choices"][0]["message"]["content"]
        return HellenChatResponse(response=ai_response, sources=sources)
    except http_requests.exceptions.Timeout:
        raise HTTPException(status_code=504, detail="AI request timed out")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Hellen+ error: {str(e)}")


@router.post("/hellen-chat-stream")
def hellen_chat_stream(data: HellenChatRequest):
    """
    Streaming version of /hellen-chat.
    Emits Server-Sent Events:
      data: {"type": "sources", "sources": [...]}   <- sent first
      data: {"type": "token", "content": "..."}     <- one per token
      data: {"type": "done"}                        <- stream complete
      data: {"type": "no_content"}                  <- when nothing found
      data: {"type": "error", "detail": "..."}      <- on error
    """
    resolved_names = _resolve_submodule_names(data.submodule_names)
    status, context, sources, _ = build_hellen_context_and_sources(data, resolved_names)

    # Module overview with no transcript loaded → stream a clear error, skip LLM
    if status != "ok" and _is_module_overview_intent(data.message):
        no_transcript_msg = (
            "⚠️ **Module content not loaded.**\n\n"
            "The transcript for this module hasn't been loaded yet. "
            "Please try again after the module content is available."
        )

        def _no_transcript_stream():
            yield f"data: {json.dumps({'type': 'sources', 'sources': []})}\n\n"
            yield f"data: {json.dumps({'type': 'token', 'content': no_transcript_msg})}\n\n"
            yield f"data: {json.dumps({'type': 'done'})}\n\n"

        return FastAPIStreamingResponse(
            _no_transcript_stream(),
            media_type="text/event-stream",
            headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no"}
        )

    if status != "ok":
        messages = [
            {
                "role": "system",
                "content": (
                    f"You are Hellen+, an AI tutor.\n\n"
                    f"The user's question is NOT covered in the current module: {data.module_name}.\n\n"
                    "Explain the concept briefly in 2–3 simple sentences.\n\n"
                    "Start by telling the user that the topic is not part of this module.\n"
                    "Then give a short simple explanation anyway.\n\n"
                    "Keep the explanation clear and beginner-friendly."
                )
            },
            {"role": "user", "content": data.message}
        ]
        sources = []
    else:
        messages = build_openai_messages(data, context)

    sources_payload = [
        {"submodule": s.submodule, "timestamp": s.timestamp, "snippet": s.snippet}
        for s in sources
    ]

    openai_url, _, headers = _azure_url()
    body = {
        "messages": messages,
        "temperature": 0,
        "max_tokens": 1000,
        "stream": True
    }

    def event_stream():
        # Send sources first so the frontend can display them immediately
        yield f"data: {json.dumps({'type': 'sources', 'sources': sources_payload})}\n\n"

        try:
            with http_requests.post(
                openai_url,
                headers=headers,
                json=body,
                stream=True,
                timeout=60
            ) as resp:
                if resp.status_code != 200:
                    yield f"data: {json.dumps({'type': 'error', 'detail': f'Azure OpenAI error {resp.status_code}'})}\n\n"
                    return

                for raw_line in resp.iter_lines():
                    if not raw_line:
                        continue
                    line = raw_line.decode("utf-8") if isinstance(raw_line, bytes) else raw_line
                    if not line.startswith("data: "):
                        continue
                    payload = line[6:]  # strip "data: "
                    if payload.strip() == "[DONE]":
                        break
                    try:
                        chunk_data = json.loads(payload)
                        delta = chunk_data["choices"][0].get("delta", {})
                        token = delta.get("content", "")
                        if token:
                            yield f"data: {json.dumps({'type': 'token', 'content': token})}\n\n"
                    except (json.JSONDecodeError, KeyError, IndexError):
                        continue

        except Exception as e:
            yield f"data: {json.dumps({'type': 'error', 'detail': str(e)})}\n\n"
            return

        yield f"data: {json.dumps({'type': 'done'})}\n\n"

    return FastAPIStreamingResponse(
        event_stream(),
        media_type="text/event-stream",
        headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no"}
    )


@router.post("/hellen-practice-stream")
def hellen_practice_stream(data: HellenPracticeRequest):
    """
    Continuous adaptive Socratic practice mode for Hellen+.
    Sessions run indefinitely until the learner closes the modal.

    SSE events (same protocol as /hellen-chat-stream):
      data: {"type": "token",  "content": "..."}
      data: {"type": "done"}
      data: {"type": "error",  "detail": "..."}
    """
    resolved_names = _resolve_submodule_names(data.submodule_names)

    # Reuse the existing context-retrieval pipeline with the module name as query
    proxy_req = HellenChatRequest(
        module_name=data.module_name,
        submodule_names=data.submodule_names,
        message=data.user_response or data.module_name,
        history=data.history,
    )
    # Fix: 4-tuple unpack — we only need the context (index 1)
    _, context_result, _, _ = build_hellen_context_and_sources(proxy_req, resolved_names)

    messages = build_practice_messages(data, context_result)

    openai_url, _, headers = _azure_url()
    body = {
        "messages": messages,
        "temperature": 0.7,
        "max_tokens": 600,
        "stream": True,
    }

    def event_stream():
        try:
            with http_requests.post(
                openai_url, headers=headers, json=body, stream=True, timeout=60
            ) as resp:
                if resp.status_code != 200:
                    yield f"data: {json.dumps({'type': 'error', 'detail': f'Azure OpenAI error {resp.status_code}'})}\n\n"
                    return

                for raw_line in resp.iter_lines():
                    if not raw_line:
                        continue
                    line = raw_line.decode("utf-8") if isinstance(raw_line, bytes) else raw_line
                    if not line.startswith("data: "):
                        continue
                    payload = line[6:]
                    if payload.strip() == "[DONE]":
                        break
                    try:
                        chunk_data = json.loads(payload)
                        delta = chunk_data["choices"][0].get("delta", {})
                        token = delta.get("content", "")
                        if token:
                            yield f"data: {json.dumps({'type': 'token', 'content': token})}\n\n"
                    except (json.JSONDecodeError, KeyError, IndexError):
                        continue

        except Exception as e:
            yield f"data: {json.dumps({'type': 'error', 'detail': str(e)})}\n\n"
            return

        yield f"data: {json.dumps({'type': 'done'})}\n\n"

    return FastAPIStreamingResponse(
        event_stream(),
        media_type="text/event-stream",
        headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no"},
    )


@router.post("/guided-hellen/next-question")
def guided_hellen_next_question(data: GuidedHellenRequest):
    """
    Generate the next micro-teaching message for the Guided Hellen+ onboarding flow.
    Called for steps 3, 4, and 5 only (steps 1–2 are handled on the frontend).
    """
    if data.step < 3 or data.step > 5:
        raise HTTPException(status_code=400, detail="step must be 3, 4, or 5")

    message = generate_guided_message(
        topic=data.topic,
        subtopic=data.subtopic,
        previous_answers=data.answers,
        step=data.step,
    )
    return {"message": message}
