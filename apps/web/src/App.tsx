import { useEffect, useMemo, useState } from "react";
import { Chess } from "chess.js";
import {
  AlertCircle,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Clipboard,
  RefreshCcw,
  RotateCcw,
  Save,
  Upload,
  X
} from "lucide-react";
import type { GameSummary, MoveAnalysis } from "@mda-chess/shared";
import { accuracyFromLosses } from "@mda-chess/shared";
import { AppShell } from "./components/AppShell";
import { AnalysisBoard } from "./components/AnalysisBoard";
import { EvalBar } from "./components/EvalBar";
import { GameReviewPanel } from "./components/GameReviewPanel";
import { MoveCoachPanel } from "./components/MoveCoachPanel";
import { PlayerBar } from "./components/PlayerBar";
import { GameSummaryBar } from "./components/GameSummaryBar";
import { ProgressPanel } from "./components/ProgressPanel";
import { Button } from "./components/ui/Button";
import { useQueryClient } from "@tanstack/react-query";
import { useAnalyzeGame, useAnalyzeMove, useExplainMove, useProgressSummary, useSaveGame } from "./api/hooks";
import { useSessionStore } from "./store/session";

const START_FEN = new Chess().fen();

type BoardOrientation = "white" | "black";
type ToastTone = "success" | "error";

interface ToastMessage {
  id: number;
  tone: ToastTone;
  message: string;
}

