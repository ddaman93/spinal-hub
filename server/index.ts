import "dotenv/config";
import dns from "dns";
dns.setDefaultResultOrder("ipv4first");
import express from "express";
import type { Request, Response, NextFunction } from "express";
import rateLimit from "express-rate-limit";
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

    // DEV: allow all origins so any LAN IP or localhost can reach the server
    if (process.env.NODE_ENV !== "production") {
      res.header("Access-Control-Allow-Origin", origin || "*");
      res.header("Access-Control-Allow-Credentials", "true");
      res.header("Access-Control-Allow-Private-Network", "true");
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

  // Care invite deep-link bridge (https → spinalhub:// scheme)
  // Used in SMS/email shares because iMessage only auto-links https URLs.
  app.get("/join/:code", (req, res) => {
    const raw = String(req.params.code || "");
    const code = raw.replace(/[^A-Z0-9]/gi, "").toUpperCase().slice(0, 12);
    if (!code) return res.status(400).send("Invalid code.");
    const deepLink = `spinalhub://join/${code}`;
    const appStoreUrl = "https://apps.apple.com/app/id6753398787";
    const playStoreUrl = "https://play.google.com/store/apps/details?id=com.spinalhub.app";
    res.setHeader("Content-Type", "text/html; charset=utf-8");
    res.send(`<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>Join Spinal Hub Care Team</title>
<style>
  body { margin: 0; font-family: -apple-system, BlinkMacSystemFont, "SF Pro Text", system-ui, sans-serif; background: #0c1a0e; color: #fff; min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: 24px; }
  .card { max-width: 380px; width: 100%; background: #14241a; border: 1px solid rgba(0,230,118,0.25); border-radius: 20px; padding: 28px; text-align: center; }
  h1 { font-size: 22px; margin: 0 0 8px; font-weight: 700; }
  p { color: rgba(255,255,255,0.7); line-height: 1.5; margin: 8px 0; font-size: 15px; }
  .code { display: inline-block; background: #00e6761a; color: #00E676; padding: 10px 16px; border-radius: 10px; font-size: 22px; font-weight: 800; letter-spacing: 3px; margin: 16px 0; }
  .btn { display: block; background: #00E676; color: #000; padding: 14px; border-radius: 12px; text-decoration: none; font-weight: 700; margin-top: 14px; }
  .alt { color: rgba(255,255,255,0.5); font-size: 13px; margin-top: 18px; }
  .alt a { color: #00E676; text-decoration: none; }
</style>
</head>
<body>
  <div class="card">
    <h1>Join Care Team</h1>
    <p>You've been invited to join a Spinal Hub care network.</p>
    <div class="code">${code}</div>
    <a class="btn" href="${deepLink}">Open Spinal Hub</a>
    <p class="alt">
      Don't have the app yet?<br />
      <a href="${appStoreUrl}">App Store</a> &nbsp;·&nbsp; <a href="${playStoreUrl}">Google Play</a><br /><br />
      Then open the app and enter code <strong>${code}</strong> in Care &gt; Join.
    </p>
  </div>
</body>
</html>`);
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

  // Rate limiting — auth endpoints: 20 req/15min; general API: 300 req/min
  const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 20,
    standardHeaders: true,
    legacyHeaders: false,
    message: { message: "Too many attempts. Try again in 15 minutes." },
  });
  const apiLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 300,
    standardHeaders: true,
    legacyHeaders: false,
  });
  const joinLimiter = rateLimit({
    windowMs: 60 * 60 * 1000,
    max: 10,
    standardHeaders: true,
    legacyHeaders: false,
    message: { message: "Too many join attempts. Try again in an hour." },
  });
  const chatLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 20,
    standardHeaders: true,
    legacyHeaders: false,
    message: { message: "Too many chat requests. Slow down." },
  });
  app.use("/api/auth", authLimiter);
  app.use("/api/care/join", joinLimiter);
  app.use("/api/chat", chatLimiter);
  app.use("/api", apiLimiter);

  // 🔑 API routes MUST come first
  const server = await registerRoutes(app);

  startExpoDevServer();
  setupExpoProxy(app);
  configureExpoAndLanding(app);

  const port = parseInt(process.env.PORT || "5000", 10);
  const host = process.env.SERVER_HOST || "0.0.0.0";
  server.listen({ port, host }, () => {
    log(`express server serving on port ${port}`);
  });
})();