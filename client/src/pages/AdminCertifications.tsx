import { FormEvent, useMemo, useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { trpc } from "@/lib/trpc";
import {
  CERTIFICATE_LEVELS,
  CERTIFICATE_TRAININGS,
  CertificateLevel,
  CertificateRecord,
  CertificateStatus,
  getPublicVerificationUrl,
  getQrCodeUrl,
} from "@shared/certifications";
import { BadgeCheck, Edit, FileText, Plus, QrCode, Search, Trash2, Upload } from "lucide-react";

type FormState = {
  fullName: string;
  email: string;
  phone: string;
  trainingName: string;
  level: CertificateLevel;
  documentType: "Certificate of Completion";
  status: CertificateStatus;
  score: string;
  issueDate: string;
  participantImageUrl: string;
};

const emptyForm = (): FormState => ({
  fullName: "",
  email: "",
  phone: "",
  trainingName: CERTIFICATE_TRAININGS[0],
  level: CERTIFICATE_LEVELS[0],
  documentType: "Certificate of Completion",
  status: "Valid",
  score: "",
  issueDate: new Date().toISOString().slice(0, 10),
  participantImageUrl: "",
});

function toFormState(certificate: CertificateRecord): FormState {
  return {
    fullName: certificate.fullName,
    email: certificate.email ?? "",
    phone: certificate.phone ?? "",
    trainingName: certificate.trainingName,
    level: certificate.level,
    documentType: certificate.documentType,
    status: certificate.status,
    score: certificate.score != null ? String(certificate.score) : "",
    issueDate: certificate.issueDate,
    participantImageUrl: certificate.participantImageUrl ?? "",
  };
}

function toPayload(form: FormState) {
  return {
    fullName: form.fullName.trim(),
    email: form.email.trim() || null,
    phone: form.phone.trim() || null,
    trainingName: form.trainingName,
    level: form.level,
    documentType: "Certificate of Completion" as const,
    status: form.status,
    score: form.score === "" ? null : Number(form.score),
    issueDate: form.issueDate,
    participantImageUrl: form.participantImageUrl.trim() || null,
  };
}

function qrCodeUrl(id: string) {
  return getQrCodeUrl(id, 140);
}

function printCertificate(certificate: CertificateRecord) {
  const qrUrl = certificate.qrCodeUrl || getQrCodeUrl(certificate.id, 180);
  const score = certificate.score != null ? `${certificate.score}%` : "N/A";
  const imageUrl = certificate.participantImageUrl || "/assets/images/logo_gtc.webp";
  const shortToken = certificate.shortSecurityToken ?? "PENDING";
  const html = `<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <title>${certificate.id}</title>
  <style>
    @page { size: A4 landscape; margin: 0; }
    * { box-sizing: border-box; }
    body { margin: 0; font-family: Arial, sans-serif; color: #0B1F3A; background: #0B1F3A; }
    .page { width: 297mm; height: 210mm; padding: 18mm; background: linear-gradient(135deg, #0B1F3A 0%, #102B4C 48%, #07172C 100%); color: white; position: relative; overflow: hidden; }
    .frame { border: 2px solid rgba(0,212,255,.55); height: 100%; padding: 12mm; position: relative; background: rgba(255,255,255,.04); }
    .gold { color: #D6B15F; }
    .cyan { color: #00D4FF; }
    .top { display: flex; justify-content: space-between; align-items: center; }
    .logo { height: 62px; background: white; border-radius: 8px; padding: 8px; }
    .portrait { width: 86px; height: 86px; border-radius: 999px; object-fit: cover; border: 4px solid #00D4FF; background: white; }
    h1 { margin: 22px 0 6px; font-size: 42px; letter-spacing: 2px; text-transform: uppercase; }
    .subtitle { font-size: 15px; color: #D6EAFE; }
    .name { font-size: 44px; font-weight: 800; margin: 24px 0 12px; color: #fff; }
    .training { font-size: 26px; color: #00D4FF; font-weight: 700; }
    .grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin: 24px 0; }
    .box { border: 1px solid rgba(255,255,255,.18); padding: 12px; background: rgba(255,255,255,.07); min-height: 70px; }
    .label { font-size: 11px; text-transform: uppercase; color: #A7C5E8; margin-bottom: 7px; }
    .value { font-size: 16px; font-weight: 700; }
    .bottom { display: flex; justify-content: space-between; align-items: end; gap: 24px; position: absolute; left: 12mm; right: 12mm; bottom: 11mm; }
    .mention { max-width: 620px; line-height: 1.5; color: #D6EAFE; font-size: 14px; }
    .signature { margin-top: 18px; font-size: 16px; font-weight: 800; color: #fff; }
    .qr { background: white; padding: 10px; border-radius: 8px; width: 132px; height: 132px; }
  </style>
</head>
<body>
  <main class="page">
    <section class="frame">
      <div class="top">
        <img class="logo" src="/assets/images/logo_gtc.PNG" alt="GTC" />
        <img class="portrait" src="${imageUrl}" alt="${certificate.fullName}" />
      </div>
      <h1>Certificate of Completion</h1>
      <div class="subtitle">Private training certificate issued by General Tech Consult</div>
      <div class="name">${certificate.fullName}</div>
      <div class="training">${certificate.trainingName}</div>
      <div class="grid">
        <div class="box"><div class="label">Niveau</div><div class="value">${certificate.level}</div></div>
        <div class="box"><div class="label">Score</div><div class="value">${score}</div></div>
        <div class="box"><div class="label">Date</div><div class="value">${certificate.issueDate}</div></div>
        <div class="box"><div class="label">ID certificat</div><div class="value">${certificate.id}</div></div>
      </div>
      <div class="bottom">
        <div class="mention">
          <div>Certificate ID: ${certificate.id}</div>
          <div>Security token: ${shortToken}</div>
          <div>Verify this certificate online at generaltechconsult.com</div>
          <div>Verification URL: ${getPublicVerificationUrl(certificate.id)}</div>
          <div>The PDF is not the primary proof. The official proof is the GTC online verification page.</div>
          <div class="signature">Christian ONYA — Data Expert & Consultant Tech</div>
        </div>
        <img class="qr" src="${qrUrl}" alt="QR code" />
      </div>
    </section>
  </main>
  <script>window.addEventListener('load', () => setTimeout(() => window.print(), 300));</script>
</body>
</html>`;
  const printWindow = window.open("", "_blank", "width=1200,height=800");
  if (!printWindow) return;
  printWindow.document.open();
  printWindow.document.write(html);
  printWindow.document.close();
}

export default function AdminCertifications() {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="py-16 text-center text-slate-500">Chargement...</div>;
  }

  if (!user || user.role !== "admin") {
    return <AdminLogin />;
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Gestion des certificats GTC</h1>
          <p className="mt-2 text-slate-600">
            Ajoutez, modifiez et publiez les certificats officiels avec QR code et PDF imprimable.
          </p>
        </div>

        <CertificateForm />
        <CertificateTable />
      </div>
    </DashboardLayout>
  );
}

