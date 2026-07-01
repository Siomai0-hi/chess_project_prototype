import { useEffect, useRef } from "react";
import type { UserProgressSummary } from "@mda-chess/shared";
import { BarChart2, BookOpen, Target, TrendingUp } from "lucide-react";
import { AccuracyBadge } from "./AccuracyBadge";
import { motion } from "framer-motion";

interface ProgressPanelProps {
  summary?: UserProgressSummary;
  loading?: boolean;
}

export function ProgressPanel({ summary, loading }: ProgressPanelProps) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="rounded-lg border border-white/[0.08] bg-[#171411]/88 shadow-panel"
      aria-label="Ахиц дэвшил"
    >
      <div className="flex h-12 items-center gap-2 border-b border-white/[0.08] px-3">
        <TrendingUp size={15} className="text-teal" />
        <h2 className="text-sm font-black text-ink">Ахиц дэвшил</h2>
      </div>

      <div className="p-3 space-y-3">
        {loading ? <ProgressSkeleton /> : summary ? <ProgressContent summary={summary} /> : <EmptyState />}
      </div>
    </motion.section>
  );
}

function ProgressContent({ summary }: { summary: UserProgressSummary }) {
  return (
    <>
      {/* Stats row */}
      <div className="grid grid-cols-2 gap-2">
        <StatCard
          icon={<BarChart2 size={14} className="text-teal" />}
          label="Тоглолт"
          value={String(summary.gamesReviewed)}
        />
        <StatCard
          icon={<Target size={14} className="text-warning-light" />}
          label="Дундаж алдаа"
          value={`${summary.blundersPerGame.toFixed(1)}/тоглолт`}
        />
      </div>

      {/* Accuracy */}
      <div className="rounded-lg border border-white/[0.08] bg-white/[0.045] px-3 py-2.5">
        <div className="mb-2 flex items-center justify-between">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-white/35">Дундаж нарийвчлал</p>
          <AccuracyBadge accuracy={summary.averageAccuracy} size="sm" />
        </div>
        <AccuracyBar accuracy={summary.averageAccuracy} />
      </div>

      {/* Training focus */}
      {summary.nextTrainingFocus.length > 0 ? (
        <div>
          <p className="mb-1.5 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wide text-white/35">
            <BookOpen size={11} />
            Дараагийн зорилт
          </p>
          <div className="flex flex-wrap gap-1.5">
            {summary.nextTrainingFocus.map((focus) => (
              <span
                key={focus}
                className="rounded-full border border-teal/25 bg-teal/[0.08] px-2.5 py-0.5 text-[11px] font-semibold text-teal"
              >
                {focus}
              </span>
            ))}
          </div>
        </div>
      ) : null}

      {/* Common mistakes */}
      {summary.commonMistakeTags.length > 0 ? (
        <div>
          <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wide text-white/35">
            Нийтлэг алдаа
          </p>
          <div className="flex flex-wrap gap-1.5">
            {summary.commonMistakeTags.map((tag) => (
              <span
                key={tag}
                className="rounded-full border border-danger/20 bg-danger/10 px-2.5 py-0.5 text-[11px] font-semibold text-danger-light"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      ) : null}
    </>
  );
}

function AccuracyBar({ accuracy }: { accuracy: number }) {
  const barRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (barRef.current) {
      barRef.current.style.width = "0%";
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          if (barRef.current) barRef.current.style.width = `${accuracy}%`;
        });
      });
    }
  }, [accuracy]);

  const color =
    accuracy >= 80 ? "from-teal to-accent-light" :
    accuracy >= 65 ? "from-warning to-warning-light" :
    "from-danger to-danger-light";

  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-black/30">
      <div
        ref={barRef}
        className={`h-full rounded-full bg-gradient-to-r ${color} transition-all duration-700 ease-out`}
        style={{ width: "0%" }}
      />
    </div>
  );
}

function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-lg border border-white/[0.08] bg-white/[0.045] px-3 py-2">
      <div className="mb-1 flex items-center gap-1.5">{icon}<p className="text-[10px] font-semibold uppercase tracking-wide text-white/35">{label}</p></div>
      <p className="text-sm font-bold text-white tabular">{value}</p>
    </div>
  );
}

function EmptyState() {
  return (
    <p className="py-2 text-sm text-white/35">
      Тоглолтоо хадгалаад ахиц дэвшлийнхээ статистикийг энд харна уу.
    </p>
  );
}

function ProgressSkeleton() {
  return (
    <div className="space-y-2">
      <div className="skeleton h-14 rounded-lg" />
      <div className="skeleton h-10 rounded-lg" />
      <div className="skeleton h-8 rounded-lg" />
    </div>
  );
}
