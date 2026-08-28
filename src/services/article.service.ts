import type { ResultSetHeader, RowDataPacket } from "mysql2";
import { db } from "../config/database.js";

export interface ArticleRow extends RowDataPacket {
  id: number;
  title: string;
  body: string;
  category: string;
  submittedBy: number;
  createdAt: Date;
}

export async function findAllArticles(): Promise<ArticleRow[]> {
  const [articles] = await db.execute<ArticleRow[]>(
    `SELECT
       id,
       title,
       body,
       category,
       submitted_by AS submittedBy,
       created_at AS createdAt
     FROM articles
     ORDER BY created_at DESC, id DESC`,
  );

  return articles;
}

export interface NewArticle {
  title: string;
  body: string;
  category: string;
  submittedBy: number;
}

export async function createArticle(article: NewArticle): Promise<number> {
  const [result] = await db.execute<ResultSetHeader>(
    `INSERT INTO articles (
       title,
       body,
       category,
       submitted_by
     )
     VALUES (?, ?, ?, ?)`,
    [article.title, article.body, article.category, article.submittedBy],
  );

  return result.insertId;
}
