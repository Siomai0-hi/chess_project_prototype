import type { ErrorRequestHandler, Response } from "express";
import { Prisma } from "@prisma/client";
import { ZodError } from "zod";
import { HttpError } from "../utils/http";

export const errorMiddleware: ErrorRequestHandler = (error, req, res, _next) => {
  if (error instanceof ZodError) {
    sendError(res, 400, "Invalid request payload", "VALIDATION_ERROR", error.flatten(), req.id);
    return;
  }

  if (error instanceof HttpError) {
    sendError(res, error.status, error.message, error.code, error.details, req.id);
    return;
  }

  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === "P2002") {
      sendError(res, 409, "Resource already exists", "RESOURCE_CONFLICT", undefined, req.id);
      return;
    }

    if (error.code === "P2025") {
      sendError(res, 404, "Resource not found", "RESOURCE_NOT_FOUND", undefined, req.id);
      return;
    }

    if (error.code === "P2003") {
      sendError(res, 409, "Related resource constraint failed", "RELATION_CONSTRAINT_FAILED", undefined, req.id);
      return;
    }
  }

  if (isBodyParserError(error)) {
    sendError(res, error.statusCode, bodyParserMessage(error), bodyParserCode(error), undefined, req.id);
    return;
  }

  console.error("[api] unexpected error", { requestId: req.id, error });
  sendError(res, 500, "Unexpected server error", "INTERNAL_SERVER_ERROR", undefined, req.id);
};

function sendError(
  res: Response,
  status: number,
  message: string,
  code: string | undefined,
  details: unknown,
  requestId: string | undefined
) {
  res.status(status).json({
    message,
    code,
    ...(details === undefined ? {} : { details }),
    ...(requestId ? { requestId } : {})
  });
}

function isBodyParserError(
  error: unknown
): error is { statusCode: number; type?: string; expose?: boolean; message: string } {
  if (!error || typeof error !== "object") return false;
  const statusCode = "statusCode" in error ? error.statusCode : undefined;
  return typeof statusCode === "number" && statusCode >= 400 && statusCode < 500;
}

function bodyParserMessage(error: { type?: string; expose?: boolean; message: string }) {
  if (error.type === "entity.parse.failed") return "Invalid JSON body";
  return error.expose ? error.message : "Invalid request body";
}

function bodyParserCode(error: { type?: string }) {
  if (error.type === "entity.parse.failed") return "INVALID_JSON";
  if (error.type === "entity.too.large") return "PAYLOAD_TOO_LARGE";
  return "INVALID_REQUEST_BODY";
}
