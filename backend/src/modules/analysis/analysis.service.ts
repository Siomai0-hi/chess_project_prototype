import { analyzeMove, analyzePgn } from "@mda-chess/chess-engine";
import { createServerEngine } from "../../stockfish/engine";
import { loadPgnOrThrow, toChessInputError } from "../../utils/chess";

export async function analyzeGame(input: { pgn: string; depth: number }) {
  loadPgnOrThrow(input.pgn);

  return analyzePgn(input.pgn, createServerEngine(), {
    depth: input.depth,
    maxMoves: 160
  });
}

export async function analyzeSingleMove(input: { fen: string; move: string; depth: number }) {
  try {
    return await analyzeMove(input, createServerEngine());
  } catch (error) {
    throw toChessInputError(error, "Invalid FEN or move", "INVALID_CHESS_MOVE") ?? error;
  }
}
