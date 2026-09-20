import type { InferSelectModel } from "drizzle-orm";
import {
  boolean,
  integer,
  json,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

/**
 * Donna's domain schema — Goals, Projects, Tasks, Clients, Deliverables,
 * Sessions, GitHub activity, and derailment events. See ARCHITECTURE.md
 * section 2 for the rationale behind each table. This is a first pass;
 * extend it as real tools are built and log additions in DECISIONS.md.
 *
 * Distinct from apps/web/lib/db/schema.ts, which holds the Chat SDK's own
 * tables (User, Chat, Message_v2, ...) and is not merged into this package.
 */

export const client = pgTable("Client", {
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  id: uuid("id").primaryKey().notNull().defaultRandom(),
  lastContactDate: timestamp("lastContactDate"),
  name: text("name").notNull(),
  riskFlag: boolean("riskFlag").notNull().default(false),
});

export type Client = InferSelectModel<typeof client>;

export const goal = pgTable("Goal", {
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  description: text("description").notNull(),
  horizon: varchar("horizon", { enum: ["long", "short"] }).notNull(),
  id: uuid("id").primaryKey().notNull().defaultRandom(),
  status: varchar("status", {
    enum: ["active", "completed", "abandoned"],
  })
    .notNull()
    .default("active"),
  updatedAt: timestamp("updatedAt").notNull().defaultNow(),
});

export type Goal = InferSelectModel<typeof goal>;

export const project = pgTable("Project", {
  clientId: uuid("clientId").references(() => client.id),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  id: uuid("id").primaryKey().notNull().defaultRandom(),
  name: text("name").notNull(),
  status: varchar("status", {
    enum: ["active", "stalled", "completed", "archived"],
  })
    .notNull()
    .default("active"),
});

export type Project = InferSelectModel<typeof project>;

export const task = pgTable("Task", {
  actualMinutes: integer("actualMinutes"),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  dueDate: timestamp("dueDate"),
  estimatedMinutes: integer("estimatedMinutes"),
  goalId: uuid("goalId").references(() => goal.id),
  id: uuid("id").primaryKey().notNull().defaultRandom(),
  priority: varchar("priority", {
    enum: ["low", "medium", "high"],
  })
    .notNull()
    .default("medium"),
  projectId: uuid("projectId")
    .notNull()
    .references(() => project.id),
  scheduledDate: timestamp("scheduledDate"),
  status: varchar("status", {
    enum: ["todo", "in_progress", "done", "blocked"],
  })
    .notNull()
    .default("todo"),
});

export type Task = InferSelectModel<typeof task>;

export const deliverable = pgTable("Deliverable", {
  clientId: uuid("clientId")
    .notNull()
    .references(() => client.id),
  description: text("description").notNull(),
  dueDate: timestamp("dueDate"),
  id: uuid("id").primaryKey().notNull().defaultRandom(),
  status: varchar("status", {
    enum: ["pending", "delivered", "at_risk"],
  })
    .notNull()
    .default("pending"),
});

export type Deliverable = InferSelectModel<typeof deliverable>;

export const session = pgTable("Session", {
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  date: timestamp("date").notNull(),
  id: uuid("id").primaryKey().notNull().defaultRandom(),
  summaryJson: json("summaryJson"),
  type: varchar("type", {
    enum: ["morning_briefing", "check_in", "eod_summary", "weekly_review"],
  }).notNull(),
});

export type Session = InferSelectModel<typeof session>;

export const githubActivityLog = pgTable("GithubActivityLog", {
  commitCount: integer("commitCount").notNull().default(0),
  fetchedAt: timestamp("fetchedAt").notNull().defaultNow(),
  id: uuid("id").primaryKey().notNull().defaultRandom(),
  prCount: integer("prCount").notNull().default(0),
  projectId: uuid("projectId")
    .notNull()
    .references(() => project.id),
  repo: text("repo").notNull(),
  windowEnd: timestamp("windowEnd").notNull(),
  windowStart: timestamp("windowStart").notNull(),
});

export type GithubActivityLog = InferSelectModel<typeof githubActivityLog>;

export const derailmentEvent = pgTable("DerailmentEvent", {
  date: timestamp("date").notNull(),
  detectedAt: timestamp("detectedAt").notNull().defaultNow(),
  fredConfirmed: boolean("fredConfirmed"),
  id: uuid("id").primaryKey().notNull().defaultRandom(),
  recoveryAction: text("recoveryAction"),
  resolvedAt: timestamp("resolvedAt"),
  signalSummaryJson: json("signalSummaryJson"),
});

export type DerailmentEvent = InferSelectModel<typeof derailmentEvent>;

export const stateLog = pgTable("StateLog", {
  id: uuid("id").primaryKey().notNull().defaultRandom(),
  level: varchar("level", { enum: ["dip", "baseline", "peak"] })
    .notNull()
    .default("baseline"),
  loggedAt: timestamp("loggedAt").notNull().defaultNow(),
  note: text("note"),
});

export type StateLog = InferSelectModel<typeof stateLog>;

export const sleepLog = pgTable("SleepLog", {
  id: uuid("id").primaryKey().notNull().defaultRandom(),
  date: timestamp("date").notNull(),
  hours: integer("hours").notNull(),
  targetHours: integer("targetHours").notNull().default(6),
  loggedAt: timestamp("loggedAt").notNull().defaultNow(),
});

export type SleepLog = InferSelectModel<typeof sleepLog>;

export const mealLog = pgTable("MealLog", {
  id: uuid("id").primaryKey().notNull().defaultRandom(),
  date: timestamp("date").notNull(),
  description: text("description"),
  loggedAt: timestamp("loggedAt").notNull().defaultNow(),
});

export type MealLog = InferSelectModel<typeof mealLog>;
