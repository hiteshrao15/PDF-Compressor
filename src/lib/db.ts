import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

const globalForDbState = globalThis as unknown as {
  databaseUnavailable: boolean | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export function isDatabaseUnavailable(): boolean {
  return globalForDbState.databaseUnavailable === true;
}

export function markDatabaseUnavailable(): void {
  globalForDbState.databaseUnavailable = true;
}
