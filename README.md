# Mongolian Chess Analysis Platform

AI-native chess learning platform focused on Mongolian coaching, Stockfish-ready analysis, mistake detection, and progress tracking.

## 1. Project Architecture

Reasoning: the MVP is web-first, but the chess, API, UI, and domain contracts live in packages so Expo can reuse them later.

```txt
apps/
  web/                 Vite React prototype
  mobile/              Expo-ready placeholder shell
backend/               Express API, Prisma, AI, engine orchestration
packages/
  shared/              Types, scoring thresholds, language helpers
  chess-engine/        chess.js validation + Stockfish adapter interface
  api-client/          Typed REST client shared by web/mobile
  ui/                  Reusable UI primitives
```

## 2. Folder Structure

Reasoning: each business area is isolated into modules, while cross-cutting services stay reusable.

```txt
backend/src/
  ai/                  OpenAI coach prompt + response parsing
  stockfish/           Server engine adapter factory
  modules/
    auth/
    games/
    analysis/
    coach/
    users/
    progress/
  middleware/
  services/
```

## 3. Backend Setup

Reasoning: Express keeps the MVP fast, Prisma gives a stable PostgreSQL model, and service modules avoid monolithic route files.

```bash
cp .env.example .env
npm install
npm run prisma:generate
npm run dev:api
```

## 4. Frontend Setup

Reasoning: Vite gives the fastest web prototype, with state and data fetching choices that map cleanly to Expo later.

```bash
npm run dev:web
```

The web app includes login/register UI, board interaction, PGN review, evaluation bar, analysis panel, and Mongolian coaching output.

## 5. Chess Engine Integration

Reasoning: `packages/chess-engine` validates moves with `chess.js`, classifies mistakes with centipawn loss, and exposes an adapter interface for Stockfish.js now or server Stockfish later.

Implemented adapters:

- `HeuristicEngineAdapter`: deterministic MVP fallback for local development.
- `StockfishWorkerAdapter`: browser Stockfish.js/UCI worker client.
- `createServerEngine`: backend adapter factory, currently falling back safely until native engine hosting is added.

## 6. AI Coach System

Reasoning: the coach is prompt-engineered around beginner-friendly Mongolian explanations with English fallback.

API:

```http
POST /coach/explain
```

Returns:

- short explanation
- long explanation
- tactical reason
- positional reason
- better move
- training tip

## 7. Database Schema

Reasoning: the schema supports MVP reviews now and future training, puzzle, import, personalized coach, and voice features later.

Models include:

- `User`
- `RefreshSession`
- `Game`
- `Move`
- `Analysis`
- `Mistake`
- `ProgressSnapshot`
- `Puzzle`
- `PuzzleAttempt`
- `TrainingRecommendation`

## 8. API Routes

Reasoning: REST endpoints are resource-based and mobile-friendly.

```txt
/auth/register
/auth/login
/auth/me
/games
/games/:id
/analysis/game
/analysis/move
/coach/explain
/users/me
/progress/summary
```

## 9. Reusable UI Components

Reasoning: reusable primitives live in `packages/ui`; app-specific composed views live in `apps/web/src/components`.

Core web components:

- `AppShell`
- `AuthPanel`
- `AnalysisBoard`
- `EvalBar`
- `GameReviewPanel`
- `MoveCoachPanel`

## 10. MVP Roadmap

1. Run local PostgreSQL and apply Prisma migrations.
2. Replace heuristic adapter with bundled Stockfish worker for browser analysis.
3. Add persistent game import and review history.
4. Add accuracy trend charts and mistake repetition training.
5. Convert `apps/mobile` shell into Expo screens using the same API client and shared types.
6. Add TTS, OCR recognition, imports, puzzles, and cloud engine workers as separate modules.

## Environment

The default OpenAI model can be changed with `OPENAI_MODEL`. If `OPENAI_API_KEY` is missing, the coach returns a deterministic Mongolian fallback so the MVP remains usable.
