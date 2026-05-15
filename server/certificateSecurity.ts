import { createHmac, timingSafeEqual } from "node:crypto";
import { CertificateRecord, normalizeCertificateStatus } from "../shared/certifications";

const FALLBACK_SECRET = "gtc-local-certificate-secret-change-me";

function getCertificateSecret() {
  return process.env.GTC_CERTIFICATE_SECRET || process.env.JWT_SECRET || FALLBACK_SECRET;
}

export function createCertificateSecurityToken(certificate: Pick<CertificateRecord, "id" | "fullName" | "issueDate">) {
  return createHmac("sha256", getCertificateSecret())
    .update(`${certificate.id}|${certificate.fullName.trim()}|${certificate.issueDate}`)
    .digest("hex");
}

export function getShortCertificateToken(token: string) {
  return token.slice(0, 10).toUpperCase();
}

export function verifyCertificateSecurityToken(
  certificate: Pick<CertificateRecord, "id" | "fullName" | "issueDate">,
  storedToken?: string | null,
) {
  const expected = createCertificateSecurityToken(certificate);
  if (!storedToken) return true;

  const left = Buffer.from(expected);
  const right = Buffer.from(storedToken);
  return left.length === right.length && timingSafeEqual(left, right);
}

export function getPublicCertificateStatus(status: CertificateRecord["status"] | string, integrityValid: boolean) {
  if (!integrityValid) return "Invalid" as const;
  return normalizeCertificateStatus(status);
}
