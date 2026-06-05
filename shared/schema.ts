import { sql } from "drizzle-orm";
import {
  pgTable,
  text,
  varchar,
  timestamp,
  integer,
  real,
  boolean,
  index,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// ---------------------------------------------------------------------------
// users
// ---------------------------------------------------------------------------

export const users = pgTable(
  "users",
  {
    id: varchar("id")
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    name: text("name").notNull(),
    email: text("email").notNull().unique(),
    passwordHash: text("password_hash").notNull().default(""),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (t) => ({
    emailLowerIdx: uniqueIndex("users_email_lower_idx").on(
      sql`lower(${t.email})`,
    ),
  }),
);

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
  sex: text("sex"),
  // care intro (shown to support workers)
  aboutMe: text("about_me"),
  routineHighlights: text("routine_highlights"),
  // medical
  medications: text("medications"),
  allergies: text("allergies"),
  medicalNotes: text("medical_notes"),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// ---------------------------------------------------------------------------
// chat_messages
// ---------------------------------------------------------------------------

export const chatMessages = pgTable(
  "chat_messages",
  {
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
  },
  (t) => ({
    channelCreatedAtIdx: index("chat_messages_channel_created_at_idx").on(
      t.channel,
      t.createdAt,
    ),
  }),
);

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

export const sciProviderReviews = pgTable(
  "sci_provider_reviews",
  {
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
  },
  (t) => ({
    providerCreatedAtIdx: index(
      "sci_provider_reviews_provider_created_at_idx",
    ).on(t.providerId, t.createdAt.desc()),
  }),
);

// ---------------------------------------------------------------------------
// message_reports
// ---------------------------------------------------------------------------

export const messageReports = pgTable(
  "message_reports",
  {
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
  },
  (t) => ({
    resolvedCreatedAtIdx: index("message_reports_resolved_created_at_idx").on(
      t.resolved,
      t.createdAt,
    ),
  }),
);

// ---------------------------------------------------------------------------
// care_relationships
// ---------------------------------------------------------------------------

export const careRelationships = pgTable(
  "care_relationships",
  {
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
  },
  (t) => ({
    caregiverStatusIdx: index("care_relationships_caregiver_status_idx").on(t.caregiverId, t.status),
    uniqueRelationship: uniqueIndex("care_relationships_unique_pair").on(t.patientId, t.caregiverId),
  })
);

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
},
(t) => ({
  injuryCreatedAtIdx: index("pressure_injury_checks_injury_created_at_idx").on(t.injuryId, t.createdAt),
}));

// ---------------------------------------------------------------------------
// care_notes  (shared handover log — multiple carers can add entries)
// ---------------------------------------------------------------------------

