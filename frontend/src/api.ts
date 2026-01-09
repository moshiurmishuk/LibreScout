import type { AnalyzeImageResponse, OffersResponse, RecommendResponse } from "./types";

type ErrorDetailShape = { detail?: unknown };

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function hasDetail(value: unknown): value is ErrorDetailShape {
  return isRecord(value) && "detail" in value;
}

async function asJsonOrThrow<T>(res: Response): Promise<T> {
  const text = await res.text();

  // Parse JSON safely without using `any`
  let parsed: unknown = null;
  try {
    parsed = text ? (JSON.parse(text) as unknown) : null;
  } catch {
    // Not JSON (could be HTML error page or plain text)
    parsed = null;
  }

  if (!res.ok) {
    const detail =
      hasDetail(parsed) && parsed.detail != null ? String(parsed.detail) : "";

    const msg = detail || text || `Request failed (${res.status})`;
    throw new Error(msg);
  }

  if (parsed === null) {
    throw new Error("Server returned a non-JSON response.");
  }

  return parsed as T;
}

export async function recommend(preference: string): Promise<RecommendResponse> {
  const res = await fetch("/api/recommendations", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ preference }),
  });

  return asJsonOrThrow<RecommendResponse>(res);
}

export async function getOffers(
  query: string,
  numResults = 5
): Promise<OffersResponse> {
  const url = new URL("/api/offers", window.location.origin);
  url.searchParams.set("query", query);
  url.searchParams.set("num_results", String(numResults));

  const res = await fetch(url.toString());
  return asJsonOrThrow<OffersResponse>(res);
}

export async function analyzeImage(
  file: File,
  offersResults = 5
): Promise<AnalyzeImageResponse> {
  const form = new FormData();
  form.append("image", file);

  const url = new URL("/api/analyze-image", window.location.origin);
  url.searchParams.set("offers_results", String(offersResults));

  const res = await fetch(url.toString(), { method: "POST", body: form });
  return asJsonOrThrow<AnalyzeImageResponse>(res);
}
