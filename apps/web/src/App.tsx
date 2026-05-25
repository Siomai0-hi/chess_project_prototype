import { useMemo, useState } from "react";
import { Chess } from "chess.js";
import { motion } from "framer-motion";
import { Activity, Gauge, Save, Sparkles } from "lucide-react";
import type { GameSummary, MoveAnalysis } from "@mda-chess/shared";
import { accuracyFromLosses } from "@mda-chess/shared";
import { AppShell } from "./components/AppShell";
import { AnalysisBoard } from "./components/AnalysisBoard";
import { EvalBar } from "./components/EvalBar";
import { GameReviewPanel } from "./components/GameReviewPanel";
import { MoveCoachPanel } from "./components/MoveCoachPanel";
import { Button } from "./components/ui/Button";
import { MetricPill } from "./components/ui/MetricPill";
import { useQueryClient } from "@tanstack/react-query";
import { useAnalyzeGame, useAnalyzeMove, useExplainMove, useProgressSummary, useSaveGame } from "./api/hooks";
import { useSessionStore } from "./store/session";

const START_FEN = new Chess().fen();
const SAMPLE_PGN = "1. e4 e5 2. Nf3 Nc6 3. Bb5 a6 4. Ba4 Nf6 5. O-O Be7";

export function App() {
  const user = useSessionStore((state) => state.user);
  const [fen, setFen] = useState(START_FEN);
  const [pgn, setPgn] = useState(SAMPLE_PGN);
  const [moves, setMoves] = useState<MoveAnalysis[]>([]);
  const [summary, setSummary] = useState<GameSummary>();
  const [selectedMove, setSelectedMove] = useState<MoveAnalysis>();
  const queryClient = useQueryClient();
  const analyzeGameMutation = useAnalyzeGame();
  const analyzeMoveMutation = useAnalyzeMove();
  const explainMutation = useExplainMove();
  const saveGameMutation = useSaveGame();
  const progressQuery = useProgressSummary(Boolean(user));

  const activeScore = selectedMove?.evaluationAfter?.scoreCpWhite ?? selectedMove?.evaluationBefore?.scoreCpWhite;

  const moveStats = useMemo(() => {
    const losses = moves.map((move) => move.centipawnLoss);
    return {
      accuracy: accuracyFromLosses(losses),
      critical: moves.filter((move) => move.classification === "mistake" || move.classification === "blunder").length
    };
  }, [moves]);

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
            result.moves.find((move) => move.classification === "blunder" || move.classification === "mistake") ??
            result.moves[0];
          if (firstImportant) selectMove(firstImportant);
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
        }
      }
    );
  }

  return (
    <AppShell>
      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_24rem]">
        <div className="grid min-w-0 gap-5 xl:grid-cols-[minmax(20rem,42rem)_minmax(18rem,1fr)]">
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="min-w-0">
            <div className="flex gap-3">
              <EvalBar scoreCpWhite={activeScore} />
              <div className="min-w-0 flex-1">
                <AnalysisBoard
                  fen={fen}
                  activeMove={selectedMove}
                  onFenChange={handleFenChange}
                  onAnalyzePosition={analyzePgn}
                />
              </div>
            </div>
          </motion.div>

          <div className="grid min-w-0 gap-5">
            <section className="rounded-lg border border-white/10 bg-panel p-4 shadow-2xl">
              <div className="grid grid-cols-3 gap-2">
                <MetricPill label="Нарийвчлал" value={`${summary?.accuracyWhite ?? moveStats.accuracy}%`} icon={<Gauge size={13} />} />
                <MetricPill label="Шүүмж" value={moves.length} icon={<Activity size={13} />} />
                <MetricPill label="Ноцтой" value={summary?.criticalMistakes ?? moveStats.critical} icon={<Sparkles size={13} />} />
              </div>

              <label className="mt-4 block text-sm font-medium text-white/70">
                PGN
                <textarea
                  className="mt-2 min-h-32 w-full rounded-lg border border-white/10 bg-night p-3 text-sm leading-6 text-ink outline-none focus:border-accent"
                  value={pgn}
                  onChange={(event) => setPgn(event.target.value)}
                />
              </label>
              <div className="mt-3 flex flex-wrap gap-2">
                <Button icon={<Sparkles size={16} />} onClick={analyzePgn} disabled={analyzeGameMutation.isPending}>
                  {analyzeGameMutation.isPending ? "Шинжилж байна" : "Тоглолт шинжлэх"}
                </Button>
                <Button variant="secondary" icon={<Save size={16} />} disabled={!user || saveGameMutation.isPending} onClick={saveGame}>
                  {saveGameMutation.isPending ? "Хадгалж байна" : "Хадгалах"}
                </Button>
              </div>
              {analyzeGameMutation.error ? (
                <p className="mt-3 text-sm text-danger">{analyzeGameMutation.error.message}</p>
              ) : null}
              {saveGameMutation.error ? <p className="mt-3 text-sm text-danger">{saveGameMutation.error.message}</p> : null}
            </section>

            <MoveCoachPanel move={selectedMove} explanation={explainMutation.data} loading={explainMutation.isPending} />
          </div>
        </div>

        <aside className="grid content-start gap-5">
          <section className="rounded-lg border border-white/10 bg-panel p-4 shadow-2xl">
            <div className="grid grid-cols-2 gap-2">
              <MetricPill label="Тоглолт" value={user ? progressQuery.data?.gamesReviewed ?? 0 : "--"} />
              <MetricPill label="Дундаж" value={user ? `${progressQuery.data?.averageAccuracy ?? 0}%` : "--"} />
            </div>
            <div className="mt-3 rounded-lg border border-white/10 bg-night p-3 text-sm leading-6 text-white/70">
              {(user ? progressQuery.data?.nextTrainingFocus : ["Тактик", "Төв", "Ноён"])?.join(" · ")}
            </div>
          </section>

          <GameReviewPanel
            moves={moves}
            summary={summary}
            selectedMove={selectedMove}
            onSelectMove={selectMove}
            loading={analyzeGameMutation.isPending}
          />
        </aside>
      </div>
    </AppShell>
  );
}

function summarizeLiveGame(moves: MoveAnalysis[]): GameSummary {
  const whiteLosses = moves.filter((move) => move.color === "white").map((move) => move.centipawnLoss);
  const blackLosses = moves.filter((move) => move.color === "black").map((move) => move.centipawnLoss);
  const criticalMistakes = moves.filter((move) => move.classification === "mistake" || move.classification === "blunder").length;

  return {
    accuracyWhite: accuracyFromLosses(whiteLosses),
    accuracyBlack: accuracyFromLosses(blackLosses),
    totalMoves: moves.length,
    criticalMistakes,
    review: "Шууд тоглолтын шинжилгээ шинэчлэгдлээ. Сонгосон нүүдлийн тайлбарыг AI Coach хэсгээс харна."
  };
}
