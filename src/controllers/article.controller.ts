import type { Request, Response } from "express";
import { findAllArticles } from "../services/article.service.js";

export async function getAllArticles(
  _req: Request,
  res: Response,
): Promise<void> {
  try {
    const articles = await findAllArticles();

    res.status(200).json({
      articles,
    });
  } catch (error) {
    console.error("Unable to retrieve articles:", error);

    res.status(500).json({
      message: "Internal server error",
    });
  }
}
