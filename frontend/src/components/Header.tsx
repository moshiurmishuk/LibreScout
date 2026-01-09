export function Header() {
  return (
    <header className="sticky top-0 z-10 border-b border-white/10 bg-black/20 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-6 px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-2xl border border-white/10 bg-white/5 text-lg">
            📚
          </div>
          <div>
            <div className="text-sm font-semibold text-white/95">LibreScout (Book Finder & Analyzer)</div>
            <div className="text-xs text-white/60">Recommendations and analysis</div>
          </div>
        </div>
        <div className="text-xs text-white/50">
          FastAPI • React • LLM • EasyOCR • SerpAPI • FAISS
        </div>
      </div>
    </header>
  );
}
