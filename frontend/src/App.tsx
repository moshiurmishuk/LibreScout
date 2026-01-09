import { useMemo, useState } from "react";
import { Header } from "./components/Header";
import { Tabs, type TabKey } from "./components/Tabs";
import { Card } from "./components/Card";
import { Badge } from "./components/Badge";
import { Spinner } from "./components/Spinner";
import { Toast } from "./components/Toast";
import { analyzeImage, getOffers, recommend } from "./api";
import type { AnalyzeImageResponse, Book, Offer } from "./types";

function getErrorMessage(err: unknown, fallback: string): string {
  if (err instanceof Error && err.message) return err.message;

  // Some libs throw plain objects: { message: "..."}
  if (typeof err === "object" && err !== null && "message" in err) {
    const msg = (err as { message?: unknown }).message;
    if (typeof msg === "string" && msg.trim()) return msg;
  }

  return fallback;
}

function BookCard({
  book,
  onBuy,
}: {
  book: Book;
  onBuy: (q: string) => void;
}) {
  const query = `${book.title} ${book.author}`.trim();

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-sm font-semibold text-white/95">
            {book.title || "Unknown title"}
          </div>
          <div className="mt-1 text-xs text-white/60">
            {book.author || "Unknown author"} · {book.language || "Unknown"}
          </div>
        </div>

        <button
          className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-white/85 hover:bg-white/10"
          onClick={() => onBuy(query)}
          type="button"
        >
          Where to buy
        </button>
      </div>

      {book.genres?.length ? (
        <div className="mt-3 flex flex-wrap gap-2">
          {book.genres.map((g, i) => (
            <Badge key={`${g}-${i}`}>{g}</Badge>
          ))}
        </div>
      ) : null}

      {book.description ? (
        <p className="mt-3 text-sm leading-relaxed text-white/80">
          {book.description}
        </p>
      ) : null}

      {book.relevance ? (
        <p className="mt-3 text-xs text-white/60">
          <span className="font-semibold text-white/70">Why this matches: </span>
          {book.relevance}
        </p>
      ) : null}
    </div>
  );
}

function OffersList({ offers }: { offers: Offer[] }) {
  if (!offers.length) {
    return <div className="text-sm text-white/60">No offers found.</div>;
  }

  return (
    <div className="space-y-3">
      {offers.map((o, idx) => (
        <div
          key={idx}
          className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/[0.02] p-4"
        >
          <div className="min-w-[240px]">
            <div className="text-sm font-semibold text-white/90">
              {o.title || "Offer"}
            </div>
            <div className="mt-1 text-xs text-white/60">
              {o.price ? <span className="text-white/80">{o.price}</span> : null}
              {o.rating ? <span> · ⭐ {o.rating}</span> : null}
              {typeof o.reviews === "number" ? (
                <span> ({o.reviews} reviews)</span>
              ) : null}
              {o.source ? <span> · {o.source}</span> : null}
            </div>
          </div>

          {o.link ? (
            <a
              className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-white/85 hover:bg-white/10"
              href={o.link}
              target="_blank"
              rel="noreferrer"
            >
              View offer
            </a>
          ) : null}
        </div>
      ))}
    </div>
  );
}

