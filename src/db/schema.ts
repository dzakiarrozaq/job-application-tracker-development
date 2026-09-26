import {
  boolean,
  integer,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";

const genId = () => crypto.randomUUID();

// ---------------------------------------------------------------------------
// Enums
// ---------------------------------------------------------------------------

export const stageTypeEnum = pgEnum("stage_type", [
  "normal",
  "offer",
  "hired",
  "rejected",
]);

export const documentTypeEnum = pgEnum("document_type", [
  "cv",
  "portfolio",
  "cover_letter",
  "certificate",
  "other",
]);

export const applicationOutcomeEnum = pgEnum("application_outcome", [
  "active",
  "offer",
  "hired",
  "rejected",
]);

// ---------------------------------------------------------------------------
// Users
// ---------------------------------------------------------------------------

export const users = pgTable("users", {
  id: text("id").primaryKey().$defaultFn(genId),
  name: text("name").notNull(),
  email: text("email").notNull(),
  passwordHash: text("password_hash"),
  image: text("image"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => ({
  emailUnique: uniqueIndex("users_email_unique").on(table.email),
}));

// ---------------------------------------------------------------------------
// Pipelines & Stages
// ---------------------------------------------------------------------------

export const pipelines = pgTable("pipelines", {
  id: text("id").primaryKey().$defaultFn(genId),
  userId: text("user_id").references(() => users.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  description: text("description"),
  track: text("track").notNull().default("custom"),
  isSystem: boolean("is_system").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const pipelineStages = pgTable("pipeline_stages", {
  id: text("id").primaryKey().$defaultFn(genId),
  pipelineId: text("pipeline_id")
    .notNull()
    .references(() => pipelines.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  order: integer("order").notNull().default(0),
  type: stageTypeEnum("type").notNull().default("normal"),
  isInterviewStage: boolean("is_interview_stage").notNull().default(false),
  color: text("color").notNull().default("#6366f1"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

// ---------------------------------------------------------------------------
// Applications
// ---------------------------------------------------------------------------

export const applications = pgTable("applications", {
  id: text("id").primaryKey().$defaultFn(genId),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  company: text("company").notNull(),
  position: text("position").notNull(),
  jobUrl: text("job_url"),
  location: text("location"),
  salaryExpectation: text("salary_expectation"),
  notes: text("notes"),
  pipelineId: text("pipeline_id")
    .notNull()
    .references(() => pipelines.id, { onDelete: "restrict" }),
  currentStageId: text("current_stage_id").references(() => pipelineStages.id, {
    onDelete: "set null",
  }),
  outcome: applicationOutcomeEnum("outcome").notNull().default("active"),
  interviewDate: timestamp("interview_date", { withTimezone: true }),
  appliedDate: timestamp("applied_date", { withTimezone: true }).notNull().defaultNow(),
  archived: boolean("archived").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

// ---------------------------------------------------------------------------
// Application stage history (for analytics e.g. time-to-interview)
// ---------------------------------------------------------------------------

export const applicationStageHistory = pgTable("application_stage_history", {
  id: text("id").primaryKey().$defaultFn(genId),
  applicationId: text("application_id")
    .notNull()
    .references(() => applications.id, { onDelete: "cascade" }),
  stageId: text("stage_id")
    .notNull()
    .references(() => pipelineStages.id, { onDelete: "cascade" }),
  enteredAt: timestamp("entered_at", { withTimezone: true }).notNull().defaultNow(),
});

// ---------------------------------------------------------------------------
// Documents
// ---------------------------------------------------------------------------

export const documents = pgTable("documents", {
  id: text("id").primaryKey().$defaultFn(genId),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  type: documentTypeEnum("type").notNull().default("other"),
  url: text("url").notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const applicationDocuments = pgTable("application_documents", {
  id: text("id").primaryKey().$defaultFn(genId),
  applicationId: text("application_id")
    .notNull()
    .references(() => applications.id, { onDelete: "cascade" }),
  documentId: text("document_id")
    .notNull()
    .references(() => documents.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => ({
  uniqueLink: uniqueIndex("application_documents_unique").on(
    table.applicationId,
    table.documentId,
  ),
}));

// ---------------------------------------------------------------------------
// Interview Prep Checklist
// ---------------------------------------------------------------------------

export const interviewPrepItems = pgTable("interview_prep_items", {
  id: text("id").primaryKey().$defaultFn(genId),
  applicationId: text("application_id")
    .notNull()
    .references(() => applications.id, { onDelete: "cascade" }),
  text: text("text").notNull(),
  completed: boolean("completed").notNull().default(false),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});
