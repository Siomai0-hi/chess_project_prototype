import type { SupportedLanguage } from "@mda-chess/shared";

declare global {
  namespace Express {
    interface Request {
      id?: string;
      user?: {
        id: string;
        email: string;
        preferredLanguage: SupportedLanguage;
      };
    }
  }
}

export {};