export function App() {
  const user = useSessionStore((state) => state.user);
  const [fen, setFen] = useState(START_FEN);
  const [pgn, setPgn] = useState("");
  const [draftPgn, setDraftPgn] = useState("");
  const [moves, setMoves] = useState<MoveAnalysis[]>([]);
  const [summary, setSummary] = useState<GameSummary>();
  const [selectedMove, setSelectedMove] = useState<MoveAnalysis>();
  const [boardOrientation, setBoardOrientation] = useState<BoardOrientation>("white");
  const [pgnModalOpen, setPgnModalOpen] = useState(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const queryClient = useQueryClient();
  const analyzeGameMutation = useAnalyzeGame();
  const analyzeMoveMutation = useAnalyzeMove();
  const explainMutation = useExplainMove();
  const saveGameMutation = useSaveGame();
  const progressQuery = useProgressSummary(!!user);

  const currentPosition = useMemo(() => safeChess(fen), [fen]);
  const activeScore = selectedMove?.evaluationAfter?.scoreCpWhite ?? selectedMove?.evaluationBefore?.scoreCpWhite;
  const activeMateIn = selectedMove?.evaluationAfter?.mateIn ?? selectedMove?.evaluationBefore?.mateIn;
  const selectedMoveIndex = moves.findIndex((m) => m.fenAfter === selectedMove?.fenAfter);
  const material = useMemo(() => getMaterialAdvantage(fen), [fen]);
  const turnLabel = currentPosition.turn() === "w" ? "Цагаан нүүнэ" : "Хар нүүнэ";
  const boardStateLabel = currentPosition.isGameOver()
    ? "Дууссан"
    : currentPosition.isCheck()
    ? "Шах"
    : turnLabel;

  // Error notifications
  useEffect(() => { if (analyzeGameMutation.error) notify("Тоглолт шинжлэхэд алдаа гарлаа.", "error"); }, [analyzeGameMutation.error]);
  useEffect(() => { if (analyzeMoveMutation.error) notify("Нүүдэл шинжлэхэд алдаа гарлаа.", "error"); }, [analyzeMoveMutation.error]);
  useEffect(() => { if (explainMutation.error) notify("Тайлбар авахад алдаа гарлаа.", "error"); }, [explainMutation.error]);
  useEffect(() => { if (saveGameMutation.error) notify("Хадгалах үед алдаа гарлаа.", "error"); }, [saveGameMutation.error]);

  // Keyboard navigation: ← →
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.key === "ArrowLeft") { e.preventDefault(); goPrevious(); }
      if (e.key === "ArrowRight") { e.preventDefault(); goNext(); }
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [moves, selectedMoveIndex]);

  function notify(message: string, tone: ToastTone = "success") {
    const id = Date.now() + Math.random();
    setToasts((items) => [...items, { id, message, tone }]);
    window.setTimeout(() => setToasts((items) => items.filter((item) => item.id !== id)), 3600);
  }

  function selectMove(move: MoveAnalysis) {
    setSelectedMove(move);
    setFen(move.fenAfter);
    explainMutation.mutate({
      move,
      language: user?.preferredLanguage ?? "mn",
      userLevel: "beginner"
    });
  }

  function analyzePgn() {
    analyzeGameMutation.mutate(
      { pgn, depth: 10 },
      {
        onSuccess: (result) => {
          setMoves(result.moves);
          setSummary(result.summary);
          const firstImportant =
            result.moves.find((m) => m.classification === "blunder" || m.classification === "mistake") ??
            result.moves[0];
          if (firstImportant) selectMove(firstImportant);
          notify("Шинжилгээ дууслаа.");
        }
      }
    );
  }

  function handleFenChange(nextFen: string, nextPgn: string, move?: string, fenBefore?: string) {
    setFen(nextFen);
    setPgn(nextPgn || pgn);
    if (!move || !fenBefore) return;
    analyzeMoveMutation.mutate(
      { fen: fenBefore, move, depth: 8 },
      {
        onSuccess: (analysis) => {
          const nextMoves = [...moves, analysis];
          setMoves(nextMoves);
          setSummary(summarizeLiveGame(nextMoves));
          selectMove(analysis);
        }
      }
    );
  }

  function saveGame() {
    saveGameMutation.mutate(
      { pgn, depth: 10, source: "MANUAL", saveAnalysis: true },
      {
        onSuccess: () => {
          void queryClient.invalidateQueries({ queryKey: ["progress-summary"] });
          notify("Тоглолт хадгалагдлаа.");
        }
      }
    );
  }

  function resetBoard() {
    const chess = new Chess();
    setFen(chess.fen());
    setPgn("");
    setDraftPgn("");
    setMoves([]);
    setSummary(undefined);
    setSelectedMove(undefined);
  }

  function openPgnModal() {
    setDraftPgn(pgn);
    setPgnModalOpen(true);
  }

  function importPgn() {
    try {
      const chess = new Chess();
      chess.loadPgn(draftPgn);
      setFen(chess.fen());
      setPgn(chess.pgn() || draftPgn.trim());
      setMoves([]);
      setSummary(undefined);
      setSelectedMove(undefined);
      setPgnModalOpen(false);
      notify("PGN орлоо.");
    } catch {
      notify("PGN формат буруу байна.", "error");
    }
  }

  async function copyPgn() {
    try {
      await navigator.clipboard.writeText(pgn);
      notify("PGN хуулагдлаа.");
    } catch {
      notify("PGN хуулах боломжгүй байна.", "error");
    }
  }

  function goToStart() {
    setFen(START_FEN);
    setSelectedMove(undefined);
  }

  function goToMove(index: number) {
    const move = moves[index];
    if (move) selectMove(move);
  }

  function goPrevious() {
    if (!moves.length) return;
    if (selectedMoveIndex <= 0) { goToStart(); return; }
    goToMove(selectedMoveIndex - 1);
  }

  function goNext() {
    if (!moves.length) return;
    const nextIndex = selectedMoveIndex < 0 ? 0 : Math.min(moves.length - 1, selectedMoveIndex + 1);
    goToMove(nextIndex);
  }

  function goToEnd() {
    if (!moves.length) return;
    goToMove(moves.length - 1);
  }

  return (
    <AppShell>
      {/* 3-column layout */}
      <div className="grid gap-3 xl:grid-cols-[minmax(22rem,34rem)_minmax(17rem,24rem)_minmax(19rem,24rem)]">

        {/* Column 1: Board */}
        <section className="grid min-w-0 content-start gap-2">
          <PlayerBar
            side="black"
            name="Хар"
            isActive={currentPosition.turn() === "b"}
            materialAdvantage={material.black}
          />
          <div className="grid min-w-0 grid-cols-[1.75rem_minmax(0,1fr)] gap-2">
            <EvalBar scoreCpWhite={activeScore} mateIn={activeMateIn} />
            <AnalysisBoard
              fen={fen}
              activeMove={selectedMove}
              orientation={boardOrientation}
              onFenChange={handleFenChange}
            />
          </div>
          <PlayerBar
            side="white"
            name="Цагаан"
            isActive={currentPosition.turn() === "w"}
            materialAdvantage={material.white}
          />

          {/* Board state bar */}
          <div className="flex min-h-10 items-center justify-between gap-3 rounded-xl border border-white/[0.07] bg-panel px-3 text-sm">
            <span className="font-semibold text-white">{boardStateLabel}</span>
            <span className="truncate text-white/35">
              {selectedMove
                ? `${selectedMove.moveNumber}. ${selectedMove.san}`
                : `${currentPosition.moves().length} боломжит нүүдэл • ← → товч`}
            </span>
          </div>
        </section>

        {/* Column 2: Game review */}
        <GameReviewPanel
          moves={moves}
          selectedMove={selectedMove}
          onSelectMove={selectMove}
          loading={analyzeGameMutation.isPending}
        />

        {/* Column 3: Coach panel + Progress */}
        <div className="flex flex-col gap-3">
          <MoveCoachPanel
            move={selectedMove}
            explanation={explainMutation.data}
            loading={explainMutation.isPending}
            analyzing={analyzeGameMutation.isPending}
            onAnalyze={analyzePgn}
          />
          {user ? (
            <ProgressPanel
              summary={progressQuery.data}
              loading={progressQuery.isLoading}
            />
          ) : null}
        </div>
      </div>

      {/* Toolbar */}
      <section
        className="mt-3 flex flex-wrap items-center gap-2 rounded-xl border border-white/[0.07] bg-panel p-2 shadow-panel"
        aria-label="Самбарын удирдлага"
      >
        <Button variant="secondary" size="sm" icon={<ChevronsLeft size={15} />} onClick={goToStart} title="Эхэнд" aria-label="Эхэнд" />
        <Button variant="secondary" size="sm" icon={<ChevronLeft size={15} />} onClick={goPrevious} disabled={!moves.length} title="Өмнөх" aria-label="Өмнөх" />
        <Button variant="secondary" size="sm" icon={<ChevronRight size={15} />} onClick={goNext} disabled={!moves.length} title="Дараах" aria-label="Дараах" />
        <Button variant="secondary" size="sm" icon={<ChevronsRight size={15} />} onClick={goToEnd} disabled={!moves.length} title="Эцэст" aria-label="Эцэст" />
        <div className="mx-1 h-5 w-px bg-white/10" />
        <Button
          variant="secondary"
          size="sm"
          icon={<RefreshCcw size={15} />}
          onClick={() => setBoardOrientation((v) => (v === "white" ? "black" : "white"))}
          title="Самбар эргүүлэх"
          aria-label="Самбар эргүүлэх"
        />
        <Button variant="secondary" size="sm" icon={<RotateCcw size={15} />} onClick={resetBoard} title="Шинэ тоглолт" aria-label="Шинэ тоглолт" />
        <Button variant="secondary" size="sm" icon={<Upload size={15} />} onClick={openPgnModal} title="PGN оруулах" aria-label="PGN оруулах" />
        <Button variant="secondary" size="sm" icon={<Clipboard size={15} />} onClick={copyPgn} disabled={!pgn.trim()} title="PGN хуулах" aria-label="PGN хуулах" />
        <Button
          variant="secondary"
          size="sm"
          icon={<Save size={15} />}
          disabled={!user || saveGameMutation.isPending || !pgn.trim()}
          loading={saveGameMutation.isPending}
          onClick={saveGame}
          title="Хадгалах"
          aria-label="Хадгалах"
        />
        <div className="ml-auto truncate px-2 text-xs text-white/30">
          {summary ? `${summary.totalMoves} нүүдэл шинжилсэн` : "Бэлэн • ← → товч"}
        </div>
      </section>

      {/* Game summary bar */}
      {summary ? <GameSummaryBar summary={summary} className="mt-3" /> : null}

      {/* PGN modal */}
      {pgnModalOpen ? (
        <PgnModal
          value={draftPgn}
          onChange={setDraftPgn}
          onClose={() => setPgnModalOpen(false)}
          onImport={importPgn}
        />
      ) : null}

      {/* Toasts */}
      <ToastViewport toasts={toasts} onDismiss={(id) => setToasts((items) => items.filter((item) => item.id !== id))} />
    </AppShell>
  );
}

