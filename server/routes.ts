import type { Express, Request, Response } from "express";
import { createServer, type Server } from "node:http";
import { getClinicalTrials } from "./routes/clinicalTrials";
import { getWeather } from "./routes/weather";
import { getSciNews } from "./routes/sciNews";
import { getChatMessages, postChatMessage, reportMessage, getAdminReports, deleteAdminMessage } from "./routes/chat";
import { getProviderReviews, postProviderReview, reportProviderReview, deleteAdminProviderReview } from "./routes/providers";
import { postFeedback } from "./routes/feedback";
import { registerRoute, loginRoute, oauthRoute, meRoute, verifyToken, extractToken } from "./routes/auth";
import { authStorage } from "./storage";
import { db } from "./db";
import { userProfiles } from "@shared/schema";
import { eq } from "drizzle-orm";

export async function registerRoutes(app: Express): Promise<Server> {
  // Health check
  app.get("/api/health", (_req, res) => {
    res.json({ ok: true });
  });

  // Auth endpoints
  app.post("/api/auth/register", registerRoute);
  app.post("/api/auth/login", loginRoute);
  app.post("/api/auth/oauth", oauthRoute);
  app.get("/api/auth/me", meRoute);

  // Delete account (Apple-required)
  app.delete("/api/auth/account", async (req: Request, res: Response) => {
    const token = extractToken(req);
    if (!token) return res.status(401).json({ message: "Unauthorized." });

    let userId: string;
    try {
      userId = verifyToken(token).id;
    } catch {
      return res.status(401).json({ message: "Invalid or expired token." });
    }

    try {
      // Delete profile data first, then the auth user
      await db.delete(userProfiles).where(eq(userProfiles.userId, userId));
      await authStorage.deleteById(userId);
      return res.json({ ok: true });
    } catch (err) {
      console.error("DELETE /api/auth/account error:", err);
      return res.status(500).json({ message: "Failed to delete account." });
    }
  });

  // Live clinical trials
  app.get("/api/clinical-trials", getClinicalTrials);

  // Weather endpoint
  app.get("/api/weather", getWeather);

  // SCI News endpoint
  app.get("/api/sci-news", getSciNews);

  // Community chat (report must be registered before /:channel to avoid route conflict)
  app.post("/api/chat/report", reportMessage);
  app.get("/api/chat/:channel", getChatMessages);
  app.post("/api/chat/:channel", postChatMessage);

  // Admin moderation (protected by ADMIN_SECRET header)
  app.get("/api/admin/reports", getAdminReports);
  app.delete("/api/admin/messages/:id", deleteAdminMessage);
  app.delete("/api/admin/provider-reviews/:id", deleteAdminProviderReview);

  // Provider reviews (report must come before /:providerId)
  app.post("/api/provider-reviews/report", reportProviderReview);
  app.get("/api/provider-reviews/:providerId", getProviderReviews);
  app.post("/api/provider-reviews/:providerId", postProviderReview);

  // Feedback
  app.post("/api/feedback", postFeedback);

  // User profiles (JWT-protected)
  app.get("/api/profile", async (req: Request, res: Response) => {
    const token = extractToken(req);
    if (!token) return res.status(401).json({ message: "Unauthorized." });

    let userId: string;
    try {
      userId = verifyToken(token).id;
    } catch {
      return res.status(401).json({ message: "Invalid or expired token." });
    }

    try {
      const rows = await db
        .select()
        .from(userProfiles)
        .where(eq(userProfiles.userId, userId))
        .limit(1);

      if (rows.length === 0) return res.status(404).json({ message: "Profile not found." });
      return res.json(rows[0]);
    } catch (err) {
      console.error("GET /api/profile error:", err);
      return res.status(500).json({ message: "Failed to fetch profile." });
    }
  });

  app.post("/api/profile", async (req: Request, res: Response) => {
    const token = extractToken(req);
    if (!token) return res.status(401).json({ message: "Unauthorized." });

    let userId: string;
    try {
      userId = verifyToken(token).id;
    } catch {
      return res.status(401).json({ message: "Invalid or expired token." });
    }

    const body = req.body as Record<string, string | undefined>;

    try {
      await db
        .insert(userProfiles)
        .values({
          userId,
          role: body.role,
          phone: body.phone,
          location: body.location,
          injuryLevel: body.injuryLevel,
          injuryType: body.injuryType,
          injuryDate: body.injuryDate,
          rehabCentre: body.rehabCentre,
          wheelchairType: body.wheelchairType,
          wheelchairModel: body.wheelchairModel,
          assistiveTech: body.assistiveTech,
          emergencyContactName: body.emergencyContactName ?? body.emergencyContact,
          emergencyContactPhone: body.emergencyContactPhone,
          careCompanies: body.careCompanies,
          caregiverNotes: body.caregiverNotes ?? body.careNotes,
          medications: body.medications,
          allergies: body.allergies,
          medicalNotes: body.medicalNotes,
        })
        .onConflictDoUpdate({
          target: userProfiles.userId,
          set: {
            role: body.role,
            phone: body.phone,
            location: body.location,
            injuryLevel: body.injuryLevel,
            injuryType: body.injuryType,
            injuryDate: body.injuryDate,
            rehabCentre: body.rehabCentre,
            wheelchairType: body.wheelchairType,
            wheelchairModel: body.wheelchairModel,
            assistiveTech: body.assistiveTech,
            emergencyContactName: body.emergencyContactName ?? body.emergencyContact,
            emergencyContactPhone: body.emergencyContactPhone,
            careCompanies: body.careCompanies,
            caregiverNotes: body.caregiverNotes ?? body.careNotes,
            medications: body.medications,
            allergies: body.allergies,
            medicalNotes: body.medicalNotes,
          },
        });

      return res.status(200).json({ ok: true });
    } catch (err) {
      console.error("POST /api/profile error:", err);
      return res.status(500).json({ message: "Failed to save profile." });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
