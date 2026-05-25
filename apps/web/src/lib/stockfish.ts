import { StockfishWorkerAdapter, type UciWorker } from "@mda-chess/chess-engine";
import stockfishWorkerUrl from "stockfish.js/stockfish.js?url";

export function createBrowserStockfish() {
  return new StockfishWorkerAdapter(() => new Worker(stockfishWorkerUrl) as unknown as UciWorker);
}
