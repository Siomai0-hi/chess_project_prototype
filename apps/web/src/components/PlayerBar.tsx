import { cn } from "@mda-chess/ui";
import { Clock3 } from "lucide-react";

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
        "flex h-11 items-center justify-between gap-3 rounded-lg border px-3 text-sm transition-all duration-300",
        isActive
          ? "border-accent/45 bg-[linear-gradient(90deg,rgba(215,181,109,0.14),rgba(101,200,189,0.07))] shadow-[0_0_0_1px_rgba(215,181,109,0.12),0_12px_26px_rgba(0,0,0,0.22)]"
          : "border-white/[0.08] bg-[#171411]/82"
      )}
    >
      <div className="flex min-w-0 items-center gap-2.5">
        {/* Avatar */}
        <div
          className={cn(
            "relative grid h-7 w-7 shrink-0 place-items-center rounded-md text-xs font-black transition-all duration-300",
            side === "white"
              ? "bg-ink text-night"
              : "border border-white/20 bg-[#0d0c0b] text-ink",
            isActive && "ring-2 ring-teal/60 ring-offset-1 ring-offset-night"
          )}
        >
          {initials}
          {isActive ? (
            <span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-teal shadow-[0_0_8px_rgba(101,200,189,0.75)] animate-glow-pulse" />
          ) : null}
        </div>

        <div className="min-w-0">
          <div className="flex min-w-0 items-center gap-2">
            <span className="truncate font-semibold text-ink">{name}</span>
            {rating ? (
              <span className="shrink-0 text-[11px] font-medium text-white/35">{rating}</span>
            ) : null}
          </div>
          {piecesLabel ? (
            <p className="text-[11px] leading-none text-accent-light/75" aria-label={`+${materialAdvantage} material`}>
              {piecesLabel} <span className="text-white/35">+{materialAdvantage}</span>
            </p>
          ) : null}
        </div>
      </div>

      {clock != null ? (
        <div
          className={cn(
            "flex shrink-0 items-center gap-1 rounded-md px-2.5 py-1 text-xs font-bold tabular transition-all duration-300",
            isActive
              ? "bg-teal/[0.14] text-teal"
              : "bg-black/20 text-white/50"
          )}
        >
          <Clock3 size={12} className="opacity-70" aria-hidden="true" />
          {clock}
        </div>
      ) : null}
    </div>
  );
}
