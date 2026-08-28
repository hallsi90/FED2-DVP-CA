import "dotenv/config";

function getRequiredEnv(name: string): string {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

function getNumberEnv(name: string, fallback: number): number {
  const value = process.env[name];

  if (!value) {
    return fallback;
  }

  const numberValue = Number(value);

  if (!Number.isInteger(numberValue)) {
    throw new Error(`${name} must be a valid integer`);
  }

  return numberValue;
}

export const env = {
  port: getNumberEnv("PORT", 3000),
  dbHost: getRequiredEnv("DB_HOST"),
  dbPort: getNumberEnv("DB_PORT", 3306),
  dbUser: getRequiredEnv("DB_USER"),
  dbPassword: getRequiredEnv("DB_PASSWORD"),
  dbName: getRequiredEnv("DB_NAME"),
  jwtSecret: getRequiredEnv("JWT_SECRET"),
};
