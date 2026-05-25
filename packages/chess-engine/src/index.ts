import { Chess, type Move } from "chess.js";
import {
  accuracyFromLosses,
  classifyCentipawnLoss,
  type EngineEvaluation,
  type GameSummary,
  type MoveAnalysis,
  type PlayerColor
} from "@mda-chess/shared";

const PIECE_VALUES: Record<string, number> = {
  p: 100,
  n: 320,
  b: 330,
  r: 500,
  q: 900,
  k: 0
};

export interface UciWorker {
  onmessage: ((event: { data: unknown }) => void) | null;
  onerror: ((event: unknown) => void) | null;
  postMessage(message: string): void;
  terminate(): void;
}

export interface EngineAnalyzeRequest {
  fen: string;
  depth?: number;
  multiPv?: number;
}

export interface ChessEngineAdapter {
  analyzePosition(request: EngineAnalyzeRequest): Promise<EngineEvaluation[]>;
}

export interface AnalyzeGameOptions {
  depth?: number;
  maxMoves?: number;
}

export interface AnalyzeMoveInput {
  fen: string;
  move: string;
  depth?: number;
}

export class HeuristicEngineAdapter implements ChessEngineAdapter {
  async analyzePosition({ fen, depth = 8, multiPv = 1 }: EngineAnalyzeRequest) {
    const chess = new Chess(fen);
    const legalMoves = chess.moves({ verbose: true });
    const color = chess.turn() === "w" ? "white" : "black";

    if (legalMoves.length === 0) {
      return [
        {
          fen,
          depth,
          scoreCpWhite: evaluateFen(fen),
          principalVariation: []
        }
      ];
    }

    const ranked = legalMoves
      .map((move) => {
        const next = new Chess(fen);
        next.move(move);
        return {
          move,
          scoreCpWhite: evaluateFen(next.fen()) + signedMoveHeuristic(move)
        };
      })
      .sort((a, b) =>
        color === "white" ? b.scoreCpWhite - a.scoreCpWhite : a.scoreCpWhite - b.scoreCpWhite
      )
      .slice(0, multiPv);

    return ranked.map((item) => ({
      fen,
      depth,
      bestMove: moveToUci(item.move),
      scoreCpWhite: item.scoreCpWhite,
      principalVariation: [moveToUci(item.move)]
    }));
  }
}

export class StockfishWorkerAdapter implements ChessEngineAdapter {
  constructor(private readonly createWorker: () => UciWorker) {}

  analyzePosition({ fen, depth = 12, multiPv = 1 }: EngineAnalyzeRequest) {
    return new Promise<EngineEvaluation[]>((resolve, reject) => {
      const worker = this.createWorker();
      const lines = new Map<number, Partial<EngineEvaluation>>();
      const sideToMove = fen.split(" ")[1] === "b" ? "black" : "white";
      let timeout: ReturnType<typeof setTimeout>;

      const finish = (bestMove?: string) => {
        clearTimeout(timeout);
        worker.terminate();
        const evaluations = Array.from(lines.entries())
          .sort(([a], [b]) => a - b)
          .map(([, line]) => ({
            fen,
            depth: line.depth ?? depth,
            bestMove: line.bestMove ?? bestMove,
            ponder: line.ponder,
            scoreCpWhite: line.scoreCpWhite,
            mateIn: line.mateIn,
            principalVariation: line.principalVariation ?? []
          }));

        resolve(
          evaluations.length > 0
            ? evaluations
            : [
                {
                  fen,
                  depth,
                  bestMove,
                  principalVariation: bestMove ? [bestMove] : []
                }
              ]
        );
      };

      worker.onerror = () => {
        clearTimeout(timeout);
        worker.terminate();
        reject(new Error("Stockfish worker failed"));
      };

      worker.onmessage = (event: { data: unknown }) => {
        const message = String(event.data);
        if (message.startsWith("info depth")) {
          const parsed = parseStockfishInfo(message, fen, sideToMove);
          if (parsed) lines.set(parsed.multiPv, parsed.evaluation);
        }

        if (message.startsWith("bestmove")) {
          const [, bestMove, , ponder] = message.split(" ");
          finish(bestMove === "(none)" ? undefined : bestMove);
          if (ponder && lines.size > 0) {
            const first = lines.get(1);
            if (first) first.ponder = ponder;
          }
        }
      };

      timeout = setTimeout(() => finish(), 8000);
      worker.postMessage("uci");
      worker.postMessage(`setoption name MultiPV value ${multiPv}`);
      worker.postMessage("isready");
      worker.postMessage(`position fen ${fen}`);
      worker.postMessage(`go depth ${depth}`);
    });
  }
}

