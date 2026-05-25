import { Router } from "express";
import { requireAuth } from "../../middleware/auth";
import { asyncHandler } from "../../utils/http";
import { getProgressSummary } from "./progress.service";

export const progressRoutes = Router();

progressRoutes.use(requireAuth);

progressRoutes.get(
  "/summary",
  asyncHandler(async (req, res) => {
    res.json(await getProgressSummary(req.user!.id));
  })
);
