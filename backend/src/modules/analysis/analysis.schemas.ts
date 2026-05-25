import { z } from "zod";

export const analyzeGameSchema = z.object({
  pgn: z.string().min(1),
  depth: z.number().int().min(1).max(20).default(10)
});

export const analyzeMoveSchema = z.object({
  fen: z.string().min(1),
  move: z.string().min(2),
  depth: z.number().int().min(1).max(20).default(10)
});
