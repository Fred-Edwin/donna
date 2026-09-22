import type { InferSelectModel } from "drizzle-orm";
import { boolean, pgTable, text, timestamp, uuid, varchar } from "drizzle-orm/pg-core";

/**
 * apps/web's own schema now holds only auth's User table. Chat SDK's
 * original Chat/Message_v2/Vote_v2/Document/Suggestion/Stream tables were
 * removed in Phase 1 Slice A (2026-09-22): eve owns session/message
 * persistence for Donna's chat now (see ARCHITECTURE.md, DECISIONS.md).
 * None of the removed tables were ever applied to a live database, so this
 * was a schema-file trim, not a data migration.
 */
export const user = pgTable("User", {
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  email: varchar("email", { length: 64 }).notNull(),
  emailVerified: boolean("emailVerified").notNull().default(false),
  id: uuid("id").primaryKey().notNull().defaultRandom(),
  image: text("image"),
  isAnonymous: boolean("isAnonymous").notNull().default(false),
  name: text("name"),
  password: varchar("password", { length: 64 }),
  updatedAt: timestamp("updatedAt").notNull().defaultNow(),
});

export type User = InferSelectModel<typeof user>;
