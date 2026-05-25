import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { SupportedLanguage } from "@mda-chess/shared";

interface SessionUser {
  id: string;
  email: string;
  name?: string | null;
  preferredLanguage: SupportedLanguage;
}

interface SessionState {
  token?: string;
  user?: SessionUser;
  setAuth: (input: { token: string; user: SessionUser }) => void;
  logout: () => void;
}

export const useSessionStore = create<SessionState>()(
  persist(
    (set) => ({
      setAuth: (input) => set(input),
      logout: () => set({ token: undefined, user: undefined })
    }),
    {
      name: "mda-chess-session"
    }
  )
);
