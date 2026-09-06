import { HeuristicEngineAdapter, type ChessEngineAdapter } from "@mda-chess/chess-engine";
import { Stockfish, type maxengine } from "@mda-chess/chess-engine";
let engine: ChessEngineAdapter | undefined;

export function createServerEngine() {
  if (!engine) {
    engine = new HeuristicEngineAdapter();
  }

  return engine;
}
