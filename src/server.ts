import express from "express";
import { db } from "./config/database.js";
import { env } from "./config/env.js";
import { authRouter } from "./routes/auth.routes.js";
import { articleRouter } from "./routes/article.routes.js";
import {
  errorHandler,
  notFoundHandler,
} from "./middleware/error.middleware.js";

const app = express();

app.disable("x-powered-by");

app.use(express.json());
app.use("/auth", authRouter);
app.use("/articles", articleRouter);

app.get("/", (_req, res) => {
  res.json({ message: "API is running" });
});

app.use(notFoundHandler);
app.use(errorHandler);

async function startServer(): Promise<void> {
  try {
    await db.query("SELECT 1");

    console.log("Database connection established");

    app.listen(env.port, () => {
      console.log(`Server is running on http://localhost:${env.port}`);
    });
  } catch (error) {
    console.error("Unable to connect to the database:", error);
    process.exit(1);
  }
}

void startServer();
