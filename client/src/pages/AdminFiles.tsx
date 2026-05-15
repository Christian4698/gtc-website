import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { trpc } from "@/lib/trpc";
import { Download, Trash2, Upload, AlertCircle, CheckCircle2 } from "lucide-react";
import { useLocation } from "wouter";

export default function AdminFiles() {
  const { user, loading } = useAuth();
  const [, setLocation] = useLocation();

  // Redirection si pas admin
  if (!loading && (!user || user.role !== "admin")) {
    setLocation("/");
    return null;
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Gestion des Fichiers & Leads</h1>
          <p className="text-slate-600 mt-2">
            Téléchargez des e-books, guides et ressources. Gérez les leads des formulaires.
          </p>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="files" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="files">📁 Fichiers</TabsTrigger>
            <TabsTrigger value="leads">📋 Leads</TabsTrigger>
          </TabsList>

          {/* FILES TAB */}
          <TabsContent value="files" className="space-y-6">
            <FileUploadSection />
            <FileListSection />
          </TabsContent>

          {/* LEADS TAB */}
          <TabsContent value="leads" className="space-y-6">
            <LeadsListSection />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}

// =====================================================================
// FILE UPLOAD SECTION
// =====================================================================

function FileUploadSection() {
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("ebook");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const utils = trpc.useUtils();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file || !title) {
      setMessage({ type: "error", text: "Fichier et titre requis" });
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("title", title);
      formData.append("category", category);
      formData.append("description", description);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
        credentials: "include",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Upload échoué");
      }

      const result = await response.json();
      setMessage({ type: "success", text: `Fichier "${result.file.title}" uploadé avec succès !` });

      // Reset form
      setTitle("");
      setCategory("ebook");
      setDescription("");
      setFile(null);

      // Refresh file list
      utils.files.adminList.invalidate();
    } catch (error) {
      setMessage({
        type: "error",
        text: error instanceof Error ? error.message : "Erreur lors de l'upload",
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload size={20} />
          Télécharger un fichier
        </CardTitle>
        <CardDescription>Uploadez des e-books, guides ou ressources de formation</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {message && (
          <div
            className={`p-4 rounded-lg flex items-center gap-2 ${
              message.type === "success"
                ? "bg-green-50 text-green-700 border border-green-200"
                : "bg-red-50 text-red-700 border border-red-200"
            }`}
          >
            {message.type === "success" ? (
              <CheckCircle2 size={20} />
            ) : (
              <AlertCircle size={20} />
            )}
            {message.text}
          </div>
        )}

        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Titre</label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: Excel Automation Guide"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Catégorie</label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ebook">E-book</SelectItem>
                  <SelectItem value="guide">Guide</SelectItem>
                  <SelectItem value="training">Formation</SelectItem>
                  <SelectItem value="template">Template</SelectItem>
                  <SelectItem value="other">Autre</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Fichier</label>
              <Input type="file" onChange={handleFileChange} accept=".pdf,.doc,.docx,.xls,.xlsx" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Description (optionnel)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Description du fichier..."
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
              rows={3}
            />
          </div>

          <Button onClick={handleUpload} disabled={uploading || !file || !title} className="w-full">
            {uploading ? "Upload en cours..." : "Télécharger le fichier"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// =====================================================================
// FILE LIST SECTION
// =====================================================================

function FileListSection() {
  const { data: files, isLoading } = trpc.files.adminList.useQuery();
  const deleteFile = trpc.files.delete.useMutation();
  const utils = trpc.useUtils();

  const handleDelete = async (id: number) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer ce fichier ?")) return;

    try {
      await deleteFile.mutateAsync({ id });
      utils.files.adminList.invalidate();
    } catch (error) {
      console.error("Delete failed:", error);
    }
  };

  if (isLoading) {
    return <div className="text-center py-8 text-slate-500">Chargement des fichiers...</div>;
  }

  if (!files || files.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-slate-500">
          Aucun fichier uploadé pour le moment.
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Fichiers uploadés ({files.length})</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-slate-200">
              <tr className="text-left text-slate-600">
                <th className="pb-3 font-semibold">Titre</th>
                <th className="pb-3 font-semibold">Catégorie</th>
                <th className="pb-3 font-semibold">Taille</th>
                <th className="pb-3 font-semibold">Téléchargements</th>
                <th className="pb-3 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {files.map((file) => (
                <tr key={file.id} className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="py-3 font-medium text-slate-900">{file.title}</td>
                  <td className="py-3">
                    <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                      {file.category}
                    </span>
                  </td>
                  <td className="py-3 text-slate-600">
                    {(file.sizeBytes / 1024 / 1024).toFixed(2)} MB
                  </td>
                  <td className="py-3 text-slate-600">{file.downloadCount}</td>
                  <td className="py-3 flex gap-2">
                    <a
                      href={file.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 hover:bg-blue-100 rounded text-blue-600"
                      title="Télécharger"
                    >
                      <Download size={16} />
                    </a>
                    <button
                      onClick={() => handleDelete(file.id)}
                      className="p-2 hover:bg-red-100 rounded text-red-600"
                      title="Supprimer"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}

// =====================================================================
// LEADS LIST SECTION
// =====================================================================

function LeadsListSection() {
  const [statusFilter, setStatusFilter] = useState<"new" | "contacted" | "converted" | "archived" | undefined>(
    "new",
  );
  const { data: leads, isLoading } = trpc.leads.list.useQuery({ status: statusFilter });
  const updateStatus = trpc.leads.updateStatus.useMutation();
  const utils = trpc.useUtils();

  const handleStatusChange = async (id: number, newStatus: "new" | "contacted" | "converted" | "archived") => {
    try {
      await updateStatus.mutateAsync({ id, status: newStatus });
      utils.leads.list.invalidate();
    } catch (error) {
      console.error("Status update failed:", error);
    }
  };

  if (isLoading) {
    return <div className="text-center py-8 text-slate-500">Chargement des leads...</div>;
  }

  if (!leads || leads.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-slate-500">
          Aucun lead dans cette catégorie.
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Leads ({leads.length})</CardTitle>
        <div className="flex gap-2 mt-4">
          {(["new", "contacted", "converted", "archived"] as const).map((status) => (
            <Button
              key={status}
              variant={statusFilter === status ? "default" : "outline"}
              size="sm"
              onClick={() => setStatusFilter(status)}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </Button>
          ))}
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-slate-200">
              <tr className="text-left text-slate-600">
                <th className="pb-3 font-semibold">Nom</th>
                <th className="pb-3 font-semibold">Email</th>
                <th className="pb-3 font-semibold">Type</th>
                <th className="pb-3 font-semibold">Statut</th>
                <th className="pb-3 font-semibold">Date</th>
              </tr>
            </thead>
            <tbody>
              {leads.map((lead) => (
                <tr key={lead.id} className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="py-3 font-medium text-slate-900">{lead.name}</td>
                  <td className="py-3 text-slate-600">{lead.email || "—"}</td>
                  <td className="py-3">
                    <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full">
                      {lead.formType}
                    </span>
                  </td>
                  <td className="py-3">
                    <Select
                      value={lead.status}
                      onValueChange={(value) =>
                        handleStatusChange(lead.id, value as any)
                      }
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="new">Nouveau</SelectItem>
                        <SelectItem value="contacted">Contacté</SelectItem>
                        <SelectItem value="converted">Converti</SelectItem>
                        <SelectItem value="archived">Archivé</SelectItem>
                      </SelectContent>
                    </Select>
                  </td>
                  <td className="py-3 text-slate-600 text-xs">
                    {new Date(lead.createdAt).toLocaleDateString("fr-FR")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