// ─── PGN Modal ────────────────────────────────────────────────────────────────

function PgnModal({
  value,
  onChange,
  onClose,
  onImport
}: {
  value: string;
  onChange: (v: string) => void;
  onClose: () => void;
  onImport: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/60 p-3 backdrop-blur-sm">
      <section className="w-full max-w-2xl animate-fade-up rounded-xl border border-white/[0.07] bg-panel shadow-panel">
        <div className="flex h-12 items-center justify-between border-b border-white/[0.07] px-4">
          <h2 className="text-sm font-bold text-white">PGN оруулах</h2>
          <button
            className="grid h-7 w-7 place-items-center rounded-lg text-white/40 transition hover:bg-white/[0.08] hover:text-white"
            onClick={onClose}
            aria-label="Хаах"
          >
            <X size={15} />
          </button>
        </div>
        <div className="p-4">
          <textarea
            className="min-h-56 w-full rounded-lg border border-white/[0.1] bg-night p-3 font-mono text-sm leading-6 text-white outline-none placeholder:text-white/25 focus:border-accent focus:shadow-[0_0_0_3px_rgba(91,138,50,0.12)] transition-all"
            placeholder="1. e4 e5 2. Nf3 Nc6..."
            value={value}
            onChange={(e) => onChange(e.target.value)}
            autoFocus
          />
          <div className="mt-3 flex justify-end gap-2">
            <Button variant="secondary" onClick={onClose}>Болих</Button>
            <Button onClick={onImport}>Оруулах</Button>
          </div>
        </div>
      </section>
    </div>
  );
}

