import { desc, eq, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  Certificate,
  InsertCertificate,
  InsertFile,
  InsertLead,
  InsertPayment,
  InsertUser,
  certificates,
  certificationLogs,
  files,
  leads,
  payments,
  users,
} from "../drizzle/schema";
import {
  CertificateInput,
  CertificateRecord,
  getQrCodeUrl,
  normalizeCertificateStatus,
  seedCertificates,
} from "../shared/certifications";
import {
  createCertificateSecurityToken,
  getShortCertificateToken,
  verifyCertificateSecurityToken,
} from "./certificateSecurity";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;
let memoryCertificates: CertificateRecord[] = [...seedCertificates];
const deletedMemoryCertificateIds = new Set<string>();
const memoryCertificationLogs: Array<{ certificationId: string; status: string; ipAddress?: string | null; createdAt: Date }> = [];
const memoryPayments: InsertPayment[] = [];

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// =====================================================================
// FILES
// =====================================================================

export async function listFiles(opts?: { onlyPublic?: boolean; category?: string }) {
  const db = await getDb();
  if (!db) return [];
  const where = [] as any[];
  if (opts?.onlyPublic) where.push(eq(files.isPublic, true));
  if (opts?.category) where.push(eq(files.category, opts.category as any));
  const query = db.select().from(files).orderBy(desc(files.createdAt));
  const rows = where.length
    ? await query.where(where.length === 1 ? where[0] : sql`${where[0]} AND ${where[1]}`)
    : await query;
  return rows;
}

export async function getFileById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const rows = await db.select().from(files).where(eq(files.id, id)).limit(1);
  return rows[0];
}

export async function createFile(file: InsertFile) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(files).values(file);
  // @ts-ignore - mysql2 returns insertId
  const insertId = result[0]?.insertId ?? (result as any).insertId;
  return await getFileById(insertId);
}

export async function deleteFile(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(files).where(eq(files.id, id));
}

export async function incrementDownloadCount(id: number) {
  const db = await getDb();
  if (!db) return;
  await db
    .update(files)
    .set({ downloadCount: sql`${files.downloadCount} + 1` })
    .where(eq(files.id, id));
}

// =====================================================================
// LEADS
// =====================================================================

export async function createLead(lead: InsertLead) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(leads).values(lead);
  // @ts-ignore
  return result[0]?.insertId ?? (result as any).insertId;
}

export async function listLeads(opts?: { status?: string; limit?: number }) {
  const db = await getDb();
  if (!db) return [];
  const query = db.select().from(leads).orderBy(desc(leads.createdAt)).limit(opts?.limit ?? 100);
  if (opts?.status) {
    return await query.where(eq(leads.status, opts.status as any));
  }
  return await query;
}

export async function updateLeadStatus(id: number, status: "new" | "contacted" | "converted" | "archived") {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(leads).set({ status }).where(eq(leads.id, id));
}

// =====================================================================
// PAYMENTS
// =====================================================================

export async function createPaymentRecord(payment: InsertPayment) {
  const db = await getDb();
  if (!db) {
    memoryPayments.push(payment);
    return;
  }

  await db.insert(payments).values(payment).onDuplicateKeyUpdate({
    set: {
      status: payment.status,
      providerReference: payment.providerReference ?? null,
      paymentUrl: payment.paymentUrl ?? null,
      rawPayload: payment.rawPayload ?? null,
    },
  });
}

export async function updatePaymentStatus(
  transactionId: string,
  status: "pending" | "successful" | "failed" | "cancelled",
  details?: { providerReference?: string | null; rawPayload?: string | null },
) {
  const db = await getDb();
  if (!db) {
    const payment = memoryPayments.find(item => item.transactionId === transactionId);
    if (payment) {
      payment.status = status;
      payment.providerReference = details?.providerReference ?? payment.providerReference ?? null;
      payment.rawPayload = details?.rawPayload ?? payment.rawPayload ?? null;
    }
    return;
  }

  await db
    .update(payments)
    .set({
      status,
      providerReference: details?.providerReference ?? null,
      rawPayload: details?.rawPayload ?? null,
    })
    .where(eq(payments.transactionId, transactionId));
}

// =====================================================================
// CERTIFICATES
// =====================================================================

