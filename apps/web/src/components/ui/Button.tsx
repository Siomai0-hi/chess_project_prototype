import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@mda-chess/ui";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  icon?: ReactNode;
  variant?: "primary" | "secondary" | "ghost" | "danger";
}

const variants = {
  primary: "bg-accent text-night hover:bg-[#72dc8e]",
  secondary: "bg-white/[0.08] text-ink hover:bg-white/[0.12] border border-white/10",
  ghost: "text-ink hover:bg-white/[0.08]",
  danger: "bg-danger text-white hover:bg-[#fa7468]"
};

export function Button({ className, icon, children, variant = "primary", type = "button", ...props }: ButtonProps) {
  return (
    <button
      type={type}
      className={cn(
        "inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-lg text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50",
        children ? "px-4" : "w-10 px-0",
        variants[variant],
        className
      )}
      {...props}
    >
      {icon}
      {children}
    </button>
  );
}
