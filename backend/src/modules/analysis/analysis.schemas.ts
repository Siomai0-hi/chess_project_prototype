import { z } from "zod";

export const analyzeGameSchema = z.object({
  pgn: z.string().trim().min(1).max(100_000),
  depth: z.coerce.number().int().min(1).max(20).default(10)
});

export const analyzeMoveSchema = z.object({
  fen: z.string().trim().min(1).max(512),
  move: z.string().trim().min(2).max(16),
  depth: z.coerce.number().int().min(1).max(20).default(10)
});
