import { AlertTriangle, Target, Trophy, Zap } from "lucide-react";
import { AccuracyBadge } from "./AccuracyBadge";
import type { GameSummary } from "@mda-chess/shared";

interface GameSummaryBarProps {
  summary: GameSummary;
  className?: string;
}

interface StatChipProps {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
  danger?: boolean;
}

function StatChip({ icon, label, value, danger }: StatChipProps) {
  return (
    <div className="flex items-center gap-2 rounded-lg border border-white/[0.08] bg-white/[0.045] px-3 py-2">
      <span className={danger ? "text-danger-light" : "text-accent-light"}>{icon}</span>
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-wide text-white/35">{label}</p>
        <p className="text-sm font-bold text-white tabular">{value}</p>
      </div>
    </div>
  );
}

export function GameSummaryBar({ summary, className }: GameSummaryBarProps) {
  return (
    <section
      className={`animate-fade-up rounded-lg border border-white/[0.08] bg-[#171411]/88 p-3 shadow-panel ${className ?? ""}`}
      aria-label="Тоглолтын дүгнэлт"
    >
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-xs font-black uppercase tracking-[0.22em] text-white/40">Тоглолтын дүгнэлт</h2>
        {summary.result ? (
          <span className="rounded-full border border-accent/20 bg-accent/[0.08] px-2.5 py-0.5 text-[11px] font-bold text-accent-light">
            {summary.result}
          </span>
        ) : null}
      </div>

      <div className="flex flex-wrap gap-2">
        {/* White accuracy */}
        <div className="flex items-center gap-2 rounded-lg border border-white/[0.08] bg-white/[0.045] px-3 py-2">
          <div className="grid h-6 w-6 place-items-center rounded-md bg-ink">
            <span className="text-[10px] font-black text-night">♔</span>
          </div>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wide text-white/35">Цагаан</p>
            <AccuracyBadge accuracy={summary.accuracyWhite} size="sm" />
          </div>
        </div>

        {/* Black accuracy */}
        <div className="flex items-center gap-2 rounded-lg border border-white/[0.08] bg-white/[0.045] px-3 py-2">
          <div className="grid h-6 w-6 place-items-center rounded-md bg-[#0d0c0b] border border-white/10">
            <span className="text-[10px] font-black text-white">♚</span>
          </div>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wide text-white/35">Хар</p>
            <AccuracyBadge accuracy={summary.accuracyBlack} size="sm" />
          </div>
        </div>

        <StatChip
          icon={<Target size={14} />}
          label="Нүүдэл"
          value={summary.totalMoves}
        />

        <StatChip
          icon={<AlertTriangle size={14} />}
          label="Алдаа"
          value={summary.criticalMistakes}
          danger={summary.criticalMistakes > 0}
        />

        {summary.opening ? (
          <StatChip
            icon={<Zap size={14} />}
            label="Эхлэл"
            value={summary.opening}
          />
        ) : null}

        {/* Review text */}
        {summary.review ? (
          <div className="flex w-full items-start gap-2 rounded-lg border border-accent/[0.18] bg-accent/[0.06] px-3 py-2">
            <Trophy size={14} className="mt-0.5 shrink-0 text-warning-light" />
            <p className="text-xs leading-5 text-white/55">{summary.review}</p>
          </div>
        ) : null}
      </div>
    </section>
  );
}
