import type { Express, Request, Response } from "express";
import { createServer, type Server } from "node:http";
import { getClinicalTrials } from "./routes/clinicalTrials";
import { getWeather } from "./routes/weather";
import { getSciNews } from "./routes/sciNews";
import { getChatMessages, postChatMessage, reportMessage, getAdminReports, deleteAdminMessage, deleteChatMessage, editChatMessage } from "./routes/chat";
import { getProviderReviews, postProviderReview, reportProviderReview, deleteAdminProviderReview } from "./routes/providers";
import { postFeedback } from "./routes/feedback";
import { registerRoute, loginRoute, oauthRoute, meRoute, verifyToken, extractToken, signToken, createApiKey, listApiKeys, deleteApiKey, resolveApiKey } from "./routes/auth";
import { createInvite, joinWithCode, getRelationships, revokeRelationship, getMyPatients, getPatientAlerts, getCareNotes, addCareNote, markNoteRead, getPatientProfile, getOrgReport, syncRelationshipRolesForUser } from "./routes/care";
import { getInjuries, createInjury, updateInjury, deleteInjury, getChecks, addCheck } from "./routes/pressureInjuries";
import { getAuditLog } from "./routes/audit";
import { createOrg, getMyOrgs, getOrg, inviteMember, joinOrg, addOrgPatient, dischargeOrgPatient, assignStaff, removeAssignment, removeMember, getPendingAssignments, approveAssignment, declineAssignment } from "./routes/org";
import {
  getVitals, addVital, deleteVital,
  getMedications, addMedication, updateMedication, deleteMedication,
  getMedicationLogs, upsertMedicationLog,
  getAppointments, addAppointment, updateAppointment, deleteAppointment,
  getBladderLogs, addBladderLog, deleteBladderLog,
  getBowelLogs, addBowelLog, deleteBowelLog,
  getPainEntries, addPainEntry, deletePainEntry,
  getHydrationLogs, addHydrationLog, deleteHydrationLog,
  getRoutineTasks, addRoutineTask, deleteRoutineTask, getRoutineCompletions, toggleRoutineCompletion,
  getSkinCheckEntries, addSkinCheckEntry, deleteSkinCheckEntry,
  getCarePreferences, upsertCarePreferences,
  getRehabGoals, addRehabGoal, updateRehabGoal, deleteRehabGoal,
} from "./routes/health";
import { authStorage } from "./storage";
import { db } from "./db";
import { userProfiles } from "@shared/schema";
import { eq } from "drizzle-orm";

