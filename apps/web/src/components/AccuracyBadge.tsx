import { cn } from "@mda-chess/ui";

interface AccuracyBadgeProps {
  accuracy?: number;
  label?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

function getAccuracyColor(accuracy: number) {
  if (accuracy >= 90) return { bg: "bg-success/15", text: "text-success", border: "border-success/25", glow: "shadow-[0_0_10px_rgba(76,175,125,0.2)]" };
  if (accuracy >= 80) return { bg: "bg-accent/15", text: "text-accent-light", border: "border-accent/25", glow: "shadow-[0_0_10px_rgba(91,138,50,0.2)]" };
  if (accuracy >= 65) return { bg: "bg-warning/12", text: "text-warning-light", border: "border-warning/25", glow: "shadow-[0_0_10px_rgba(212,160,23,0.2)]" };
  return { bg: "bg-danger/12", text: "text-danger-light", border: "border-danger/25", glow: "shadow-[0_0_10px_rgba(192,57,43,0.2)]" };
}

function getAccuracyLabel(accuracy: number) {
  if (accuracy >= 95) return "Гайхалтай";
  if (accuracy >= 85) return "Маш сайн";
  if (accuracy >= 75) return "Сайн";
  if (accuracy >= 60) return "Дундаж";
  return "Сайжрах хэрэгтэй";
}

const sizes = {
  sm: "px-2 py-0.5 text-[11px] gap-1",
  md: "px-2.5 py-1 text-xs gap-1.5",
  lg: "px-3 py-1.5 text-sm gap-2"
};

export function AccuracyBadge({ accuracy, label, size = "md", className }: AccuracyBadgeProps) {
  if (typeof accuracy !== "number") {
    return (
      <div className={cn("inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.05] px-2.5 py-1 text-xs text-white/35", sizes[size], className)}>
        <span className="tabular">--%</span>
      </div>
    );
  }

  const colors = getAccuracyColor(accuracy);
  const tooltipLabel = label ?? getAccuracyLabel(accuracy);

  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full border font-semibold tabular animate-count-up",
        colors.bg,
        colors.text,
        colors.border,
        colors.glow,
        sizes[size],
        className
      )}
      title={tooltipLabel}
    >
      <span>{accuracy.toFixed(0)}%</span>
    </div>
  );
}