export default function App() {
  const [tab, setTab] = useState<TabKey>("preference");

  // Preference mode
  const [preference, setPreference] = useState("");
  const [books, setBooks] = useState<Book[]>([]);
  const [recLoading, setRecLoading] = useState(false);

  // Image mode
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [imgLoading, setImgLoading] = useState(false);
  const [imgResult, setImgResult] = useState<AnalyzeImageResponse | null>(null);

  // Offers
  const [offersLoading, setOffersLoading] = useState(false);
  const [offersQuery, setOffersQuery] = useState<string>("");
  const [offers, setOffers] = useState<Offer[]>([]);

  // Toast
  const [toast, setToast] = useState<{
    kind: "error" | "info" | "success";
    message: string;
  } | null>(null);

  const canSubmitPreference = useMemo(
    () => preference.trim().length > 0,
    [preference]
  );
  const canSubmitImage = useMemo(() => !!file, [file]);

  async function onRecommend() {
    setRecLoading(true);
    setToast(null);
    setBooks([]);
    try {
      const res = await recommend(preference.trim());
      setBooks(res.books || []);
      if (!res.books?.length) {
        setToast({
          kind: "info",
          message:
            "No matching books returned. Try a more specific preference.",
        });
      }
    } catch (e: unknown) {
      setToast({
        kind: "error",
        message: getErrorMessage(e, "Failed to get recommendations."),
      });
    } finally {
      setRecLoading(false);
    }
  }

  async function onAnalyzeImage() {
    if (!file) return;
    setImgLoading(true);
    setToast(null);
    setImgResult(null);
    setOffers([]);
    setOffersQuery("");
    try {
      const res = await analyzeImage(file, 5);
      setImgResult(res);
      setOffers(res.offers || []);
      setOffersQuery(res.offers_query || "");
      setToast({ kind: "success", message: "Image analyzed successfully." });
    } catch (e: unknown) {
      setToast({
        kind: "error",
        message: getErrorMessage(e, "Failed to analyze image."),
      });
    } finally {
      setImgLoading(false);
    }
  }

  async function onBuy(query: string) {
    const q = query.trim();
    if (!q) return;

    setOffersLoading(true);
    setToast(null);
    setOffers([]);
    setOffersQuery(q);

    try {
      const res = await getOffers(q, 5);
      setOffers(res.offers || []);
      if (!res.offers?.length) {
        setToast({
          kind: "info",
          message: "No shopping results found for that query.",
        });
      }
    } catch (e: unknown) {
      setToast({
        kind: "error",
        message: getErrorMessage(e, "Failed to fetch offers."),
      });
    } finally {
      setOffersLoading(false);
    }
  }

  function onPickFile(f: File | null) {
    setFile(f);
    setImgResult(null);
    setOffers([]);
    setOffersQuery("");

    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(f ? URL.createObjectURL(f) : null);
  }

  return (
    <div className="min-h-screen">
      <Header />

      <main className="mx-auto max-w-6xl space-y-6 px-5 py-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-semibold text-white/95">
              Find your next read
            </h1>
            <p className="mt-1 text-sm text-white/60">
              Use a preference prompt or upload a cover image. EasyOCR extracts
              text; the backend uses LLM + optional web snippets.
            </p>
          </div>
          <Tabs value={tab} onChange={setTab} />
        </div>

        {toast ? (
          <Toast
            kind={toast.kind}
            message={toast.message}
            onClose={() => setToast(null)}
          />
        ) : null}

        {tab === "preference" ? (
          <Card
            title="Search by preference"
            subtitle="Describe what you want (themes, mood, genre, pacing)."
            right={
              <button
                className="rounded-xl bg-indigo-500/20 px-4 py-2 text-sm font-medium text-indigo-100 hover:bg-indigo-500/25 disabled:opacity-50"
                onClick={onRecommend}
                disabled={!canSubmitPreference || recLoading}
                type="button"
              >
                {recLoading ? "Searching..." : "Recommend"}
              </button>
            }
          >
            <textarea
              className="w-full rounded-2xl border border-white/10 bg-black/20 p-4 text-sm text-white/90 outline-none placeholder:text-white/35 focus:border-white/20"
              rows={5}
              value={preference}
              onChange={(e) => setPreference(e.target.value)}
              placeholder='e.g. "dark fantasy with political intrigue", "cozy mystery in a small town", "short hard sci-fi novella"'
            />

            <div className="mt-4">
              {recLoading ? (
                <Spinner label="Generating recommendations..." />
              ) : null}
            </div>

            {books.length ? (
              <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2">
                {books.map((b, i) => (
                  <BookCard key={`${b.title}-${i}`} book={b} onBuy={onBuy} />
                ))}
              </div>
            ) : null}
          </Card>
        ) : (
          <Card
            title="Analyze a book cover image"
            subtitle="Upload a cover image. EasyOCR extracts text; the backend infers title/author using an LLM."
            right={
              <button
                className="rounded-xl bg-emerald-500/20 px-4 py-2 text-sm font-medium text-emerald-100 hover:bg-emerald-500/25 disabled:opacity-50"
                onClick={onAnalyzeImage}
                disabled={!canSubmitImage || imgLoading}
                type="button"
              >
                {imgLoading ? "Analyzing..." : "Analyze"}
              </button>
            }
          >
            <div className="flex flex-col gap-4 md:flex-row md:items-start">
              <div className="flex-1">
                <input
                  className="block w-full cursor-pointer rounded-2xl border border-white/10 bg-black/20 p-3 text-sm text-white/70 file:mr-4 file:rounded-xl file:border-0 file:bg-white/10 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white/90 hover:file:bg-white/15"
                  type="file"
                  accept="image/*"
                  onChange={(e) => onPickFile(e.target.files?.[0] ?? null)}
                />

                {imgLoading ? (
                  <div className="mt-4">
                    <Spinner label="Extracting & identifying..." />
                  </div>
                ) : null}

                {imgResult ? (
                  <div className="mt-5 space-y-4">
                    <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-4">
                      <div className="text-xs font-semibold text-white/70">
                        OCR TEXT
                      </div>
                      <div className="mt-2 text-sm text-white/80">
                        {imgResult.ocr_text || (
                          <span className="text-white/50">
                            No text detected.
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-4">
                      <div className="text-sm font-semibold text-white/95">
                        {imgResult.book.title}
                      </div>
                      <div className="mt-1 text-xs text-white/60">
                        {imgResult.book.author} · {imgResult.book.language}
                      </div>

                      {imgResult.book.genres?.length ? (
                        <div className="mt-3 flex flex-wrap gap-2">
                          {imgResult.book.genres.map((g, i) => (
                            <Badge key={`${g}-${i}`}>{g}</Badge>
                          ))}
                        </div>
                      ) : null}

                      {imgResult.book.description ? (
                        <p className="mt-3 text-sm leading-relaxed text-white/80">
                          {imgResult.book.description}
                        </p>
                      ) : null}

                      {imgResult.book.relevance ? (
                        <p className="mt-3 text-xs text-white/60">
                          <span className="font-semibold text-white/70">
                            Why this match:{" "}
                          </span>
                          {imgResult.book.relevance}
                        </p>
                      ) : null}

                      <div className="mt-4">
                        <button
                          className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-white/85 hover:bg-white/10"
                          onClick={() =>
                            onBuy(
                              `${imgResult.book.title} ${imgResult.book.author}`
                            )
                          }
                          type="button"
                        >
                          Where to buy
                        </button>
                      </div>
                    </div>
                  </div>
                ) : null}
              </div>

              <div className="w-full md:w-[320px]">
                <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-4">
                  <div className="text-xs font-semibold text-white/70">
                    PREVIEW
                  </div>
                  <div className="mt-3 overflow-hidden rounded-2xl border border-white/10 bg-black/20">
                    {previewUrl ? (
                      <img
                        src={previewUrl}
                        className="block w-full object-contain"
                        alt="Selected book cover"
                      />
                    ) : (
                      <div className="grid h-[220px] place-items-center text-sm text-white/50">
                        Select an image…
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </Card>
        )}

        <Card
          title="Where to buy"
          subtitle={
            offersQuery ? `Top offers for: ${offersQuery}` : "Search results will appear here."
          }
          right={offersLoading ? <Spinner label="Loading offers..." /> : null}
        >
          <OffersList offers={offers} />
        </Card>

        <footer className="pb-10 pt-2 text-center text-xs text-white/45">
          Built with FastAPI + React. Powered by LLM. Results may be imperfect - OCR and web
          snippets can be noisy.
        </footer>
      </main>
    </div>
  );
}
