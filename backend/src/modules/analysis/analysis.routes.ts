import { Router } from "express";
import { asyncHandler } from "../../utils/http";
import { analyzeGameSchema, analyzeMoveSchema } from "./analysis.schemas";
import { analyzeGame, analyzeSingleMove } from "./analysis.service";

export const analysisRoutes = Router();

analysisRoutes.post(
  "/game",
  asyncHandler(async (req, res) => {
    const result = await analyzeGame(analyzeGameSchema.parse(req.body));
    res.json(result);
  })
);

analysisRoutes.post(
  "/move",
  asyncHandler(async (req, res) => {
    const result = await analyzeSingleMove(analyzeMoveSchema.parse(req.body));
    res.json(result);
  })
);
