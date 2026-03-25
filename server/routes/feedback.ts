import type { Request, Response } from "express";
import { db } from "../db";
import { feedback } from "@shared/schema";
import { extractToken, verifyToken } from "./auth";

export async function postFeedback(req: Request, res: Response) {
  const { category, message } = req.body;

  if (!message || typeof message !== "string" || message.trim().length === 0) {
    return res.status(400).json({ error: "message is required" });
  }
  if (message.trim().length > 2000) {
    return res.status(400).json({ error: "message too long (max 2000 chars)" });
  }

  const validCategories = ["feature", "bug", "general"];
  const cat = validCategories.includes(category) ? category : "general";

  let authorId: string | null = null;
  const token = extractToken(req);
  if (token) {
    try {
      const payload = verifyToken(token);
      authorId = payload.id;
    } catch {
      // anonymous is fine
    }
  }

  try {
    await db.insert(feedback).values({
      category: cat,
      message: message.trim(),
      authorId: authorId ?? undefined,
    });
    return res.status(201).json({ ok: true });
  } catch (err) {
    console.error("postFeedback error:", err);
    return res.status(500).json({ error: "Failed to save feedback." });
  }
}
