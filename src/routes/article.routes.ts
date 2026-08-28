import { Router } from "express";
import { getAllArticles } from "../controllers/article.controller.js";

export const articleRouter = Router();

articleRouter.get("/", getAllArticles);
