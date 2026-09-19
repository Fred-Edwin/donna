import { config } from "dotenv";
import { defineConfig } from "drizzle-kit";

config({
  path: "../../apps/web/.env.local",
});

export default defineConfig({
  dbCredentials: {
    url: process.env.POSTGRES_URL ?? "",
  },
  dialect: "postgresql",
  out: "./migrations",
  schema: "./schema.ts",
});
