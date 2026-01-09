from pydantic import BaseModel, Field
from typing import Optional


class Book(BaseModel):
    title: str = Field(default="Unknown")
    author: str = Field(default="Unknown")
    description: Optional[str] = None
    language: str = Field(default="Unknown")
    genres: list[str] = Field(default_factory=list)
    relevance: str = Field(default="")


class Offer(BaseModel):
    title: Optional[str] = None
    price: Optional[str] = None
    rating: Optional[float] = None
    reviews: Optional[int] = None
    link: Optional[str] = None
    source: Optional[str] = None


class RecommendRequest(BaseModel):
    preference: str


class RecommendResponse(BaseModel):
    books: list[Book]


class OffersResponse(BaseModel):
    query: str
    offers: list[Offer]


class AnalyzeImageResponse(BaseModel):
    ocr_text: str
    context_used: str
    book: Book
    offers_query: str
    offers: list[Offer]
