import { db } from "./db";
import { users } from "@shared/schema";
import { eq } from "drizzle-orm";

// ---------------------------------------------------------------------------
// Auth user storage — backed by PostgreSQL via Drizzle
// ---------------------------------------------------------------------------

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
}

export interface IAuthStorage {
  findByEmail(email: string): Promise<AuthUser | undefined>;
  findById(id: string): Promise<AuthUser | undefined>;
  createAuthUser(user: Omit<AuthUser, "id">): Promise<AuthUser>;
  upsertByEmail(user: Omit<AuthUser, "id">): Promise<AuthUser>;
  deleteById(id: string): Promise<void>;
}

function rowToAuthUser(row: typeof users.$inferSelect): AuthUser {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    passwordHash: row.passwordHash,
  };
}

class AuthDbStorage implements IAuthStorage {
  async findByEmail(email: string): Promise<AuthUser | undefined> {
    const rows = await db.select().from(users).where(eq(users.email, email)).limit(1);
    return rows[0] ? rowToAuthUser(rows[0]) : undefined;
  }

  async findById(id: string): Promise<AuthUser | undefined> {
    const rows = await db.select().from(users).where(eq(users.id, id)).limit(1);
    return rows[0] ? rowToAuthUser(rows[0]) : undefined;
  }

  async createAuthUser(user: Omit<AuthUser, "id">): Promise<AuthUser> {
    const rows = await db
      .insert(users)
      .values({ name: user.name, email: user.email, passwordHash: user.passwordHash })
      .returning();
    return rowToAuthUser(rows[0]);
  }

  async upsertByEmail(user: Omit<AuthUser, "id">): Promise<AuthUser> {
    const existing = await this.findByEmail(user.email);
    if (existing) return existing;
    return this.createAuthUser(user);
  }

  async deleteById(id: string): Promise<void> {
    await db.delete(users).where(eq(users.id, id));
  }
}

export const authStorage: IAuthStorage = new AuthDbStorage();
