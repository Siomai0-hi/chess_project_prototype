import type { ErrorRequestHandler } from "express";
import { ZodError } from "zod";
import { HttpError } from "../utils/http";

export const errorMiddleware: ErrorRequestHandler = (error, _req, res, _next) => {
  if (error instanceof ZodError) {
    res.status(400).json({
      message: "Invalid request payload",
      code: "VALIDATION_ERROR",
      details: error.flatten()
    });
    return;
  }

  if (error instanceof HttpError) {
    res.status(error.status).json({
      message: error.message,
      code: error.code,
      details: error.details
    });
    return;
  }

  res.status(500).json({
    message: "Unexpected server error",
    code: "INTERNAL_SERVER_ERROR"
  });
};
