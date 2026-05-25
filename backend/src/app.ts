import cors from "cors";
import express from "express";
import helmet from "helmet";
import { env } from "./config/env";
import { analysisRoutes } from "./modules/analysis/analysis.routes";
import { authRoutes } from "./modules/auth/auth.routes";
import { coachRoutes } from "./modules/coach/coach.routes";
import { gamesRoutes } from "./modules/games/games.routes";
import { progressRoutes } from "./modules/progress/progress.routes";
import { usersRoutes } from "./modules/users/users.routes";
import { errorMiddleware } from "./middleware/error";

export function createApp() {
  const app = express();

  app.use(helmet());
  app.use(
    cors({
      origin: env.CORS_ORIGIN,
      credentials: true
    })
  );
  app.use(express.json({ limit: "2mb" }));

  app.get("/health", (_req, res) => {
    res.json({ ok: true, service: "mongolian-chess-api" });
  });

  app.use("/auth", authRoutes);
  app.use("/games", gamesRoutes);
  app.use("/analysis", analysisRoutes);
  app.use("/coach", coachRoutes);
  app.use("/users", usersRoutes);
  app.use("/progress", progressRoutes);

  app.use((_req, res) => {
    res.status(404).json({ message: "Route not found", code: "NOT_FOUND" });
  });

  app.use(errorMiddleware);

  return app;
}
