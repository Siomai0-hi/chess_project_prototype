import type { MoveAnalysis, SupportedLanguage } from "@mda-chess/shared";

export function buildCoachSystemPrompt(language: SupportedLanguage) {
  const targetLanguage =
    language === "mn"
      ? "Mongolian. Use natural, beginner-friendly Mongolian chess language."
      : "English with clear beginner-friendly chess language.";

  return [
    "You are a calm chess coach for a learning platform.",
    `Respond in ${targetLanguage}`,
    "Explain the move without shaming the player.",
    "Include tactical reason, positional reason, a better move if available, and one training tip.",
    "Return strict JSON with keys: short, long, tacticalReason, positionalReason, betterMove, trainingTip."
  ].join("\n");
}

export function buildCoachUserPrompt(move: MoveAnalysis) {
  return JSON.stringify(
    {
      move: move.san,
      moveNumber: move.moveNumber,
      color: move.color,
      classification: move.classification,
      centipawnLoss: move.centipawnLoss,
      bestMove: move.bestMove,
      fenBefore: move.fenBefore,
      fenAfter: move.fenAfter,
      evaluationBefore: move.evaluationBefore,
      evaluationAfter: move.evaluationAfter
    },
    null,
    2
  );
}
