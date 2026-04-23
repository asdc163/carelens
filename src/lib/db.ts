import { PrismaClient } from "@prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";

const url = process.env.DATABASE_URL ?? "file:./prisma/carelens.db";
const filename = url.startsWith("file:") ? url.slice(5) : url;

// Reuse Prisma across hot reloads in dev
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter: new PrismaBetterSqlite3({ url: filename }),
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
