import { config } from "dotenv";
import { defineConfig } from "prisma/config";

// Load .env.local for local development (Prisma CLI reads .env by default)
config({ path: ".env.local" });

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: process.env["DATABASE_URL"]!,
  },
});
