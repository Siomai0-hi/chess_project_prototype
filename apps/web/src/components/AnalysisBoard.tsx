import { useEffect, useMemo, useRef, useState } from "react";
import { Chess, type Square as ChessSquare } from "chess.js";
import { Chessboard } from "react-chessboard";
import type { Arrow, CustomSquareStyles, Square as BoardSquare } from "react-chessboard/dist/chessboard/types";
import type { MoveAnalysis } from "@mda-chess/shared";

interface AnalysisBoardProps {
  fen: string;
  activeMove?: MoveAnalysis;
  orientation: "white" | "black";
  onFenChange: (fen: string, pgn: string, move?: string, fenBefore?: string) => void;
}

export function AnalysisBoard({ fen, activeMove, orientation, onFenChange }: AnalysisBoardProps) {
  const boardRef = useRef<HTMLDivElement>(null);
  const [boardWidth, setBoardWidth] = useState(480);
  const [selectedSquare, setSelectedSquare] = useState<BoardSquare>();
  const position = useMemo(() => {
    try {
      return new Chess(fen);
    } catch {
      return new Chess();
    }
  }, [fen]);
  const activeSquares = getMoveSquares(activeMove?.uci);
  const legalSquares = useMemo(() => getLegalSquares(position, selectedSquare), [position, selectedSquare]);
  const customSquareStyles = useMemo(
    () => buildSquareStyles(activeSquares.from, activeSquares.to, selectedSquare, legalSquares),
    [activeSquares.from, activeSquares.to, legalSquares, selectedSquare]
  );
  const customArrows = useMemo<Arrow[]>(
    () => (activeSquares.from && activeSquares.to ? [[activeSquares.from, activeSquares.to, "rgba(85, 200, 120, 0.64)"]] : []),
    [activeSquares.from, activeSquares.to]
  );

  useEffect(() => {
    if (!boardRef.current) return;

    const observer = new ResizeObserver(([entry]) => {
      if (entry) setBoardWidth(Math.max(260, Math.floor(entry.contentRect.width)));
    });

    observer.observe(boardRef.current);
    return () => observer.disconnect();
  }, []);

  function handleDrop(sourceSquare: string, targetSquare: string) {
    setSelectedSquare(undefined);
    return makeMove(sourceSquare, targetSquare);
  }

  function handleSquareClick(square: BoardSquare) {
    const piece = position.get(square as ChessSquare);

    if (selectedSquare) {
      const legalMove = position
        .moves({ square: selectedSquare as ChessSquare, verbose: true })
        .find((move) => move.to === square);

      if (legalMove) {
        makeMove(selectedSquare, square);
        setSelectedSquare(undefined);
        return;
      }
    }

    if (piece && piece.color === position.turn()) {
      setSelectedSquare(square);
      return;
    }

    setSelectedSquare(undefined);
  }

  function makeMove(sourceSquare: string, targetSquare: string) {
    const chess = new Chess(fen);
    const fenBefore = chess.fen();

    try {
      const move = chess.move({
        from: sourceSquare,
        to: targetSquare,
        promotion: "q"
      });

      if (!move) return false;
      onFenChange(chess.fen(), chess.pgn(), move.san, fenBefore);
      return true;
    } catch {
      return false;
    }
  }

  return (
    <div ref={boardRef} className="analysis-board-shell aspect-square w-full overflow-hidden rounded-lg border border-black/40 shadow-[0_4px_24px_rgba(0,0,0,0.6)]">
      <Chessboard
        id="analysis-board"
        position={fen}
        boardOrientation={orientation}
        onPieceDrop={handleDrop}
        onSquareClick={handleSquareClick}
        boardWidth={boardWidth}
        animationDuration={180}
        autoPromoteToQueen
        customArrows={customArrows}
        customArrowColor="rgba(91, 138, 50, 0.68)"
        customBoardStyle={{
          width: "100%",
          height: "100%",
          borderRadius: "8px",
          boxShadow: "inset 0 0 0 1px rgba(0,0,0,0.22)"
        }}
        customDarkSquareStyle={{ backgroundColor: "#b58863" }}
        customLightSquareStyle={{ backgroundColor: "#f0d9b5" }}
        customDropSquareStyle={{ boxShadow: "inset 0 0 0 4px rgba(91, 138, 50, 0.58)" }}
        customNotationStyle={{
          color: "rgba(20,20,20,0.58)",
          fontSize: Math.max(10, Math.floor(boardWidth / 58)),
          fontWeight: 800
        }}
        customSquareStyles={customSquareStyles}
      />
    </div>
  );
}

function getMoveSquares(uci?: string): { from?: BoardSquare; to?: BoardSquare } {
  if (!uci || uci.length < 4) return {};
  const from = uci.slice(0, 2);
  const to = uci.slice(2, 4);

  if (!isSquare(from) || !isSquare(to)) return {};
  return { from, to };
}

function isSquare(value: string): value is BoardSquare {
  return /^[a-h][1-8]$/.test(value);
}

function getLegalSquares(position: Chess, selectedSquare?: BoardSquare) {
  if (!selectedSquare) return [];
  return position.moves({ square: selectedSquare as ChessSquare, verbose: true }).map((move) => move.to as BoardSquare);
}

function buildSquareStyles(from?: BoardSquare, to?: BoardSquare, selectedSquare?: BoardSquare, legalSquares: BoardSquare[] = []): CustomSquareStyles {
  const styles: CustomSquareStyles = {};
  const base = {
    boxShadow: "inset 0 0 0 3px rgba(91, 138, 50, 0.36)",
    background: "rgba(155, 199, 0, 0.28)"
  };

  if (from) styles[from] = base;
  if (to) {
    styles[to] = {
      ...base,
      boxShadow: "inset 0 0 0 3px rgba(212, 160, 23, 0.46)",
      background: "rgba(212, 160, 23, 0.3)"
    };
  }

  if (selectedSquare) {
    styles[selectedSquare] = {
      ...styles[selectedSquare],
      boxShadow: "inset 0 0 0 4px rgba(52, 152, 219, 0.55)"
    };
  }

  for (const square of legalSquares) {
    styles[square] = {
      ...styles[square],
      background: "radial-gradient(circle at center, rgba(20,20,20,0.34) 0 16%, transparent 17%)"
    };
  }

  return styles;
}
