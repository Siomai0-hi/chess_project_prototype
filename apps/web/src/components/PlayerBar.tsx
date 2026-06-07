import { cn } from "@mda-chess/ui";

interface PlayerBarProps {
  side: "white" | "black";
  name: string;
  rating?: number;
  clock?: string;
  isActive?: boolean;
  materialAdvantage?: number;
}

const PIECE_SYMBOLS = ["♟", "♞", "♝", "♜", "♛"];
const PIECE_VALUES = [1, 3, 3, 5, 9];

function materialPieces(advantage: number): string {
  if (advantage <= 0) return "";
  const pieces: string[] = [];
  let remaining = advantage;
  for (let i = PIECE_VALUES.length - 1; i >= 0 && remaining > 0; i--) {
    const count = Math.floor(remaining / (PIECE_VALUES[i] ?? 1));
    if (count > 0) {
      pieces.push(PIECE_SYMBOLS[i]?.repeat(Math.min(count, 3)) ?? "");
      remaining -= count * (PIECE_VALUES[i] ?? 1);
    }
  }
  return pieces.join("");
}

export function PlayerBar({ side, name, rating, clock, isActive, materialAdvantage = 0 }: PlayerBarProps) {
  const initials = name.slice(0, 1).toUpperCase();
  const piecesLabel = materialPieces(materialAdvantage);

  return (
    <div
      className={cn(
        "flex h-11 items-center justify-between gap-3 rounded-xl border px-3 text-sm transition-all duration-300",
        isActive
          ? "border-accent/50 bg-accent/[0.07] shadow-[0_0_0_1px_rgba(91,138,50,0.2),0_0_12px_rgba(91,138,50,0.1)]"
          : "border-white/[0.07] bg-panel"
      )}
    >
      <div className="flex min-w-0 items-center gap-2.5">
        {/* Avatar */}
        <div
          className={cn(
            "relative grid h-7 w-7 shrink-0 place-items-center rounded-lg text-xs font-bold transition-all duration-300",
            side === "white"
              ? "bg-white text-night"
              : "border border-white/20 bg-[#111] text-white",
            isActive && "ring-2 ring-accent/60 ring-offset-1 ring-offset-night"
          )}
        >
          {initials}
          {/* Active pulse dot */}
          {isActive ? (
            <span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-accent shadow-[0_0_6px_rgba(91,138,50,0.8)] animate-glow-pulse" />
          ) : null}
        </div>

        {/* Name & material */}
        <div className="min-w-0">
          <div className="flex min-w-0 items-center gap-2">
            <span className="truncate font-semibold text-white">{name}</span>
            {rating ? (
              <span className="shrink-0 text-[11px] font-medium text-white/35">{rating}</span>
            ) : null}
          </div>
          {piecesLabel ? (
            <p className="text-[11px] leading-none text-white/45" aria-label={`+${materialAdvantage} material`}>
              {piecesLabel} <span className="text-white/30">+{materialAdvantage}</span>
            </p>
          ) : null}
        </div>
      </div>

      {/* Clock — only shown when a clock prop is provided */}
      {clock != null ? (
        <div
          className={cn(
            "flex shrink-0 items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-bold tabular transition-all duration-300",
            isActive
              ? "bg-accent/20 text-accent-light"
              : "bg-black/20 text-white/50"
          )}
        >
          <span className="text-[10px] opacity-60">⏱</span>
          {clock}
        </div>
      ) : null}
    </div>
  );
}