export const careNotes = pgTable(
  "care_notes",
  {
    id: varchar("id")
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    patientId: varchar("patient_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    authorId: varchar("author_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    authorName: text("author_name").notNull(),
    // free_text | isbar
    noteType: text("note_type").notNull().default("free_text"),
    content: text("content").notNull().default(""),
    // ISBAR fields (null for free_text notes)
    // morning | afternoon | evening | night
    shiftType: text("shift_type"),
    situation: text("situation"),
    background: text("background"),
    assessment: text("assessment"),
    recommendation: text("recommendation"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (t) => ({
    patientCreatedIdx: index("care_notes_patient_created_idx").on(
      t.patientId,
      t.createdAt,
    ),
  }),
);

// ---------------------------------------------------------------------------
// handover_reads  (who has read each care note)
// ---------------------------------------------------------------------------

export const handoverReads = pgTable(
  "handover_reads",
  {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    noteId: varchar("note_id")
      .notNull()
      .references(() => careNotes.id, { onDelete: "cascade" }),
    readerId: varchar("reader_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    readerName: text("reader_name").notNull(),
    readAt: timestamp("read_at").notNull().defaultNow(),
  },
  (t) => ({
    noteReaderIdx: index("handover_reads_note_reader_idx").on(t.noteId, t.readerId),
  }),
);

// ---------------------------------------------------------------------------
// bladder_logs
// ---------------------------------------------------------------------------

export const bladderLogs = pgTable(
  "bladder_logs",
  {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    patientId: varchar("patient_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    recordedById: varchar("recorded_by_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    authorName: text("author_name").notNull(),
    // catheterization | spontaneous | leak | accident | bag_attach
    type: text("type").notNull(),
    // day | night — null treated as "day" for legacy entries
    bagType: text("bag_type"),
    volumeMl: integer("volume_ml"),
    notes: text("notes"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (t) => ({ idx: index("bladder_logs_patient_created_idx").on(t.patientId, t.createdAt.desc()) }),
);

// ---------------------------------------------------------------------------
// bowel_logs
// ---------------------------------------------------------------------------

export const bowelLogs = pgTable(
  "bowel_logs",
  {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    patientId: varchar("patient_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    recordedById: varchar("recorded_by_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    authorName: text("author_name").notNull(),
    // digital_stimulation | suppository | enema | manual_evacuation | spontaneous | laxative | no_result
    method: text("method").notNull(),
    // Bristol Stool Scale 1–7, null if no_result
    bristolType: integer("bristol_type"),
    // small | moderate | large | none
    amount: text("amount"),
    // normal | dark | pale | bloody | mucus
    colour: text("colour"),
    durationMins: integer("duration_mins"),
    notes: text("notes"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (t) => ({ idx: index("bowel_logs_patient_created_idx").on(t.patientId, t.createdAt.desc()) }),
);

// ---------------------------------------------------------------------------
// pain_entries
// ---------------------------------------------------------------------------

export const painEntries = pgTable(
  "pain_entries",
  {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    patientId: varchar("patient_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    recordedById: varchar("recorded_by_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    authorName: text("author_name").notNull(),
    level: integer("level").notNull(), // 1-10
    location: text("location").notNull(),
    description: text("description"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (t) => ({ idx: index("pain_entries_patient_created_idx").on(t.patientId, t.createdAt.desc()) }),
);

// ---------------------------------------------------------------------------
// hydration_logs
// ---------------------------------------------------------------------------

export const hydrationLogs = pgTable(
  "hydration_logs",
  {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    patientId: varchar("patient_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    recordedById: varchar("recorded_by_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    amount: integer("amount").notNull(),
    unit: text("unit").notNull().default("ml"),
    date: text("date").notNull(), // YYYY-MM-DD
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (t) => ({ idx: index("hydration_logs_patient_date_idx").on(t.patientId, t.date) }),
);

// ---------------------------------------------------------------------------
// routine_tasks  (checklist items per patient)
// ---------------------------------------------------------------------------

export const routineTasks = pgTable("routine_tasks", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  patientId: varchar("patient_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  // morning | evening | anytime
  category: text("category").notNull().default("morning"),
  orderIndex: integer("order_index").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// ---------------------------------------------------------------------------
// routine_completions  (daily task check-offs)
// ---------------------------------------------------------------------------

export const routineCompletions = pgTable(
  "routine_completions",
  {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    taskId: varchar("task_id").notNull().references(() => routineTasks.id, { onDelete: "cascade" }),
    patientId: varchar("patient_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    recordedById: varchar("recorded_by_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    date: text("date").notNull(), // YYYY-MM-DD
    completedAt: text("completed_at").notNull(), // ISO timestamp
  },
  (t) => ({ idx: index("routine_completions_patient_date_idx").on(t.patientId, t.date) }),
);

// ---------------------------------------------------------------------------
// skin_check_entries
// ---------------------------------------------------------------------------

export const skinCheckEntries = pgTable(
  "skin_check_entries",
  {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    patientId: varchar("patient_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    recordedById: varchar("recorded_by_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    authorName: text("author_name").notNull(),
    location: text("location").notNull(),
    // clear | redness | broken
    severity: text("severity").notNull(),
    notes: text("notes"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (t) => ({ idx: index("skin_check_entries_patient_created_idx").on(t.patientId, t.createdAt.desc()) }),
);

// ---------------------------------------------------------------------------
// care_preferences  (single doc per patient)
// ---------------------------------------------------------------------------

export const carePreferences = pgTable("care_preferences", {
  patientId: varchar("patient_id").primaryKey().references(() => users.id, { onDelete: "cascade" }),
  name: text("name").notNull().default(""),
  injuryLevel: text("injury_level").notNull().default(""),
  injuryType: text("injury_type").notNull().default(""),
  equipment: text("equipment").notNull().default(""),
  allergies: text("allergies").notNull().default(""),
  medicationsSummary: text("medications_summary").notNull().default(""),
  morningCareNotes: text("morning_care_notes").notNull().default(""),
  eveningCareNotes: text("evening_care_notes").notNull().default(""),
  otherNotes: text("other_notes").notNull().default(""),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// ---------------------------------------------------------------------------
// vitals  (shared vital sign readings)
// ---------------------------------------------------------------------------

export const vitals = pgTable(
  "vitals",
  {
    id: varchar("id")
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    patientId: varchar("patient_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    recordedById: varchar("recorded_by_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    authorName: text("author_name").notNull(),
    // blood_pressure | heart_rate | temperature | oxygen | weight
    type: text("type").notNull(),
    value: text("value").notNull(),
    systolic: integer("systolic"),
    diastolic: integer("diastolic"),
    notes: text("notes"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (t) => ({
    vitalsPatientIdx: index("vitals_patient_created_idx").on(t.patientId, t.createdAt.desc()),
  }),
);

// ---------------------------------------------------------------------------
// medications  (shared medication list per patient)
// ---------------------------------------------------------------------------

export const medications = pgTable("medications", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  patientId: varchar("patient_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  dosage: text("dosage").notNull().default(""),
  frequency: text("frequency").notNull().default("Daily"),
  times: text("times").notNull().default("8:00 AM"), // comma-separated
  // scheduled | prn
  scheduleType: text("schedule_type").notNull().default("scheduled"),
  // oral | sublingual | patch | injection | inhaled | topical | rectal | other
  route: text("route").notNull().default("oral"),
  notes: text("notes"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// ---------------------------------------------------------------------------
// medication_logs  (daily dose records)
// ---------------------------------------------------------------------------

export const medicationLogs = pgTable(
  "medication_logs",
  {
    id: varchar("id")
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    medicationId: varchar("medication_id")
      .notNull()
      .references(() => medications.id, { onDelete: "cascade" }),
    patientId: varchar("patient_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    recordedById: varchar("recorded_by_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    date: text("date").notNull(), // YYYY-MM-DD
    scheduledTime: text("scheduled_time").notNull(),
    taken: boolean("taken").notNull().default(false),
    actualTime: text("actual_time"), // ISO string when actually taken
    administeredByName: text("administered_by_name"),
    // refused | unavailable | sleeping | held_by_clinician | npo | other
    reasonOmitted: text("reason_omitted"),
  },
  (t) => ({
    medLogPatientDateIdx: index("medication_logs_patient_date_idx").on(t.patientId, t.date),
  }),
);

// ---------------------------------------------------------------------------
// appointments  (shared appointments per patient)
// ---------------------------------------------------------------------------

export const appointments = pgTable(
  "appointments",
  {
    id: varchar("id")
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    patientId: varchar("patient_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    createdById: varchar("created_by_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    // doctor | therapy | equipment | other
    type: text("type").notNull().default("other"),
    title: text("title").notNull(),
    date: text("date").notNull(), // YYYY-MM-DD
    time: text("time").notNull().default(""),
    location: text("location"),
    notes: text("notes"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (t) => ({
    apptPatientDateIdx: index("appointments_patient_date_idx").on(t.patientId, t.date),
  }),
);

// ---------------------------------------------------------------------------
// rehab_goals
// ---------------------------------------------------------------------------

export const rehabGoals = pgTable(
  "rehab_goals",
  {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    patientId: varchar("patient_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    createdById: varchar("created_by_id").notNull().references(() => users.id),
    createdByName: text("created_by_name").notNull().default(""),
    // Goal details
    category: text("category").notNull().default("mobility"), // mobility | self_care | communication | community | other
    title: text("title").notNull(),
    description: text("description"),
    targetDate: text("target_date"), // YYYY-MM-DD
    // Status: active | achieved | on_hold | discontinued
    status: text("status").notNull().default("active"),
    achievedAt: timestamp("achieved_at"),
    // Progress notes (latest progress narrative)
    progressNote: text("progress_note"),
    progressUpdatedAt: timestamp("progress_updated_at"),
    progressUpdatedBy: text("progress_updated_by"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (t) => ({
    rehabGoalPatientIdx: index("rehab_goals_patient_idx").on(t.patientId),
  }),
);

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
export type CareNote = typeof careNotes.$inferSelect;
export type HandoverRead = typeof handoverReads.$inferSelect;
export type Vital = typeof vitals.$inferSelect;
export type Medication = typeof medications.$inferSelect;
export type MedicationLog = typeof medicationLogs.$inferSelect;
export type Appointment = typeof appointments.$inferSelect;
export type BladderLog = typeof bladderLogs.$inferSelect;
export type BowelLog = typeof bowelLogs.$inferSelect;
export type PainEntry = typeof painEntries.$inferSelect;
export type HydrationLog = typeof hydrationLogs.$inferSelect;
export type RoutineTask = typeof routineTasks.$inferSelect;
export type RoutineCompletion = typeof routineCompletions.$inferSelect;
export type SkinCheckEntry = typeof skinCheckEntries.$inferSelect;
export type CarePreference = typeof carePreferences.$inferSelect;
export type RehabGoal = typeof rehabGoals.$inferSelect;

// ---------------------------------------------------------------------------
// audit_logs  (append-only — never deleted)
// ---------------------------------------------------------------------------

export const auditLogs = pgTable(
  "audit_logs",
  {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    patientId: varchar("patient_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    actorId: varchar("actor_id").notNull().references(() => users.id),
    actorName: text("actor_name").notNull(),
    // action: created | updated | deleted | administered | omitted | achieved | status_changed | assessed
    action: text("action").notNull(),
    // entityType: wound | wound_check | medication | med_log | care_note | goal | vital | bladder | bowel | pain
    entityType: text("entity_type").notNull(),
    entityId: text("entity_id").notNull(),
    summary: text("summary").notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (t) => ({
    auditPatientIdx: index("audit_logs_patient_idx").on(t.patientId, t.createdAt),
  }),
);

export type AuditLog = typeof auditLogs.$inferSelect;