export async function registerRoutes(app: Express): Promise<Server> {
  // API key middleware — rewrite sh_ tokens to short-lived JWTs so existing requireAuth works unchanged
  app.use("/api", async (req, _res, next) => {
    const auth = req.headers.authorization;
    if (auth?.startsWith("Bearer sh_")) {
      const userId = await resolveApiKey(auth.slice(7)).catch(() => null);
      if (userId) {
        req.headers.authorization = `Bearer ${signToken({ id: userId, email: "", name: "api" })}`;
      }
    }
    next();
  });

  // Health check
  app.get("/api/health", (_req, res) => {
    res.json({ ok: true });
  });

  // Auth endpoints
  app.post("/api/auth/register", registerRoute);
  app.post("/api/auth/login", loginRoute);
  app.post("/api/auth/oauth", oauthRoute);
  app.get("/api/auth/me", meRoute);
  app.get("/api/auth/api-keys", listApiKeys);
  app.post("/api/auth/api-keys", createApiKey);
  app.delete("/api/auth/api-keys/:id", deleteApiKey);

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
  app.patch("/api/chat/message/:id", editChatMessage);
  app.delete("/api/chat/message/:id", deleteChatMessage);

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

  // Care relationships & invite system
  app.post("/api/care/invite", createInvite);
  app.post("/api/care/join", joinWithCode);
  app.get("/api/care/relationships", getRelationships);
  app.delete("/api/care/relationships/:id", revokeRelationship);
  app.get("/api/care/patients", getMyPatients);
  app.get("/api/care/patients/alerts", getPatientAlerts);
  app.get("/api/care/notes/:patientId", getCareNotes);
  app.post("/api/care/notes/:patientId", addCareNote);
  app.post("/api/care/notes/:noteId/read", markNoteRead);
  app.get("/api/care/profile/:patientId", getPatientProfile);
  app.get("/api/care/org-report", getOrgReport);

  // Health records (vitals, medications, appointments)
  app.get("/api/health/vitals", getVitals);
  app.post("/api/health/vitals", addVital);
  app.delete("/api/health/vitals/:id", deleteVital);

  app.get("/api/health/medications", getMedications);
  app.post("/api/health/medications", addMedication);
  app.put("/api/health/medications/:id", updateMedication);
  app.delete("/api/health/medications/:id", deleteMedication);

  app.get("/api/health/medication-logs", getMedicationLogs);
  app.post("/api/health/medication-logs", upsertMedicationLog);

  app.get("/api/health/appointments", getAppointments);
  app.post("/api/health/appointments", addAppointment);
  app.put("/api/health/appointments/:id", updateAppointment);
  app.delete("/api/health/appointments/:id", deleteAppointment);

  app.get("/api/health/bladder-logs", getBladderLogs);
  app.post("/api/health/bladder-logs", addBladderLog);
  app.delete("/api/health/bladder-logs/:id", deleteBladderLog);

  app.get("/api/health/bowel-logs", getBowelLogs);
  app.post("/api/health/bowel-logs", addBowelLog);
  app.delete("/api/health/bowel-logs/:id", deleteBowelLog);

  app.get("/api/health/pain-entries", getPainEntries);
  app.post("/api/health/pain-entries", addPainEntry);
  app.delete("/api/health/pain-entries/:id", deletePainEntry);

  app.get("/api/health/hydration-logs", getHydrationLogs);
  app.post("/api/health/hydration-logs", addHydrationLog);
  app.delete("/api/health/hydration-logs/:id", deleteHydrationLog);

  app.get("/api/health/routine-tasks", getRoutineTasks);
  app.post("/api/health/routine-tasks", addRoutineTask);
  app.delete("/api/health/routine-tasks/:id", deleteRoutineTask);
  app.get("/api/health/routine-completions", getRoutineCompletions);
  app.post("/api/health/routine-completions/toggle", toggleRoutineCompletion);

  app.get("/api/health/skin-check-entries", getSkinCheckEntries);
  app.post("/api/health/skin-check-entries", addSkinCheckEntry);
  app.delete("/api/health/skin-check-entries/:id", deleteSkinCheckEntry);

  app.get("/api/health/care-preferences", getCarePreferences);
  app.put("/api/health/care-preferences", upsertCarePreferences);

  app.get("/api/health/rehab-goals", getRehabGoals);
  app.post("/api/health/rehab-goals", addRehabGoal);
  app.patch("/api/health/rehab-goals/:id", updateRehabGoal);
  app.delete("/api/health/rehab-goals/:id", deleteRehabGoal);

  // Audit trail
  app.get("/api/audit/:patientId", getAuditLog);

  // Org (care company / rehab tenant)
  app.post("/api/org", createOrg);
  app.get("/api/org", getMyOrgs);
  // static routes before :orgId param to avoid conflicts
  app.get("/api/org/pending-assignments", getPendingAssignments);
  app.post("/api/org/join", joinOrg);
  app.post("/api/org/assignments/:assignmentId/approve", approveAssignment);
  app.post("/api/org/assignments/:assignmentId/decline", declineAssignment);
  app.get("/api/org/:orgId", getOrg);
  app.post("/api/org/:orgId/invite-member", inviteMember);
  app.post("/api/org/:orgId/patients", addOrgPatient);
  app.delete("/api/org/:orgId/patients/:patientId", dischargeOrgPatient);
  app.post("/api/org/:orgId/assignments", assignStaff);
  app.delete("/api/org/:orgId/assignments", removeAssignment);
  app.delete("/api/org/:orgId/members/:memberId", removeMember);

  // Pressure injury tracker
  app.get("/api/pressure-injuries", getInjuries);
  app.post("/api/pressure-injuries", createInjury);
  app.patch("/api/pressure-injuries/:id", updateInjury);
  app.delete("/api/pressure-injuries/:id", deleteInjury);
  app.get("/api/pressure-injuries/:id/checks", getChecks);
  app.post("/api/pressure-injuries/:id/checks", addCheck);

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
          aboutMe: body.aboutMe,
          routineHighlights: body.routineHighlights,
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
            aboutMe: body.aboutMe,
            routineHighlights: body.routineHighlights,
            medications: body.medications,
            allergies: body.allergies,
            medicalNotes: body.medicalNotes,
          },
        });

      // Sync care relationship roles if profile role changed
      if (body.role) {
        await syncRelationshipRolesForUser(userId, body.role).catch(() => {});
      }

      return res.status(200).json({ ok: true });
    } catch (err) {
      console.error("POST /api/profile error:", err);
      return res.status(500).json({ message: "Failed to save profile." });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
