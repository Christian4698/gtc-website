import { FormEvent, useEffect, useMemo, useState } from "react";
import Layout from "@/components/Layout";
import SEOHelmet from "@/components/SEOHelmet";
import { trpc } from "@/lib/trpc";
import { CertificateRecord, formatCertificateId, getQrCodeUrl, normalizeCertificateStatus } from "@shared/certifications";
import {
  Award,
  BadgeCheck,
  CalendarDays,
  FileCheck2,
  Gauge,
  GraduationCap,
  IdCard,
  Search,
  UserRound,
} from "lucide-react";

const certifiedProfiles = [
  {
    image: "/assets/images/certified-1.webp",
    name: "Participant GTC",
    training: "Excel & Data Analyst",
  },
  {
    image: "/assets/images/certified-2.webp",
    name: "Participant GTC",
    training: "AI & Automation Basics",
  },
  {
    image: "/assets/images/certified-3.webp",
    name: "Participant GTC",
    training: "Data Analytics Essentials",
  },
];

function displayStatus(status: CertificateRecord["status"]) {
  return status === "Reussi" ? "Réussi" : status;
}

function publicDisplayStatus(status: CertificateRecord["status"]) {
  const normalized = normalizeCertificateStatus(status);
  if (normalized === "Revoked") return "Révoqué";
  if (normalized === "Expired") return "Expiré";
  return "Valide";
}

function statusBadgeClass(status: CertificateRecord["status"]) {
  const normalized = normalizeCertificateStatus(status);
  if (normalized === "Revoked") return "bg-red-50 text-red-700";
  if (normalized === "Expired") return "bg-amber-50 text-amber-700";
  return "bg-green-50 text-green-700";
}