function toCertificateRecord(row: Certificate | CertificateRecord): CertificateRecord {
  if ("certificationId" in row) {
    const baseCertificate = {
      id: row.certificationId,
      fullName: row.fullName,
      email: row.email,
      phone: row.phone,
      trainingName: row.trainingName,
      level: row.level,
      documentType: "Certificate of Completion" as const,
      status: normalizeCertificateStatus(row.status),
      score: row.score,
      issueDate: row.issueDate,
      participantImageUrl: row.participantImageUrl,
      qrCodeUrl: row.qrCodeUrl ?? getQrCodeUrl(row.certificationId),
      pdfUrl: row.pdfUrl,
    };
    const token = row.securityToken ?? createCertificateSecurityToken(baseCertificate);
    const integrityValid = verifyCertificateSecurityToken(baseCertificate, token);
    return {
      ...baseCertificate,
      shortSecurityToken: getShortCertificateToken(token),
      integrityValid,
    };
  }

  const token = createCertificateSecurityToken(row);
  return {
    ...row,
    status: normalizeCertificateStatus(row.status),
    qrCodeUrl: row.qrCodeUrl ?? getQrCodeUrl(row.id),
    shortSecurityToken: getShortCertificateToken(token),
    integrityValid: true,
  };
}

function mergeSeedAndRows(rows: CertificateRecord[]) {
  const byId = new Map<string, CertificateRecord>();
  seedCertificates.forEach(cert => {
    if (!deletedMemoryCertificateIds.has(cert.id.toUpperCase())) byId.set(cert.id, cert);
  });
  rows.forEach(cert => byId.set(cert.id, cert));
  return Array.from(byId.values()).sort((a, b) => b.issueDate.localeCompare(a.issueDate));
}

export async function listCertificates(): Promise<CertificateRecord[]> {
  const db = await getDb();
  if (!db) return mergeSeedAndRows(memoryCertificates);

  const rows = await db.select().from(certificates).orderBy(desc(certificates.createdAt));
  return mergeSeedAndRows(rows.map(toCertificateRecord));
}

export async function getCertificateByCertId(certId: string): Promise<CertificateRecord | undefined> {
  const normalized = certId.trim().toUpperCase();
  const db = await getDb();

  if (!db) {
    if (deletedMemoryCertificateIds.has(normalized)) return undefined;
    return memoryCertificates.find(cert => cert.id.toUpperCase() === normalized);
  }

  const rows = await db.select().from(certificates).where(eq(certificates.certificationId, normalized)).limit(1);
  if (rows[0]) return toCertificateRecord(rows[0]);
  return seedCertificates.find(cert => cert.id.toUpperCase() === normalized);
}

export type CertificateVerificationResult =
  | { certificate: CertificateRecord; status: "Valid" | "Revoked" | "Expired"; shortSecurityToken: string }
  | { certificate: null; status: "Invalid" | "NotFound"; message: string };

export async function logCertificateVerification(input: {
  certificationId: string;
  status: "Valid" | "Revoked" | "Expired" | "Invalid" | "NotFound";
  ipAddress?: string | null;
}) {
  const db = await getDb();
  if (!db) {
    memoryCertificationLogs.push({
      certificationId: input.certificationId,
      status: input.status,
      ipAddress: input.ipAddress ?? null,
      createdAt: new Date(),
    });
    return;
  }

  try {
    await db.insert(certificationLogs).values({
      certificationId: input.certificationId,
      status: input.status,
      ipAddress: input.ipAddress ?? null,
    });
  } catch (error) {
    console.warn("[certification_logs] Unable to write verification log:", error);
  }
}

export async function verifyCertificateByCertId(
  certId: string,
  opts?: { ipAddress?: string | null },
): Promise<CertificateVerificationResult> {
  const normalized = certId.trim().toUpperCase();
  const certificate = await getCertificateByCertId(normalized);

  if (!certificate) {
    await logCertificateVerification({ certificationId: normalized, status: "NotFound", ipAddress: opts?.ipAddress });
    return { certificate: null, status: "NotFound", message: "Certificat introuvable" };
  }

  if (certificate.integrityValid === false) {
    await logCertificateVerification({ certificationId: normalized, status: "Invalid", ipAddress: opts?.ipAddress });
    return { certificate: null, status: "Invalid", message: "Certificat invalide ou altéré" };
  }

  const status = normalizeCertificateStatus(certificate.status);
  const token = certificate.shortSecurityToken ?? getShortCertificateToken(createCertificateSecurityToken(certificate));
  await logCertificateVerification({ certificationId: normalized, status, ipAddress: opts?.ipAddress });
  return { certificate: { ...certificate, status, shortSecurityToken: token, integrityValid: true }, status, shortSecurityToken: token };
}