// ─── Toast Viewport ───────────────────────────────────────────────────────────

function ToastViewport({
  toasts,
  onDismiss
}: {
  toasts: ToastMessage[];
  onDismiss: (id: number) => void;
}) {
  return (
    <div className="fixed bottom-4 right-4 z-[60] grid w-[calc(100vw-2rem)] max-w-sm gap-2">
      {toasts.map((toast) => (
        <button
          key={toast.id}
          className="flex animate-fade-up items-start gap-2.5 rounded-xl border border-white/[0.1] bg-panel/95 p-3 text-left shadow-panel backdrop-blur-sm"
          onClick={() => onDismiss(toast.id)}
        >
          {toast.tone === "success" ? (
            <CheckCircle2 className="mt-0.5 shrink-0 text-accent-light" size={16} aria-hidden="true" />
          ) : (
            <AlertCircle className="mt-0.5 shrink-0 text-danger-light" size={16} aria-hidden="true" />
          )}
          <span className="text-sm leading-5 text-white/80">{toast.message}</span>
        </button>
      ))}
    </div>
  );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function safeChess(fen: string) {
  try { return new Chess(fen); } catch { return new Chess(); }
}

function getMaterialAdvantage(fen: string) {
  const values: Record<string, number> = { p: 1, n: 3, b: 3, r: 5, q: 9, k: 0 };
  const chess = safeChess(fen);
  let white = 0;
  let black = 0;
  for (const row of chess.board()) {
    for (const piece of row) {
      if (!piece) continue;
      const value = values[piece.type] ?? 0;
      if (piece.color === "w") white += value;
      else black += value;
    }
  }
  return { white: Math.max(0, white - black), black: Math.max(0, black - white) };
}

function summarizeLiveGame(moves: MoveAnalysis[]): GameSummary {
  const whiteLosses = moves.filter((m) => m.color === "white").map((m) => m.centipawnLoss);
  const blackLosses = moves.filter((m) => m.color === "black").map((m) => m.centipawnLoss);
  const criticalMistakes = moves.filter(
    (m) => m.classification === "mistake" || m.classification === "blunder"
  ).length;
  return {
    accuracyWhite: accuracyFromLosses(whiteLosses),
    accuracyBlack: accuracyFromLosses(blackLosses),
    totalMoves: moves.length,
    criticalMistakes,
    review: "Шууд тоглолтын шинжилгээ шинэчлэгдлээ. Сонгосон нүүдлийн тайлбарыг баруун самбараас харна."
  };
}
