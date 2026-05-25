import { useMutation, useQuery } from "@tanstack/react-query";
import type { MoveAnalysis, SupportedLanguage } from "@mda-chess/shared";
import { apiClient } from "./client";

export function useAnalyzeGame() {
  return useMutation({
    mutationFn: (input: { pgn: string; depth?: number }) => apiClient.analyzeGame(input)
  });
}

export function useAnalyzeMove() {
  return useMutation({
    mutationFn: (input: { fen: string; move: string; depth?: number }) => apiClient.analyzeMove(input)
  });
}

export function useSaveGame() {
  return useMutation({
    mutationFn: (input: { pgn: string; depth?: number; source?: "MANUAL" | "PGN_IMPORT"; saveAnalysis?: boolean }) =>
      apiClient.saveGame(input)
  });
}

export function useExplainMove() {
  return useMutation({
    mutationFn: (input: {
      move: MoveAnalysis;
      language?: SupportedLanguage;
      userLevel?: "beginner" | "intermediate" | "advanced";
    }) => apiClient.explainMove(input)
  });
}

export function useProgressSummary(enabled: boolean) {
  return useQuery({
    queryKey: ["progress-summary"],
    queryFn: () => apiClient.progressSummary(),
    enabled
  });
}
