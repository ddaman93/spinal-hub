import type { Express } from "express";
import { createServer, type Server } from "node:http";
import { getClinicalTrials } from "./routes/clinicalTrials";
import { getWeather } from "./routes/weather";
import { getSciNews } from "./routes/sciNews";

export async function registerRoutes(app: Express): Promise<Server> {
  // Health check (useful for debugging)
  app.get("/api/health", (_req, res) => {
    res.json({ ok: true });
  });

  // Live clinical trials
  app.get("/api/clinical-trials", getClinicalTrials);

  // Weather endpoint
  app.get("/api/weather", getWeather);

  // SCI News endpoint
  app.get("/api/sci-news", getSciNews);

  const httpServer = createServer(app);
  return httpServer;
}