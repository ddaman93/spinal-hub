import type { Request, Response } from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import * as jose from "jose";
import crypto from "crypto";
import { authStorage } from "../storage";
import { db } from "../db";
import { apiKeys } from "@shared/schema";
import { eq, desc } from "drizzle-orm";

const APPLE_JWKS = jose.createRemoteJWKSet(new URL("https://appleid.apple.com/auth/keys"));

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) throw new Error("JWT_SECRET environment variable is required");
const JWT_EXPIRY = "30d";

export interface JwtPayload {
  id: string;
  email: string;
  name: string;
}

export function signToken(payload: JwtPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRY });
}

export function verifyToken(token: string): JwtPayload {
  return jwt.verify(token, JWT_SECRET) as JwtPayload;
}

export function extractToken(req: Request): string | null {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith("Bearer ")) return null;
  const token = auth.slice(7);
  if (!token || token === "null" || token === "undefined") return null;
  return token;
}

export async function registerRoute(req: Request, res: Response) {
  const { name, email, password } = req.body;

  if (!name || typeof name !== "string" || !name.trim()) {
    return res.status(400).json({ message: "Name is required." });
  }
  if (!email || typeof email !== "string" || !email.includes("@")) {
    return res.status(400).json({ message: "A valid email address is required." });
  }
  if (!password || typeof password !== "string" || password.length < 8) {
    return res.status(400).json({ message: "Password must be at least 8 characters." });
  }

  const normalizedEmail = email.trim().toLowerCase();

  const existing = await authStorage.findByEmail(normalizedEmail);
  if (existing) {
    return res.status(409).json({ message: "An account with this email already exists." });
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const user = await authStorage.createAuthUser({
    name: name.trim(),
    email: normalizedEmail,
    passwordHash,
  });

  const token = signToken({ id: user.id, email: user.email, name: user.name });
  return res.status(201).json({ token, user: { id: user.id, name: user.name, email: user.email } });
}

export async function loginRoute(req: Request, res: Response) {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required." });
  }

  const normalizedEmail = (email as string).trim().toLowerCase();
  const user = await authStorage.findByEmail(normalizedEmail);

  if (!user) {
    return res.status(401).json({ message: "Invalid email or password." });
  }

  const match = await bcrypt.compare(password as string, user.passwordHash);
  if (!match) {
    return res.status(401).json({ message: "Invalid email or password." });
  }

  const token = signToken({ id: user.id, email: user.email, name: user.name });
  return res.json({ token, user: { id: user.id, name: user.name, email: user.email } });
}

export async function oauthRoute(req: Request, res: Response) {
  const { provider, accessToken, idToken, fullName } = req.body;

  if (!provider || (!accessToken && !idToken)) {
    return res.status(400).json({ message: "provider and a token are required." });
  }

  let providerEmail: string;
  let providerName: string;

  try {
    if (provider === "apple") {
      if (!accessToken) {
        return res.status(400).json({ message: "accessToken is required for Apple." });
      }
      const tokenStr = String(accessToken).trim();
      const { payload } = await jose.jwtVerify(tokenStr, APPLE_JWKS, {
        issuer: "https://appleid.apple.com",
        audience: "com.spinalhub.app",
      });
      const sub = payload.sub as string;
      // Apple only provides email on first sign-in; use a stable synthetic address as fallback
      providerEmail = (payload.email as string | undefined)?.toLowerCase() ?? `${sub}@privaterelay.appleid.com`;
      providerName = fullName ?? "Apple User";
    } else if (provider === "google") {
      // Native iOS/Android Google flows often return only an id_token. Prefer it
      // when available and verify via Google's tokeninfo endpoint. Fall back to
      // access_token + userinfo for flows that return one.
      if (idToken) {
        const infoRes = await fetch(
          `https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(idToken)}`,
        );
        if (!infoRes.ok) {
          return res.status(401).json({ message: "Invalid Google ID token." });
        }
        const info = await infoRes.json() as { email?: string; name?: string; aud?: string; iss?: string };
        if (info.iss !== "accounts.google.com" && info.iss !== "https://accounts.google.com") {
          return res.status(401).json({ message: "Invalid Google ID token issuer." });
        }
        if (!info.email) {
          return res.status(401).json({ message: "Could not retrieve email from Google." });
        }
        providerEmail = info.email.toLowerCase();
        providerName = info.name || providerEmail;
      } else {
        const infoRes = await fetch(
          `https://www.googleapis.com/oauth2/v3/userinfo`,
          { headers: { Authorization: `Bearer ${accessToken}` } },
        );
        if (!infoRes.ok) {
          return res.status(401).json({ message: "Invalid Google access token." });
        }
        const info = await infoRes.json() as { email?: string; name?: string };
        if (!info.email) {
          return res.status(401).json({ message: "Could not retrieve email from Google." });
        }
        providerEmail = info.email.toLowerCase();
        providerName = info.name || providerEmail;
      }
    } else if (provider === "facebook") {
      const infoRes = await fetch(
        `https://graph.facebook.com/me?fields=id,name,email&access_token=${accessToken}`,
      );
      if (!infoRes.ok) {
        return res.status(401).json({ message: "Invalid Facebook access token." });
      }
      const info = await infoRes.json() as { email?: string; name?: string };
      if (!info.email) {
        return res.status(401).json({ message: "Could not retrieve email from Facebook." });
      }
      providerEmail = info.email.toLowerCase();
      providerName = info.name || providerEmail;
    } else {
      return res.status(400).json({ message: "Unsupported provider." });
    }
  } catch (err) {
    console.error("[oauth] token verification failed:", err);
    return res.status(502).json({ message: "Failed to verify OAuth token with provider." });
  }

  const user = await authStorage.upsertByEmail({
    name: providerName,
    email: providerEmail,
    passwordHash: "",
  });

  const token = signToken({ id: user.id, email: user.email, name: user.name });
  return res.json({ token, user: { id: user.id, name: user.name, email: user.email } });
}

