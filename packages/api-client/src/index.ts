import type { CoachExplanation, MoveAnalysis, SupportedLanguage, UserProgressSummary } from "@mda-chess/shared";

export interface AuthResponse {
  token: string;
  user: {
    id: string;
    email: string;
    name?: string | null;
    preferredLanguage: SupportedLanguage;
  };
}

export interface AnalyzeGameResponse {
  moves: MoveAnalysis[];
  summary: {
    accuracyWhite: number;
    accuracyBlack: number;
    opening?: string;
    result?: string;
    totalMoves: number;
    criticalMistakes: number;
    review: string;
  };
}

export class ApiClient {
  constructor(
    private readonly baseUrl: string,
    private readonly getToken?: () => string | undefined
  ) {}

  register(input: { email: string; password: string; name?: string; preferredLanguage?: SupportedLanguage }) {
    return this.request<AuthResponse>("/auth/register", {
      method: "POST",
      body: JSON.stringify(input)
    });
  }

  login(input: { email: string; password: string }) {
    return this.request<AuthResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify(input)
    });
  }

  me() {
    return this.request<AuthResponse["user"]>("/auth/me");
  }

  analyzeGame(input: { pgn: string; depth?: number }) {
    return this.request<AnalyzeGameResponse>("/analysis/game", {
      method: "POST",
      body: JSON.stringify(input)
    });
  }

  saveGame(input: { pgn: string; depth?: number; source?: "MANUAL" | "PGN_IMPORT"; saveAnalysis?: boolean }) {
    return this.request<{ id: string }>("/games", {
      method: "POST",
      body: JSON.stringify({
        source: "MANUAL",
        saveAnalysis: true,
        ...input
      })
    });
  }

  analyzeMove(input: { fen: string; move: string; depth?: number }) {
    return this.request<MoveAnalysis>("/analysis/move", {
      method: "POST",
      body: JSON.stringify(input)
    });
  }

  explainMove(input: {
    move: MoveAnalysis;
    language?: SupportedLanguage;
    userLevel?: "beginner" | "intermediate" | "advanced";
  }) {
    return this.request<CoachExplanation>("/coach/explain", {
      method: "POST",
      body: JSON.stringify(input)
    });
  }

  progressSummary() {
    return this.request<UserProgressSummary>("/progress/summary");
  }

  private async request<T>(path: string, init: RequestInit = {}): Promise<T> {
    const token = this.getToken?.();
    const response = await fetch(`${this.baseUrl}${path}`, {
      ...init,
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...init.headers
      }
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: "Request failed" }));
      throw new Error(error.message ?? "Request failed");
    }

    return response.json() as Promise<T>;
  }
}