function generateNextCertificateId(existing: CertificateRecord[], issueDate: string) {
  const parsedYear = new Date(issueDate).getFullYear();
  const year = Number.isFinite(parsedYear) ? parsedYear : new Date().getFullYear();
  const prefix = `GTC-EX-${year}-`;
  const used = new Set(existing.map(cert => cert.id));
  let sequence =
    existing.reduce((max, cert) => {
      if (!cert.id.startsWith(prefix)) return max;
      const match = cert.id.match(/^GTC-EX-\d{4}-(\d{4})$/);
      return match ? Math.max(max, Number(match[1])) : max;
    }, 0) + 1;

  let certId = `${prefix}${String(sequence).padStart(4, "0")}`;
  while (used.has(certId)) {
    sequence += 1;
    certId = `${prefix}${String(sequence).padStart(4, "0")}`;
  }
  return certId;
}

export async function createCertificate(input: CertificateInput): Promise<CertificateRecord> {
  const allCertificates = await listCertificates();
  const certId = generateNextCertificateId(allCertificates, input.issueDate);
  const certificate: CertificateRecord = {
    id: certId,
    ...input,
    documentType: input.documentType ?? "Certificate of Completion",
    status: normalizeCertificateStatus(input.status),
    qrCodeUrl: getQrCodeUrl(certId),
    pdfUrl: null,
  };
  const securityToken = createCertificateSecurityToken(certificate);
  certificate.shortSecurityToken = getShortCertificateToken(securityToken);
  certificate.integrityValid = true;

  const db = await getDb();
  if (!db) {
    memoryCertificates = [certificate, ...memoryCertificates];
    return certificate;
  }

  const row: InsertCertificate = {
    certificationId: certId,
    fullName: certificate.fullName,
    email: certificate.email ?? null,
    phone: certificate.phone ?? null,
    trainingName: certificate.trainingName,
    level: certificate.level,
    documentType: certificate.documentType,
    status: certificate.status,
    score: certificate.score ?? null,
    issueDate: certificate.issueDate,
    securityToken,
    participantImageUrl: certificate.participantImageUrl ?? null,
    qrCodeUrl: certificate.qrCodeUrl ?? getQrCodeUrl(certId),
    pdfUrl: certificate.pdfUrl ?? null,
  };
  await db.insert(certificates).values(row);
  return certificate;
}

export async function updateCertificate(certId: string, input: CertificateInput): Promise<CertificateRecord> {
  const normalized = certId.trim().toUpperCase();
  const certificate: CertificateRecord = {
    id: normalized,
    ...input,
    documentType: input.documentType ?? "Certificate of Completion",
    status: normalizeCertificateStatus(input.status),
    qrCodeUrl: getQrCodeUrl(normalized),
    pdfUrl: null,
  };
  const securityToken = createCertificateSecurityToken(certificate);
  certificate.shortSecurityToken = getShortCertificateToken(securityToken);
  certificate.integrityValid = true;
  const db = await getDb();

  if (!db) {
    deletedMemoryCertificateIds.delete(normalized);
    memoryCertificates = mergeSeedAndRows(memoryCertificates).map(cert =>
      cert.id.toUpperCase() === normalized ? certificate : cert,
    );
    return certificate;
  }

  await db
    .update(certificates)
    .set({
      fullName: certificate.fullName,
      email: certificate.email ?? null,
      phone: certificate.phone ?? null,
      trainingName: certificate.trainingName,
      level: certificate.level,
      documentType: certificate.documentType,
      status: certificate.status,
      score: certificate.score ?? null,
      issueDate: certificate.issueDate,
      securityToken,
      participantImageUrl: certificate.participantImageUrl ?? null,
      qrCodeUrl: certificate.qrCodeUrl ?? getQrCodeUrl(normalized),
      pdfUrl: certificate.pdfUrl ?? null,
    })
    .where(eq(certificates.certificationId, normalized));
  return certificate;
}

export async function deleteCertificate(certId: string): Promise<void> {
  const normalized = certId.trim().toUpperCase();
  const db = await getDb();
  if (!db) {
    deletedMemoryCertificateIds.add(normalized);
    memoryCertificates = memoryCertificates.filter(cert => cert.id.toUpperCase() !== normalized);
    return;
  }

  await db.delete(certificates).where(eq(certificates.certificationId, normalized));
}
