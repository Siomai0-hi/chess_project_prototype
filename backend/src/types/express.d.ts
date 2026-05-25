import type { SupportedLanguage } from "@mda-chess/shared";

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        preferredLanguage: SupportedLanguage;
      };
    }
  }
}

export {};
