from __future__ import annotations

import json
from typing import Any

from openai import OpenAI
from fastapi import HTTPException

from app.core.config import settings
from app.models.schemas import Book
from app.prompts.prompt_builder import (
    build_book_search_prompt,
    build_book_from_image_prompt,
)
from app.services.parse import safe_parse_json

_client = OpenAI(api_key=settings.OPENAI_API_KEY)


def _ensure_key():
    if not settings.OPENAI_API_KEY:
        raise HTTPException(
            status_code=401,
            detail="OPENAI_API_KEY is missing. Set it in your .env file.",
        )


def _chat(prompt: str) -> str:
    """
    Compatible with OpenAI Python SDK versions that support chat.completions.
    Returns the assistant text content.
    """
    try:
        resp = _client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": "Return ONLY JSON. No extra text."},
                {"role": "user", "content": prompt},
            ],
            temperature=0.2,
        )
        content = resp.choices[0].message.content or ""
        return content.strip()
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"OpenAI request failed: {str(e)}") from e


def llm_recommend_books(preference: str) -> list[Book]:
    _ensure_key()
    prompt = build_book_search_prompt(preference)

    raw = _chat(prompt)
    data = safe_parse_json(raw)

    if isinstance(data, dict):
        data = [data]
    if not isinstance(data, list):
        return []

    books: list[Book] = []
    for item in data[:3]:
        if isinstance(item, dict):
            books.append(Book(**_normalize_book_dict(item)))
    return books


def llm_book_from_image(ocr_text: str, context: str) -> Book:
    _ensure_key()
    prompt = build_book_from_image_prompt(ocr_text=ocr_text, context=context)

    raw = _chat(prompt)
    data = safe_parse_json(raw)

    if isinstance(data, list) and data:
        data = data[0]

    if isinstance(data, dict):
        return Book(**_normalize_book_dict(data))

    return Book(
        title="Unknown",
        author="Unknown",
        description=raw[:2000] if raw else None,
        language="Unknown",
        genres=[],
        relevance="Could not confidently parse model output into JSON.",
    )


def _normalize_book_dict(d: dict[str, Any]) -> dict[str, Any]:
    return {
        "title": str(d.get("title") or "Unknown"),
        "author": str(d.get("author") or "Unknown"),
        "description": d.get("description", None),
        "language": str(d.get("language") or "Unknown"),
        "genres": d.get("genres") if isinstance(d.get("genres"), list) else [],
        "relevance": str(d.get("relevance") or ""),
    }
