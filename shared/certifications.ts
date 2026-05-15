export type CertificateStatus = "Valid" | "Revoked" | "Expired" | "Valide" | "Reussi";
export type PublicCertificateStatus = "Valid" | "Revoked" | "Expired";

export type CertificateLevel =
  | "Beginner / Debutant"
  | "Intermediate / Intermediaire"
  | "Advanced / Avance"
  | "Expert"
  | "Mastery / Maitrise";

export type CertificateRecord = {
  id: string;
  fullName: string;
  email?: string | null;
  phone?: string | null;
  trainingName: string;
  level: CertificateLevel;
  documentType: "Certificate of Completion";
  status: CertificateStatus;
  score?: number | null;
  issueDate: string;
  participantImageUrl?: string | null;
  qrCodeUrl?: string | null;
  pdfUrl?: string | null;
  shortSecurityToken?: string;
  integrityValid?: boolean;
};

export type CertificateInput = Omit<CertificateRecord, "id" | "qrCodeUrl" | "pdfUrl"> & {
  documentType?: "Certificate of Completion";
};

export const CERTIFICATE_LEVELS: CertificateLevel[] = [
  "Beginner / Debutant",
  "Intermediate / Intermediaire",
  "Advanced / Avance",
  "Expert",
  "Mastery / Maitrise",
];

export const CERTIFICATE_TRAININGS = [
  "Excel & Data Analyst",
  "AI & Automation Basics",
  "Data Analytics Essentials",
  "Automation & Digital Solutions",
] as const;

export const GTC_PUBLIC_CERTIFICATION_ORIGIN = "https://www.generaltechconsult.com";

export function formatCertificateId(value: string) {
  const clean = value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 15);
  const parts = [clean.slice(0, 3), clean.slice(3, 5), clean.slice(5, 9), clean.slice(9, 13)].filter(Boolean);
  return parts.join("-");
}

export function normalizeCertificateId(value: string) {
  return formatCertificateId(value).toUpperCase();
}

export function getPublicVerificationUrl(id: string) {
  return `${GTC_PUBLIC_CERTIFICATION_ORIGIN}/certifications?id=${encodeURIComponent(id)}`;
}

export function getQrCodeUrl(id: string, size = 180) {
  return `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&margin=12&data=${encodeURIComponent(
    getPublicVerificationUrl(id),
  )}`;
}

export function normalizeCertificateStatus(status: CertificateStatus | string): PublicCertificateStatus {
  if (status === "Revoked") return "Revoked";
  if (status === "Expired") return "Expired";
  return "Valid";
}

export const seedCertificates: CertificateRecord[] = [
  {
    id: "GTC-EX-2026-0001",
    fullName: "Christian ONYA",
    email: "christian.onya@example.com",
    phone: "+243 829 664 720",
    trainingName: "Excel & Data Analyst",
    level: "Advanced / Avance",
    documentType: "Certificate of Completion",
    status: "Valid",
    score: 94,
    issueDate: "2026-05-03",
    participantImageUrl: "/assets/images/christian-onya.webp",
  },
  {
    id: "GTC-EX-2025-0002",
    fullName: "Amina Diallo",
    email: "amina.diallo@example.com",
    phone: "+221 77 123 45 67",
    trainingName: "AI & Automation Basics",
    level: "Intermediate / Intermediaire",
    documentType: "Certificate of Completion",
    status: "Valid",
    score: 88,
    issueDate: "2025-11-18",
    participantImageUrl: "/assets/images/certified-1.webp",
  },
  {
    id: "GTC-EX-2024-0003",
    fullName: "Samuel Kabasele",
    email: "samuel.kabasele@example.com",
    phone: "+243 810 222 333",
    trainingName: "Data Analytics Essentials",
    level: "Beginner / Debutant",
    documentType: "Certificate of Completion",
    status: "Valid",
    score: 82,
    issueDate: "2024-08-22",
    participantImageUrl: "/assets/images/certified-2.webp",
  },
  {
    id: "GTC-EX-2026-0004",
    fullName: "Grace Nsimba",
    email: "grace.nsimba@example.com",
    phone: "+243 990 456 789",
    trainingName: "Automation & Digital Solutions",
    level: "Expert",
    documentType: "Certificate of Completion",
    status: "Valid",
    score: 96,
    issueDate: "2026-02-14",
    participantImageUrl: "/assets/images/certified-3.webp",
  },
  {
    id: "GTC-EX-2025-0005",
    fullName: "Jean-Marc Tshiama",
    email: "jean.tshiama@example.com",
    phone: "+243 841 555 909",
    trainingName: "Excel & Data Analyst",
    level: "Mastery / Maitrise",
    documentType: "Certificate of Completion",
    status: "Valid",
    score: 98,
    issueDate: "2025-06-09",
    participantImageUrl: "/assets/images/certified-1.webp",
  },
  {
    id: "GTC-EX-2024-0006",
    fullName: "Fatou Mbaye",
    email: "fatou.mbaye@example.com",
    phone: "+221 76 900 12 34",
    trainingName: "AI & Automation Basics",
    level: "Advanced / Avance",
    documentType: "Certificate of Completion",
    status: "Valid",
    score: 91,
    issueDate: "2024-12-05",
    participantImageUrl: "/assets/images/certified-2.webp",
  },
  {
    id: "GTC-EX-2026-0007",
    fullName: "David Okafor",
    email: "david.okafor@example.com",
    phone: "+234 803 456 7890",
    trainingName: "Data Analytics Essentials",
    level: "Intermediate / Intermediaire",
    documentType: "Certificate of Completion",
    status: "Valid",
    score: 86,
    issueDate: "2026-04-17",
    participantImageUrl: "/assets/images/certified-3.webp",
  },
  {
    id: "GTC-EX-2025-0008",
    fullName: "Nadia El Mansouri",
    email: "nadia.mansouri@example.com",
    phone: "+212 661 234 567",
    trainingName: "Automation & Digital Solutions",
    level: "Expert",
    documentType: "Certificate of Completion",
    status: "Valid",
    score: 93,
    issueDate: "2025-03-27",
    participantImageUrl: "/assets/images/certified-1.webp",
  },
  {
    id: "GTC-EX-2024-0009",
    fullName: "Linda Mbuyi",
    email: "linda.mbuyi@example.com",
    phone: "+243 971 888 101",
    trainingName: "Excel & Data Analyst",
    level: "Beginner / Debutant",
    documentType: "Certificate of Completion",
    status: "Valid",
    score: 79,
    issueDate: "2024-05-19",
    participantImageUrl: "/assets/images/certified-2.webp",
  },
  {
    id: "GTC-EX-2026-0010",
    fullName: "Mohamed Traore",
    email: "mohamed.traore@example.com",
    phone: "+225 07 12 34 56 78",
    trainingName: "Automation & Digital Solutions",
    level: "Mastery / Maitrise",
    documentType: "Certificate of Completion",
    status: "Valid",
    score: 97,
    issueDate: "2026-01-28",
    participantImageUrl: "/assets/images/certified-3.webp",
  },
].map(cert => ({
  ...cert,
  qrCodeUrl: getQrCodeUrl(cert.id),
  pdfUrl: null,
})) as CertificateRecord[];
