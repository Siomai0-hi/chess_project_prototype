import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { BookOpenCheck, BrainCircuit, Crown, GraduationCap, LogIn, LogOut, Menu, TrendingUp, X } from "lucide-react";
import type { ReactNode } from "react";
import { AuthPanel } from "./AuthPanel";
import { Button } from "./ui/Button";
import { useSessionStore } from "../store/session";

interface AppShellProps {
  children: ReactNode;
  activeTab?: "analysis" | "play" | "learn";
  onTabChange?: (tab: "analysis" | "play" | "learn") => void;
}

const navItems = [
  { id: "analysis" as const, label: "Шинжилгээ", icon: BrainCircuit },
  { id: "play" as const, label: "Практик", icon: Crown },
  { id: "learn" as const, label: "Сургалт", icon: GraduationCap }
];

export function AppShell({ children, activeTab = "analysis", onTabChange }: AppShellProps) {
  const { user, logout } = useSessionStore();
  const [authOpen, setAuthOpen] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  return (
    <div className="min-h-screen bg-night text-ink">
      <header className="sticky top-0 z-20 border-b border-white/[0.08] bg-[#12110f]/92 shadow-[0_1px_0_rgba(247,243,234,0.04)] backdrop-blur-xl">
        <div className="mx-auto flex max-w-[96rem] items-center justify-between px-3 py-2 sm:px-5">
          <div className="flex min-w-0 items-center gap-3">
            <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-accent/35 bg-gradient-accent shadow-glow-sm">
              <Crown size={19} className="text-night" aria-hidden="true" />
            </div>
            <div className="min-w-0">
              <p className="truncate text-base font-black tracking-tight text-ink">
                MDA <span className="gradient-text">Chess Lab</span>
              </p>
              <p className="hidden text-[10px] font-semibold uppercase tracking-[0.26em] text-white/35 sm:block">Grandmaster desk</p>
            </div>
          </div>

          <nav className="hidden items-center gap-1 md:flex" aria-label="Гол цэс">
            {navItems.map((item) => {
              const isActive = item.id === activeTab;
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  className={`relative inline-flex h-9 items-center gap-2 rounded-md px-3 text-sm font-semibold transition-all duration-200 ${
                    isActive
                      ? "border border-accent/25 bg-accent/[0.12] text-ink shadow-inner"
                      : "border border-transparent text-white/[0.48] hover:border-white/[0.08] hover:bg-white/[0.045] hover:text-white/[0.86]"
                  }`}
                  onClick={() => onTabChange?.(item.id)}
                  aria-current={isActive ? "page" : undefined}
                >
                  <Icon size={14} aria-hidden="true" />
                  {item.label}
                  {isActive ? (
                    <span className="absolute inset-x-3 -bottom-px h-px rounded-full bg-gradient-accent" />
                  ) : null}
                </button>
              );
            })}
          </nav>

          <div className="flex items-center gap-2">
            {user ? (
              <>
                <div className="hidden max-w-[14rem] items-center gap-2 rounded-md border border-white/[0.08] bg-white/[0.045] px-3 py-1.5 sm:flex">
                  <div className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-accent/[0.18] text-[10px] font-bold text-accent-light">
                    {(user.name ?? user.email).slice(0, 1).toUpperCase()}
                  </div>
                  <span className="truncate text-xs font-medium text-white/70">{user.name ?? user.email}</span>
                </div>
                <Button
                  variant="ghost"
                  icon={<LogOut size={15} />}
                  onClick={logout}
                  aria-label="Гарах"
                  title="Гарах"
                />
              </>
            ) : (
              <Button
                variant="secondary"
                icon={<LogIn size={15} />}
                onClick={() => setAuthOpen((open) => !open)}
                aria-expanded={authOpen}
              >
                Нэвтрэх
              </Button>
            )}

            {user ? (
              <Button
                variant="ghost"
                icon={<TrendingUp size={15} />}
                aria-label="Ахиц"
                title="Ахиц дэвшил"
                className="hidden sm:flex"
              />
            ) : null}

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

        <AnimatePresence>
          {mobileNavOpen ? (
            <motion.nav
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="overflow-hidden border-t border-white/[0.08] px-3 py-2 md:hidden"
              aria-label="Гол цэс"
            >
              <div className="grid grid-cols-3 gap-1">
                {navItems.map((item) => {
                  const isActive = item.id === activeTab;
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      className={`inline-flex h-10 items-center justify-center gap-1.5 rounded-md text-sm font-semibold transition-all duration-200 ${
                        isActive
                          ? "border border-accent/25 bg-accent/[0.12] text-ink"
                          : "border border-transparent text-white/50 hover:bg-white/[0.06] hover:text-white/90"
                      }`}
                      onClick={() => {
                        onTabChange?.(item.id);
                        setMobileNavOpen(false);
                      }}
                    >
                      <Icon size={14} aria-hidden="true" />
                      {item.label}
                    </button>
                  );
                })}
              </div>
            </motion.nav>
          ) : null}
        </AnimatePresence>
      </header>

      {/* Auth dropdown */}
      <AnimatePresence>
        {!user && authOpen ? (
          <div className="fixed inset-0 z-40">
            <button
              className="absolute inset-0 cursor-default bg-black/50 backdrop-blur-xs"
              aria-label="Бүртгэлийн цонх хаах"
              onClick={() => setAuthOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.97 }}
              transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
              className="absolute right-3 top-[3.75rem] w-[calc(100vw-1.5rem)] max-w-sm sm:right-5"
            >
              <AuthPanel className="glass shadow-panel" onAuthenticated={() => setAuthOpen(false)} />
            </motion.div>
          </div>
        ) : null}
      </AnimatePresence>

      <main className="relative z-10 mx-auto max-w-[96rem] px-3 py-3 sm:px-5 lg:py-4">
        <div className="mb-3 hidden items-center justify-between border-b border-white/[0.06] pb-3 xl:flex">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.24em] text-white/[0.38]">
            <BookOpenCheck size={14} className="text-accent-light" aria-hidden="true" />
            <span>Engine review room</span>
          </div>
          <div className="h-px flex-1 bg-gradient-to-r from-accent/30 via-teal/20 to-transparent mx-5" />
          <span className="text-xs font-semibold text-white/35">MN coach protocol</span>
        </div>
        {children}
      </main>
    </div>
  );
}
