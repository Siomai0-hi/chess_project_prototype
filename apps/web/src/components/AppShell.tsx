import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Brain, LogIn, LogOut, ShieldHalf } from "lucide-react";
import type { ReactNode } from "react";
import { AuthPanel } from "./AuthPanel";
import { Button } from "./ui/Button";
import { useSessionStore } from "../store/session";

export function AppShell({ children }: { children: ReactNode }) {
  const { user, logout } = useSessionStore();
  const [authOpen, setAuthOpen] = useState(false);

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-20 border-b border-white/10 bg-night/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-lg bg-accent text-night shadow-glow">
              <ShieldHalf size={22} aria-hidden="true" />
            </div>
            <div className="min-w-0">
              <p className="truncate text-base font-bold text-ink">MateCoach MN</p>
              <p className="truncate text-xs text-white/50">Монгол AI шатрын дасгалжуулагч</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {user ? (
              <div className="hidden items-center gap-2 rounded-lg border border-white/10 bg-white/[0.045] px-3 py-2 text-xs text-white/70 sm:flex">
                <Brain size={14} aria-hidden="true" />
                {user.email}
              </div>
            ) : null}
            {user ? (
              <Button variant="ghost" icon={<LogOut size={16} />} onClick={logout} aria-label="Гарах" title="Гарах" />
            ) : (
              <Button
                variant="secondary"
                icon={<LogIn size={16} />}
                onClick={() => setAuthOpen((open) => !open)}
                aria-expanded={authOpen}
              >
                Нэвтрэх
              </Button>
            )}
          </div>
        </div>
      </header>
      <AnimatePresence>
        {!user && authOpen ? (
          <div className="fixed inset-0 z-40">
            <button
              className="absolute inset-0 cursor-default bg-night/35 backdrop-blur-[2px]"
              aria-label="Бүртгэлийн цонх хаах"
              onClick={() => setAuthOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: -8, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.98 }}
              transition={{ duration: 0.18, ease: "easeOut" }}
              className="absolute right-4 top-[4.5rem] w-[calc(100vw-2rem)] max-w-sm sm:right-6"
            >
              <AuthPanel className="bg-panel/95 backdrop-blur-xl" onAuthenticated={() => setAuthOpen(false)} />
            </motion.div>
          </div>
        ) : null}
      </AnimatePresence>
      <main className="mx-auto max-w-7xl px-4 py-5 sm:px-6 lg:py-8">{children}</main>
    </div>
  );
}
