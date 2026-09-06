import { HeuristicEngineAdapter, type ChessEngineAdapter } from "@mda-chess/chess-engine";
import 
let engine: ChessEngineAdapter | undefined;

export function createServerEngine() {
  if (!engine) {
    engine = new HeuristicEngineAdapter();
  }

  return engine;
}
