import { Router } from "express";
import { requireAuth } from "../../middleware/auth";
import { asyncHandler, HttpError } from "../../utils/http";
import { createGameSchema } from "./games.schemas";
import { createGame, getGame, listGames } from "./games.service";

export const gamesRoutes = Router();

gamesRoutes.use(requireAuth);

gamesRoutes.get(
  "/",
  asyncHandler(async (req, res) => {
    const games = await listGames(req.user!.id);
    res.json(games);
  })
);

gamesRoutes.post(
  "/",
  asyncHandler(async (req, res) => {
    const input = createGameSchema.parse(req.body);
    const game = await createGame({
      userId: req.user!.id,
      ...input
    });
    res.status(201).json(game);
  })
);

gamesRoutes.get(
  "/:id",
  asyncHandler(async (req, res) => {
    if (!req.params.id) throw new HttpError(400, "Game id is required", "GAME_ID_REQUIRED");
    const game = await getGame(req.user!.id, req.params.id);
    res.json(game);
  })
);
