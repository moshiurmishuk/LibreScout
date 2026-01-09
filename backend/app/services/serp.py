import os
from serpapi import GoogleSearch
from app.core.config import settings
from app.models.schemas import Offer


def search_google_snippets(query: str, num_results: int = 10) -> list[str]:
    """
    Uses SerpAPI organic results to fetch snippets.
    """
    api_key = settings.SERPAPI_API_KEY
    if not api_key or not query.strip():
        return []

    search = GoogleSearch({
        "q": query,
        "api_key": api_key,
        "num": num_results,
    })

    try:
        results = search.get_dict()
    except Exception:
        return []

    snippets: list[str] = []
    for res in results.get("organic_results", []) or []:
        title = res.get("title", "")
        snippet = res.get("snippet", "")
        if title or snippet:
            snippets.append(f"{title}: {snippet}".strip(": ").strip())

    return snippets


def search_book_offers(book_query: str, num_results: int = 5) -> list[Offer]:
    """
    Uses SerpAPI Google Shopping results.
    """
    api_key = settings.SERPAPI_API_KEY
    if not api_key or not book_query.strip():
        return []

    search = GoogleSearch({
        "q": book_query,
        "tbm": "shop",
        "num": num_results,
        "api_key": api_key,
    })

    try:
        results = search.get_dict()
    except Exception:
        return []

    offers: list[Offer] = []
    for item in results.get("shopping_results", []) or []:
        offers.append(Offer(
            title=item.get("title"),
            price=str(item.get("price") or item.get("extracted_price") or "") or None,
            rating=item.get("rating"),
            reviews=item.get("reviews"),
            link=item.get("product_link") or item.get("link"),
            source=item.get("source"),
        ))

    return offers
