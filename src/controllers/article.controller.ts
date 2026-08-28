import type { Request, Response } from "express";
import {
  createArticle as createArticleInDatabase,
  findAllArticles,
} from "../services/article.service.js";

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

export async function createArticle(
  req: Request,
  res: Response,
): Promise<void> {
  const submittedBy = req.user?.id;

  if (!submittedBy) {
    res.status(401).json({
      message: "Authentication is required",
    });
    return;
  }

  const requestBody = req.body as Record<string, unknown> | undefined;

  const title =
    typeof requestBody?.title === "string" ? requestBody.title.trim() : "";

  const body =
    typeof requestBody?.body === "string" ? requestBody.body.trim() : "";

  const category =
    typeof requestBody?.category === "string"
      ? requestBody.category.trim()
      : "";

  if (!title || !body || !category) {
    res.status(400).json({
      message: "Title, body, and category are required",
    });
    return;
  }

  if (title.length > 255) {
    res.status(400).json({
      message: "Title must contain no more than 255 characters",
    });
    return;
  }

  if (category.length > 100) {
    res.status(400).json({
      message: "Category must contain no more than 100 characters",
    });
    return;
  }

  try {
    const articleId = await createArticleInDatabase({
      title,
      body,
      category,
      submittedBy,
    });

    res.status(201).json({
      message: "Article created successfully",
      article: {
        id: articleId,
        title,
        body,
        category,
        submittedBy,
      },
    });
  } catch (error) {
    console.error("Unable to create article:", error);

    res.status(500).json({
      message: "Internal server error",
    });
  }
}
