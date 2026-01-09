import ast
import json
import re
from typing import Any


def extract_json_like(text: str) -> str:
    if not isinstance(text, str):
        return ""

    match = re.search(r"```(?:json)?\s*(.*?)\s*```", text, re.DOTALL | re.IGNORECASE)
    if match:
        return match.group(1).strip()
    return text.strip()


def safe_parse_json(text: str) -> Any:
    """
    Tolerant parsing:
    - strict JSON
    - python literal fallback
    """
    cleaned = extract_json_like(text)

    try:
        return json.loads(cleaned)
    except Exception:
        try:
            return ast.literal_eval(cleaned)
        except Exception:
            return None
