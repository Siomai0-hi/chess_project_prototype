import { z } from "zod";

const evaluationSchema = z.object({
  fen: z.string(),
  depth: z.number(),
  bestMove: z.string().optional(),
  ponder: z.string().optional(),
  scoreCpWhite: z.number().optional(),
  mateIn: z.number().optional(),
  principalVariation: z.array(z.string())
});

export const moveAnalysisSchema = z.object({
  moveNumber: z.number(),
  san: z.string(),
  uci: z.string().optional(),
  fenBefore: z.string(),
  fenAfter: z.string(),
  color: z.enum(["white", "black"]),
  classification: z.enum(["book", "best", "excellent", "good", "inaccuracy", "mistake", "blunder"]),
  centipawnLoss: z.number(),
  bestMove: z.string().optional(),
  evaluationBefore: evaluationSchema.optional(),
  evaluationAfter: evaluationSchema.optional()
});

export const explainMoveSchema = z.object({
  move: moveAnalysisSchema,
  language: z.enum(["mn", "en"]).default("mn"),
  userLevel: z.enum(["beginner", "intermediate", "advanced"]).default("beginner")
});
