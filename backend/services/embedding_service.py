"""
Embedding generation and disk-cache service (Azure text-embedding-3-small).

Responsibilities:
- Generate text embeddings via Azure OpenAI
- Compute cosine similarity between embedding vectors
- Read/write embedding cache from/to disk
- Decide whether to load from cache or regenerate
"""
import os
import json
import math
import requests as http_requests
from typing import Dict, List


def _get_embedding(text: str) -> List[float]:
    """Call Azure OpenAI to get a text embedding vector."""
    api_key = os.getenv("AZURE_OPENAI_API_KEY")
    azure_endpoint = os.getenv("AZURE_OPENAI_ENDPOINT")
    api_version = os.getenv("AZURE_OPENAI_API_VERSION", "2024-02-01")
    embedding_deployment = os.getenv("AZURE_OPENAI_EMBEDDING_DEPLOYMENT")

    url = f"{azure_endpoint}/deployments/{embedding_deployment}/embeddings?api-version={api_version}"

    headers = {
        "Content-Type": "application/json",
        "api-key": api_key
    }

    body = {
        "input": text.replace("\n", " ")[:8000]
    }

    resp = http_requests.post(url, headers=headers, json=body, timeout=30)
    resp.raise_for_status()

    return resp.json()["data"][0]["embedding"]


def _cosine_similarity(a: List[float], b: List[float]) -> float:
    """Cosine similarity between two equal-length vectors."""
    dot = sum(x * y for x, y in zip(a, b))
    mag_a = math.sqrt(sum(x * x for x in a))
    mag_b = math.sqrt(sum(x * x for x in b))
    if mag_a == 0 or mag_b == 0:
        return 0.0
    return dot / (mag_a * mag_b)


def generate_chunk_embeddings(
    chunks_map: Dict[str, List[Dict[str, str]]]
) -> Dict[str, List[Dict]]:
    """
    Generate embeddings for all chunks. Called only when no valid cache exists.
    Returns a map where each chunk dict contains an 'embedding' key.
    """
    embedded_map: Dict[str, List[Dict]] = {}
    total = sum(len(v) for v in chunks_map.values())
    done = 0

    for submodule, chunks in chunks_map.items():
        embedded_chunks = []
        for chunk in chunks:
            try:
                emb = _get_embedding(chunk["text"])
            except Exception as e:
                print(f"[Hellen+] Embedding failed for chunk in '{submodule}': {e}")
                emb = []  # empty fallback — will score 0 in similarity
            embedded_chunks.append({
                "text": chunk["text"],
                "submodule": chunk["submodule"],
                "timestamp": chunk["timestamp"],
                "embedding": emb
            })
            done += 1
            if done % 20 == 0:
                print(f"[Hellen+] Embedded {done}/{total} chunks...")

        embedded_map[submodule] = embedded_chunks

    print(f"[Hellen+] Embedding complete: {done}/{total} chunks embedded.")
    return embedded_map


def _cache_is_valid(transcript_file: str, cache_file: str) -> bool:
    """Return True if cache exists and is newer than the transcript file."""
    if not os.path.exists(cache_file):
        return False
    return os.path.getmtime(cache_file) >= os.path.getmtime(transcript_file)


def load_embedded_chunks_from_cache(cache_file: str) -> Dict[str, List[Dict]]:
    """Load the embedded chunks map from disk."""
    print(f"[Hellen+] Loading embeddings from cache: {cache_file}")
    with open(cache_file, "r", encoding="utf-8") as f:
        flat_list: List[Dict] = json.load(f)
    # Reconstruct {submodule: [chunks]} structure
    result: Dict[str, List[Dict]] = {}
    for chunk in flat_list:
        sub = chunk["submodule"]
        result.setdefault(sub, []).append(chunk)
    total = sum(len(v) for v in result.values())
    print(f"[Hellen+] Loaded {total} cached chunks for {len(result)} submodules.")
    return result


def save_embedded_chunks_to_cache(
    embedded_map: Dict[str, List[Dict]],
    cache_file: str
) -> None:
    """Flatten and save the embedded chunks map to disk as JSON."""
    flat_list = [chunk for chunks in embedded_map.values() for chunk in chunks]
    with open(cache_file, "w", encoding="utf-8") as f:
        json.dump(flat_list, f)
    total = len(flat_list)
    print(f"[Hellen+] Saved {total} embedded chunks to cache: {cache_file}")


def load_or_generate(
    chunks_map: Dict[str, List[Dict]],
    cache_file: str,
    transcript_file: str
) -> Dict[str, List[Dict]]:
    """
    Load embeddings from disk cache if valid; otherwise generate and cache them.
    Returns an empty-embedding fallback map on error.
    """
    try:
        if _cache_is_valid(transcript_file, cache_file):
            return load_embedded_chunks_from_cache(cache_file)

        print("[Hellen+] No valid embedding cache found. Generating embeddings...")
        embedded_map = generate_chunk_embeddings(chunks_map)
        save_embedded_chunks_to_cache(embedded_map, cache_file)
        print("[Hellen+] Embeddings cached successfully")
        return embedded_map

    except Exception as e:
        print(f"[Hellen+] WARNING: Embedding initialization failed: {e}")
        print("[Hellen+] Falling back to empty embeddings")
        return {
            sub: [{**c, "embedding": []} for c in chunks]
            for sub, chunks in chunks_map.items()
        }
