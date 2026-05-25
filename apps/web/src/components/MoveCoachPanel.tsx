import type { CoachExplanation, MoveAnalysis } from "@mda-chess/shared";
import { Brain, Lightbulb, Loader2 } from "lucide-react";

interface MoveCoachPanelProps {
  move?: MoveAnalysis;
  explanation?: CoachExplanation;
  loading?: boolean;
}

export function MoveCoachPanel({ move, explanation, loading }: MoveCoachPanelProps) {
  return (
    <section className="rounded-lg border border-white/10 bg-panel p-4 shadow-2xl">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-wide text-white/50">AI Coach</p>
          <h2 className="mt-1 text-lg font-bold text-ink">{move ? `${move.moveNumber}. ${move.san}` : "Нүүдэл сонгоно уу"}</h2>
        </div>
        <div className="grid h-10 w-10 place-items-center rounded-lg bg-accent/[0.14] text-accent">
          {loading ? <Loader2 className="animate-spin" size={18} /> : <Brain size={18} />}
        </div>
      </div>

      <div className="mt-4 space-y-3">
        <CoachBlock title="Товч" value={explanation?.short ?? "Шинжилгээний дараа тайлбар гарна."} />
        <CoachBlock title="Тактик" value={explanation?.tacticalReason} />
        <CoachBlock title="Байрлал" value={explanation?.positionalReason} />
        <CoachBlock title="Дасгал" value={explanation?.trainingTip} icon={<Lightbulb size={14} />} />
      </div>
    </section>
  );
}

function CoachBlock({ title, value, icon }: { title: string; value?: string; icon?: React.ReactNode }) {
  if (!value) return null;

  return (
    <div className="rounded-lg border border-white/10 bg-night p-3">
      <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-white/50">
        {icon}
        {title}
      </p>
      <p className="mt-2 text-sm leading-6 text-white/75">{value}</p>
    </div>
  );
}