export default function Certifications() {
  const [inputId, setInputId] = useState("");
  const [verifiedId, setVerifiedId] = useState("");
  const [hasSearched, setHasSearched] = useState(false);

  const certificateQuery = trpc.certifications.verify.useQuery(
    { id: verifiedId },
    { enabled: Boolean(verifiedId), retry: false },
  );
  const idsQuery = trpc.certifications.listIds.useQuery(undefined, { retry: false });

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const urlId = params.get("id")?.trim();
    if (!urlId) return;
    const formattedId = formatCertificateId(urlId);
    setInputId(formattedId);
    setVerifiedId(formattedId);
    setHasSearched(true);
  }, []);

  const verification = certificateQuery.data ?? null;
  const certificate = verification?.certificate ?? null;
  const ids = useMemo(() => idsQuery.data ?? [], [idsQuery.data]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const normalizedId = formatCertificateId(inputId);
    setInputId(normalizedId);
    setVerifiedId(normalizedId);
    setHasSearched(Boolean(normalizedId));

    if (normalizedId) {
      window.history.replaceState(null, "", `/certifications?id=${encodeURIComponent(normalizedId)}`);
    }
  };

  return (
    <Layout>
      <SEOHelmet
        title="Vérification des certificats GTC - General Tech Consult"
        description="Vérifiez l'authenticité des certificats délivrés par General Tech Consult grâce à un identifiant unique."
        keywords="certificat GTC, verification certificat, General Tech Consult, formation certifiee"
      />

      <section className="bg-[#0B1F3A] pt-32 pb-20 text-white">
        <div className="container max-w-7xl mx-auto px-4">
          <div className="gtc-line-separator mb-8"></div>
          <h1 className="text-4xl md:text-6xl font-bold leading-tight mb-6">
            Vérification des certificats GTC
          </h1>
          <p className="text-lg md:text-xl text-[#00D4FF] max-w-3xl">
            Cette page permet de vérifier l’authenticité des certificats délivrés par General Tech Consult.
          </p>
        </div>
      </section>

      <section className="bg-[#F5F7FA] py-16 md:py-24">
        <div className="container max-w-7xl mx-auto px-4">
          <div className="mb-14">
            <div className="flex items-center gap-3 mb-4">
              <Award className="text-[#1E90FF]" size={28} />
              <h2 className="text-3xl md:text-4xl font-bold text-[#0B1F3A]">
                Quelques certifiés GTC
              </h2>
            </div>
            <p className="text-[#64748B] max-w-3xl">
              Découvrez quelques profils certifiés par General Tech Consult. Chaque certificat peut être vérifié grâce à son identifiant unique.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
              {certifiedProfiles.map((profile, index) => (
                <article
                  key={`${profile.training}-${index}`}
                  className="bg-white rounded-lg overflow-hidden shadow-sm border border-slate-200"
                >
                  <img
                    src={profile.image}
                    alt={`${profile.name} - ${profile.training}`}
                    loading="lazy"
                    decoding="async"
                    className="h-64 w-full object-cover"
                  />
                  <div className="p-5">
                    <span className="inline-flex items-center gap-2 rounded-full bg-[#E8F7FF] px-3 py-1 text-xs font-semibold text-[#0B78D0]">
                      <BadgeCheck size={14} />
                      Certifié GTC
                    </span>
                    <h3 className="mt-4 text-xl font-bold text-[#0B1F3A]">{profile.name}</h3>
                    <p className="mt-1 text-sm text-[#64748B]">{profile.training}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md border border-slate-200 p-6 md:p-8">
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-4">
              <label className="sr-only" htmlFor="certificate-id">
                ID du certificat
              </label>
              <input
                id="certificate-id"
                value={inputId}
                onChange={event => setInputId(formatCertificateId(event.target.value))}
                placeholder="Entrez l’ID du certificat (ex : GTC-EX-2026-0001)"
                inputMode="text"
                maxLength={18}
                className="min-h-12 rounded border border-slate-300 px-4 font-semibold tracking-wide text-[#0B1F3A] outline-none transition focus:border-[#1E90FF] focus:ring-4 focus:ring-[#1E90FF]/15"
              />
              <button type="submit" className="gtc-btn-primary inline-flex items-center justify-center gap-2">
                <Search size={18} />
                Vérifier
              </button>
            </form>

            {certificateQuery.isFetching && hasSearched && (
              <div className="mt-8 rounded-lg border border-[#1E90FF]/20 bg-[#E8F7FF] p-5 text-[#0B1F3A]">
                Vérification en cours...
              </div>
            )}

            {!certificateQuery.isFetching && hasSearched && certificate && (
              <CertificateResult certificate={certificate} />
            )}

            {!certificateQuery.isFetching && hasSearched && !certificate && verifiedId && (
              <div className="gtc-animate-in mt-8 rounded-lg border border-red-200 bg-red-50 p-5 text-red-700">
                {verification?.status === "Invalid"
                  ? "Certificat invalide ou altéré"
                  : "Certification non reconnue ou introuvable."}
              </div>
            )}

            {ids.length > 0 && (
              <div className="mt-10 border-t border-slate-200 pt-6">
                <p className="text-sm font-semibold text-[#0B1F3A]">Liste des IDs disponibles :</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {ids.map(id => (
                    <button
                      key={id}
                      type="button"
                      onClick={() => {
                        setInputId(id);
                        setVerifiedId(id);
                        setHasSearched(true);
                        window.history.replaceState(null, "", `/certifications?id=${encodeURIComponent(id)}`);
                      }}
                      className="rounded border border-[#1E90FF]/25 bg-[#E8F7FF] px-3 py-1.5 text-xs font-semibold text-[#0B1F3A] hover:border-[#1E90FF]"
                    >
                      {id}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </section>
    </Layout>
  );
}

function CertificateResult({ certificate }: { certificate: CertificateRecord }) {
  const imageUrl = certificate.participantImageUrl || "/assets/images/logo_gtc.webp";
  const fields = [
    { icon: UserRound, label: "Nom complet", value: certificate.fullName },
    { icon: Award, label: "Formation suivie", value: certificate.trainingName },
    { icon: GraduationCap, label: "Niveau", value: certificate.level },
    { icon: FileCheck2, label: "Type de document", value: certificate.documentType },
    { icon: BadgeCheck, label: "Statut", value: `${displayStatus(certificate.status)} / Réussi` },
    { icon: Gauge, label: "Score", value: certificate.score != null ? `${certificate.score}%` : "Non renseigné" },
    { icon: CalendarDays, label: "Date de certification", value: certificate.issueDate },
    { icon: IdCard, label: "ID du certificat", value: certificate.id },
  ];
  fields[4] = { icon: BadgeCheck, label: "Statut", value: publicDisplayStatus(certificate.status) };
  fields.push({
    icon: FileCheck2,
    label: "Token de sécurité",
    value: certificate.shortSecurityToken ?? "Non renseigné",
  });

  return (
    <div className="gtc-animate-in mt-8 rounded-lg border border-[#1E90FF]/20 bg-gradient-to-br from-white to-[#F4FBFF] p-6 shadow-lg">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex-1">
          <div className={`mb-6 inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold ${statusBadgeClass(certificate.status)}`}>
            <BadgeCheck size={18} />
            Certificat authentique - {publicDisplayStatus(certificate.status)}
          </div>

          <div className="mb-6 flex flex-col gap-4 rounded-lg border border-slate-200 bg-white p-4 sm:flex-row sm:items-center">
            <img
              src={imageUrl}
              alt={`Portrait de ${certificate.fullName}`}
              loading="lazy"
              decoding="async"
              className="h-24 w-24 rounded-full border-4 border-[#E8F7FF] object-cover shadow-sm"
              onError={event => {
                event.currentTarget.src = "/assets/images/logo_gtc.webp";
              }}
            />
            <div>
              <p className="text-sm font-semibold uppercase text-[#64748B]">Certifié GTC</p>
              <h3 className="text-2xl font-bold text-[#0B1F3A]">{certificate.fullName}</h3>
              <p className="text-[#1E90FF]">{certificate.trainingName}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {fields.map(field => (
              <div key={field.label} className="rounded border border-slate-200 bg-white p-4">
                <div className="flex items-center gap-2 text-xs font-semibold uppercase text-[#64748B]">
                  <field.icon size={15} className="text-[#1E90FF]" />
                  {field.label}
                </div>
                <p className="mt-2 font-semibold text-[#0B1F3A]">{field.value}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-4 text-center shadow-sm">
          <img
            src={certificate.qrCodeUrl || getQrCodeUrl(certificate.id)}
            alt={`QR code de verification ${certificate.id}`}
            loading="lazy"
            decoding="async"
            className="mx-auto h-40 w-40"
          />
          <p className="mt-3 text-xs font-semibold text-[#64748B]">Lien de vérification QR</p>
          <p className="mt-2 text-[11px] text-[#64748B]">
            La preuve officielle est cette page GTC, pas le PDF imprimé.
          </p>
        </div>
      </div>
    </div>
  );
}
