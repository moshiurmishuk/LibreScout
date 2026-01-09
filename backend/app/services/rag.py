import numpy as np
import faiss
from sentence_transformers import SentenceTransformer

_embedding_model = SentenceTransformer("all-MiniLM-L6-v2")


def build_faiss_index(snippets: list[str]):
    embeddings = _embedding_model.encode(snippets)
    embeddings = np.array(embeddings).astype("float32")
    dimension = embeddings.shape[1]

    index = faiss.IndexFlatL2(dimension)
    index.add(embeddings)
    return index, snippets


def query_faiss(index, snippets: list[str], question: str, top_k: int = 5) -> str:
    if not question.strip() or not snippets:
        return ""

    q_emb = _embedding_model.encode([question])
    q_emb = np.array(q_emb).astype("float32")

    distances, indices = index.search(q_emb, min(top_k, len(snippets)))
    relevant = [snippets[i] for i in indices[0] if 0 <= i < len(snippets)]
    return "\n".join(relevant)
