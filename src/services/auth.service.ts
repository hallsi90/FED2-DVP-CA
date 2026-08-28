import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import type { ResultSetHeader, RowDataPacket } from "mysql2";
import { db } from "../config/database.js";
import { env } from "../config/env.js";

interface UserRow extends RowDataPacket {
  id: number;
  email: string;
  password_hash: string;
}

const SALT_ROUNDS = 12;
const JWT_EXPIRES_IN = "1h";

export async function findUserByEmail(
  email: string,
): Promise<UserRow | undefined> {
  const [users] = await db.execute<UserRow[]>(
    `SELECT id, email, password_hash
     FROM users
     WHERE email = ?
     LIMIT 1`,
    [email],
  );

  return users[0];
}

export async function createUser(
  email: string,
  password: string,
): Promise<number> {
  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

  const [result] = await db.execute<ResultSetHeader>(
    `INSERT INTO users (email, password_hash)
     VALUES (?, ?)`,
    [email, passwordHash],
  );

  return result.insertId;
}

export async function authenticateUser(
  email: string,
  password: string,
): Promise<string | null> {
  const user = await findUserByEmail(email);

  if (!user) {
    return null;
  }

  const passwordIsValid = await bcrypt.compare(password, user.password_hash);

  if (!passwordIsValid) {
    return null;
  }

  return jwt.sign(
    {
      userId: user.id,
      email: user.email,
    },
    env.jwtSecret,
    {
      expiresIn: JWT_EXPIRES_IN,
    },
  );
}
