export type Book = {
  title: string;
  author: string;
  description?: string | null;
  language: string;
  genres: string[];
  relevance: string;
};

export type Offer = {
  title?: string | null;
  price?: string | null;
  rating?: number | null;
  reviews?: number | null;
  link?: string | null;
  source?: string | null;
};

export type RecommendResponse = {
  books: Book[];
};

export type OffersResponse = {
  query: string;
  offers: Offer[];
};

export type AnalyzeImageResponse = {
  ocr_text: string;
  context_used: string;
  book: Book;
  offers_query: string;
  offers: Offer[];
};
