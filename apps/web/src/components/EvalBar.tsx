import { cn } from "@mda-chess/ui";

export function EvalBar({ scoreCpWhite, className }: { scoreCpWhite?: number; className?: string }) {
  const clamped = Math.max(-900, Math.min(900, scoreCpWhite ?? 0));
  const whitePercent = 50 + (clamped / 900) * 50;
  const label =
    typeof scoreCpWhite === "number"
      ? `${scoreCpWhite > 0 ? "+" : ""}${(scoreCpWhite / 100).toFixed(1)}`
      : "0.0";

  return (
    <div
      className={cn(
        "relative flex h-full min-h-[18rem] w-7 flex-col overflow-hidden rounded-lg border border-white/10 bg-[#111]",
        className
      )}
      title={`Үнэлгээ ${label}`}
    >
      <div className="relative flex-1 bg-[#111]">
        <div className="absolute bottom-0 left-0 right-0 bg-white transition-all duration-300" style={{ height: `${whitePercent}%` }} />
        <div className="absolute left-1/2 top-2 -translate-x-1/2 rounded bg-black/45 px-1.5 py-1 text-[10px] font-bold text-white">
          {label}
        </div>
      </div>
      <div className="grid h-7 place-items-center bg-[#111] text-[10px] font-bold text-white/60">eval</div>
    </div>
  );
}
