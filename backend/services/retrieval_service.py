"""
Semantic retrieval service.

Responsibilities:
- Rewrite user queries for better semantic search
- Retrieve the top-k most relevant transcript chunks via cosine similarity
"""
import os
import requests as http_requests
from typing import Dict, List, Tuple

from services.embedding_service import _get_embedding, _cosine_similarity


def rewrite_query_for_retrieval(query: str) -> str:
    """
    Use GPT to rewrite the user query into a better semantic search query.
    Falls back to the original query on any error.
    """
    api_key = os.getenv("AZURE_OPENAI_API_KEY")
    azure_endpoint = os.getenv("AZURE_OPENAI_ENDPOINT")
    deployment = os.getenv("AZURE_OPENAI_DEPLOYMENT")
    api_version = os.getenv("AZURE_OPENAI_API_VERSION")

    openai_url = f"{azure_endpoint}/deployments/{deployment}/chat/completions?api-version={api_version}"

    headers = {
        "Content-Type": "application/json",
        "api-key": api_key
    }

    prompt = f"""
Rewrite the following user question into a short semantic search query
that would best match educational transcript content.

User question:
{query}

Return ONLY the rewritten query.
"""

    body = {
        "messages": [
            {"role": "system", "content": "You are a search query optimizer."},
            {"role": "user", "content": prompt}
        ],
        "temperature": 0,
        "max_tokens": 50
    }

    try:
        response = http_requests.post(openai_url, headers=headers, json=body, timeout=10)
        if response.status_code == 200:
            rewritten = response.json()["choices"][0]["message"]["content"].strip()
            print(f"[Hellen+] Query rewritten: '{query}' → '{rewritten}'")
            return rewritten
    except Exception as e:
        print(f"[Hellen+] Query rewrite failed: {e}")

    return query


def retrieve_relevant_chunks(
    query: str,
    submodule_names: List[str],
    embedded_chunks_map: Dict[str, List[Dict]],
    top_k: int = 5,
    min_score: float = 0.2
) -> Tuple[List[Dict], float]:
    """
    Semantic retrieval with dynamic context filtering.
    Returns (chunks, best_score).
    """
    try:
        search_query = rewrite_query_for_retrieval(query)
        query_embedding = _get_embedding(search_query)
    except Exception as e:
        print(f"[Hellen+] Query embedding failed: {e}")
        return [], 0.0

    scored = []

    for sub_name in submodule_names:
        for chunk in embedded_chunks_map.get(sub_name, []):
            emb = chunk.get("embedding")
            if not emb:
                continue
            score = _cosine_similarity(query_embedding, emb)
            if score >= min_score:
                scored.append((score, chunk))

    if not scored:
        return [], 0.0

    # Sort by similarity
    scored.sort(key=lambda x: x[0], reverse=True)

    best_score = scored[0][0]

    # Dynamic context filtering: keep chunks within 75% of the best score
    filtered = [
        (score, chunk)
        for score, chunk in scored
        if score >= best_score * 0.75
    ]

    return [c[1] for c in filtered[:top_k]], best_score
