import type { ReactNode } from "react";

export function MetricPill({ label, value, icon }: { label: string; value: ReactNode; icon?: ReactNode }) {
  return (
    <div className="min-w-0 rounded-lg border border-white/10 bg-white/[0.045] px-3 py-2">
      <div className="flex items-center gap-2 text-[11px] uppercase tracking-wide text-white/50">
        {icon}
        <span className="truncate">{label}</span>
      </div>
      <div className="mt-1 truncate text-lg font-semibold text-ink">{value}</div>
    </div>
  );
}
