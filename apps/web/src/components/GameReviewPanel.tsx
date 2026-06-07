import { useEffect, useRef } from "react";
import type { MoveAnalysis } from "@mda-chess/shared";
import { cn } from "@mda-chess/ui";
import { AccuracyBadge } from "./AccuracyBadge";
import { accuracyFromLosses } from "@mda-chess/shared";

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
    <section className="flex min-h-[18rem] min-w-0 flex-col rounded-xl border border-white/[0.07] bg-panel shadow-panel">
      {/* Header */}
      <div className="flex h-12 items-center justify-between gap-2 border-b border-white/[0.07] px-3">
        <h2 className="text-sm font-bold text-white">Нүүдлийн жагсаалт</h2>
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

      {/* Move list */}
      <div className="min-h-0 flex-1 overflow-auto">
        {loading ? <MoveListSkeleton /> : null}
        {!loading && moves.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 py-10 text-center">
            <div className="grid h-12 w-12 place-items-center rounded-xl bg-white/[0.04] text-2xl">♟</div>
            <p className="text-sm text-white/35">PGN оруулаад шинжилгээ эхлүүлнэ үү</p>
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
              <div className="flex items-center justify-center bg-black/10 text-[11px] font-bold text-white/25">
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

  return (
    <button
      className={cn(
        "relative flex min-h-10 min-w-0 items-center justify-between gap-2 border-l border-white/[0.04] px-2.5 text-left transition-all duration-150",
        selected
          ? "bg-accent/[0.14] text-white"
          : "text-white/65 hover:bg-white/[0.05] hover:text-white/90"
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
      <span className="min-w-0 truncate font-semibold">{move.san}</span>
      <span className={classificationClass(move.classification)} aria-hidden="true">
        {classificationSymbol(move.classification)}
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
  return "bg-accent";
}

function classificationClass(classification: MoveAnalysis["classification"]) {
  const base = "grid h-5 min-w-5 place-items-center rounded-md text-[10px] font-black leading-none";
  if (classification === "blunder") return `${base} bg-danger/20 text-[#ff9a91]`;
  if (classification === "mistake") return `${base} bg-danger/15 text-[#ffb0aa]`;
  if (classification === "inaccuracy") return `${base} bg-warning/[0.18] text-[#f4cf74]`;
  if (classification === "book") return `${base} bg-white/10 text-white/40`;
  return `${base} bg-accent/[0.18] text-[#99c76a]`;
}
