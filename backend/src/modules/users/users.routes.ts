import { Router } from "express";
import { requireAuth } from "../../middleware/auth";
import { asyncHandler } from "../../utils/http";
import { updateMeSchema } from "./users.schemas";
import { getUserProfile, updateUserProfile } from "./users.service";

export const usersRoutes = Router();

usersRoutes.use(requireAuth);

usersRoutes.get(
  "/me",
  asyncHandler(async (req, res) => {
    res.json(await getUserProfile(req.user!.id));
  })
);

usersRoutes.patch(
  "/me",
  asyncHandler(async (req, res) => {
    const input = updateMeSchema.parse(req.body);
    res.json(await updateUserProfile(req.user!.id, input));
  })
);
