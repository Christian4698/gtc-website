import { bigint, boolean, int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

export const roles = mysqlTable("roles", {
  id: int("id").autoincrement().primaryKey(),
  name: mysqlEnum("roleName", ["admin", "formateur", "etudiant"]).notNull().unique(),
  description: text("description"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Role = typeof roles.$inferSelect;
export type InsertRole = typeof roles.$inferInsert;

/**
 * Core user table backing auth flow.
 */
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin", "formateur", "etudiant"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Files table for storing uploaded resources (e-books, guides, training materials).
 * Categories: ebook, guide, training, template, other.
 */
export const files = mysqlTable("files", {
  id: int("id").autoincrement().primaryKey(),
  /** Storage key from S3 (used to reference the file) */
  fileKey: varchar("fileKey", { length: 512 }).notNull().unique(),
  /** Public URL path (e.g. /manus-storage/xxx) */
  url: varchar("url", { length: 512 }).notNull(),
  /** Original file name uploaded by user */
  filename: varchar("filename", { length: 256 }).notNull(),
  /** Display title shown to users */
  title: varchar("title", { length: 256 }).notNull(),
  /** Optional description */
  description: text("description"),
  /** Category for filtering & display */
  category: mysqlEnum("category", ["ebook", "guide", "training", "template", "other"]).default("other").notNull(),
  /** MIME type */
  mimeType: varchar("mimeType", { length: 128 }).notNull(),
  /** File size in bytes */
  sizeBytes: bigint("sizeBytes", { mode: "number" }).notNull(),
  /** Whether the file is publicly downloadable */
  isPublic: boolean("isPublic").default(true).notNull(),
  /** Optional price (in USD cents). 0 = free. */
  priceCents: int("priceCents").default(0).notNull(),
  /** Number of times downloaded */
  downloadCount: int("downloadCount").default(0).notNull(),
  /** Uploader user id */
  uploadedBy: int("uploadedBy").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type FileRow = typeof files.$inferSelect;
export type InsertFile = typeof files.$inferInsert;

/**
 * Leads table for storing form submissions from the website.
 */
export const leads = mysqlTable("leads", {
  id: int("id").autoincrement().primaryKey(),
  /** Form type: software, training, data, contact, lead_magnet */
  formType: varchar("formType", { length: 64 }).notNull(),
  name: varchar("name", { length: 256 }).notNull(),
  email: varchar("email", { length: 320 }),
  phone: varchar("phone", { length: 64 }),
  /** JSON-encoded payload of the form */
  payload: text("payload"),
  /** Source page (e.g. /services) */
  source: varchar("source", { length: 256 }),
  /** Status: new, contacted, converted, archived */
  status: mysqlEnum("status", ["new", "contacted", "converted", "archived"]).default("new").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Lead = typeof leads.$inferSelect;
export type InsertLead = typeof leads.$inferInsert;

/**
 * Official certification records.
 * Compatible with MySQL today and easy to mirror in Supabase/Postgres later.
 */
export const certificates = mysqlTable("certifications_data", {
  id: int("id").autoincrement().primaryKey(),
  certificationId: varchar("certificationId", { length: 32 }).notNull().unique(),
  fullName: varchar("fullName", { length: 256 }).notNull(),
  email: varchar("email", { length: 320 }),
  phone: varchar("phone", { length: 64 }),
  trainingName: varchar("trainingName", { length: 256 }).notNull(),
  level: mysqlEnum("level", [
    "Beginner / Debutant",
    "Intermediate / Intermediaire",
    "Advanced / Avance",
    "Expert",
    "Mastery / Maitrise",
  ]).default("Beginner / Debutant").notNull(),
  documentType: varchar("documentType", { length: 128 }).default("Certificate of Completion").notNull(),
  status: mysqlEnum("certificateStatus", ["Valid", "Revoked", "Expired", "Valide", "Reussi"]).default("Valid").notNull(),
  score: int("score"),
  issueDate: varchar("issueDate", { length: 10 }).notNull(),
  securityToken: varchar("securityToken", { length: 128 }),
  participantImageUrl: varchar("participantImageUrl", { length: 1024 }),
  qrCodeUrl: varchar("qrCodeUrl", { length: 1024 }),
  pdfUrl: varchar("pdfUrl", { length: 1024 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Certificate = typeof certificates.$inferSelect;
export type InsertCertificate = typeof certificates.$inferInsert;

export const certificationLogs = mysqlTable("certification_logs", {
  id: int("id").autoincrement().primaryKey(),
  certificationId: varchar("certificationId", { length: 32 }).notNull(),
  status: mysqlEnum("verificationStatus", ["Valid", "Revoked", "Expired", "Invalid", "NotFound"]).notNull(),
  ipAddress: varchar("ipAddress", { length: 128 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type CertificationLog = typeof certificationLogs.$inferSelect;
export type InsertCertificationLog = typeof certificationLogs.$inferInsert;

export const payments = mysqlTable("payments", {
  id: int("id").autoincrement().primaryKey(),
  transactionId: varchar("transactionId", { length: 128 }).notNull().unique(),
  provider: mysqlEnum("paymentProvider", ["flutterwave", "cinetpay"]).notNull(),
  status: mysqlEnum("paymentStatus", ["pending", "successful", "failed", "cancelled"]).default("pending").notNull(),
  fullName: varchar("fullName", { length: 256 }).notNull(),
  email: varchar("email", { length: 320 }).notNull(),
  phone: varchar("phone", { length: 64 }).notNull(),
  product: varchar("product", { length: 256 }).notNull(),
  deliveryMode: varchar("deliveryMode", { length: 64 }).notNull(),
  amount: varchar("amount", { length: 32 }).notNull(),
  currency: varchar("currency", { length: 8 }).notNull(),
  deliveryAmountCdf: int("deliveryAmountCdf").default(0).notNull(),
  providerReference: varchar("providerReference", { length: 256 }),
  paymentUrl: varchar("paymentUrl", { length: 1024 }),
  rawPayload: text("rawPayload"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Payment = typeof payments.$inferSelect;
export type InsertPayment = typeof payments.$inferInsert;
