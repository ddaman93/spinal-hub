import type { Request, Response } from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { authStorage } from "../storage";

const JWT_SECRET = process.env.JWT_SECRET || "dev-secret-change-in-production";
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
  return auth.slice(7);
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
  const { provider, accessToken } = req.body;

  if (!provider || !accessToken) {
    return res.status(400).json({ message: "provider and accessToken are required." });
  }

  let providerEmail: string;
  let providerName: string;

  try {
    if (provider === "google") {
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
  } catch {
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
