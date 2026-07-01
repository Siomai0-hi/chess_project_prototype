import { randomUUID } from "node:crypto";
import type { RequestHandler } from "express";

const MAX_REQUEST_ID_LENGTH = 128;

export const requestContext: RequestHandler = (req, res, next) => {
  const requestId = normalizeRequestId(req.header("x-request-id")) ?? randomUUID();

  req.id = requestId;
  res.setHeader("X-Request-Id", requestId);
  next();
};

function normalizeRequestId(value: string | undefined) {
  const trimmed = value?.trim();
  if (!trimmed) return undefined;
  return trimmed.slice(0, MAX_REQUEST_ID_LENGTH);
}
