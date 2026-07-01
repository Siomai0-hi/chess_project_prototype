import { Chess } from "chess.js";
import { HttpError } from "./http";

export function loadPgnOrThrow(pgn: string) {
  const chess = new Chess();

  try {
    chess.loadPgn(pgn.trim());
  } catch {
    throw new HttpError(400, "Invalid PGN", "INVALID_PGN");
  }

  if (chess.history().length === 0) {
    throw new HttpError(400, "PGN must contain at least one move", "EMPTY_PGN");
  }

  return chess;
}

export function toChessInputError(error: unknown, message: string, code: string) {
  if (!isChessInputError(error)) return undefined;
  return new HttpError(400, message, code);
}

function isChessInputError(error: unknown) {
  if (!(error instanceof Error)) return false;

  return /invalid|illegal|fen|move|pgn/i.test(error.message);
}
