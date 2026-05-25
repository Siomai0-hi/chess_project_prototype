import { Router } from "express";
import { asyncHandler } from "../../utils/http";
import { explainMoveSchema } from "./coach.schemas";
import { explainMove } from "./coach.service";

export const coachRoutes = Router();

coachRoutes.post(
  "/explain",
  asyncHandler(async (req, res) => {
    const result = await explainMove(explainMoveSchema.parse(req.body));
    res.json(result);
  })
);
