export type TabKey = "preference" | "image";

export function Tabs({
  value,
  onChange,
}: {
  value: TabKey;
  onChange: (v: TabKey) => void;
}) {
  const base =
    "rounded-full px-4 py-2 text-sm font-medium transition border";
  const active =
    "bg-white/10 border-white/15 text-white";
  const inactive =
    "bg-transparent border-white/10 text-white/70 hover:bg-white/5";

  return (
    <div className="inline-flex gap-2 rounded-full border border-white/10 bg-black/10 p-1">
      <button
        className={`${base} ${value === "preference" ? active : inactive}`}
        onClick={() => onChange("preference")}
        type="button"
      >
        By preference
      </button>
      <button
        className={`${base} ${value === "image" ? active : inactive}`}
        onClick={() => onChange("image")}
        type="button"
      >
        By image
      </button>
    </div>
  );
}