export async function analyzeMove(
  input: AnalyzeMoveInput,
  engine: ChessEngineAdapter
): Promise<MoveAnalysis> {
  const chess = new Chess(input.fen);
  const color: PlayerColor = chess.turn() === "w" ? "white" : "black";
  const moveNumber = Number(input.fen.split(" ")[5] ?? 1);
  const move = chess.move(input.move);

  if (!move) {
    throw new Error("Illegal move for current FEN");
  }

  const fenAfter = chess.fen();
  const [beforeLine] = await engine.analyzePosition({
    fen: input.fen,
    depth: input.depth,
    multiPv: 1
  });
  const [afterLine] = await engine.analyzePosition({
    fen: fenAfter,
    depth: input.depth,
    multiPv: 1
  });

  const actualScore =
    engine instanceof HeuristicEngineAdapter ? evaluateFen(fenAfter) + signedMoveHeuristic(move) : afterLine?.scoreCpWhite;
  const normalizedAfterLine =
    engine instanceof HeuristicEngineAdapter && afterLine
      ? {
          ...afterLine,
          scoreCpWhite: actualScore
        }
      : afterLine;
  const centipawnLoss = calculateLoss(color, beforeLine?.scoreCpWhite, actualScore);

  return {
    moveNumber,
    san: move.san,
    uci: moveToUci(move),
    fenBefore: input.fen,
    fenAfter,
    color,
    classification: classifyCentipawnLoss(centipawnLoss),
    centipawnLoss,
    bestMove: beforeLine?.bestMove,
    evaluationBefore: beforeLine,
    evaluationAfter: normalizedAfterLine
  };
}

export async function analyzePgn(
  pgn: string,
  engine: ChessEngineAdapter,
  options: AnalyzeGameOptions = {}
) {
  const source = new Chess();
  source.loadPgn(pgn.trim());
  const history = source.history({ verbose: true });
  const replay = new Chess();
  const depth = options.depth ?? 10;
  const limit = Math.min(history.length, options.maxMoves ?? history.length);
  const moves: MoveAnalysis[] = [];

  for (const historicalMove of history.slice(0, limit)) {
    const fenBefore = replay.fen();
    const move = replay.move(historicalMove.san);
    if (!move) break;

    const analysis = await analyzeMove({ fen: fenBefore, move: move.san, depth }, engine);
    moves.push(analysis);
  }

  return {
    moves,
    summary: summarizeGame(moves, source.header().Result ?? undefined)
  };
}

export function summarizeGame(moves: MoveAnalysis[], result?: string): GameSummary {
  const whiteLosses = moves.filter((move) => move.color === "white").map((move) => move.centipawnLoss);
  const blackLosses = moves.filter((move) => move.color === "black").map((move) => move.centipawnLoss);
  const criticalMistakes = moves.filter(
    (move) => move.classification === "mistake" || move.classification === "blunder"
  ).length;

  return {
    accuracyWhite: accuracyFromLosses(whiteLosses),
    accuracyBlack: accuracyFromLosses(blackLosses),
    result,
    totalMoves: moves.length,
    criticalMistakes,
    review:
      criticalMistakes === 0
        ? "Тоглолт тогтвортой байна. Дараагийн алхам бол төлөвлөгөөний чанараа сайжруулах."
        : "Гол алдаануудыг давтаж үзээд тактикийн аюулыг нүүдэл бүрийн өмнө шалгаарай."
  };
}

