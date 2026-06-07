import type { CoachExplanation, MoveAnalysis } from "@mda-chess/shared";
import { Lightbulb, Loader2, Search } from "lucide-react";
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

  return (
    <section className="flex min-h-[24rem] flex-col rounded-lg border border-white/10 bg-panel shadow-2xl">
      <div className="flex h-12 items-center justify-between gap-3 border-b border-white/10 px-3">
        <div>
          <h2 className="text-sm font-bold text-white">Шинжилгээ</h2>
          <p className="text-xs text-white/45">{move ? `${move.moveNumber}. ${move.san}` : "Нүүдэл сонгоно уу"}</p>
        </div>
        <Button
          variant="secondary"
          icon={analyzing ? <Loader2 className="animate-spin" size={16} /> : <Search size={16} />}
          onClick={onAnalyze}
          disabled={analyzing}
          title="Шинжлэх"
          aria-label="Шинжлэх"
        />
      </div>

      <div className="min-h-0 flex-1 space-y-4 overflow-auto p-3">
        <div className="grid grid-cols-3 gap-2">
          <InfoCell label="Eval" value={formatScore(evaluation?.scoreCpWhite, evaluation?.mateIn)} />
          <InfoCell label="Гүн" value={evaluation?.depth ?? "--"} />
          <InfoCell label="Алдагдал" value={typeof move?.centipawnLoss === "number" ? `${move.centipawnLoss}` : "--"} />
        </div>

        <section>
          <h3 className="mb-2 text-xs font-bold uppercase text-white/45">Шилдэг нүүдлүүд</h3>
          {bestMoves.length ? (
            <div className="space-y-1">
              {bestMoves.map((line, index) => (
                <div key={`${line}-${index}`} className="flex items-center justify-between rounded-md bg-night px-3 py-2 text-sm">
                  <span className="font-semibold text-white/55">{index + 1}</span>
                  <span className="truncate font-bold text-white">{line}</span>
                  <span className="text-white/35">→</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="rounded-md bg-night px-3 py-2 text-sm text-white/55">Шинжилгээний дараа engine line гарна.</p>
          )}
        </section>

        <section>
          <h3 className="mb-2 text-xs font-bold uppercase text-white/45">Тайлбар</h3>
          {loading ? <CoachSkeleton /> : null}
          {!loading ? (
            <div className="space-y-2">
              <CoachBlock value={explanation?.short ?? "Сонгосон нүүдлийн тайлбар энд гарна."} />
              <CoachBlock title="Тактик" value={explanation?.tacticalReason} />
              <CoachBlock title="Байрлал" value={explanation?.positionalReason} />
              <CoachBlock title="Дасгал" value={explanation?.trainingTip} icon={<Lightbulb size={14} />} />
            </div>
          ) : null}
        </section>
      </div>
    </section>
  );
}

function InfoCell({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="rounded-md border border-white/10 bg-night px-2 py-2">
      <p className="text-[11px] font-semibold uppercase text-white/40">{label}</p>
      <p className="mt-1 truncate text-sm font-bold text-white">{value}</p>
    </div>
  );
}

function CoachBlock({ title, value, icon }: { title?: string; value?: string; icon?: React.ReactNode }) {
  if (!value) return null;

  return (
    <div className="rounded-md border border-white/10 bg-night p-3">
      {title ? (
        <p className="flex items-center gap-2 text-xs font-semibold uppercase text-white/45">
          {icon}
          {title}
        </p>
      ) : null}
      <p className="mt-2 text-sm leading-6 text-white/75">{value}</p>
    </div>
  );
}

function CoachSkeleton() {
  return (
    <div className="space-y-2">
      <div className="h-20 animate-pulse rounded-md bg-white/[0.055]" />
      <div className="h-16 animate-pulse rounded-md bg-white/[0.045]" />
    </div>
  );
}

function formatScore(scoreCpWhite?: number, mateIn?: number) {
  if (typeof mateIn === "number") return `#${mateIn}`;
  if (typeof scoreCpWhite !== "number") return "--";
  return `${scoreCpWhite > 0 ? "+" : ""}${(scoreCpWhite / 100).toFixed(1)}`;
}
