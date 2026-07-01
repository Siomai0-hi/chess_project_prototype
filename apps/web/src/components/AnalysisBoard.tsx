import { useEffect, useMemo, useRef, useState } from "react";
import { Chess, type Square as ChessSquare } from "chess.js";
import { Chessboard } from "react-chessboard";
import type { Arrow, CustomSquareStyles, Square as BoardSquare } from "react-chessboard/dist/chessboard/types";
import type { MoveAnalysis } from "@mda-chess/shared";
import { PromotionDialog } from "./PromotionDialog";

interface AnalysisBoardProps {
  fen: string;
  activeMove?: MoveAnalysis;
  orientation: "white" | "black";
  onFenChange: (fen: string, pgn: string, move?: string, fenBefore?: string) => void;
}

type PendingPromotion = { from: string; to: string };

export function AnalysisBoard({ fen, activeMove, orientation, onFenChange }: AnalysisBoardProps) {
  const boardRef = useRef<HTMLDivElement>(null);
  const [boardWidth, setBoardWidth] = useState(480);
  const [selectedSquare, setSelectedSquare] = useState<BoardSquare>();
  const [pendingPromotion, setPendingPromotion] = useState<PendingPromotion | null>(null);

  const position = useMemo(() => {
    try { return new Chess(fen); } catch { return new Chess(); }
  }, [fen]);

  const activeSquares = getMoveSquares(activeMove?.uci);
  const legalSquares = useMemo(
    () => getLegalSquares(position, selectedSquare),
    [position, selectedSquare]
  );
  const customSquareStyles = useMemo(
    () => buildSquareStyles(activeSquares.from, activeSquares.to, selectedSquare, legalSquares),
    [activeSquares.from, activeSquares.to, legalSquares, selectedSquare]
  );
  const customArrows = useMemo<Arrow[]>(
    () =>
      activeSquares.from && activeSquares.to
        ? [[activeSquares.from, activeSquares.to, "rgba(215, 181, 109, 0.82)"]]
        : [],
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

  function isPawnPromotion(from: string, to: string) {
    const piece = position.get(from as ChessSquare);
    if (!piece || piece.type !== "p") return false;
    const toRank = to[1];
    return (piece.color === "w" && toRank === "8") || (piece.color === "b" && toRank === "1");
  }

  function handleDrop(sourceSquare: string, targetSquare: string) {
    setSelectedSquare(undefined);
    if (isPawnPromotion(sourceSquare, targetSquare)) {
      setPendingPromotion({ from: sourceSquare, to: targetSquare });
      return false; // defer until piece chosen
    }
    return makeMove(sourceSquare, targetSquare);
  }

  function handleSquareClick(square: BoardSquare) {
    const piece = position.get(square as ChessSquare);
    if (selectedSquare) {
      const legalMove = position
        .moves({ square: selectedSquare as ChessSquare, verbose: true })
        .find((m) => m.to === square);
      if (legalMove) {
        if (isPawnPromotion(selectedSquare, square)) {
          setPendingPromotion({ from: selectedSquare, to: square });
          setSelectedSquare(undefined);
          return;
        }
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

  function handlePromotion(promotion: "q" | "r" | "b" | "n") {
    if (!pendingPromotion) return;
    makeMove(pendingPromotion.from, pendingPromotion.to, promotion);
    setPendingPromotion(null);
  }

  function makeMove(sourceSquare: string, targetSquare: string, promotion?: string) {
    const chess = new Chess(fen);
    const fenBefore = chess.fen();
    try {
      const move = chess.move({ from: sourceSquare, to: targetSquare, promotion: promotion ?? "q" });
      if (!move) return false;
      onFenChange(chess.fen(), chess.pgn(), move.san, fenBefore);
      return true;
    } catch {
      return false;
    }
  }

  return (
    <>
      <div
        ref={boardRef}
        className="analysis-board-shell relative aspect-square w-full overflow-hidden rounded-lg border border-black/60 p-2 shadow-[0_18px_54px_rgba(0,0,0,0.56)]"
      >
        <Chessboard
          id="analysis-board"
          position={fen}
          boardOrientation={orientation}
          onPieceDrop={handleDrop}
          onSquareClick={handleSquareClick}
          boardWidth={boardWidth}
          animationDuration={160}
          customArrows={customArrows}
          customArrowColor="rgba(215,181,109,0.78)"
          customBoardStyle={{
            width: "100%",
            height: "100%",
            borderRadius: "8px",
            boxShadow: "inset 0 0 0 1px rgba(18,17,15,0.34)"
          }}
          customDarkSquareStyle={{ backgroundColor: "#54736f" }}
          customLightSquareStyle={{ backgroundColor: "#d9c89c" }}
          customDropSquareStyle={{ boxShadow: "inset 0 0 0 4px rgba(101, 200, 189, 0.65)" }}
          customNotationStyle={{
            color: "rgba(20,20,20,0.52)",
            fontSize: Math.max(10, Math.floor(boardWidth / 58)),
            fontWeight: 800
          }}
          customSquareStyles={customSquareStyles}
        />
      </div>

      <PromotionDialog
        open={pendingPromotion !== null}
        color={position.turn()}
        onSelect={handlePromotion}
        onClose={() => setPendingPromotion(null)}
      />
    </>
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
  return position
    .moves({ square: selectedSquare as ChessSquare, verbose: true })
    .map((m) => m.to as BoardSquare);
}

function buildSquareStyles(
  from?: BoardSquare,
  to?: BoardSquare,
  selectedSquare?: BoardSquare,
  legalSquares: BoardSquare[] = []
): CustomSquareStyles {
  const styles: CustomSquareStyles = {};
  const base = {
    boxShadow: "inset 0 0 0 3px rgba(101, 200, 189, 0.42)",
    background: "rgba(101, 200, 189, 0.22)"
  };

  if (from) styles[from] = base;
  if (to) {
    styles[to] = {
      ...base,
      boxShadow: "inset 0 0 0 3px rgba(215, 181, 109, 0.58)",
      background: "rgba(215, 181, 109, 0.30)"
    };
  }
  if (selectedSquare) {
    styles[selectedSquare] = {
      ...styles[selectedSquare],
      boxShadow: "inset 0 0 0 4px rgba(184, 70, 83, 0.58)"
    };
  }
  for (const square of legalSquares) {
    styles[square] = {
      ...styles[square],
      background:
        "radial-gradient(circle at center, rgba(20,20,20,0.32) 0 15%, transparent 16%)"
    };
  }
  return styles;
}
