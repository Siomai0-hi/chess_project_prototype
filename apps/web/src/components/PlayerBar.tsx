import { Clock3 } from "lucide-react";
import { cn } from "@mda-chess/ui";

interface PlayerBarProps {
  side: "white" | "black";
  name: string;
  rating?: number;
  clock?: string;
  isActive?: boolean;
  materialAdvantage?: number;
}

export function PlayerBar({ side, name, rating = 1500, clock, isActive, materialAdvantage = 0 }: PlayerBarProps) {
  const initials = name.slice(0, 1).toUpperCase();
  const materialLabel = materialAdvantage > 0 ? `+${materialAdvantage}` : "";

  return (
    <div
      className={cn(
        "flex h-11 items-center justify-between gap-3 rounded-lg border bg-panel px-3 text-sm",
        isActive ? "border-accent/70 shadow-[0_0_0_1px_rgba(91,138,50,0.35)]" : "border-white/10"
      )}
    >
      <div className="flex min-w-0 items-center gap-2.5">
        <div
          className={cn(
            "grid h-7 w-7 shrink-0 place-items-center rounded-md text-xs font-bold",
            side === "white" ? "bg-white text-night" : "bg-[#111] text-white"
          )}
        >
          {initials}
        </div>
        <div className="min-w-0">
          <div className="flex min-w-0 items-center gap-2">
            <span className="truncate font-semibold text-white">{name}</span>
            <span className="shrink-0 text-xs text-white/45">{rating}</span>
          </div>
          {materialLabel ? <p className="text-xs font-semibold text-white/55">{materialLabel}</p> : null}
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-1.5 rounded-md bg-night px-2 py-1 text-xs font-bold text-white/80">
        <Clock3 size={13} aria-hidden="true" />
        {clock ?? "--:--"}
      </div>
    </div>
  );
}
