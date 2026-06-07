import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { LogIn, LogOut, Menu, TrendingUp, X } from "lucide-react";
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
  { id: "analysis" as const, label: "Шинжилгээ" },
  { id: "play" as const, label: "Тоглох" },
  { id: "learn" as const, label: "Сурах" }
];

export function AppShell({ children, activeTab = "analysis", onTabChange }: AppShellProps) {
  const { user, logout } = useSessionStore();
  const [authOpen, setAuthOpen] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  return (
    <div className="min-h-screen bg-night">
      {/* Ambient top glow */}
      <div className="pointer-events-none fixed inset-x-0 top-0 z-0 h-[500px] bg-gradient-radial-glow opacity-60" />

      {/* Header */}
      <header className="sticky top-0 z-20 border-b border-white/[0.07] bg-night/90 shadow-[0_1px_0_rgba(255,255,255,0.04)] backdrop-blur-md">
        <div className="mx-auto flex max-w-[92rem] items-center justify-between px-3 py-2 sm:px-5">

          {/* Logo */}
          <div className="flex min-w-0 items-center gap-3">
            <div className="relative grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-gradient-accent shadow-glow-sm transition-all duration-300 hover:shadow-glow-accent">
              {/* Chess knight SVG */}
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M8 16l-1.5 4h11L16 16" />
                <path d="M7.5 16C6 14.5 5 12 5 9c0-3.87 3.13-7 7-7 1.5 0 2.9.47 4.05 1.27" />
                <path d="M12 2c0 0 2 1.5 2 4 0 1-.4 1.9-1 2.6L11 11l3 1-2.5 4H9l-1-5 2-3" />
                <line x1="8" y1="20" x2="16" y2="20" />
              </svg>
            </div>
            <div className="min-w-0">
              <p className="truncate text-base font-bold tracking-tight text-white">
                Mate<span className="gradient-text">Coach</span>
                <span className="ml-1 text-xs font-semibold text-white/40">MN</span>
              </p>
            </div>
          </div>

          {/* Desktop Nav */}
          <nav className="hidden items-center gap-1 md:flex" aria-label="Гол цэс">
            {navItems.map((item) => {
              const isActive = item.id === activeTab;
              return (
                <button
                  key={item.id}
                  className={`relative h-9 rounded-lg px-4 text-sm font-semibold transition-all duration-200 ${
                    isActive
                      ? "bg-accent/[0.14] text-white"
                      : "text-white/50 hover:bg-white/[0.06] hover:text-white/90"
                  }`}
                  onClick={() => onTabChange?.(item.id)}
                >
                  {item.label}
                  {isActive ? (
                    <span className="absolute bottom-0 left-1/2 h-0.5 w-6 -translate-x-1/2 rounded-full bg-gradient-accent" />
                  ) : null}
                </button>
              );
            })}
          </nav>

          {/* Right actions */}
          <div className="flex items-center gap-2">
            {user ? (
              <>
                <div className="hidden max-w-[14rem] items-center gap-2 rounded-lg border border-white/[0.07] bg-white/[0.04] px-3 py-1.5 sm:flex">
                  <div className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-accent/20 text-[10px] font-bold text-accent">
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

            {/* Progress shortcut — visible when logged in */}
            {user ? (
              <Button
                variant="ghost"
                icon={<TrendingUp size={15} />}
                aria-label="Ахиц"
                title="Ахиц дэвшил"
                className="hidden sm:flex"
              />
            ) : null}

            {/* Mobile menu toggle */}
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

        {/* Mobile nav */}
        <AnimatePresence>
          {mobileNavOpen ? (
            <motion.nav
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="overflow-hidden border-t border-white/[0.07] px-3 py-2 md:hidden"
              aria-label="Гол цэс"
            >
              <div className="grid grid-cols-3 gap-1">
                {navItems.map((item) => {
                  const isActive = item.id === activeTab;
                  return (
                    <button
                      key={item.id}
                      className={`h-10 rounded-lg text-sm font-semibold transition-all duration-200 ${
                        isActive
                          ? "bg-accent/[0.14] text-white"
                          : "text-white/50 hover:bg-white/[0.06] hover:text-white/90"
                      }`}
                      onClick={() => {
                        onTabChange?.(item.id);
                        setMobileNavOpen(false);
                      }}
                    >
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

      {/* Main content */}
      <main className="relative z-10 mx-auto max-w-[92rem] px-3 py-3 sm:px-5 lg:py-4">
        {children}
      </main>
    </div>
  );
}
