import type { Express } from "express";
import { createServer, type Server } from "node:http";
import { getClinicalTrials } from "./routes/clinicalTrials";

export async function registerRoutes(app: Express): Promise<Server> {
  // put application routes here
  app.get("/api/clinical-trials", getClinicalTrials);
  // prefix all routes with /api

  const httpServer = createServer(app);

  return httpServer;
}
