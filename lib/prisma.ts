import { PrismaClient } from "@/app/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

/**
 * Normalizes PostgreSQL connection string to eliminate the pg-connection-string
 * deprecation warning (upgrading sslmode=require/prefer/verify-ca to verify-full).
 */
function normalizeConnectionString(rawUrl?: string): string | undefined {
  if (!rawUrl) return rawUrl;
  try {
    const parsed = new URL(rawUrl);
    const sslmode = parsed.searchParams.get("sslmode");
    if (sslmode === "require" || sslmode === "prefer" || sslmode === "verify-ca") {
      parsed.searchParams.set("sslmode", "verify-full");
      return parsed.toString();
    }
    return rawUrl;
  } catch {
    return rawUrl.replace(/sslmode=(?:require|prefer|verify-ca)/g, "sslmode=verify-full");
  }
}

const createPrismaClient = () => {
  const rawConnectionString = process.env.DATABASE_URL;
  if (!rawConnectionString) {
    throw new Error("DATABASE_URL is not defined in environment variables");
  }

  const connectionString = normalizeConnectionString(rawConnectionString);

  const adapter = new PrismaPg({
    connectionString,
  });

  return new PrismaClient({ adapter });
};

// Reuse Prisma client across hot-reloads to prevent connection exhaustion
export const prisma = globalForPrisma.prisma ?? createPrismaClient();
export const db = prisma;

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

export default prisma;