export async function meRoute(req: Request, res: Response) {
  const token = extractToken(req);
  if (!token) return res.status(401).json({ message: "Unauthorized." });

  try {
    const payload = verifyToken(token);
    const user = await authStorage.findById(payload.id);
    if (!user) return res.status(404).json({ message: "User not found." });
    return res.json({ id: user.id, name: user.name, email: user.email });
  } catch {
    return res.status(401).json({ message: "Invalid or expired token." });
  }
}

// ---------------------------------------------------------------------------
// API key management
// ---------------------------------------------------------------------------

function requireAuthFromToken(req: Request, res: Response): string | null {
  const token = extractToken(req);
  if (!token) { res.status(401).json({ message: "Unauthorized." }); return null; }
  try {
    return verifyToken(token).id;
  } catch {
    res.status(401).json({ message: "Invalid or expired token." });
    return null;
  }
}

export async function createApiKey(req: Request, res: Response) {
  const userId = requireAuthFromToken(req, res);
  if (!userId) return;
  const label = (req.body.label as string)?.trim() || "My API Key";
  const rawKey = "sh_" + crypto.randomBytes(32).toString("hex");
  const hash = crypto.createHash("sha256").update(rawKey).digest("hex");
  try {
    const [row] = await db.insert(apiKeys).values({ userId, keyHash: hash, label }).returning({
      id: apiKeys.id, label: apiKeys.label, createdAt: apiKeys.createdAt,
    });
    res.status(201).json({ ...row, key: rawKey });
  } catch (err: any) {
    res.status(500).json({ message: err?.message ?? "Failed to create key." });
  }
}

export async function listApiKeys(req: Request, res: Response) {
  const userId = requireAuthFromToken(req, res);
  if (!userId) return;
  try {
    const rows = await db.select({
      id: apiKeys.id, label: apiKeys.label,
      lastUsedAt: apiKeys.lastUsedAt, createdAt: apiKeys.createdAt,
    }).from(apiKeys).where(eq(apiKeys.userId, userId)).orderBy(desc(apiKeys.createdAt));
    res.json(rows);
  } catch (err: any) {
    res.status(500).json({ message: err?.message ?? "Failed to list keys." });
  }
}

export async function deleteApiKey(req: Request, res: Response) {
  const userId = requireAuthFromToken(req, res);
  if (!userId) return;
  try {
    const [row] = await db.select({ userId: apiKeys.userId }).from(apiKeys).where(eq(apiKeys.id, req.params.id)).limit(1);
    if (!row) return res.status(404).json({ message: "Not found." });
    if (row.userId !== userId) return res.status(403).json({ message: "Forbidden." });
    await db.delete(apiKeys).where(eq(apiKeys.id, req.params.id));
    res.json({ ok: true });
  } catch (err: any) {
    res.status(500).json({ message: err?.message ?? "Failed to delete key." });
  }
}

export async function resolveApiKey(bearerToken: string): Promise<string | null> {
  if (!bearerToken.startsWith("sh_")) return null;
  const hash = crypto.createHash("sha256").update(bearerToken).digest("hex");
  const [row] = await db.select({ id: apiKeys.id, userId: apiKeys.userId })
    .from(apiKeys).where(eq(apiKeys.keyHash, hash)).limit(1);
  if (!row) return null;
  db.update(apiKeys).set({ lastUsedAt: new Date() }).where(eq(apiKeys.id, row.id)).catch(() => {});
  return row.userId;
}
