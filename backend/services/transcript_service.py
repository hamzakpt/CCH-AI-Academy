"""
Transcript parsing and chunking service.

Responsibilities:
- Parse the Video transcripts and Quizzes.txt file into submodule segments
- Extract quiz blocks by topic
- Chunk transcript segments into overlapping windows for embedding
"""
import re
from typing import Dict, List, Optional


def parse_transcripts_with_timestamps(filepath: str) -> Dict[str, List[Dict[str, str]]]:
    """
    Parse Video transcripts and Quizzes.txt into {submodule_title: [{text, timestamp}]}.
    Detects submodule headers (lines ending with ':' followed by blank line),
    timestamp lines (e.g. '9:35' or '0 minutes 8 seconds'), and spoken text.
    """
    result: Dict[str, List[Dict[str, str]]] = {}

    with open(filepath, "r", encoding="utf-8-sig") as f:
        lines = f.readlines()

    current_submodule = None
    current_timestamp = "00:00"
    current_text_parts: List[str] = []

    # Quiz parsing state
    in_quiz_block = False
    quiz_buffer: List[str] = []

    # Regex for short timestamp like "9:35" or "0:08" or "25:15"
    short_ts_re = re.compile(r"^\d{1,2}:\d{2}$")
    # Regex for long timestamp like "9 minutes 35 seconds" or "0 minutes 8 seconds"
    long_ts_re = re.compile(r"^(\d+)\s+minutes?(?:\s+(\d+)\s+seconds?)?$")
    # Regex for submodule header: text ending with ':' (not a timestamp)
    header_re = re.compile(r"^(.+):\s*$")

    def flush_segment():
        nonlocal current_text_parts
        if current_submodule and current_text_parts:
            text = " ".join(current_text_parts).strip()
            if text:
                result.setdefault(current_submodule, []).append({
                    "text": text,
                    "submodule": current_submodule,
                    "timestamp": current_timestamp
                })
            current_text_parts = []

    i = 0
    while i < len(lines):
        line = lines[i].strip()

        # Detect start of quiz block
        if "[QUIZ_BLOCK_" in line:
            flush_segment()
            in_quiz_block = True
            quiz_buffer = []
            i += 1
            continue

        # Capture quiz block content
        if in_quiz_block:
            quiz_buffer.append(line)

            # End quiz block when we reach Correct Answer
            if line.lower().startswith("correct answer"):

                # capture all answer lines until separator
                j = i + 1

                while j < len(lines):
                    next_line = lines[j].strip()

                    if not next_line or next_line.startswith("----"):
                        break

                    quiz_buffer.append(next_line)
                    j += 1

                i = j - 1

                text = "Quiz Question\n" + "\n".join(quiz_buffer)

                result.setdefault("Quiz Knowledge Base", []).append({
                    "text": text,
                    "submodule": "Quiz Knowledge Base",
                    "timestamp": "Quiz"
                })

                in_quiz_block = False
                quiz_buffer = []

            i += 1
            continue

        # Skip empty lines
        if not line:
            i += 1
            continue

        # Check for submodule header: a line ending with ':'
        # followed by an empty line (or end of file)
        header_match = header_re.match(line)
        if header_match:
            candidate = header_match.group(1).strip()
            # Make sure it's not a short timestamp like "1:05"
            if not short_ts_re.match(candidate) and not long_ts_re.match(candidate):
                # Check next line is empty or EOF
                next_line = lines[i + 1].strip() if i + 1 < len(lines) else ""
                if next_line == "":
                    flush_segment()
                    current_submodule = candidate
                    current_timestamp = "00:00"
                    current_text_parts = []
                    i += 2  # skip header + blank line
                    continue

        # Check for short timestamp (e.g., "9:35")
        if short_ts_re.match(line):
            flush_segment()
            parts = line.split(":")
            current_timestamp = f"{int(parts[0]):02d}:{parts[1]}"
            i += 1
            continue

        # Check for long timestamp (e.g., "9 minutes 35 seconds")
        long_match = long_ts_re.match(line)
        if long_match:
            # Skip this line — we already captured the short form
            i += 1
            continue

        # It's regular transcript text
        if current_submodule:
            current_text_parts.append(line)

        i += 1

    flush_segment()
    return result


def parse_quiz_by_topic(filepath: str) -> Dict[str, List[str]]:
    """
    Parse the quiz section of the transcript file into per-topic lists of quiz blocks.
    Returns {topic_name: [quiz_block_text, ...]}, preserving original order.
    Each quiz_block_text includes the question, options, and correct answer(s).
    """
    result: Dict[str, List[str]] = {}
    current_module: Optional[str] = None
    in_quiz_section = False
    module_re = re.compile(r"^MODULE:\s*(.+)$")
    block_start_re = re.compile(r"^\[QUIZ_BLOCK_\d+\]$")

    with open(filepath, "r", encoding="utf-8-sig") as f:
        lines = f.readlines()

    i = 0
    while i < len(lines):
        line = lines[i].strip()

        if "QUIZ KNOWLEDGE BASE" in line:
            in_quiz_section = True
            i += 1
            continue

        if not in_quiz_section:
            i += 1
            continue

        module_match = module_re.match(line)
        if module_match:
            current_module = module_match.group(1).strip()
            i += 1
            continue

        if block_start_re.match(line) and current_module:
            block_lines: List[str] = []
            i += 1
            while i < len(lines):
                bline = lines[i].rstrip()
                stripped = bline.strip()
                # Stop at any block separator, next block header, or section divider
                if (
                    stripped.startswith("----")
                    or stripped.startswith("====")
                    or block_start_re.match(stripped)
                ):
                    break
                block_lines.append(bline)
                i += 1
            block_text = "\n".join(block_lines).strip()
            if block_text:
                result.setdefault(current_module, []).append(block_text)
            continue

        i += 1

    return result


def chunk_segments(
    segments: List[Dict[str, str]],
    chunk_size: int = 800,
    overlap: int = 150
) -> List[Dict[str, str]]:
    """
    Split transcript segments into overlapping chunks of ~chunk_size characters.
    Each chunk uses the segment's own submodule name.
    """
    if not segments:
        return []

    chunks = []
    current_text = ""
    current_timestamp = segments[0]["timestamp"]
    current_submodule = segments[0]["submodule"]

    for seg in segments:
        seg_submodule = seg["submodule"]
        if len(current_text) + len(seg["text"]) > chunk_size and current_text:
            chunks.append({
                "text": current_text.strip(),
                "submodule": current_submodule,
                "timestamp": current_timestamp
            })
            # Overlap: keep the last `overlap` characters
            overlap_text = current_text[-overlap:] if len(current_text) > overlap else current_text
            current_text = overlap_text
            current_timestamp = seg["timestamp"]
            current_submodule = seg_submodule

        if not current_text:
            current_timestamp = seg["timestamp"]
            current_submodule = seg_submodule

        current_text += " " + seg["text"]

    if current_text.strip():
        chunks.append({
            "text": current_text.strip(),
            "submodule": current_submodule,
            "timestamp": current_timestamp
        })

    return chunks


def build_submodule_chunks(
    transcript_data: Dict[str, List[Dict[str, str]]]
) -> Dict[str, List[Dict[str, str]]]:
    """Build chunked transcript lookup: {submodule_title: [chunks]}."""
    result = {}
    for submodule, segments in transcript_data.items():
        result[submodule] = chunk_segments(segments)
    return result
