import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, integer, real, boolean } from "drizzle-orm/pg-core";
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
// care_relationships
// ---------------------------------------------------------------------------

export const careRelationships = pgTable("care_relationships", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  patientId: varchar("patient_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  caregiverId: varchar("caregiver_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  // carer | family | clinician
  role: text("role").notNull().default("carer"),
  status: text("status").notNull().default("active"), // active | revoked
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// ---------------------------------------------------------------------------
// invite_codes
// ---------------------------------------------------------------------------

export const inviteCodes = pgTable("invite_codes", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  code: text("code").notNull().unique(),
  patientId: varchar("patient_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  // role the joiner will receive
  role: text("role").notNull().default("carer"),
  expiresAt: timestamp("expires_at").notNull(),
  usedAt: timestamp("used_at"),
  usedById: varchar("used_by_id").references(() => users.id, { onDelete: "set null" }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// ---------------------------------------------------------------------------
// pressure_injuries  (one row per wound site, tracks the site over time)
// ---------------------------------------------------------------------------

export const pressureInjuries = pgTable("pressure_injuries", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  patientId: varchar("patient_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  // anatomical site: sacrum | left_ischium | right_ischium | left_trochanter |
  //   right_trochanter | left_heel | right_heel | left_malleolus |
  //   right_malleolus | left_elbow | right_elbow | occiput | other
  site: text("site").notNull(),
  siteLabel: text("site_label"), // custom label when site = "other"
  status: text("status").notNull().default("active"), // active | healed
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// ---------------------------------------------------------------------------
// pressure_injury_checks  (one row per assessment of a wound site)
// ---------------------------------------------------------------------------

export const pressureInjuryChecks = pgTable("pressure_injury_checks", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  injuryId: varchar("injury_id")
    .notNull()
    .references(() => pressureInjuries.id, { onDelete: "cascade" }),
  assessedById: varchar("assessed_by_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  // stage1 | stage2 | stage3 | stage4 | unstageable | dti | clear
  stage: text("stage").notNull(),
  lengthCm: real("length_cm"),
  widthCm: real("width_cm"),
  depthCm: real("depth_cm"),
  // wound bed: granulation | slough | eschar | epithelializing | none
  woundBed: text("wound_bed"),
  // exudate: none | scant | moderate | heavy
  exudate: text("exudate"),
  // surrounding skin: intact | erythema | macerated | induration
  surroundingSkin: text("surrounding_skin"),
  odor: boolean("odor").default(false),
  painScore: integer("pain_score"), // 0-10
  photoUrl: text("photo_url"),
  notes: text("notes"),
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
export type CareRelationship = typeof careRelationships.$inferSelect;
export type InviteCode = typeof inviteCodes.$inferSelect;
export type PressureInjury = typeof pressureInjuries.$inferSelect;
export type PressureInjuryCheck = typeof pressureInjuryChecks.$inferSelect;
