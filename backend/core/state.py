"""
Shared global runtime state for the DIAI Academy backend.

These dicts are populated once at startup by main.py and read by services/routes at request time.
Importing this module gives a reference to the same dict objects — no singletons needed.
"""
from typing import Dict, List

# {submodule_name: [{text, submodule, timestamp, embedding}]}
embedded_chunks_map: Dict[str, List[Dict]] = {}

# {topic_name: [quiz_block_text, ...]}
quiz_by_topic: Dict[str, List[str]] = {}

# {submodule_name: [{text, submodule, timestamp}]}
transcript_data: Dict[str, List[Dict]] = {}

# {submodule_name: [chunks]}
submodule_chunks_map: Dict[str, List[Dict]] = {}
