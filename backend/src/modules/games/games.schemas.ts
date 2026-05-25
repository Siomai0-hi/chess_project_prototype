import { z } from "zod";

export const createGameSchema = z.object({
  pgn: z.string().min(1),
  source: z.enum(["MANUAL", "PGN_IMPORT", "LICHESS", "CHESSCOM", "OCR"]).default("MANUAL"),
  depth: z.number().int().min(1).max(20).default(10),
  saveAnalysis: z.boolean().default(true)
});
