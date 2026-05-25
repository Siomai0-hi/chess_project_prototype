import type { MoveAnalysis } from "@mda-chess/shared";

const placeholderMove: MoveAnalysis = {
  moveNumber: 1,
  san: "e4",
  fenBefore: "startpos",
  fenAfter: "after-e4",
  color: "white",
  classification: "best",
  centipawnLoss: 0
};

export function AnalysisScreen() {
  return null;
}

export const mobileAnalysisContract = {
  screen: "AnalysisScreen",
  reuses: ["api-client", "shared-types", "chess-engine"],
  placeholderMove
};
