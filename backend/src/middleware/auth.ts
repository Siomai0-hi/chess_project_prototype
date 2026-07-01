import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { z } from "zod";
import { env } from "../config/env";
import { HttpError } from "../utils/http";

const JwtPayloadSchema = z.object({
  sub: z.string().min(1),
  email: z.string().email(),
  preferredLanguage: z.enum(["mn", "en"])
});

export function requireAuth(req: Request, _res: Response, next: NextFunction) {
  const token = readBearerToken(req);
  if (!token) {
    next(new HttpError(401, "Authentication required", "AUTH_REQUIRED"));
    return;
  }

  try {
    req.user = verifyToken(token);
    next();
  } catch {
    next(new HttpError(401, "Invalid or expired token", "INVALID_TOKEN"));
  }
}

export function optionalAuth(req: Request, _res: Response, next: NextFunction) {
  const token = readBearerToken(req);
  if (!token) {
    next();
    return;
  }

  try {
    req.user = verifyToken(token);
  } catch {
    req.user = undefined;
  }

  next();
}

function verifyToken(token: string) {
  const payload = JwtPayloadSchema.parse(jwt.verify(token, env.JWT_SECRET));

  return {
    id: payload.sub,
    email: payload.email,
    preferredLanguage: payload.preferredLanguage
  };
}

function readBearerToken(req: Request) {
  const header = req.header("authorization");
  const [scheme, token] = header?.trim().split(/\s+/, 2) ?? [];
  if (scheme?.toLowerCase() !== "bearer" || !token) return undefined;
  return token;
}
