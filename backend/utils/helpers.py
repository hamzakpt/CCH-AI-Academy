"""
General utility/helper functions for the DIAI Academy backend.

Includes:
- Time parsing for user-provided study hours
- AI result adaptation to time budget
- Submodule → module name detection
- Path ratings computation from ai_summary
- Shared constants (ADMIN_USERNAMES, CSV-based lookups)
"""
import os
import json
import pandas as pd
from typing import Dict, Optional

from ai.course_loader import parse_rating


# ----------------------------
# Constants
# ----------------------------

ADMIN_USERNAMES = {"admin@cchellenic.com"}

# CSV-based data loaded at module startup (static reference data)
_DATA_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data")

course_links_df = pd.read_csv(
    os.path.join(_DATA_DIR, "DIAI Academy eLearning details(Sheet2).csv")
)
course_links_map: Dict[str, str] = dict(
    zip(course_links_df["learning_path"], course_links_df["link"])
)

course_details_df = pd.read_csv(
    os.path.join(_DATA_DIR, "DIAI Academy eLearning details(Sheet1).csv")
)
submodule_ratings_map: Dict = {}
for _, row in course_details_df.iterrows():
    lps = [lp.strip() for lp in str(row["learning_path"]).split(",")]
    sub_name = str(row["sub_module"])
    rating = parse_rating(row.get("user_feedback", ""))
    for lp in lps:
        submodule_ratings_map[(lp, sub_name)] = rating


# ----------------------------
# Time Parsing
# ----------------------------

def parse_time_available(time_available: str) -> int:
    """Convert a time-available string (e.g. '2 hours') to total minutes."""
    if not time_available:
        return 120  # default 2 hours

    time_available = time_available.lower()
    digits = "".join(filter(str.isdigit, time_available))

    if digits:
        hours = int(digits)
        return hours * 60

    return 120


# ----------------------------
# Time Adaptation
# ----------------------------

def adapt_to_time(ai_result, total_budget_minutes, experience=None, interests=None):
    """Score and filter submodules to fit within the user's time budget."""
    if not ai_result or "selected_paths" not in ai_result:
        return ai_result

    max_minutes = total_budget_minutes
    total = 0
    used_submodules = set()

    scored_submodules = []

    # Build reasoning lookup so we don't lose it during rebuild
    reasoning_lookup = {}
    for path in ai_result["selected_paths"]:
        for module in path.get("modules", []):
            key = (path["learning_path"], module["module_name"])
            reasoning_lookup[key] = module.get("reasoning", "")

    # Flatten new structure
    for path in ai_result["selected_paths"]:
        path_name = path["learning_path"]

        for module in path["modules"]:
            module_name = module["module_name"]
            module_name_lower = module_name.lower()

            for sub in module["submodules"]:

                sub_name = (sub.get("name") or "").lower()
                duration = sub.get("duration", 0)

                score = 0

                # Beginner boost
                foundational_keywords = ["intro", "fundamentals", "basics"]
                if experience == "beginner":
                    if any(k in module_name_lower or k in sub_name for k in foundational_keywords):
                        score += 50

                # Advanced boost
                advanced_keywords = ["advanced", "deep", "optimization"]
                if experience == "advanced":
                    if any(k in module_name_lower or k in sub_name for k in advanced_keywords):
                        score += 50

                # Interest boost
                if interests:
                    interest_words = interests.lower().split()
                    sub_words = sub_name.split()

                    if any(word in sub_words for word in interest_words):
                        score += 40

                # Short duration boost
                if duration <= 30:
                    score += 10

                scored_submodules.append({
                    "path": path_name,
                    "module": module_name,
                    "sub": sub,
                    "score": score
                })

    # Sort by score
    scored_submodules.sort(key=lambda x: x["score"], reverse=True)

    adapted_paths = {}

    for item in scored_submodules:

        sub_name = (item["sub"].get("name") or "").lower()
        duration = item["sub"].get("duration", 0)

        if sub_name in used_submodules:
            continue

        if total + duration > max_minutes:
            continue

        path_name = item["path"]
        module_name = item["module"]

        if path_name not in adapted_paths:
            adapted_paths[path_name] = []

        # Check if module already exists
        module_entry = next(
            (m for m in adapted_paths[path_name] if m["module_name"] == module_name),
            None
        )

        if not module_entry:
            module_entry = {
                "module_name": module_name,
                "reasoning": reasoning_lookup.get((path_name, module_name), ""),
                "submodules": []
            }
            adapted_paths[path_name].append(module_entry)

        module_entry["submodules"].append(item["sub"])

        used_submodules.add(sub_name)
        total += duration

    # Convert dictionary to list structure again
    final_paths = []

    for path_name, modules in adapted_paths.items():
        final_paths.append({
            "learning_path": path_name,
            "modules": modules
        })

    TOTAL_WEEKS = 12

    if total_budget_minutes <= 0:
        return ai_result

    weekly_capacity = total_budget_minutes / TOTAL_WEEKS if TOTAL_WEEKS else 0
    actual_weeks_needed = total / weekly_capacity if weekly_capacity else 0

    ai_result["selected_paths"] = final_paths
    ai_result["total_minutes"] = total
    ai_result["estimated_weeks"] = round(actual_weeks_needed, 1)
    ai_result["weekly_load_hours"] = round((total / TOTAL_WEEKS) / 60, 1)

    return ai_result


