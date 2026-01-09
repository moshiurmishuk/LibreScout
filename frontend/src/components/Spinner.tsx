export function Spinner({ label }: { label?: string }) {
  return (
    <div className="flex items-center gap-3 text-sm text-white/80">
      <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/20 border-t-white/80" />
      <span>{label ?? "Working..."}</span>
    </div>
  );
}
