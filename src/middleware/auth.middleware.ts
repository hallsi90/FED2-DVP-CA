import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { env } from "../config/env.js";

export function authenticateToken(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  const authorizationHeader = req.headers.authorization;

  if (!authorizationHeader) {
    res.status(401).json({
      message: "Authentication token is required",
    });
    return;
  }

  const [scheme, token] = authorizationHeader.split(" ");

  if (scheme !== "Bearer" || !token) {
    res.status(401).json({
      message: "Authentication token must use the Bearer scheme",
    });
    return;
  }

  try {
    const payload = jwt.verify(token, env.jwtSecret);

    if (
      typeof payload === "string" ||
      typeof payload.userId !== "number" ||
      typeof payload.email !== "string"
    ) {
      res.status(401).json({
        message: "Invalid authentication token",
      });
      return;
    }

    req.user = {
      id: payload.userId,
      email: payload.email,
    };

    next();
  } catch {
    res.status(401).json({
      message: "Invalid or expired authentication token",
    });
  }
}
