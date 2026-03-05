import { PrismaClient } from "@/lib/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { config as loadDotenv } from "dotenv";
import { Pool } from "pg";

loadDotenv({ path: ".env.local", override: true });
loadDotenv({ path: ".env", override: false });

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
  pool: Pool | undefined;
  connectionString: string | undefined;
};

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is not set. Check .env.local or .env configuration.");
}

const shouldReuseExistingClients =
  globalForPrisma.prisma !== undefined &&
  globalForPrisma.pool !== undefined &&
  globalForPrisma.connectionString === connectionString;

if (!shouldReuseExistingClients) {
  if (globalForPrisma.prisma) {
    void globalForPrisma.prisma.$disconnect().catch(() => undefined);
  }

  if (globalForPrisma.pool) {
    void globalForPrisma.pool.end().catch(() => undefined);
  }
}

const pool =
  shouldReuseExistingClients && globalForPrisma.pool
    ? globalForPrisma.pool
    : new Pool({
        connectionString,
      });

const adapter = new PrismaPg(pool);

export const prisma =
  shouldReuseExistingClients && globalForPrisma.prisma
    ? globalForPrisma.prisma
    : new PrismaClient({
        adapter,
        log: ["query"],
      });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
  globalForPrisma.pool = pool;
  globalForPrisma.connectionString = connectionString;
}