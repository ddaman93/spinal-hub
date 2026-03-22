import type { Request, Response } from "express";
import { db } from "../db";
import { chatMessages } from "@shared/schema";
import { eq, gt, desc } from "drizzle-orm";
import { verifyToken, extractToken } from "./auth";

export async function getChatMessages(req: Request, res: Response) {
  const { channel } = req.params;
  const since = req.query.since as string | undefined;

  try {
    if (since) {
      const sinceDate = new Date(since);
      const rows = await db
        .select()
        .from(chatMessages)
        .where(eq(chatMessages.channel, channel))
        .orderBy(chatMessages.createdAt);

      const filtered = rows.filter((m) => m.createdAt > sinceDate);
      return res.json(filtered.map(toClientMessage));
    }

    const rows = await db
      .select()
      .from(chatMessages)
      .where(eq(chatMessages.channel, channel))
      .orderBy(chatMessages.createdAt)
      .limit(100);

    return res.json(rows.map(toClientMessage));
  } catch (err) {
    console.error("getChatMessages error:", err);
    return res.status(500).json({ error: "Failed to fetch messages." });
  }
}

export async function postChatMessage(req: Request, res: Response) {
  const { channel } = req.params;

  // Require JWT — derive author from token, not client body
  const token = extractToken(req);
  let authorId: string | null = null;
  let authorName: string;

  if (token) {
    try {
      const payload = verifyToken(token);
      authorId = payload.id;
      authorName = payload.name;
    } catch {
      return res.status(401).json({ error: "Invalid or expired token." });
    }
  } else {
    // Fallback: accept client-supplied author for unauthenticated users
    const { author } = req.body;
    if (!author || typeof author !== "string" || author.trim().length === 0) {
      return res.status(401).json({ error: "Authentication required to post messages." });
    }
    authorName = author.trim().slice(0, 60);
  }

  const { text } = req.body;
  if (!text || typeof text !== "string" || text.trim().length === 0) {
    return res.status(400).json({ error: "text is required" });
  }
  if (text.trim().length > 1000) {
    return res.status(400).json({ error: "message too long (max 1000 chars)" });
  }

  try {
    const rows = await db
      .insert(chatMessages)
      .values({
        channel,
        authorId: authorId ?? undefined,
        authorName,
        text: text.trim(),
      })
      .returning();

    return res.status(201).json(toClientMessage(rows[0]));
  } catch (err) {
    console.error("postChatMessage error:", err);
    return res.status(500).json({ error: "Failed to save message." });
  }
}

function toClientMessage(row: typeof chatMessages.$inferSelect) {
  return {
    id: row.id,
    channel: row.channel,
    author: row.authorName,
    text: row.text,
    timestamp: row.createdAt.toISOString(),
  };
}