# ----------------------------
# Module Detection
# ----------------------------

def detect_module_from_submodule(submodule_name: str) -> str:
    """
    Map a submodule (transcript lesson) name to its parent module name.
    Ground truth: DIAI Academy eLearning details (Sheet1), columns module + sub_module.
    """
    _SUBMODULE_TO_MODULE: Dict[str, str] = {
        # Data Fundamentals
        "what is data":                         "Data Fundamentals",
        "features & labels":                    "Data Fundamentals",
        "problems with data":                   "Data Fundamentals",
        "data wrangling":                       "Data Fundamentals",
        # Data Science Basics (Data Preparation)
        "data exploration":                     "Data Science Basics",
        "structuring data":                     "Data Science Basics",
        "sql":                                  "Data Science Basics",
        "data warehouses":                      "Data Science Basics",
        "data lakes":                           "Data Science Basics",
        # Machine Learning
        "history of ml":                        "Machine Learning",
        "ml models":                            "Machine Learning",
        "supervised & unsupervised learning":   "Machine Learning",
        "measuring success":                    "Machine Learning",
        "splitting data":                       "Machine Learning",
        "linear regression":                    "Machine Learning",
        "decision trees":                       "Machine Learning",
        "unsupervised methods":                 "Machine Learning",
        "training, testing and validation":     "Machine Learning",
        "forecasting":                          "Machine Learning",
        "improving methods":                    "Machine Learning",
        # Data Visualization
        "intro to data viz":                    "Data Visualization",
        "tools & methods":                      "Data Visualization",
        "data viz standards":                   "Data Visualization",
        "dashboard design matrix":              "Data Visualization",
        "data viz process":                     "Data Visualization",
        # Data Projects
        "intro to data science":                "Data Projects",
        "life-cycle of a data science project": "Data Projects",
        "skills & roles":                       "Data Projects",
        "tools":                                "Data Projects",
        # Generative AI
        "intro to generative ai":               "Generative AI",
        "genai in practice":                    "Generative AI",
        "about prompt literacy":                "Generative AI",
        "intro  to prompt engineering":         "Generative AI",
        "intro to prompt engineering":          "Generative AI",
        "prompt engineering techniques":        "Generative AI",
        "pitfalls in prompting":                "Generative AI",
        "prompt for content creation":          "Generative AI",
        "prompt engineering conclusion":        "Generative AI",
    }

    key = submodule_name.strip().lower()
    if key in _SUBMODULE_TO_MODULE:
        return _SUBMODULE_TO_MODULE[key]

    # Partial-match fallback (longest key that is a substring wins)
    best = None
    for sub_key, module in _SUBMODULE_TO_MODULE.items():
        if sub_key in key or key in sub_key:
            if best is None or len(sub_key) > len(best[0]):
                best = (sub_key, module)
    if best:
        return best[1]

    return "Another Module"


# ----------------------------
# Path Ratings
# ----------------------------

def compute_path_ratings(ai_summary) -> Dict:
    """Compute average rating per learning path part from ai_summary."""
    if not ai_summary or "selected_paths" not in ai_summary:
        return {}

    result = {}
    for selected_path in ai_summary["selected_paths"]:
        path_name = selected_path.get("learning_path", "")
        ratings = []

        for module in selected_path.get("modules", []):
            for sub in module.get("submodules", []):
                # Try from ai_summary first (new paths have rating field)
                r = sub.get("rating")
                if r is None:
                    # Fallback: look up from CSV-based map
                    sub_name = sub.get("name", "")
                    r = submodule_ratings_map.get((path_name, sub_name))
                if r is not None:
                    ratings.append(r)

        if ratings:
            result[path_name] = round(sum(ratings) / len(ratings), 1)

    return result

def _parse_json(value):
    """Parse JSON string to Python object, return as-is if already parsed or None."""
    if value is None:
        return None
    if isinstance(value, (dict, list)):
        return value
    try:
        return json.loads(value)
    except (json.JSONDecodeError, TypeError):
        return value


def _to_json(value):
    """Convert Python object to JSON string for storage."""
    if value is None:
        return None
    if isinstance(value, str):
        return value
    return json.dumps(value)
