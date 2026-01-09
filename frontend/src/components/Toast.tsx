export function Toast({
  kind,
  message,
  onClose,
}: {
  kind: "error" | "info" | "success";
  message: string;
  onClose: () => void;
}) {
  const styles =
    kind === "error"
      ? "border-red-400/30 bg-red-500/10 text-red-100"
      : kind === "success"
      ? "border-emerald-400/30 bg-emerald-500/10 text-emerald-100"
      : "border-white/15 bg-white/5 text-white/85";

  return (
    <div className={`rounded-xl border px-4 py-3 text-sm ${styles}`}>
      <div className="flex items-start justify-between gap-4">
        <div>{message}</div>
        <button
          onClick={onClose}
          className="rounded-lg px-2 py-1 text-xs text-white/70 hover:bg-white/10"
          type="button"
        >
          Close
        </button>
      </div>
    </div>
  );
}
