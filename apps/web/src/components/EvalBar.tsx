import { cn } from "@mda-chess/ui";

interface EvalBarProps {
  scoreCpWhite?: number;
  mateIn?: number;
  className?: string;
}

export function EvalBar({ scoreCpWhite, mateIn, className }: EvalBarProps) {
  const isMate = typeof mateIn === "number";
  const clamped = isMate
    ? mateIn > 0 ? 900 : -900
    : Math.max(-900, Math.min(900, scoreCpWhite ?? 0));

  const whitePercent = 50 + (clamped / 900) * 50;

  const label = isMate
    ? `#${Math.abs(mateIn!)}`
    : typeof scoreCpWhite === "number"
    ? `${scoreCpWhite > 0 ? "+" : ""}${(scoreCpWhite / 100).toFixed(1)}`
    : "0.0";

  const isWhiteAdvantage = clamped >= 0;
  const isMateForWhite = isMate && mateIn! > 0;
  const isMateForBlack = isMate && mateIn! < 0;

  return (
    <div
      className={cn(
        "relative flex h-full min-h-[18rem] w-7 flex-col overflow-hidden rounded-lg border border-white/[0.09] bg-[#0d0c0b] shadow-inner",
        className
      )}
      title={`Үнэлгээ: ${label}`}
      role="meter"
      aria-valuenow={scoreCpWhite ?? 0}
      aria-valuemin={-900}
      aria-valuemax={900}
      aria-label={`Тоглолтын үнэлгээ ${label}`}
    >
      {/* Black region (top) */}
      <div className="relative flex-1 overflow-hidden bg-[#1a1a1a]">
        {/* White fill from bottom */}
        <div
          className="absolute bottom-0 left-0 right-0 transition-all duration-500 ease-out"
          style={{
            height: `${whitePercent}%`,
            background: isMateForWhite
              ? "linear-gradient(180deg, #65c8bd 0%, #f7f3ea 100%)"
              : isMateForBlack
              ? "linear-gradient(180deg, #413a31 0%, #9f9a8f 100%)"
              : isWhiteAdvantage
              ? "linear-gradient(180deg, #d7b56d 0%, #f7f3ea 100%)"
              : "linear-gradient(180deg, #54736f 0%, #d9c89c 100%)"
          }}
        />

        {/* Score label */}
        <div
          className={cn(
            "absolute left-1/2 -translate-x-1/2 rounded-md px-1 py-0.5 text-[9px] font-black tabular leading-tight tracking-tight transition-all duration-500",
            isMate
              ? "top-2 bg-black/60 text-accent-light"
              : isWhiteAdvantage
              ? "bottom-2 bg-black/55 text-ink"
              : "top-2 bg-white/15 text-white/90"
          )}
        >
          {label}
        </div>
      </div>

      {/* Footer label */}
      <div className="grid h-6 place-items-center bg-[#0d0c0b] text-[9px] font-bold uppercase tracking-widest text-white/30">
        eval
      </div>
    </div>
  );
}
