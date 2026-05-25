import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import type { SupportedLanguage } from "@mda-chess/shared";
import { env } from "../config/env";
import { HttpError } from "../utils/http";

interface JwtPayload {
  sub: string;
  email: string;
  preferredLanguage: SupportedLanguage;
}

export function requireAuth(req: Request, _res: Response, next: NextFunction) {
  const token = readBearerToken(req);
  if (!token) {
    next(new HttpError(401, "Authentication required", "AUTH_REQUIRED"));
    return;
  }

  try {
    const payload = jwt.verify(token, env.JWT_SECRET) as JwtPayload;
    req.user = {
      id: payload.sub,
      email: payload.email,
      preferredLanguage: payload.preferredLanguage
    };
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
    const payload = jwt.verify(token, env.JWT_SECRET) as JwtPayload;
    req.user = {
      id: payload.sub,
      email: payload.email,
      preferredLanguage: payload.preferredLanguage
    };
  } catch {
    req.user = undefined;
  }

  next();
}

function readBearerToken(req: Request) {
  const header = req.header("authorization");
  if (!header?.startsWith("Bearer ")) return undefined;
  return header.slice("Bearer ".length);
}
