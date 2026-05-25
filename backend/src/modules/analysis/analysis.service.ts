import { analyzeMove, analyzePgn } from "@mda-chess/chess-engine";
import { createServerEngine } from "../../stockfish/engine";

export async function analyzeGame(input: { pgn: string; depth: number }) {
  return analyzePgn(input.pgn, createServerEngine(), {
    depth: input.depth,
    maxMoves: 160
  });
}

export async function analyzeSingleMove(input: { fen: string; move: string; depth: number }) {
  return analyzeMove(input, createServerEngine());
}
