import type { GameSummary, MoveAnalysis } from "@mda-chess/shared";
import { AlertTriangle, BadgeCheck, BookOpen, Target } from "lucide-react";
import { MetricPill } from "./ui/MetricPill";
import { Button } from "./ui/Button";

interface GameReviewPanelProps {
  moves: MoveAnalysis[];
  summary?: GameSummary;
  selectedMove?: MoveAnalysis;
  onSelectMove: (move: MoveAnalysis) => void;
  loading?: boolean;
}

export function GameReviewPanel({ moves, summary, selectedMove, onSelectMove, loading }: GameReviewPanelProps) {
  return (
    <section className="rounded-lg border border-white/10 bg-panel p-4 shadow-2xl">
      <div className="grid grid-cols-2 gap-2">
        <MetricPill label="Цагаан" value={`${summary?.accuracyWhite ?? 0}%`} icon={<BadgeCheck size={13} />} />
        <MetricPill label="Хар" value={`${summary?.accuracyBlack ?? 0}%`} icon={<Target size={13} />} />
        <MetricPill label="Алдаа" value={summary?.criticalMistakes ?? 0} icon={<AlertTriangle size={13} />} />
        <MetricPill label="Нээлт" value={summary?.opening ?? "Илрүүлнэ"} icon={<BookOpen size={13} />} />
      </div>

      <div className="mt-4 max-h-[24rem] overflow-auto pr-1">
        {loading ? <p className="text-sm text-white/60">Тоглолтыг шинжилж байна...</p> : null}
        {!loading && moves.length === 0 ? (
          <p className="text-sm text-white/60">PGN оруулаад эсвэл самбар дээр нүүгээд эхлээрэй.</p>
        ) : null}
        <div className="grid grid-cols-1 gap-2">
          {moves.map((move) => (
            <button
              key={`${move.moveNumber}-${move.color}-${move.san}-${move.fenAfter}`}
              className={`flex items-center justify-between rounded-lg border px-3 py-2 text-left text-sm transition ${
                selectedMove?.fenAfter === move.fenAfter
                  ? "border-accent bg-accent/[0.12]"
                  : "border-white/10 bg-white/[0.04] hover:bg-white/[0.07]"
              }`}
              onClick={() => onSelectMove(move)}
            >
              <span className="font-semibold text-ink">
                {move.moveNumber}. {move.san}
              </span>
              <span className={classificationClass(move.classification)}>{classificationLabel(move.classification)}</span>
            </button>
          ))}
        </div>
      </div>

      {summary?.review ? (
        <div className="mt-4 rounded-lg border border-white/10 bg-night p-3 text-sm leading-6 text-white/70">
          {summary.review}
        </div>
      ) : null}
    </section>
  );
}

function classificationLabel(classification: MoveAnalysis["classification"]) {
  const labels: Record<MoveAnalysis["classification"], string> = {
    book: "Ном",
    best: "Шилдэг",
    excellent: "Маш сайн",
    good: "Сайн",
    inaccuracy: "Алдаатай",
    mistake: "Алдаа",
    blunder: "Ноцтой"
  };
  return labels[classification];
}

function classificationClass(classification: MoveAnalysis["classification"]) {
  const base = "rounded-md px-2 py-1 text-xs font-bold";
  if (classification === "blunder" || classification === "mistake") return `${base} bg-danger/[0.16] text-[#ff8d83]`;
  if (classification === "inaccuracy") return `${base} bg-warning/[0.16] text-[#ffd483]`;
  return `${base} bg-accent/[0.14] text-[#86e89c]`;
}
