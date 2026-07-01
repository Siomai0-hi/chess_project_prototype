import type { ButtonHTMLAttributes, ReactNode } from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@mda-chess/ui";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  icon?: ReactNode;
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
}

const variants = {
  primary:
    "border border-accent/35 bg-gradient-accent text-night font-semibold shadow-glow-sm hover:bg-gradient-accent-hover hover:shadow-glow-accent active:scale-[0.97]",
  secondary:
    "border border-white/[0.11] bg-white/[0.055] text-ink hover:border-accent/35 hover:bg-white/[0.10] active:scale-[0.97]",
  ghost:
    "text-ink/70 hover:bg-white/[0.07] hover:text-ink active:scale-[0.97]",
  danger:
    "bg-gradient-danger text-white hover:opacity-90 shadow-glow-danger active:scale-[0.97]"
};

const sizes = {
  sm: "h-8 text-xs rounded-md",
  md: "h-10 text-sm rounded-lg",
  lg: "h-11 text-sm rounded-lg"
};

export function Button({
  className,
  icon,
  children,
  variant = "primary",
  size = "md",
  type = "button",
  loading = false,
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      disabled={disabled ?? loading}
      className={cn(
        "inline-flex shrink-0 items-center justify-center gap-2 font-semibold transition-all duration-150 disabled:cursor-not-allowed disabled:opacity-45",
        sizes[size],
        children ? "px-4" : size === "sm" ? "w-8 px-0" : size === "lg" ? "w-11 px-0" : "w-10 px-0",
        variants[variant],
        className
      )}
      {...props}
    >
      {loading ? <Loader2 size={15} className="animate-spin" aria-hidden="true" /> : icon}
      {children}
    </button>
  );
}
