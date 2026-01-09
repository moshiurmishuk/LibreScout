def build_book_search_prompt(query: str) -> str:
    return f"""
You are my dedicated book-searching agent. Your only task is to suggest books
based on whatever information I provide (genre, mood, themes, etc.).

Return ONLY JSON. Do NOT include any text outside JSON.
Return a maximum of 3 books.

Schema (array of objects):
[
  {{
    "title": "string",
    "author": "string",
    "description": "string | null",
    "language": "string",
    "genres": ["string", ...],
    "relevance": "string"
  }}
]

Field requirements:
- title: full title
- author: full author name
- description: short summary or null
- language: primary language
- genres: list of genres
- relevance: why it matches the query

Do NOT add extra fields.
Return ONLY JSON.

Query: "{query}"
""".strip()


def build_book_from_image_prompt(ocr_text: str, context: str) -> str:
    return f"""
You are a careful book identifier.

You will be given:
1) OCR text extracted from a book cover image
2) optional web snippets about the likely book (may be noisy)

Task:
- Identify the most likely book title + author.
- Provide a short description if possible.
- Provide language and genres if possible.
- Provide a short "relevance" explaining why you think this is the correct match.

Output STRICT JSON (a single object) and nothing else.
Schema:
{{
  "title": "string",
  "author": "string",
  "description": "string | null",
  "language": "string",
  "genres": ["string", ...],
  "relevance": "string"
}}

Rules:
- If uncertain, use "Unknown" for title/author/language.
- Do NOT invent specific facts (publication year, ISBN, etc.).
- Use the web snippets only as supporting evidence.
- Return ONLY JSON.

OCR Text:
\"\"\"{ocr_text}\"\"\"

Web Snippets (may be empty):
\"\"\"{context}\"\"\"
""".strip()
