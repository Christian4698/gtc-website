import { PrismaClient } from "@prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";

const databaseUrl = process.env.DATABASE_URL ?? "file:prisma/dev.db";
const sqlitePath = databaseUrl.startsWith("file:") ? databaseUrl.slice("file:".length) : databaseUrl;

const adapter = new PrismaBetterSqlite3({ url: sqlitePath });

export const prisma = new PrismaClient({ adapter });
