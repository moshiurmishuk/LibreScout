from fastapi import APIRouter, UploadFile, File, HTTPException, Query
from app.models.schemas import (
    RecommendRequest,
    RecommendResponse,
    AnalyzeImageResponse,
    OffersResponse,
)
from app.services.ocr import extract_text_from_image_bytes
from app.services.serp import search_google_snippets, search_book_offers
from app.services.rag import build_faiss_index, query_faiss
from app.services.llm import llm_recommend_books, llm_book_from_image

router = APIRouter()


@router.post("/recommendations", response_model=RecommendResponse)
def recommend(req: RecommendRequest):
    preference = (req.preference or "").strip()
    if not preference:
        raise HTTPException(status_code=400, detail="preference is required")

    books = llm_recommend_books(preference)
    return RecommendResponse(books=books)


@router.get("/offers", response_model=OffersResponse)
def offers(query: str = Query(..., min_length=1), num_results: int = Query(5, ge=1, le=10)):
    data = search_book_offers(query, num_results=num_results)
    return OffersResponse(query=query, offers=data)


@router.post("/analyze-image", response_model=AnalyzeImageResponse)
async def analyze_image(image: UploadFile = File(...), offers_results: int = Query(5, ge=1, le=10)):
    if not image.filename:
        raise HTTPException(status_code=400, detail="image file is required")

    content = await image.read()
    if not content:
        raise HTTPException(status_code=400, detail="empty file")

    # 1) OCR (EasyOCR only)
    ocr_text = extract_text_from_image_bytes(content)

    if not ocr_text.strip():
        # still return something predictable
        ocr_text = ""

    # 2) Web snippets + RAG
    snippets = search_google_snippets(ocr_text, num_results=10) if ocr_text else []
    context = ""
    if snippets:
        index, snippet_texts = build_faiss_index(snippets)
        context = query_faiss(index, snippet_texts, ocr_text, top_k=5)

    # 3) LLM -> Book JSON
    book = llm_book_from_image(ocr_text=ocr_text, context=context)

    # 4) Offers
    query_text = " ".join([t for t in [book.title, book.author] if t]).strip() or ocr_text
    offer_list = search_book_offers(query_text, num_results=offers_results) if query_text else []

    return AnalyzeImageResponse(
        ocr_text=ocr_text,
        context_used=context,
        book=book,
        offers_query=query_text,
        offers=offer_list,
    )
