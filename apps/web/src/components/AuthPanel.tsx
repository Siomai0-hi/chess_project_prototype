import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { LogIn, ShieldCheck, UserPlus } from "lucide-react";
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
  const [email, setEmail] = useState("demo@matecoach.mn");
  const [password, setPassword] = useState("password123");
  const [name, setName] = useState("Шатарчин");
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

  return (
    <section className={cn("rounded-lg border border-white/10 bg-panel p-4 shadow-2xl", className)}>
      <div className="mb-4 flex items-center gap-3">
        <div className="grid h-10 w-10 place-items-center rounded-lg bg-accent/[0.14] text-accent">
          <ShieldCheck size={18} aria-hidden="true" />
        </div>
        <div className="min-w-0">
          <h2 className="truncate text-base font-bold text-ink">Бүртгэл</h2>
          <p className="truncate text-xs text-white/50">Ахиц, тоглолт, алдаагаа хадгална</p>
        </div>
      </div>

      <div className="flex rounded-lg bg-white/[0.055] p-1">
        <button
          className={`h-9 flex-1 rounded-md text-sm font-semibold transition ${
            mode === "login" ? "bg-accent text-night" : "text-white/60"
          }`}
          onClick={() => setMode("login")}
        >
          Нэвтрэх
        </button>
        <button
          className={`h-9 flex-1 rounded-md text-sm font-semibold transition ${
            mode === "register" ? "bg-accent text-night" : "text-white/60"
          }`}
          onClick={() => setMode("register")}
        >
          Бүртгүүлэх
        </button>
      </div>

      <div className="mt-4 space-y-3">
        {mode === "register" ? (
          <label className="block text-sm text-white/70">
            Нэр
            <input
              className="mt-1 h-11 w-full rounded-lg border border-white/10 bg-night px-3 text-ink outline-none focus:border-accent"
              value={name}
              onChange={(event) => setName(event.target.value)}
            />
          </label>
        ) : null}
        <label className="block text-sm text-white/70">
          Имэйл
          <input
            className="mt-1 h-11 w-full rounded-lg border border-white/10 bg-night px-3 text-ink outline-none focus:border-accent"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
        </label>
        <label className="block text-sm text-white/70">
          Нууц үг
          <input
            className="mt-1 h-11 w-full rounded-lg border border-white/10 bg-night px-3 text-ink outline-none focus:border-accent"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
        </label>

        {mutation.error ? <p className="text-sm text-danger">Нэвтрэх мэдээллээ шалгаад дахин оролдоно уу.</p> : null}

        <Button
          className="w-full"
          icon={mode === "login" ? <LogIn size={16} /> : <UserPlus size={16} />}
          disabled={mutation.isPending}
          onClick={() => mutation.mutate()}
        >
          {mutation.isPending ? "Уншиж байна" : mode === "login" ? "Нэвтрэх" : "Бүртгүүлэх"}
        </Button>
      </div>
    </section>
  );
}
