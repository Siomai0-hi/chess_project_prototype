import type { MoveAnalysis } from "@mda-chess/shared";
import { Color, MoveClassification, type Prisma } from "@prisma/client";
import { Chess } from "chess.js";
import { analyzeGame } from "../analysis/analysis.service";
import { prisma } from "../../services/prisma";
import { HttpError } from "../../utils/http";

export async function listGames(userId: string) {
  return prisma.game.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      result: true,
      openingEco: true,
      openingName: true,
      accuracyWhite: true,
      accuracyBlack: true,
      criticalMistakes: true,
      createdAt: true,
      source: true
    }
  });
}

export async function getGame(userId: string, gameId: string) {
  const game = await prisma.game.findFirst({
    where: { id: gameId, userId },
    include: {
      moves: {
        orderBy: { ply: "asc" },
        include: { analysis: true, mistake: true }
      }
    }
  });

  if (!game) {
    throw new HttpError(404, "Game not found", "GAME_NOT_FOUND");
  }

  return game;
}

export async function createGame(input: {
  userId: string;
  pgn: string;
  source: "MANUAL" | "PGN_IMPORT" | "LICHESS" | "CHESSCOM" | "OCR";
  depth: number;
  saveAnalysis: boolean;
}) {
  const chess = new Chess();
  chess.loadPgn(input.pgn.trim());
  const result = chess.header().Result;
  const analyzed = input.saveAnalysis ? await analyzeGame({ pgn: input.pgn, depth: input.depth }) : undefined;

  return prisma.game.create({
    data: {
      userId: input.userId,
      pgn: input.pgn,
      source: input.source,
      result,
      finalFen: chess.fen(),
      accuracyWhite: analyzed?.summary.accuracyWhite,
      accuracyBlack: analyzed?.summary.accuracyBlack,
      criticalMistakes: analyzed?.summary.criticalMistakes ?? 0,
      moves: analyzed
        ? {
            create: analyzed.moves.map((move, index) => toMoveCreateInput(move, index, input.userId))
          }
        : undefined
    },
    include: {
      moves: {
        orderBy: { ply: "asc" },
        include: { analysis: true, mistake: true }
      }
    }
  });
}

function toMoveCreateInput(move: MoveAnalysis, index: number, userId: string): Prisma.MoveCreateWithoutGameInput {
  const critical = move.classification === "mistake" || move.classification === "blunder";

  return {
    ply: index + 1,
    moveNumber: move.moveNumber,
    color: move.color === "white" ? Color.WHITE : Color.BLACK,
    san: move.san,
    uci: move.uci,
    fenBefore: move.fenBefore,
    fenAfter: move.fenAfter,
    classification: toMoveClassification(move.classification),
    centipawnLoss: move.centipawnLoss,
    bestMove: move.bestMove,
    analysis: move.evaluationAfter
      ? {
          create: {
            depth: move.evaluationAfter.depth,
            scoreCpWhite: move.evaluationAfter.scoreCpWhite,
            mateIn: move.evaluationAfter.mateIn,
            bestMove: move.evaluationAfter.bestMove,
            principalVariation: move.evaluationAfter.principalVariation,
            raw: JSON.parse(JSON.stringify(move.evaluationAfter))
          }
        }
      : undefined,
    mistake: critical
      ? {
          create: {
            userId,
            classification: toMoveClassification(move.classification),
            reason: move.classification === "blunder" ? "Large evaluation loss" : "Meaningful evaluation loss",
            tags: inferMistakeTags(move)
          }
        }
      : undefined
  };
}

function toMoveClassification(classification: MoveAnalysis["classification"]) {
  const map: Record<MoveAnalysis["classification"], MoveClassification> = {
    book: MoveClassification.BOOK,
    best: MoveClassification.BEST,
    excellent: MoveClassification.EXCELLENT,
    good: MoveClassification.GOOD,
    inaccuracy: MoveClassification.INACCURACY,
    mistake: MoveClassification.MISTAKE,
    blunder: MoveClassification.BLUNDER
  };

  return map[classification];
}

function inferMistakeTags(move: MoveAnalysis) {
  const tags = ["review"];
  if (move.centipawnLoss >= 350) tags.push("tactics");
  if (!move.bestMove) tags.push("calculation");
  return tags;
}
