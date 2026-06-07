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
    "bg-gradient-accent text-night font-semibold hover:bg-gradient-accent-hover shadow-glow-sm hover:shadow-glow-accent active:scale-[0.97]",
  secondary:
    "bg-white/[0.07] text-ink hover:bg-white/[0.12] border border-white/[0.1] hover:border-white/20 active:scale-[0.97]",
  ghost:
    "text-ink/70 hover:bg-white/[0.07] hover:text-ink active:scale-[0.97]",
  danger:
    "bg-gradient-danger text-white hover:opacity-90 shadow-glow-danger active:scale-[0.97]"
};

const sizes = {
  sm: "h-8 text-xs rounded-md",
  md: "h-10 text-sm rounded-lg",
  lg: "h-11 text-sm rounded-xl"
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