function AdminLogin() {
  const [username, setUsername] = useState("Admin_GTC");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const utils = trpc.useUtils();
  const login = trpc.auth.adminLogin.useMutation();

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    try {
      await login.mutateAsync({ username, password });
      await utils.auth.me.invalidate();
    } catch {
      setError("Identifiants incorrects.");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#F5F7FA] px-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Accès admin GTC</CardTitle>
          <CardDescription>Connectez-vous pour enregistrer et gérer les certifications.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Field label="Utilisateur">
              <Input value={username} onChange={event => setUsername(event.target.value)} autoComplete="username" required />
            </Field>
            <Field label="Mot de passe">
              <Input
                type="password"
                value={password}
                onChange={event => setPassword(event.target.value)}
                autoComplete="current-password"
                required
              />
            </Field>
            {error && <p className="text-sm font-medium text-red-600">{error}</p>}
            <Button type="submit" className="w-full" disabled={login.isPending}>
              {login.isPending ? "Connexion..." : "Afficher le formulaire"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

function CertificateForm({ editing, onDone }: { editing?: CertificateRecord; onDone?: () => void }) {
  const [form, setForm] = useState<FormState>(() => (editing ? toFormState(editing) : emptyForm()));
  const [createdId, setCreatedId] = useState("");
  const [uploading, setUploading] = useState(false);
  const utils = trpc.useUtils();
  const createCertificate = trpc.certifications.create.useMutation();
  const updateCertificate = trpc.certifications.update.useMutation();

  const setField = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm(prev => ({ ...prev, [key]: value }));
  };

  const handleImageUpload = async (file: File | undefined) => {
    if (!file) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const response = await fetch("/api/certification-image", {
        method: "POST",
        body: formData,
        credentials: "include",
      });
      if (!response.ok) throw new Error("Upload image échoué");
      const result = (await response.json()) as { url: string };
      setField("participantImageUrl", result.url);
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const payload = toPayload(form);
    const certificate = editing
      ? await updateCertificate.mutateAsync({ id: editing.id, data: payload })
      : await createCertificate.mutateAsync(payload);

    setCreatedId(certificate.id);
    if (!editing) setForm(emptyForm());
    utils.certifications.adminList.invalidate();
    utils.certifications.listIds.invalidate();
    onDone?.();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {editing ? <Edit size={20} /> : <Plus size={20} />}
          {editing ? `Modifier ${editing.id}` : "Ajouter un certificat"}
        </CardTitle>
        <CardDescription>ID généré automatiquement au format GTC-EX-YYYY-XXXX.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="Nom complet">
            <Input value={form.fullName} onChange={event => setField("fullName", event.target.value)} required />
          </Field>
          <Field label="Email">
            <Input type="email" value={form.email} onChange={event => setField("email", event.target.value)} />
          </Field>
          <Field label="Téléphone">
            <Input value={form.phone} onChange={event => setField("phone", event.target.value)} />
          </Field>
          <Field label="Formation suivie">
            <Select value={form.trainingName} onValueChange={value => setField("trainingName", value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Valid">Valid</SelectItem>
                <SelectItem value="Revoked">Revoked</SelectItem>
                <SelectItem value="Expired">Expired</SelectItem>
                {CERTIFICATE_TRAININGS.map(item => (
                  <SelectItem key={item} value={item}>
                    {item}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <Field label="Niveau">
            <Select value={form.level} onValueChange={value => setField("level", value as CertificateLevel)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CERTIFICATE_LEVELS.map(level => (
                  <SelectItem key={level} value={level}>
                    {level}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <Field label="Type de document">
            <Input value={form.documentType} disabled />
          </Field>
          <Field label="Statut">
            <Select value={form.status} onValueChange={value => setField("status", value as CertificateStatus)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Valide">Valide</SelectItem>
                <SelectItem value="Reussi">Réussi</SelectItem>
              </SelectContent>
            </Select>
          </Field>
          <Field label="Score">
            <Input
              type="number"
              min="0"
              max="100"
              value={form.score}
              onChange={event => setField("score", event.target.value)}
            />
          </Field>
          <Field label="Date de certification">
            <Input type="date" value={form.issueDate} onChange={event => setField("issueDate", event.target.value)} required />
          </Field>
          <Field label="Image du participant">
            <div className="grid gap-2">
              <Input
                value={form.participantImageUrl}
                onChange={event => setField("participantImageUrl", event.target.value)}
                placeholder="/assets/certified/christian-onya.jpg"
              />
              <label className="inline-flex items-center gap-2 rounded border border-slate-300 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50">
                <Upload size={16} />
                {uploading ? "Upload..." : "Uploader une image"}
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={event => handleImageUpload(event.target.files?.[0])}
                />
              </label>
            </div>
          </Field>
          <div className="md:col-span-2 flex flex-wrap gap-3">
            <Button type="submit" disabled={createCertificate.isPending || updateCertificate.isPending || !form.fullName.trim()}>
              {editing ? "Enregistrer les modifications" : "Générer et enregistrer"}
            </Button>
            {editing && (
              <Button type="button" variant="outline" onClick={onDone}>
                Annuler
              </Button>
            )}
          </div>
        </form>

        {createdId && !editing && (
          <div className="mt-5 rounded-lg border border-green-200 bg-green-50 p-4 text-green-800">
            <div className="flex items-center gap-2 font-semibold">
              <BadgeCheck size={18} />
              Certificat créé : {createdId}
            </div>
            <a className="mt-2 block text-sm underline" href={getPublicVerificationUrl(createdId)} target="_blank" rel="noreferrer">
              {getPublicVerificationUrl(createdId)}
            </a>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1 block text-sm font-medium text-slate-700">{label}</label>
      {children}
    </div>
  );
}

function CertificateTable() {
  const [query, setQuery] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const { data: certificates, isLoading } = trpc.certifications.adminList.useQuery(undefined, { retry: false });
  const deleteCertificate = trpc.certifications.delete.useMutation();
  const utils = trpc.useUtils();

  const filteredCertificates = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return certificates ?? [];
    return (certificates ?? []).filter(certificate =>
      `${certificate.id} ${certificate.fullName} ${certificate.email ?? ""} ${certificate.trainingName}`
        .toLowerCase()
        .includes(needle),
    );
  }, [certificates, query]);

  const handleDelete = async (id: string) => {
    if (!confirm(`Supprimer le certificat ${id} ?`)) return;
    await deleteCertificate.mutateAsync({ id });
    utils.certifications.adminList.invalidate();
    utils.certifications.listIds.invalidate();
  };

  if (isLoading) {
    return <div className="py-8 text-center text-slate-500">Chargement des certificats...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Certificats enregistrés ({filteredCertificates.length})</CardTitle>
        <div className="relative mt-4 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            value={query}
            onChange={event => setQuery(event.target.value)}
            placeholder="Rechercher par nom, email, formation ou ID"
            className="pl-9"
          />
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {filteredCertificates.map(certificate => (
            <div key={certificate.id} className="rounded-lg border border-slate-200 bg-white p-4">
              {editingId === certificate.id ? (
                <CertificateForm editing={certificate} onDone={() => setEditingId(null)} />
              ) : (
                <div className="grid grid-cols-1 gap-4 lg:grid-cols-[80px_1fr_auto] lg:items-center">
                  <img
                    src={certificate.participantImageUrl || "/assets/images/logo_gtc.webp"}
                    alt={certificate.fullName}
                    loading="lazy"
                    decoding="async"
                    className="h-20 w-20 rounded-full border object-cover"
                  />
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-bold text-slate-900">{certificate.fullName}</p>
                      <span className="rounded-full bg-green-100 px-2 py-1 text-xs font-semibold text-green-700">
                        {certificate.status === "Reussi" ? "Réussi" : certificate.status}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-slate-600">{certificate.trainingName} · {certificate.level}</p>
                    <p className="mt-1 text-xs font-semibold text-slate-500">{certificate.id} · {certificate.issueDate}</p>
                    <p className="mt-1 text-xs text-slate-500">
                      {certificate.email || "Email non renseigné"} · {certificate.phone || "Téléphone non renseigné"}
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-3">
                    <img
                      src={certificate.qrCodeUrl || qrCodeUrl(certificate.id)}
                      alt=""
                      loading="lazy"
                      decoding="async"
                      className="h-16 w-16 rounded border bg-white p-1"
                    />
                    <a href={getPublicVerificationUrl(certificate.id)} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-sm text-[#1E90FF]">
                      <QrCode size={16} />
                      QR
                    </a>
                    <button onClick={() => printCertificate(certificate)} className="inline-flex items-center gap-2 text-sm text-[#0B1F3A]">
                      <FileText size={16} />
                      PDF
                    </button>
                    <button onClick={() => setEditingId(certificate.id)} className="inline-flex items-center gap-2 text-sm text-slate-700">
                      <Edit size={16} />
                      Modifier
                    </button>
                    <button onClick={() => handleDelete(certificate.id)} className="inline-flex items-center gap-2 text-sm text-red-600">
                      <Trash2 size={16} />
                      Supprimer
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
