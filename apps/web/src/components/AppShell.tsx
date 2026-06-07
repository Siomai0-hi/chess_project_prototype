import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { LogIn, LogOut, Menu, ShieldHalf, X } from "lucide-react";
import type { ReactNode } from "react";
import { AuthPanel } from "./AuthPanel";
import { Button } from "./ui/Button";
import { useSessionStore } from "../store/session";

export function AppShell({ children }: { children: ReactNode }) {
  const { user, logout } = useSessionStore();
  const [authOpen, setAuthOpen] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const navItems = ["Шинжилгээ", "Тоглох", "Сурах"];

  return (
    <div className="min-h-screen bg-night">
      <header className="sticky top-0 z-20 border-b border-white/10 bg-night/95">
        <div className="mx-auto flex max-w-[92rem] items-center justify-between px-3 py-2 sm:px-5">
          <div className="flex min-w-0 items-center gap-2.5">
            <div className="grid h-9 w-9 place-items-center rounded-lg bg-accent text-white shadow-glow">
              <ShieldHalf size={22} aria-hidden="true" />
            </div>
            <div className="min-w-0">
              <p className="truncate text-base font-bold text-ink">MateCoach MN</p>
            </div>
          </div>

          <nav className="hidden items-center gap-1 md:flex" aria-label="Гол цэс">
            {navItems.map((item, index) => (
              <button
                key={item}
                className={`h-9 rounded-lg px-3 text-sm font-semibold transition ${
                  index === 0 ? "bg-white/[0.1] text-white" : "text-white/60 hover:bg-white/[0.07] hover:text-white"
                }`}
              >
                {item}
              </button>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            {user ? (
              <div className="hidden max-w-[15rem] truncate rounded-lg border border-white/10 bg-white/[0.045] px-3 py-2 text-xs text-white/70 sm:block">
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
            <Button
              variant="ghost"
              className="md:hidden"
              icon={mobileNavOpen ? <X size={18} /> : <Menu size={18} />}
              aria-label="Цэс"
              aria-expanded={mobileNavOpen}
              onClick={() => setMobileNavOpen((open) => !open)}
            />
          </div>
        </div>
        {mobileNavOpen ? (
          <nav className="border-t border-white/10 px-3 py-2 md:hidden" aria-label="Гол цэс">
            <div className="grid grid-cols-3 gap-1">
              {navItems.map((item, index) => (
                <button
                  key={item}
                  className={`h-9 rounded-lg text-sm font-semibold transition ${
                    index === 0 ? "bg-white/[0.1] text-white" : "text-white/60 hover:bg-white/[0.07] hover:text-white"
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>
          </nav>
        ) : null}
      </header>
      <AnimatePresence>
        {!user && authOpen ? (
          <div className="fixed inset-0 z-40">
            <button className="absolute inset-0 cursor-default bg-black/40" aria-label="Бүртгэлийн цонх хаах" onClick={() => setAuthOpen(false)} />
            <motion.div
              initial={{ opacity: 0, y: -8, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.98 }}
              transition={{ duration: 0.18, ease: "easeOut" }}
              className="absolute right-3 top-[3.75rem] w-[calc(100vw-1.5rem)] max-w-sm sm:right-5"
            >
              <AuthPanel className="bg-panel/95 backdrop-blur-xl" onAuthenticated={() => setAuthOpen(false)} />
            </motion.div>
          </div>
        ) : null}
      </AnimatePresence>
      <main className="mx-auto max-w-[92rem] px-3 py-3 sm:px-5 lg:py-4">{children}</main>
    </div>
  );
}
