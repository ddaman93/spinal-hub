import "dotenv/config";
import dns from "dns";
dns.setDefaultResultOrder("ipv4first");
import express from "express";
import type { Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import * as fs from "fs";
import * as path from "path";
import { createProxyMiddleware } from "http-proxy-middleware";

const app = express();
const log = console.log;

declare module "http" {
  interface IncomingMessage {
    rawBody: unknown;
  }
}

/* -------------------- middleware -------------------- */

function setupCors(app: express.Application) {
  app.use((req, res, next) => {
    const origin = req.header("origin");

    // DEV: allow Expo web dev server origins
    if (process.env.NODE_ENV !== "production") {
      const allowedOrigins = new Set<string>([
        "http://localhost:8081",
        "http://127.0.0.1:8081",
      ]);

      // If there is an Origin header and it's allowed, echo it back.
      // (Required when using credentials.)
      if (origin && allowedOrigins.has(origin)) {
        res.header("Access-Control-Allow-Origin", origin);
        res.header("Access-Control-Allow-Credentials", "true");
      }

      // If there's no Origin header (e.g. curl), we don't need CORS headers.
      // If it's a different Origin, we intentionally do NOT set ACAO.

      res.header("Vary", "Origin");
      res.header(
        "Access-Control-Allow-Methods",
        "GET, POST, PUT, DELETE, OPTIONS",
      );
      res.header(
        "Access-Control-Allow-Headers",
        "Content-Type, Authorization",
      );
    } else {
      // PROD: allow configured domains
      const origins = new Set<string>();

      // Custom production domain (e.g. https://api.spinalhub.app)
      if (process.env.PRODUCTION_DOMAIN) {
        origins.add(process.env.PRODUCTION_DOMAIN);
      }

      if (process.env.REPLIT_DEV_DOMAIN) {
        origins.add(`https://${process.env.REPLIT_DEV_DOMAIN}`);
      }

      if (process.env.REPLIT_DOMAINS) {
        process.env.REPLIT_DOMAINS.split(",").forEach((d) => {
          origins.add(`https://${d.trim()}`);
        });
      }

      if (origin && origins.has(origin)) {
        res.header("Access-Control-Allow-Origin", origin);
        res.header(
          "Access-Control-Allow-Methods",
          "GET, POST, PUT, DELETE, OPTIONS",
        );
        res.header(
          "Access-Control-Allow-Headers",
          "Content-Type, Authorization",
        );
        res.header("Access-Control-Allow-Credentials", "true");
        res.header("Vary", "Origin");
      }
    }

    if (req.method === "OPTIONS") {
      return res.sendStatus(200);
    }

    next();
  });
}

function setupBodyParsing(app: express.Application) {
  app.use(
    express.json({
      verify: (req, _res, buf) => {
        (req as any).rawBody = buf;
      },
    }),
  );

  app.use(express.urlencoded({ extended: false }));
}

function setupRequestLogging(app: express.Application) {
  app.use((req, res, next) => {
    const start = Date.now();
    const reqPath = req.path;
    let capturedJsonResponse: Record<string, unknown> | undefined;

    const originalResJson = res.json.bind(res);
    res.json = function (bodyJson: any, ...args: any[]) {
      capturedJsonResponse = bodyJson;
      return originalResJson(bodyJson, ...args);
    };

    res.on("finish", () => {
      if (!reqPath.startsWith("/api")) return;

      const duration = Date.now() - start;
      let logLine = `${req.method} ${reqPath} ${res.statusCode} in ${duration}ms`;

      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) logLine = logLine.slice(0, 79) + "…";
      log(logLine);
    });

    next();
  });
}

/* -------------------- expo helpers -------------------- */

function getAppName(): string {
  try {
    const appJsonPath = path.resolve(process.cwd(), "app.json");
    const appJson = JSON.parse(fs.readFileSync(appJsonPath, "utf-8"));
    return appJson.expo?.name || "App Landing Page";
  } catch {
    return "App Landing Page";
  }
}

function serveLandingPage({
  req,
  res,
  landingPageTemplate,
  appName,
}: {
  req: Request;
  res: Response;
  landingPageTemplate: string;
  appName: string;
}) {
  const protocol = req.header("x-forwarded-proto") || req.protocol || "https";
  const host = req.header("x-forwarded-host") || req.get("host");
  const baseUrl = `${protocol}://${host}`;
  const expsUrl = `${host}`;
  const webUrl = `${protocol}://${host}/expo-web`;

  const html = landingPageTemplate
    .replace(/BASE_URL_PLACEHOLDER/g, baseUrl)
    .replace(/EXPS_URL_PLACEHOLDER/g, expsUrl)
    .replace(/WEB_URL_PLACEHOLDER/g, webUrl)
    .replace(/APP_NAME_PLACEHOLDER/g, appName);

  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.status(200).send(html);
}

function configureExpoAndLanding(app: express.Application) {
  const templatePath = path.resolve(
    process.cwd(),
    "server",
    "templates",
    "landing-page.html",
  );
  const landingPageTemplate = fs.readFileSync(templatePath, "utf-8");
  const appName = getAppName();

  // Landing page
  app.get("/", (req, res) => {
    return serveLandingPage({
      req,
      res,
      landingPageTemplate,
      appName,
    });
  });

  // Static assets ONLY for non-API
  app.use("/assets", express.static(path.resolve(process.cwd(), "assets")));
  app.use("/", express.static(path.resolve(process.cwd(), "static-build")));
}

/* -------------------- dev tooling -------------------- */

function startExpoDevServer() {
  if (process.env.NODE_ENV === "development") {
    log("Note: Expo dev server should be running separately on port 8081");
    log("Start it with: npm run expo:dev");
  }
}

function setupExpoProxy(app: express.Application) {
  if (process.env.NODE_ENV === "development") {
    const expoProxy = createProxyMiddleware({
      target: "http://localhost:8081",
      changeOrigin: true,
      ws: true,
    });

    // Proxy /expo-web route
    app.use("/expo-web", (req, res, next) => {
      req.url = req.url.replace(/^\/expo-web/, "") || "/";
      expoProxy(req, res, next);
    });

    // Proxy all other non-API requests to Expo (must come after API routes)
    app.use((req, res, next) => {
      // Skip API routes - they're handled by Express
      if (req.path.startsWith("/api")) {
        return next();
      }
      // Proxy everything else to Expo dev server
      expoProxy(req, res, next);
    });
  }
}

/* -------------------- bootstrap -------------------- */

(async () => {
  setupCors(app);
  setupBodyParsing(app);
  setupRequestLogging(app);

  // 🔑 API routes MUST come first
  const server = await registerRoutes(app);

  startExpoDevServer();
  setupExpoProxy(app);
  configureExpoAndLanding(app);

  const port = parseInt(process.env.PORT || "5000", 10);
  const host = process.env.SERVER_HOST || (process.env.NODE_ENV === "production" ? "0.0.0.0" : "localhost");
  server.listen({ port, host }, () => {
    log(`express server serving on port ${port}`);
  });
})();