export function validateFen(fen: string) {
  try {
    new Chess(fen);
    return true;
  } catch {
    return false;
  }
}

export function legalMovesForFen(fen: string) {
  return new Chess(fen).moves({ verbose: true }).map((move) => ({
    san: move.san,
    uci: moveToUci(move),
    from: move.from,
    to: move.to,
    promotion: move.promotion
  }));
}

export function evaluateFen(fen: string) {
  const chess = new Chess(fen);
  const board = chess.board();
  let score = 0;

  for (const row of board) {
    for (const piece of row) {
      if (!piece) continue;
      const value = PIECE_VALUES[piece.type] ?? 0;
      score += piece.color === "w" ? value : -value;
    }
  }

  if (chess.isCheckmate()) {
    return chess.turn() === "w" ? -100000 : 100000;
  }

  return score;
}

function calculateLoss(color: PlayerColor, bestScore?: number, actualScore?: number) {
  if (typeof bestScore !== "number" || typeof actualScore !== "number") return 0;
  const rawLoss = color === "white" ? bestScore - actualScore : actualScore - bestScore;
  return Math.max(0, Math.round(rawLoss));
}

function moveToUci(move: Move) {
  return `${move.from}${move.to}${move.promotion ?? ""}`;
}

function signedMoveHeuristic(move: Move) {
  const sign = move.color === "w" ? 1 : -1;
  let bonus = 0;

  if (["e4", "d4", "e5", "d5"].includes(move.to)) bonus += 35;
  if (["c4", "f4", "c5", "f5"].includes(move.to)) bonus += 12;
  if (
    (move.piece === "n" || move.piece === "b") &&
    ["b1", "g1", "c1", "f1", "b8", "g8", "c8", "f8"].includes(move.from) &&
    ["c3", "f3", "c6", "f6", "d2", "e2", "d7", "e7", "b5", "g5", "b4", "g4"].includes(move.to)
  ) {
    bonus += 24;
  }
  if (move.piece === "p" && ["e", "d"].includes(move.from[0] ?? "") && Math.abs(Number(move.from[1]) - Number(move.to[1])) === 2) {
    bonus += 26;
  }
  if (move.flags.includes("k") || move.flags.includes("q")) bonus += 45;
  if (move.captured) bonus += Math.min(90, (PIECE_VALUES[move.captured] ?? 0) / 8);
  if (move.promotion) bonus += 80;

  return sign * bonus;
}

function parseStockfishInfo(message: string, fen: string, sideToMove: PlayerColor) {
  const parts = message.split(/\s+/);
  const depthIndex = parts.indexOf("depth");
  const multiPvIndex = parts.indexOf("multipv");
  const scoreIndex = parts.indexOf("score");
  const pvIndex = parts.indexOf("pv");

  if (depthIndex === -1 || scoreIndex === -1) return undefined;

  const depth = Number(parts[depthIndex + 1]);
  const multiPv = multiPvIndex === -1 ? 1 : Number(parts[multiPvIndex + 1]);
  const scoreKind = parts[scoreIndex + 1];
  const scoreValue = Number(parts[scoreIndex + 2]);
  const principalVariation = pvIndex === -1 ? [] : parts.slice(pvIndex + 1);
  const bestMove = principalVariation[0];

  let scoreCpWhite: number | undefined;
  let mateIn: number | undefined;

  if (scoreKind === "cp") {
    scoreCpWhite = sideToMove === "white" ? scoreValue : -scoreValue;
  }

  if (scoreKind === "mate") {
    mateIn = sideToMove === "white" ? scoreValue : -scoreValue;
    scoreCpWhite = Math.sign(mateIn) * 100000;
  }

  return {
    multiPv,
    evaluation: {
      fen,
      depth,
      bestMove,
      scoreCpWhite,
      mateIn,
      principalVariation
    }
  };
}
