import { useEffect, useRef } from "react";
import type { MoveAnalysis } from "@mda-chess/shared";
import { cn } from "@mda-chess/ui";
import { AccuracyBadge } from "./AccuracyBadge";
import { accuracyFromLosses } from "@mda-chess/shared";
import { AlertTriangle, BookOpenCheck, NotebookTabs } from "lucide-react";

interface GameReviewPanelProps {
  moves: MoveAnalysis[];
  selectedMove?: MoveAnalysis;
  onSelectMove: (move: MoveAnalysis) => void;
  loading?: boolean;
}

interface MovePair {
  moveNumber: number;
  white?: MoveAnalysis;
  black?: MoveAnalysis;
}

export function GameReviewPanel({ moves, selectedMove, onSelectMove, loading }: GameReviewPanelProps) {
  const pairs = buildMovePairs(moves);
  const selectedRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to selected move
  useEffect(() => {
    if (selectedRef.current) {
      selectedRef.current.scrollIntoView({ block: "nearest", behavior: "smooth" });
    }
  }, [selectedMove]);

  const whiteLosses = moves.filter((m) => m.color === "white").map((m) => m.centipawnLoss);
  const blackLosses = moves.filter((m) => m.color === "black").map((m) => m.centipawnLoss);
  const wAcc = moves.length ? accuracyFromLosses(whiteLosses) : undefined;
  const bAcc = moves.length ? accuracyFromLosses(blackLosses) : undefined;

  return (
    <section className="flex min-h-[18rem] min-w-0 flex-col rounded-lg border border-white/[0.08] bg-[#171411]/88 shadow-panel">
      <div className="flex h-12 items-center justify-between gap-2 border-b border-white/[0.08] px-3">
        <div className="flex min-w-0 items-center gap-2">
          <NotebookTabs size={15} className="text-accent-light" aria-hidden="true" />
          <div className="min-w-0">
            <h2 className="truncate text-sm font-black text-ink">Нүүдлийн хуудас</h2>
            <p className="text-[10px] font-bold uppercase tracking-[0.20em] text-white/35">{moves.length ? `${moves.length} нүүдэл` : "PGN"}</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          {wAcc !== undefined ? <AccuracyBadge accuracy={wAcc} size="sm" /> : null}
          {bAcc !== undefined ? <AccuracyBadge accuracy={bAcc} size="sm" /> : null}
          {!wAcc && !bAcc ? (
            <span className="text-xs text-white/35">
              {moves.length ? `${moves.length} нүүдэл` : "PGN"}
            </span>
          ) : null}
        </div>
      </div>

      <div className="grid grid-cols-[2.4rem_minmax(0,1fr)_minmax(0,1fr)] border-b border-white/[0.06] bg-black/[0.14] px-0 text-[10px] font-bold uppercase tracking-[0.18em] text-white/35">
        <div className="py-2 text-center">#</div>
        <div className="border-l border-white/[0.05] px-2.5 py-2">Цагаан</div>
        <div className="border-l border-white/[0.05] px-2.5 py-2">Хар</div>
      </div>

      <div className="min-h-0 flex-1 overflow-auto">
        {loading ? <MoveListSkeleton /> : null}
        {!loading && moves.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 px-4 py-12 text-center">
            <div className="grid h-12 w-12 place-items-center rounded-lg border border-white/[0.08] bg-white/[0.045] text-accent-light">
              <BookOpenCheck size={19} aria-hidden="true" />
            </div>
            <p className="text-sm font-semibold text-white/[0.38]">PGN хүлээж байна</p>
          </div>
        ) : null}
        <div className="grid text-sm">
          {pairs.map((pair) => (
            <div
              key={pair.moveNumber}
              className="grid grid-cols-[2.4rem_minmax(0,1fr)_minmax(0,1fr)] border-b border-white/[0.04]"
              ref={
                selectedMove &&
                (pair.white?.fenAfter === selectedMove.fenAfter ||
                  pair.black?.fenAfter === selectedMove.fenAfter)
                  ? selectedRef
                  : null
              }
            >
              <div className="flex items-center justify-center bg-black/[0.16] text-[11px] font-black tabular text-white/[0.28]">
                {pair.moveNumber}
              </div>
              <MoveCell
                move={pair.white}
                selected={selectedMove?.fenAfter === pair.white?.fenAfter}
                onSelectMove={onSelectMove}
              />
              <MoveCell
                move={pair.black}
                selected={selectedMove?.fenAfter === pair.black?.fenAfter}
                onSelectMove={onSelectMove}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function MoveCell({
  move,
  selected,
  onSelectMove
}: {
  move?: MoveAnalysis;
  selected: boolean;
  onSelectMove: (move: MoveAnalysis) => void;
}) {
  if (!move) return <div className="min-h-10 border-l border-white/[0.04]" />;

  const leftBorderColor = classificationBorderColor(move.classification);
  const isCritical = move.classification === "mistake" || move.classification === "blunder";

  return (
    <button
      className={cn(
        "relative flex min-h-10 min-w-0 items-center justify-between gap-2 border-l border-white/[0.045] px-2.5 text-left transition-all duration-150",
        selected
          ? "bg-accent/[0.13] text-ink shadow-[inset_0_0_0_1px_rgba(215,181,109,0.20)]"
          : "text-white/[0.66] hover:bg-white/[0.055] hover:text-white/[0.92]"
      )}
      onClick={() => onSelectMove(move)}
      title={`${move.moveNumber}. ${move.san} — ${classificationLabel(move.classification)}`}
      aria-label={`${move.moveNumber}. ${move.san}, ${classificationLabel(move.classification)}`}
      aria-pressed={selected}
    >
      {/* Classification left border */}
      <span
        className={cn("absolute left-0 top-0 h-full w-0.5 transition-opacity", leftBorderColor, selected ? "opacity-100" : "opacity-40")}
      />
      <span className="min-w-0 truncate font-bold">{move.san}</span>
      <span className="flex shrink-0 items-center gap-1">
        {isCritical ? <AlertTriangle size={12} className="text-danger-light" aria-hidden="true" /> : null}
        <span className="hidden text-[10px] font-semibold tabular text-white/[0.32] sm:inline">{move.centipawnLoss}cp</span>
        <span className={classificationClass(move.classification)} aria-hidden="true">
          {classificationSymbol(move.classification)}
        </span>
      </span>
    </button>
  );
}

function buildMovePairs(moves: MoveAnalysis[]): MovePair[] {
  const map = new Map<number, MovePair>();
  for (const move of moves) {
    const pair = map.get(move.moveNumber) ?? { moveNumber: move.moveNumber };
    if (move.color === "white") pair.white = move;
    else pair.black = move;
    map.set(move.moveNumber, pair);
  }
  return [...map.values()].sort((a, b) => a.moveNumber - b.moveNumber);
}

function MoveListSkeleton() {
  return (
    <div className="space-y-1.5 p-3">
      {Array.from({ length: 8 }).map((_, index) => (
        <div key={index} className="skeleton h-8 rounded-lg" />
      ))}
    </div>
  );
}

function classificationLabel(classification: MoveAnalysis["classification"]) {
  const labels: Record<MoveAnalysis["classification"], string> = {
    book: "Ном",
    best: "Шилдэг",
    excellent: "Маш сайн",
    good: "Сайн",
    inaccuracy: "Оновчгүй",
    mistake: "Алдаа",
    blunder: "Ноцтой алдаа"
  };
  return labels[classification];
}

function classificationSymbol(classification: MoveAnalysis["classification"]) {
  const symbols: Record<MoveAnalysis["classification"], string> = {
    book: "○",
    best: "!!",
    excellent: "!",
    good: "•",
    inaccuracy: "?!",
    mistake: "?",
    blunder: "??"
  };
  return symbols[classification];
}

function classificationBorderColor(classification: MoveAnalysis["classification"]) {
  if (classification === "blunder") return "bg-danger";
  if (classification === "mistake") return "bg-danger/70";
  if (classification === "inaccuracy") return "bg-warning";
  if (classification === "book") return "bg-white/20";
  if (classification === "best" || classification === "excellent") return "bg-teal";
  return "bg-accent";
}

function classificationClass(classification: MoveAnalysis["classification"]) {
  const base = "grid h-5 min-w-5 place-items-center rounded-md border text-[10px] font-black leading-none";
  if (classification === "blunder") return `${base} border-danger/25 bg-danger/20 text-[#ff9a91]`;
  if (classification === "mistake") return `${base} border-danger/20 bg-danger/15 text-[#ffb0aa]`;
  if (classification === "inaccuracy") return `${base} bg-warning/[0.18] text-[#f4cf74]`;
  if (classification === "book") return `${base} border-white/10 bg-white/10 text-white/40`;
  return `${base} border-teal/25 bg-teal/[0.14] text-teal`;
}
