export function EvalBar({ scoreCpWhite }: { scoreCpWhite?: number }) {
  const clamped = Math.max(-900, Math.min(900, scoreCpWhite ?? 0));
  const whitePercent = 50 + (clamped / 900) * 50;
  const label =
    typeof scoreCpWhite === "number"
      ? `${scoreCpWhite > 0 ? "+" : ""}${(scoreCpWhite / 100).toFixed(1)}`
      : "0.0";

  return (
    <div className="flex h-full min-h-[18rem] w-8 flex-col overflow-hidden rounded-lg border border-white/10 bg-black/30">
      <div className="relative flex-1 bg-[#1f2421]">
        <div className="absolute bottom-0 left-0 right-0 bg-ink transition-all" style={{ height: `${whitePercent}%` }} />
      </div>
      <div className="grid h-9 place-items-center bg-night text-[11px] font-bold text-white/70">{label}</div>
    </div>
  );
}
