import type { Request, Response } from "express";
import { createUser, findUserByEmail } from "../services/auth.service.js";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD_LENGTH = 8;

export async function register(req: Request, res: Response): Promise<void> {
  try {
    const body = req.body as Record<string, unknown> | undefined;
    const email = body?.email;
    const password = body?.password;

    if (typeof email !== "string" || typeof password !== "string") {
      res.status(400).json({
        message: "Email and password are required",
      });
      return;
    }

    const normalizedEmail = email.trim().toLowerCase();

    if (!EMAIL_PATTERN.test(normalizedEmail)) {
      res.status(400).json({
        message: "Email must be valid",
      });
      return;
    }

    if (password.length < MIN_PASSWORD_LENGTH) {
      res.status(400).json({
        message: `Password must contain at least ${MIN_PASSWORD_LENGTH} characters`,
      });
      return;
    }

    const existingUser = await findUserByEmail(normalizedEmail);

    if (existingUser) {
      res.status(409).json({
        message: "A user with this email already exists",
      });
      return;
    }

    const userId = await createUser(normalizedEmail, password);

    res.status(201).json({
      message: "User registered successfully",
      user: {
        id: userId,
        email: normalizedEmail,
      },
    });
  } catch (error) {
    console.error("Unable to register user:", error);

    res.status(500).json({
      message: "Internal server error",
    });
  }
}
