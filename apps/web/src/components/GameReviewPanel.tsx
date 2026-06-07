import type { MoveAnalysis } from "@mda-chess/shared";
import { cn } from "@mda-chess/ui";

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

  return (
    <section className="flex min-h-[18rem] min-w-0 flex-col rounded-lg border border-white/10 bg-panel shadow-2xl">
      <div className="flex h-12 items-center justify-between border-b border-white/10 px-3">
        <h2 className="text-sm font-bold text-white">Нүүдлийн жагсаалт</h2>
        <span className="text-xs text-white/45">{moves.length ? `${moves.length} нүүдэл` : "PGN"}</span>
      </div>

      <div className="min-h-0 flex-1 overflow-auto">
        {loading ? <MoveListSkeleton /> : null}
        {!loading && moves.length === 0 ? (
          <div className="p-3 text-sm leading-6 text-white/55">PGN оруулаад шинжилгээ эхлүүлнэ үү.</div>
        ) : null}
        <div className="grid text-sm">
          {pairs.map((pair) => (
            <div key={pair.moveNumber} className="grid grid-cols-[2.6rem_minmax(0,1fr)_minmax(0,1fr)] border-b border-white/[0.045]">
              <div className="flex items-center justify-center bg-black/10 text-xs font-semibold text-white/40">{pair.moveNumber}.</div>
              <MoveCell move={pair.white} selected={selectedMove?.fenAfter === pair.white?.fenAfter} onSelectMove={onSelectMove} />
              <MoveCell move={pair.black} selected={selectedMove?.fenAfter === pair.black?.fenAfter} onSelectMove={onSelectMove} />
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
  if (!move) return <div className="min-h-10 border-l border-white/[0.045]" />;

  return (
    <button
      className={cn(
        "flex min-h-10 min-w-0 items-center justify-between gap-2 border-l border-white/[0.045] px-2.5 text-left transition",
        selected ? "bg-accent/20 text-white" : "text-white/75 hover:bg-white/[0.06]"
      )}
      onClick={() => onSelectMove(move)}
      title={`${move.moveNumber}. ${move.san} - ${classificationLabel(move.classification)}`}
      aria-label={`${move.moveNumber}. ${move.san}, ${classificationLabel(move.classification)}`}
    >
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
    <div className="space-y-2 p-3">
      {Array.from({ length: 8 }).map((_, index) => (
        <div key={index} className="h-8 animate-pulse rounded bg-white/[0.055]" />
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

function classificationClass(classification: MoveAnalysis["classification"]) {
  const base = "grid h-5 min-w-5 place-items-center rounded text-[11px] font-black leading-none";
  if (classification === "blunder") return `${base} bg-danger/20 text-[#ff9a91]`;
  if (classification === "mistake") return `${base} bg-danger/15 text-[#ffb0aa]`;
  if (classification === "inaccuracy") return `${base} bg-warning/[0.18] text-[#f4cf74]`;
  if (classification === "book") return `${base} bg-white/10 text-white/50`;
  return `${base} bg-accent/[0.18] text-[#99c76a]`;
}
