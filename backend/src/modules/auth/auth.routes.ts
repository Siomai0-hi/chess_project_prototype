import { Router } from "express";
import { requireAuth } from "../../middleware/auth";
import { asyncHandler } from "../../utils/http";
import { getCurrentUser, loginUser, registerUser } from "./auth.service";
import { loginSchema, registerSchema } from "./auth.schemas";

export const authRoutes = Router();

authRoutes.post(
  "/register",
  asyncHandler(async (req, res) => {
    const result = await registerUser(registerSchema.parse(req.body));
    res.status(201).json(result);
  })
);

authRoutes.post(
  "/login",
  asyncHandler(async (req, res) => {
    const result = await loginUser(loginSchema.parse(req.body));
    res.json(result);
  })
);

authRoutes.get(
  "/me",
  requireAuth,
  asyncHandler(async (req, res) => {
    const user = await getCurrentUser(req.user!.id);
    res.json(user);
  })
);
