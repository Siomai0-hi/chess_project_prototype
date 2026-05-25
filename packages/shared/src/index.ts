export type SupportedLanguage = "mn" | "en";

export type MoveClassification =
  | "book"
  | "best"
  | "excellent"
  | "good"
  | "inaccuracy"
  | "mistake"
  | "blunder";

export type PlayerColor = "white" | "black";

export interface EngineEvaluation {
  fen: string;
  depth: number;
  bestMove?: string;
  ponder?: string;
  scoreCpWhite?: number;
  mateIn?: number;
  principalVariation: string[];
}

export interface MoveAnalysis {
  moveNumber: number;
  san: string;
  uci?: string;
  fenBefore: string;
  fenAfter: string;
  color: PlayerColor;
  classification: MoveClassification;
  centipawnLoss: number;
  bestMove?: string;
  evaluationBefore?: EngineEvaluation;
  evaluationAfter?: EngineEvaluation;
}

export interface GameSummary {
  accuracyWhite: number;
  accuracyBlack: number;
  opening?: string;
  result?: string;
  totalMoves: number;
  criticalMistakes: number;
  review: string;
}

export interface CoachExplanation {
  language: SupportedLanguage;
  short: string;
  long: string;
  tacticalReason: string;
  positionalReason: string;
  betterMove?: string;
  trainingTip: string;
}

export interface UserProgressSummary {
  gamesReviewed: number;
  averageAccuracy: number;
  blundersPerGame: number;
  commonMistakeTags: string[];
  nextTrainingFocus: string[];
}

export interface ApiErrorShape {
  message: string;
  code?: string;
  details?: unknown;
}

export const CLASSIFICATION_THRESHOLDS = {
  best: 20,
  excellent: 50,
  good: 100,
  inaccuracy: 180,
  mistake: 350
} as const;

export function classifyCentipawnLoss(loss: number): MoveClassification {
  if (loss <= CLASSIFICATION_THRESHOLDS.best) return "best";
  if (loss <= CLASSIFICATION_THRESHOLDS.excellent) return "excellent";
  if (loss <= CLASSIFICATION_THRESHOLDS.good) return "good";
  if (loss <= CLASSIFICATION_THRESHOLDS.inaccuracy) return "inaccuracy";
  if (loss <= CLASSIFICATION_THRESHOLDS.mistake) return "mistake";
  return "blunder";
}

export function isCriticalMistake(classification: MoveClassification) {
  return classification === "mistake" || classification === "blunder";
}

export function accuracyFromLosses(losses: number[]) {
  if (losses.length === 0) return 100;
  const averageLoss = losses.reduce((total, loss) => total + loss, 0) / losses.length;
  return Math.max(0, Math.min(100, Math.round(100 - averageLoss / 8)));
}
