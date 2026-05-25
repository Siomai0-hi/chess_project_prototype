import { useEffect, useMemo, useRef, useState } from "react";
import { Chess } from "chess.js";
import { Chessboard } from "react-chessboard";
import type { Arrow, CustomSquareStyles, Square } from "react-chessboard/dist/chessboard/types";
import { Circle, RotateCcw, Search, ShieldAlert } from "lucide-react";
import type { MoveAnalysis } from "@mda-chess/shared";
import { Button } from "./ui/Button";

interface AnalysisBoardProps {
  fen: string;
  activeMove?: MoveAnalysis;
  onFenChange: (fen: string, pgn: string, move?: string, fenBefore?: string) => void;
  onAnalyzePosition: () => void;
}

export function AnalysisBoard({ fen, activeMove, onFenChange, onAnalyzePosition }: AnalysisBoardProps) {
  const boardRef = useRef<HTMLDivElement>(null);
  const [boardWidth, setBoardWidth] = useState(360);
  const position = useMemo(() => {
    try {
      return new Chess(fen);
    } catch {
      return new Chess();
    }
  }, [fen]);
  const activeSquares = getMoveSquares(activeMove?.uci);
  const customSquareStyles = useMemo(
    () => buildSquareStyles(activeSquares.from, activeSquares.to),
    [activeSquares.from, activeSquares.to]
  );
  const customArrows = useMemo<Arrow[]>(
    () => (activeSquares.from && activeSquares.to ? [[activeSquares.from, activeSquares.to, "rgba(85, 200, 120, 0.64)"]] : []),
    [activeSquares.from, activeSquares.to]
  );
  const turnLabel = position.turn() === "w" ? "Цагаан нүүнэ" : "Хар нүүнэ";
  const boardStateLabel = position.isCheck() ? "Шах" : turnLabel;

  useEffect(() => {
    if (!boardRef.current) return;

    const observer = new ResizeObserver(([entry]) => {
      if (entry) setBoardWidth(Math.floor(entry.contentRect.width));
    });

    observer.observe(boardRef.current);
    return () => observer.disconnect();
  }, []);

  function handleDrop(sourceSquare: string, targetSquare: string) {
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

  function resetBoard() {
    const chess = new Chess();
    onFenChange(chess.fen(), chess.pgn());
  }

  return (
    <section className="rounded-lg border border-white/10 bg-[linear-gradient(145deg,#20251f,#151815)] p-3 shadow-2xl">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2">
          <div className="grid h-8 w-8 place-items-center rounded-lg border border-white/10 bg-white/[0.055] text-accent">
            {position.isCheck() ? <ShieldAlert size={16} aria-hidden="true" /> : <Circle size={13} aria-hidden="true" />}
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-bold text-ink">{boardStateLabel}</p>
            <p className="truncate text-xs text-white/50">
              {activeMove ? `${activeMove.moveNumber}. ${activeMove.san}` : `${position.moves().length} боломжит нүүдэл`}
            </p>
          </div>
        </div>
        <div className="rounded-lg border border-white/10 bg-night px-3 py-2 text-xs font-semibold text-white/65">
          {position.isGameOver() ? "Дууссан" : "Шууд"}
        </div>
      </div>

      <div className="rounded-lg border border-white/10 bg-night/80 p-2 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]">
        <div
          ref={boardRef}
          className="analysis-board-shell aspect-square w-full overflow-hidden rounded-lg border border-black/30"
        >
          <Chessboard
            id="analysis-board"
            position={fen}
            onPieceDrop={handleDrop}
            boardWidth={boardWidth}
            animationDuration={180}
            autoPromoteToQueen
            customArrows={customArrows}
            customArrowColor="rgba(85, 200, 120, 0.64)"
            customBoardStyle={{
              width: "100%",
              height: "100%",
              borderRadius: "8px",
              boxShadow: "0 24px 70px rgba(0,0,0,0.28), inset 0 0 0 1px rgba(255,255,255,0.08)"
            }}
            customDarkSquareStyle={{ backgroundColor: "#6f7f55" }}
            customLightSquareStyle={{ backgroundColor: "#d8c8a6" }}
            customDropSquareStyle={{ boxShadow: "inset 0 0 0 4px rgba(85, 200, 120, 0.58)" }}
            customNotationStyle={{
              color: "rgba(16,18,17,0.62)",
              fontSize: Math.max(10, Math.floor(boardWidth / 56)),
              fontWeight: 800
            }}
            customSquareStyles={customSquareStyles}
          />
        </div>
      </div>
      <div className="mt-3 grid grid-cols-2 gap-2">
        <Button variant="secondary" icon={<RotateCcw size={16} />} onClick={resetBoard}>
          Шинэ
        </Button>
        <Button icon={<Search size={16} />} onClick={onAnalyzePosition}>
          Шинжлэх
        </Button>
      </div>
    </section>
  );
}

function getMoveSquares(uci?: string): { from?: Square; to?: Square } {
  if (!uci || uci.length < 4) return {};
  const from = uci.slice(0, 2);
  const to = uci.slice(2, 4);

  if (!isSquare(from) || !isSquare(to)) return {};
  return { from, to };
}

function isSquare(value: string): value is Square {
  return /^[a-h][1-8]$/.test(value);
}

function buildSquareStyles(from?: Square, to?: Square): CustomSquareStyles {
  const styles: CustomSquareStyles = {};
  const base = {
    boxShadow: "inset 0 0 0 3px rgba(85, 200, 120, 0.32)",
    background: "radial-gradient(circle at center, rgba(85,200,120,0.32), transparent 62%)"
  };

  if (from) styles[from] = base;
  if (to) {
    styles[to] = {
      ...base,
      boxShadow: "inset 0 0 0 3px rgba(244, 184, 74, 0.42)",
      background: "radial-gradient(circle at center, rgba(244,184,74,0.38), transparent 62%)"
    };
  }

  return styles;
}
