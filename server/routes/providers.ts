import type { Request, Response } from "express";
import { db } from "../db";
import { sciProviderReviews, messageReports } from "@shared/schema";
import { eq, desc } from "drizzle-orm";
import { verifyToken, extractToken } from "./auth";

export async function getProviderReviews(req: Request, res: Response) {
  const { providerId } = req.params;
  try {
    const rows = await db
      .select()
      .from(sciProviderReviews)
      .where(eq(sciProviderReviews.providerId, providerId))
      .orderBy(desc(sciProviderReviews.createdAt))
      .limit(100);

    return res.json(rows.map(toClientReview));
  } catch (err) {
    console.error("getProviderReviews error:", err);
    return res.status(500).json({ error: "Failed to fetch reviews." });
  }
}

export async function postProviderReview(req: Request, res: Response) {
  const { providerId } = req.params;

  const token = extractToken(req);
  let authorId: string | null = null;
  let authorName = "Anonymous";

  if (token) {
    try {
      const payload = verifyToken(token);
      authorId = payload.id;
      authorName = payload.name;
    } catch {
      return res.status(401).json({ error: "Invalid or expired token." });
    }
  }

  const { rating, comment } = req.body;

  if (!rating || typeof rating !== "number" || rating < 1 || rating > 5) {
    return res.status(400).json({ error: "rating must be a number between 1 and 5." });
  }
  if (comment && typeof comment === "string" && comment.length > 1000) {
    return res.status(400).json({ error: "comment too long (max 1000 chars)." });
  }

  try {
    const rows = await db
      .insert(sciProviderReviews)
      .values({
        providerId,
        authorId: authorId ?? undefined,
        authorName,
        rating,
        comment: typeof comment === "string" ? comment.trim() : "",
      })
      .returning();

    return res.status(201).json(toClientReview(rows[0]));
  } catch (err) {
    console.error("postProviderReview error:", err);
    return res.status(500).json({ error: "Failed to save review." });
  }
}

export async function reportProviderReview(req: Request, res: Response) {
  const token = extractToken(req);
  let reporterId: string | null = null;
  let reporterName: string | null = null;

  if (token) {
    try {
      const payload = verifyToken(token);
      reporterId = payload.id;
      reporterName = payload.name;
    } catch {
      return res.status(401).json({ error: "Invalid or expired token." });
    }
  }

  const { reviewId, reportedAuthor, reviewText } = req.body;
  if (!reviewId || !reportedAuthor) {
    return res.status(400).json({ error: "reviewId and reportedAuthor are required." });
  }

  try {
    await db.insert(messageReports).values({
      messageId: reviewId,
      channel: "provider-review",
      reportedAuthor,
      messageText: typeof reviewText === "string" ? reviewText.slice(0, 1000) : "",
      reporterId: reporterId ?? undefined,
      reporterName: reporterName ?? undefined,
    });

    console.warn(
      `[REVIEW REPORT] reviewId=${reviewId} author="${reportedAuthor}" reporter="${reporterName ?? "anonymous"}"\nreview: ${reviewText}`
    );

    return res.status(201).json({ ok: true });
  } catch (err) {
    console.error("reportProviderReview error:", err);
    return res.status(500).json({ error: "Failed to submit report." });
  }
}

export async function deleteAdminProviderReview(req: Request, res: Response) {
  const secret = req.headers["x-admin-secret"];
  if (!process.env.ADMIN_SECRET || secret !== process.env.ADMIN_SECRET) {
    return res.status(403).json({ error: "Forbidden." });
  }

  const { id } = req.params;
  try {
    await db.delete(sciProviderReviews).where(eq(sciProviderReviews.id, id));
    await db
      .update(messageReports)
      .set({ resolved: "removed" })
      .where(eq(messageReports.messageId, id))
      .catch(() => {});

    return res.json({ ok: true });
  } catch (err) {
    console.error("deleteAdminProviderReview error:", err);
    return res.status(500).json({ error: "Failed to delete review." });
  }
}

function toClientReview(row: typeof sciProviderReviews.$inferSelect) {
  return {
    id: row.id,
    authorName: row.authorName,
    rating: row.rating,
    comment: row.comment,
    date: row.createdAt.toISOString(),
  };
}
