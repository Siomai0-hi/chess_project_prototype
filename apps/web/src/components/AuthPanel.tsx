import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Eye, EyeOff, LogIn, ShieldCheck, UserPlus } from "lucide-react";
import { cn } from "@mda-chess/ui";
import { apiClient } from "../api/client";
import { useSessionStore } from "../store/session";
import { Button } from "./ui/Button";

interface AuthPanelProps {
  className?: string;
  onAuthenticated?: () => void;
}

export function AuthPanel({ className, onAuthenticated }: AuthPanelProps) {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const setAuth = useSessionStore((state) => state.setAuth);

  const mutation = useMutation({
    mutationFn: () =>
      mode === "login"
        ? apiClient.login({ email, password })
        : apiClient.register({ email, password, name, preferredLanguage: "mn" }),
    onSuccess: (result) => {
      setAuth(result);
      onAuthenticated?.();
    }
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim() || !password.trim()) return;
    mutation.mutate();
  }

  return (
    <section className={cn("rounded-lg border border-white/[0.08] bg-[#171411] p-5 shadow-panel", className)}>
      <div className="mb-5 flex items-center gap-3">
        <div className="grid h-10 w-10 place-items-center rounded-lg border border-accent/25 bg-gradient-accent shadow-glow-sm">
          <ShieldCheck size={18} className="text-night" aria-hidden="true" />
        </div>
        <div className="min-w-0">
          <h2 className="truncate text-base font-black text-ink">
            {mode === "login" ? "Нэвтрэх" : "Бүртгүүлэх"}
          </h2>
          <p className="truncate text-xs text-white/40">
            Ахиц, тоглолт, алдаагаа хадгалах
          </p>
        </div>
      </div>

      <div className="mb-4 flex rounded-lg bg-black/20 p-1">
        <button
          type="button"
          className={`h-9 flex-1 rounded-md text-sm font-semibold transition-all duration-200 ${
            mode === "login"
              ? "bg-gradient-accent text-night shadow-glow-sm"
              : "text-white/45 hover:text-white/70"
          }`}
          onClick={() => setMode("login")}
        >
          Нэвтрэх
        </button>
        <button
          type="button"
          className={`h-9 flex-1 rounded-md text-sm font-semibold transition-all duration-200 ${
            mode === "register"
              ? "bg-gradient-accent text-night shadow-glow-sm"
              : "text-white/45 hover:text-white/70"
          }`}
          onClick={() => setMode("register")}
        >
          Бүртгүүлэх
        </button>
      </div>

      <form className="space-y-3" onSubmit={handleSubmit} noValidate>
        {mode === "register" ? (
          <label className="block">
            <span className="mb-1 block text-xs font-semibold text-white/50">Нэр</span>
            <input
              className="h-11 w-full rounded-lg border border-white/[0.1] bg-night px-3 text-white outline-none placeholder:text-white/25 focus:border-accent focus:shadow-[0_0_0_3px_rgba(215,181,109,0.14)] transition-all"
              placeholder="Таны нэр"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoComplete="name"
            />
          </label>
        ) : null}

        <label className="block">
          <span className="mb-1 block text-xs font-semibold text-white/50">Имэйл</span>
          <input
            className="h-11 w-full rounded-lg border border-white/[0.1] bg-night px-3 text-white outline-none placeholder:text-white/25 focus:border-accent focus:shadow-[0_0_0_3px_rgba(215,181,109,0.14)] transition-all"
            type="email"
            placeholder="name@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            required
          />
        </label>

        <label className="block">
          <span className="mb-1 block text-xs font-semibold text-white/50">Нууц үг</span>
          <div className="relative">
            <input
              className="h-11 w-full rounded-lg border border-white/[0.1] bg-night px-3 pr-10 text-white outline-none placeholder:text-white/25 focus:border-accent focus:shadow-[0_0_0_3px_rgba(215,181,109,0.14)] transition-all"
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete={mode === "login" ? "current-password" : "new-password"}
              required
            />
            <button
              type="button"
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-white/35 transition hover:text-white/70"
              onClick={() => setShowPassword((v) => !v)}
              aria-label={showPassword ? "Нуух" : "Харуулах"}
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </label>

        {mutation.error ? (
          <p className="rounded-lg border border-danger/25 bg-danger/10 px-3 py-2 text-sm text-danger-light">
            Мэдээллээ шалгаад дахин оролдоно уу.
          </p>
        ) : null}

        <Button
          type="submit"
          className="w-full"
          icon={mode === "login" ? <LogIn size={16} /> : <UserPlus size={16} />}
          loading={mutation.isPending}
          disabled={!email.trim() || !password.trim()}
        >
          {mode === "login" ? "Нэвтрэх" : "Бүртгүүлэх"}
        </Button>
      </form>
    </section>
  );
}
