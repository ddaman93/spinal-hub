import type { Express } from "express";
import { createServer, type Server } from "node:http";
import { getClinicalTrials } from "./routes/clinicalTrials";

export async function registerRoutes(app: Express): Promise<Server> {
  // Health check (useful for debugging)
  app.get("/api/health", (_req, res) => {
    res.json({ ok: true });
  });

  // Live clinical trials
  app.get("/api/clinical-trials", getClinicalTrials);

  const httpServer = createServer(app);
  return httpServer;
}