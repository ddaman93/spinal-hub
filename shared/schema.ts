import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// ---------------------------------------------------------------------------
// users
// ---------------------------------------------------------------------------

export const users = pgTable("users", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull().default(""),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// ---------------------------------------------------------------------------
// user_profiles
// ---------------------------------------------------------------------------

export const userProfiles = pgTable("user_profiles", {
  userId: varchar("user_id")
    .primaryKey()
    .references(() => users.id, { onDelete: "cascade" }),
  role: text("role"),
  phone: text("phone"),
  location: text("location"),
  // injury
  injuryLevel: text("injury_level"),
  injuryType: text("injury_type"),
  injuryDate: text("injury_date"),
  rehabCentre: text("rehab_centre"),
  // mobility
  wheelchairType: text("wheelchair_type"),
  wheelchairModel: text("wheelchair_model"),
  assistiveTech: text("assistive_tech"),
  // care
  emergencyContactName: text("emergency_contact_name"),
  emergencyContactPhone: text("emergency_contact_phone"),
  careCompanies: text("care_companies"),
  caregiverNotes: text("caregiver_notes"),
  // medical
  medications: text("medications"),
  allergies: text("allergies"),
  medicalNotes: text("medical_notes"),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// ---------------------------------------------------------------------------
// chat_messages
// ---------------------------------------------------------------------------

export const chatMessages = pgTable("chat_messages", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  channel: text("channel").notNull(),
  authorId: varchar("author_id").references(() => users.id, {
    onDelete: "set null",
  }),
  authorName: text("author_name").notNull(),
  text: text("text").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// ---------------------------------------------------------------------------
// feedback
// ---------------------------------------------------------------------------

export const feedback = pgTable("feedback", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  category: text("category").notNull().default("general"),
  message: text("message").notNull(),
  authorId: varchar("author_id").references(() => users.id, { onDelete: "set null" }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// ---------------------------------------------------------------------------
// sci_provider_reviews
// ---------------------------------------------------------------------------

export const sciProviderReviews = pgTable("sci_provider_reviews", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  providerId: text("provider_id").notNull(),
  authorId: varchar("author_id").references(() => users.id, {
    onDelete: "set null",
  }),
  authorName: text("author_name").notNull().default("Anonymous"),
  rating: integer("rating").notNull(),
  comment: text("comment").notNull().default(""),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// ---------------------------------------------------------------------------
// message_reports
// ---------------------------------------------------------------------------

export const messageReports = pgTable("message_reports", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  messageId: varchar("message_id").notNull(),
  channel: text("channel").notNull(),
  reportedAuthor: text("reported_author").notNull(),
  messageText: text("message_text").notNull(),
  reporterId: varchar("reporter_id").references(() => users.id, {
    onDelete: "set null",
  }),
  reporterName: text("reporter_name"),
  resolved: text("resolved").notNull().default("pending"), // pending | removed | dismissed
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// ---------------------------------------------------------------------------
// Zod schemas + types
// ---------------------------------------------------------------------------

export const insertUserSchema = createInsertSchema(users).pick({
  name: true,
  email: true,
  passwordHash: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type DbUserProfile = typeof userProfiles.$inferSelect;
export type DbChatMessage = typeof chatMessages.$inferSelect;
