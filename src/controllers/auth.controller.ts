import type { Request, Response } from "express";
import {
  authenticateUser,
  createUser,
  findUserByEmail,
} from "../services/auth.service.js";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_EMAIL_LENGTH = 255;
const MIN_PASSWORD_LENGTH = 8;
const MAX_PASSWORD_BYTES = 72;

function isValidEmail(email: string): boolean {
  return email.length <= MAX_EMAIL_LENGTH && EMAIL_PATTERN.test(email);
}

function getPasswordValidationMessage(password: string): string | null {
  if (password.length < MIN_PASSWORD_LENGTH) {
    return `Password must contain at least ${MIN_PASSWORD_LENGTH} characters`;
  }

  if (password.trim().length === 0) {
    return "Password cannot consist only of whitespace";
  }

  if (Buffer.byteLength(password, "utf8") > MAX_PASSWORD_BYTES) {
    return `Password must contain no more than ${MAX_PASSWORD_BYTES} bytes`;
  }

  return null;
}

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

    if (!isValidEmail(normalizedEmail)) {
      res.status(400).json({
        message: `Email must be valid and contain no more than ${MAX_EMAIL_LENGTH} characters`,
      });
      return;
    }

    const passwordValidationMessage = getPasswordValidationMessage(password);

    if (passwordValidationMessage) {
      res.status(400).json({
        message: passwordValidationMessage,
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

export async function login(req: Request, res: Response): Promise<void> {
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

    if (
      !isValidEmail(normalizedEmail) ||
      getPasswordValidationMessage(password) !== null
    ) {
      res.status(400).json({
        message: "Email and password must be valid",
      });
      return;
    }

    const token = await authenticateUser(normalizedEmail, password);

    if (!token) {
      res.status(401).json({
        message: "Invalid email or password",
      });
      return;
    }

    res.status(200).json({
      message: "Login successful",
      token,
    });
  } catch (error) {
    console.error("Unable to log in:", error);

    res.status(500).json({
      message: "Internal server error",
    });
  }
}
