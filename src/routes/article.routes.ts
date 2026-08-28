import { Router } from "express";
import {
  createArticle,
  getAllArticles,
} from "../controllers/article.controller.js";
import { authenticateToken } from "../middleware/auth.middleware.js";

export const articleRouter = Router();

articleRouter.get("/", getAllArticles);
articleRouter.post("/", authenticateToken, createArticle);
