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
  billingAddress: text("billingAddress"),
  billingEmail: text("billingEmail"),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  currency: varchar("currency", { length: 3 }).notNull().default("USD"),
  id: uuid("id").primaryKey().notNull().defaultRandom(),
  lastContactDate: timestamp("lastContactDate"),
  legalName: text("legalName"),
  name: text("name").notNull(),
  paymentTerms: text("paymentTerms"),
  primaryContactEmail: text("primaryContactEmail"),
  primaryContactName: text("primaryContactName"),
  primaryContactPhone: text("primaryContactPhone"),
  riskFlag: boolean("riskFlag").notNull().default(false),
  taxPin: text("taxPin"),
});

export type Client = InferSelectModel<typeof client>;

export const goal = pgTable("Goal", {
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  description: text("description").notNull(),
  horizon: varchar("horizon", { enum: ["long", "short"] }).notNull(),
  id: uuid("id").primaryKey().notNull().defaultRandom(),
  /**
   * Donna's contextual progress assessment (0–100). Agent-writable during
   * briefings and goal reviews. Intentionally separate from the raw
   * tasks-done/tasks-total ratio (which is derived at query time) — Donna
   * can set this to reflect milestone weight, not just task count.
   * Null = not yet assessed.
   */
  progressPct: integer("progressPct"),
  status: varchar("status", {
    enum: ["active", "completed", "abandoned"],
  })
    .notNull()
    .default("active"),
  /**
   * Optional target completion date. Backs the "TARGET: NOV 30 (68D REMAINING)"
   * countdown in the Goal Detail cockpit header. Null = no target set.
   */
  targetDate: timestamp("targetDate"),
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
  /**
   * Set when status transitions to "done" (see updateTask). Backs 7-day
   * completion velocity (Goals ledger, artboard "13") — createdAt alone
   * can't answer "when was this finished." Null until completed; cleared
   * back to null if status moves off "done". See DECISIONS.md 2026-09-22.
   */
  completedAt: timestamp("completedAt"),
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
  title: text("title").notNull(),
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

export const clientDocument = pgTable("ClientDocument", {
  amountCents: integer("amountCents"),
  clientId: uuid("clientId")
    .notNull()
    .references(() => client.id),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  currency: varchar("currency", { length: 3 }).notNull().default("USD"),
  docNumber: text("docNumber"),
  dueDate: timestamp("dueDate"),
  fileUrl: text("fileUrl"),
  id: uuid("id").primaryKey().notNull().defaultRandom(),
  issueDate: timestamp("issueDate"),
  status: varchar("status", {
    enum: ["draft", "sent", "paid", "overdue", "executed"],
  })
    .notNull()
    .default("sent"),
  title: text("title").notNull(),
  type: varchar("type", {
    enum: ["invoice", "contract", "receipt", "tax_cert"],
  }).notNull(),
});

export type ClientDocument = InferSelectModel<typeof clientDocument>;

/**
 * Catch-all for anything Donna notices that doesn't cleanly fit Goal/
 * Project/Task/Client/Deliverable — the escape hatch so document ingestion
 * and everyday conversation don't force a bad fit into the rigid schema, or
 * get silently dropped. Donna writes rows here; she does not alter the
 * schema itself. See DECISIONS.md 2026-09-22 entry.
 */
export const observation = pgTable("Observation", {
  /**
   * Distinguishes durable facts about Fred himself (preferences, people in
   * his life, biographical context — surfaced in future chats regardless
   * of project) from task/project-scoped notes. Null = unclassified, same
   * as existing rows before this field. See DECISIONS.md 2026-09-22 entry
   * (proactive extraction during free-form chat).
   */
  category: varchar("category", {
    enum: ["preference", "relationship", "biographical", "project_note"],
  }),
  content: text("content").notNull(),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  id: uuid("id").primaryKey().notNull().defaultRandom(),
  /**
   * Loose, untyped pointer — e.g. "project", "client" — not a foreign key,
   * since the related entity may not exist yet or may span several.
   */
  relatedEntityId: uuid("relatedEntityId"),
  relatedEntityType: text("relatedEntityType"),
  sourceType: varchar("sourceType", {
    enum: ["brain_dump", "conversation", "inference"],
  }).notNull(),
  status: varchar("status", {
    enum: ["new", "reviewed", "promoted", "dismissed"],
  })
    .notNull()
    .default("new"),
});

export type Observation = InferSelectModel<typeof observation>;
