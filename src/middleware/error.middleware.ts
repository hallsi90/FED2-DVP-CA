import type { NextFunction, Request, Response } from "express";

interface JsonSyntaxError extends SyntaxError {
  status?: number;
  body?: unknown;
}

function isJsonSyntaxError(error: unknown): error is JsonSyntaxError {
  return (
    error instanceof SyntaxError &&
    "status" in error &&
    error.status === 400 &&
    "body" in error
  );
}

export function notFoundHandler(req: Request, res: Response): void {
  res.status(404).json({
    message: `Route ${req.method} ${req.originalUrl} was not found`,
  });
}

export function errorHandler(
  error: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  if (isJsonSyntaxError(error)) {
    res.status(400).json({
      message: "Request body contains invalid JSON",
    });
    return;
  }

  console.error("Unhandled application error:", error);

  res.status(500).json({
    message: "Internal server error",
  });
}
