"use client";

import { useEffect, useState } from "react";
import { documentsApi, type DocumentItem } from "@/lib/api";
import { useLanguage } from "@/lib/language";
import Image from "next/image";
import { Plus, FolderOpen, Trash2, Edit2, X, FileText, Image as LucideImage, File, FileQuestion, Filter, Search, Clock, CheckCircle2, AlertCircle, Pencil, Download, Copy, Sparkles } from "lucide-react";

const STATUS_COLORS: Record<string, string> = {
  draft: "bg-gray-100 text-gray-600",
  approved: "bg-emerald-100 text-emerald-700",
  pending: "bg-amber-100 text-amber-700",
};

const STATUS_ICONS: Record<string, React.ReactNode> = {
  draft: <Clock className="w-4 h-4 text-gray-400" />,
  approved: <CheckCircle2 className="w-4 h-4 text-emerald-500" />,
  pending: <AlertCircle className="w-4 h-4 text-amber-500" />,
};

const TYPE_ICONS: Record<string, React.ReactNode> = {
  pdf: <FileText className="w-4 h-4 text-red-500" />,
  image: <LucideImage className="w-4 h-4 text-blue-500" />,
  doc: <File className="w-4 h-4 text-blue-600" />,
  other: <FileQuestion className="w-4 h-4 text-slate-400" />,
};

const TEMPLATES = [
  {
    title: "Statement of Purpose (SOP) Master Template",
    category: "SOP",
    content: `STATEMENT OF PURPOSE\n\nApplicant: [Your Name]\nTarget Program: Master in [Field] - [University Name]\n\n1. INTRODUCTION & MOTIVATION\nEver since my undergraduate studies in [Your Bachelor Major], I have been deeply fascinated by [Specific Technical Field]. Applying for the Master in [Field] at [University Name] represents the logical next step in my academic trajectory.\n\n2. ACADEMIC BACKGROUND & KEY ACHIEVEMENTS\nDuring my Bachelor's degree at [Current University], I acquired strong foundations in [Key Courses/Skills]. My graduation thesis focused on [Topic], where I implemented [Technologies/Methodology].\n\n3. REASON FOR CHOOSING THIS UNIVERSITY & PROGRAM\nI selected [University Name] specifically because of its world-class research in [Specialized Lab/Course], led by renowned professors. Courses such as [Course 1] and [Course 2] directly match my research interests.\n\n4. FUTURE CAREER GOALS\nUpon graduation, I intend to work as a [Target Job Title, e.g., Embedded Systems Engineer] in [Target Sector/Region], contributing to [Industry Goals].`
  },
  {
    title: "Academic Recommendation Letter Request Email",
    category: "Email",
    content: `Subject: Recommendation Letter Request for Master Application - [Your Name]\n\nDear Professor [Professor's Last Name],\n\nI hope this email finds you well.\n\nI am currently preparing my application files for international Master programs in [Field] for the academic year 2026-2027, notably at [University Name].\n\nHaving thoroughly enjoyed your course on [Subject Name] where I obtained [Your Grade/Achievement], I would be deeply honored if you could write a recommendation letter supporting my candidacy.\n\nThe submission deadline is [Deadline Date]. I have attached my updated CV and Statement of Purpose for your convenience.\n\nThank you very much for your time and guidance.\n\nSincerely,\n[Your Name]\n[Your Contact Info]`
  }
];

