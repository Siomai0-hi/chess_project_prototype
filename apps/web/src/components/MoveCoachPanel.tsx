import type { CoachExplanation, MoveAnalysis } from "@mda-chess/shared";
import { ArrowRight, Lightbulb, Loader2, Search, Sparkles } from "lucide-react";
import { useState } from "react";
import { Button } from "./ui/Button";

interface MoveCoachPanelProps {
  move?: MoveAnalysis;
  explanation?: CoachExplanation;
  loading?: boolean;
  analyzing?: boolean;
  onAnalyze?: () => void;
}

export function MoveCoachPanel({ move, explanation, loading, analyzing, onAnalyze }: MoveCoachPanelProps) {
  const evaluation = move?.evaluationAfter ?? move?.evaluationBefore;
  const bestMoves = evaluation?.principalVariation?.slice(0, 3) ?? [];
  const [showLong, setShowLong] = useState(false);

  return (
    <section className="flex min-h-[24rem] flex-col rounded-xl border border-white/[0.07] bg-panel shadow-panel">
      {/* Header */}
      <div className="flex h-12 items-center justify-between gap-3 border-b border-white/[0.07] px-3">
        <div className="min-w-0">
          <h2 className="text-sm font-bold text-white">Шинжилгээ</h2>
          {move ? (
            <p className="truncate text-[11px] text-white/35">
              {move.moveNumber}. {move.san}
              <span className={`ml-1.5 ${classificationColor(move.classification)}`}>
                {classificationSymbol(move.classification)} {classificationLabel(move.classification)}
              </span>
            </p>
          ) : (
            <p className="text-[11px] text-white/35">Нүүдэл сонгоно уу</p>
          )}
        </div>
        <Button
          variant="secondary"
          size="sm"
          icon={analyzing ? <Loader2 className="animate-spin" size={14} /> : <Search size={14} />}
          onClick={onAnalyze}
          disabled={analyzing}
          title="Шинжлэх"
          aria-label="Шинжлэх"
        >
          {analyzing ? "Шинжилж байна" : "Шинжлэх"}
        </Button>
      </div>

      {/* Content */}
      <div className="min-h-0 flex-1 space-y-3 overflow-auto p-3">

        {/* Eval stats */}
        <div className="grid grid-cols-3 gap-2">
          <InfoCell label="Eval" value={formatScore(evaluation?.scoreCpWhite, evaluation?.mateIn)} />
          <InfoCell label="Гүн" value={evaluation?.depth ?? "--"} />
          <InfoCell
            label="Алдагдал"
            value={typeof move?.centipawnLoss === "number" ? `${move.centipawnLoss}cp` : "--"}
            danger={(move?.centipawnLoss ?? 0) > 150}
          />
        </div>

        {/* Classification banner */}
        {move ? (
          <div className={`rounded-lg border px-3 py-2 ${classificationBannerClass(move.classification)}`}>
            <p className="text-xs font-bold">{classificationLabel(move.classification)}: {move.san}</p>
          </div>
        ) : null}

        {/* Best moves */}
        <section>
          <h3 className="mb-1.5 text-[10px] font-bold uppercase tracking-widest text-white/35">
            Шилдэг нүүдлүүд
          </h3>
          {bestMoves.length ? (
            <div className="space-y-1">
              {bestMoves.map((line, index) => (
                <div
                  key={`${line}-${index}`}
                  className="flex items-center justify-between rounded-lg bg-night px-3 py-2 text-sm"
                >
                  <span className="grid h-5 w-5 place-items-center rounded-md bg-white/[0.06] text-[11px] font-bold text-white/40">
                    {index + 1}
                  </span>
                  <span className="truncate px-2 font-bold text-white">{line}</span>
                  <span className="text-white/25">
                    <ArrowRight size={12} />
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="rounded-lg bg-night px-3 py-2 text-sm text-white/35">
              Шинжилгээний дараа engine line гарна.
            </p>
          )}
        </section>

        {/* Better move chip */}
        {explanation?.betterMove ? (
          <div className="flex items-center gap-2 rounded-lg border border-accent/25 bg-accent/[0.08] px-3 py-2">
            <Sparkles size={13} className="shrink-0 text-accent-light" />
            <span className="text-xs text-white/60">Илүү сайн нүүдэл:</span>
            <span className="font-bold text-accent-light">{explanation.betterMove}</span>
          </div>
        ) : null}

        {/* Coach explanation */}
        <section>
          <h3 className="mb-1.5 text-[10px] font-bold uppercase tracking-widest text-white/35">
            Тайлбар
          </h3>
          {loading ? <CoachSkeleton /> : null}
          {!loading ? (
            <div className="space-y-2">
              {/* Short explanation */}
              <CoachBlock value={explanation?.short ?? "Сонгосон нүүдлийн тайлбар энд гарна."} />

              {/* Long explanation (collapsible) */}
              {explanation?.long ? (
                <div>
                  <button
                    className="mb-1 text-[11px] font-semibold text-accent-light underline-offset-2 hover:underline"
                    onClick={() => setShowLong((v) => !v)}
                  >
                    {showLong ? "Хураангуй харах ↑" : "Дэлгэрэнгүй харах ↓"}
                  </button>
                  {showLong ? <CoachBlock value={explanation.long} /> : null}
                </div>
              ) : null}

              <CoachBlock title="Тактик" value={explanation?.tacticalReason} />
              <CoachBlock title="Байрлал" value={explanation?.positionalReason} />
              <CoachBlock
                title="Дасгал"
                value={explanation?.trainingTip}
                icon={<Lightbulb size={13} className="text-warning-light" />}
                highlight
              />
            </div>
          ) : null}
        </section>
      </div>
    </section>
  );
}

function InfoCell({ label, value, danger }: { label: string; value: React.ReactNode; danger?: boolean }) {
  return (
    <div className="rounded-lg border border-white/[0.07] bg-night px-2 py-2">
      <p className="text-[10px] font-semibold uppercase tracking-wide text-white/35">{label}</p>
      <p className={`mt-0.5 truncate text-sm font-bold tabular ${danger ? "text-danger-light" : "text-white"}`}>
        {value}
      </p>
    </div>
  );
}

function CoachBlock({
  title,
  value,
  icon,
  highlight
}: {
  title?: string;
  value?: string;
  icon?: React.ReactNode;
  highlight?: boolean;
}) {
  if (!value) return null;
  return (
    <div
      className={`rounded-lg border p-3 ${
        highlight
          ? "border-warning/20 bg-warning/[0.06]"
          : "border-white/[0.07] bg-night"
      }`}
    >
      {title ? (
        <p className="mb-1.5 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wide text-white/40">
          {icon}
          {title}
        </p>
      ) : null}
      <p className="text-sm leading-[1.65] text-white/70">{value}</p>
    </div>
  );
}

function CoachSkeleton() {
  return (
    <div className="space-y-2">
      <div className="skeleton h-20 rounded-lg" />
      <div className="skeleton h-14 rounded-lg" />
    </div>
  );
}

function formatScore(scoreCpWhite?: number, mateIn?: number) {
  if (typeof mateIn === "number") return `#${mateIn}`;
  if (typeof scoreCpWhite !== "number") return "--";
  return `${scoreCpWhite > 0 ? "+" : ""}${(scoreCpWhite / 100).toFixed(2)}`;
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
    book: "○", best: "!!", excellent: "!", good: "•",
    inaccuracy: "?!", mistake: "?", blunder: "??"
  };
  return symbols[classification];
}

function classificationColor(classification: MoveAnalysis["classification"]) {
  if (classification === "blunder" || classification === "mistake") return "text-danger-light";
  if (classification === "inaccuracy") return "text-warning-light";
  if (classification === "book") return "text-white/40";
  return "text-accent-light";
}

function classificationBannerClass(classification: MoveAnalysis["classification"]) {
  if (classification === "blunder") return "border-danger/30 bg-danger/10 text-danger-light";
  if (classification === "mistake") return "border-danger/20 bg-danger/[0.07] text-danger-light";
  if (classification === "inaccuracy") return "border-warning/25 bg-warning/[0.08] text-warning-light";
  if (classification === "book") return "border-white/10 bg-white/[0.04] text-white/50";
  return "border-accent/25 bg-accent/[0.08] text-accent-light";
}