export default function DocumentsPage() {
  const { t } = useLanguage();
  const [docs, setDocs] = useState<DocumentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [search, setSearch] = useState("");

  // Form state
  const [title, setTitle] = useState("");
  const [type, setType] = useState("pdf");
  const [status, setStatus] = useState("draft");
  const [content, setContent] = useState("");
  const [universityId, setUniversityId] = useState("");
  const [file, setFile] = useState<File | null>(null);

  // Edit state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editType, setEditType] = useState("pdf");
  const [editStatus, setEditStatus] = useState("draft");

  // Active Template Preview Modal
  const [previewTemplate, setPreviewTemplate] = useState<{ title: string; content: string } | null>(null);
  const [copied, setCopied] = useState(false);

  // Detail modal
  const [selectedDoc, setSelectedDoc] = useState<DocumentItem | null>(null);

  async function load() {
    try {
      setLoading(true);
      const data = await documentsApi.list();
      setDocs(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : t.authFailed);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const filteredDocs = docs.filter((doc) => {
    if (statusFilter !== "all" && doc.status !== statusFilter) return false;
    if (typeFilter !== "all" && doc.type !== typeFilter) return false;
    if (search && !doc.title.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  async function onCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    try {
      await documentsApi.create({ title, type, status, content, university_id: universityId || undefined }, file ?? undefined);
      setTitle("");
      setType("pdf");
      setStatus("draft");
      setContent("");
      setUniversityId("");
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : t.authFailed);
    }
  }

  async function onUpdate(id: string) {
    try {
      await documentsApi.update(id, {
        title: editTitle || undefined,
        type: editType || undefined,
        status: editStatus || undefined,
      });
      setEditingId(null);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : t.authFailed);
    }
  }

  async function onDelete(id: string) {
    if (!confirm(t.deleteConfirm)) return;
    try {
      await documentsApi.remove(id);
      setSelectedDoc(null);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : t.authFailed);
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const stats = {
    total: docs.length,
    draft: docs.filter((d) => d.status === "draft").length,
    pending: docs.filter((d) => d.status === "pending").length,
    approved: docs.filter((d) => d.status === "approved").length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 bg-white p-6 rounded-2xl shadow-xs">
        <div className="flex items-center gap-4">
          <Image src="/logo.png" alt="StudyHub" width={48} height={48} priority />
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold uppercase tracking-wider mb-2">
              <FileText className="w-3.5 h-3.5" /> Module 3 — Gestionnaire de Documents
            </div>
            <h1 className="text-2xl font-extrabold text-slate-900">{t.documentsTitle}</h1>
            <p className="text-sm text-slate-500 mt-1">{t.documentsIntro}</p>
          </div>
        </div>
      </div>

      {error && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600" role="alert">
          {error}
        </p>
      )}

      {/* Stats Row */}
      <div className="flex gap-3 flex-wrap">
        {[
          { label: t.total, value: stats.total, color: "bg-slate-900 text-white" },
          { label: t.draft, value: stats.draft, color: "bg-gray-100 text-gray-700" },
          { label: t.pending, value: stats.pending, color: "bg-amber-100 text-amber-800" },
          { label: t.approved, value: stats.approved, color: "bg-emerald-100 text-emerald-800" },
        ].map((s) => (
          <div key={s.label} className={`rounded-xl px-4 py-2 ${s.color} text-xs font-bold`}>
            {s.value} <span className="opacity-75 font-medium">({s.label})</span>
          </div>
        ))}
      </div>

      {/* Templates Section */}
      <div className="bg-slate-900 text-white p-5 rounded-2xl shadow-md space-y-3">
        <div className="flex items-center gap-2 text-blue-400 text-xs font-bold uppercase tracking-wider">
          <Sparkles className="w-4 h-4" /> Modèles de Candidature Téléchargeables (SOP, Recommandation, CV)
        </div>
        <p className="text-xs text-slate-300">Utilisez nos trames officielles prêtes à remplir pour vos dossiers de Master et bourses.</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {TEMPLATES.map((tmpl, idx) => (
            <div key={idx} className="bg-slate-800/90 border border-slate-700 p-3.5 rounded-xl flex items-center justify-between gap-3 text-xs">
              <div className="min-w-0">
                <strong className="text-white block font-bold truncate">{tmpl.title}</strong>
                <span className="text-[10px] text-blue-300 font-semibold uppercase">{tmpl.category}</span>
              </div>
              <button
                onClick={() => setPreviewTemplate(tmpl)}
                className="shrink-0 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-[11px] rounded-lg transition"
              >
                Afficher / Copier
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center bg-white p-4 rounded-xl border border-slate-200">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t.searchPlaceholder}
            className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-200 outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-lg border border-slate-200 px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-blue-500 bg-white font-medium text-slate-700"
        >
          <option value="all">{t.allStatus}</option>
          <option value="draft">{t.draft}</option>
          <option value="pending">{t.pending}</option>
          <option value="approved">{t.approved}</option>
        </select>
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="rounded-lg border border-slate-200 px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-blue-500 bg-white font-medium text-slate-700"
        >
          <option value="all">{t.allTypes}</option>
          <option value="pdf">PDF</option>
          <option value="image">Image</option>
          <option value="doc">Doc</option>
          <option value="other">Autre</option>
        </select>
      </div>

      {/* Upload & Add Form */}
      <form onSubmit={onCreate} className="bg-white rounded-2xl border border-slate-200 p-5 space-y-3 shadow-xs" encType="multipart/form-data">
        <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
          <Plus className="w-4 h-4 text-emerald-600" /> {t.addDocument}
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={t.documentTitlePlaceholder}
            required
            className="rounded-xl border border-slate-200 px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          />
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="rounded-xl border border-slate-200 px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-blue-500 bg-white font-medium text-slate-700"
          >
            <option value="pdf">PDF (Passeport / Relevé / Diplôme)</option>
            <option value="doc">Word / Text (SOP / CV)</option>
            <option value="image">Image (Carte d'identité)</option>
            <option value="other">Autre</option>
          </select>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="rounded-xl border border-slate-200 px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-blue-500 bg-white font-medium text-slate-700"
          >
            <option value="draft">{t.draft}</option>
            <option value="pending">{t.pending}</option>
            <option value="approved">{t.approved}</option>
          </select>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <input
            type="file"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            className="text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-slate-900 file:text-white hover:file:bg-slate-800"
          />
          <button
            type="submit"
            className="w-full sm:w-auto px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl transition flex items-center justify-center gap-1.5"
          >
            <Plus className="w-4 h-4" /> Ajouter au dossier
          </button>
        </div>
      </form>

      {/* Document List */}
      {loading ? (
        <p className="text-xs text-slate-400 py-4 text-center">{t.loading}</p>
      ) : filteredDocs.length === 0 ? (
        <p className="text-xs text-slate-400 py-6 text-center bg-white rounded-2xl border border-dashed">{t.noDocuments}</p>
      ) : (
        <ul className="space-y-2.5">
          {filteredDocs.map((doc) => (
            <li
              key={doc.id}
              className="bg-white rounded-2xl border border-slate-200 p-4 hover:border-blue-300 transition shadow-xs flex items-center justify-between gap-4"
            >
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <div className="shrink-0 p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                  {TYPE_ICONS[doc.type || "other"] || TYPE_ICONS.other}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-slate-900 truncate">{doc.title}</p>
                  <div className="flex items-center gap-2 mt-0.5 text-[11px] text-slate-400">
                    <span className="uppercase font-bold text-slate-600">{doc.type || "pdf"}</span>
                    <span>· Ajouté le {new Date(doc.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-bold ${STATUS_COLORS[doc.status] || "bg-gray-100 text-gray-600"}`}>
                  {STATUS_ICONS[doc.status]} {doc.status}
                </span>

                {doc.file_path && (
                  <a
                    href={`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/${doc.file_path}`}
                    target="_blank"
                    rel="noreferrer"
                    className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-slate-50 transition"
                    title="Télécharger"
                  >
                    <Download className="w-4 h-4" />
                  </a>
                )}

                <button
                  onClick={() => onDelete(doc.id)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-slate-50 transition"
                  title={t.delete}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {/* Template Preview Modal */}
      {previewTemplate && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-base font-bold text-slate-900">{previewTemplate.title}</h3>
              <button onClick={() => setPreviewTemplate(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <textarea
              readOnly
              rows={12}
              value={previewTemplate.content}
              className="w-full p-4 rounded-xl border border-slate-200 bg-slate-50 font-mono text-xs text-slate-800 leading-relaxed"
            />

            <div className="flex justify-end gap-2">
              <button
                onClick={() => copyToClipboard(previewTemplate.content)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl transition flex items-center gap-1.5"
              >
                <Copy className="w-4 h-4" /> {copied ? "Copié !" : "Copier le texte"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}