"use client";

import { useEffect, useState } from "react";
import { universitiesApi, type University } from "@/lib/api";
import { useLanguage } from "@/lib/language";
import { Plus, MapPin, Trophy, X, ExternalLink, Clock, AlertCircle, GraduationCap, CheckCircle2, Globe, FileCheck } from "lucide-react";

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  researching: { label: "En Recherche", color: "bg-gray-100 text-gray-700" },
  preparing: { label: "Dossier en Préparation", color: "bg-blue-100 text-blue-700" },
  submitted: { label: "Candidature Transmise", color: "bg-purple-100 text-purple-700" },
  accepted: { label: "Admis / Accepté", color: "bg-emerald-100 text-emerald-800" },
  rejected: { label: "Refusé", color: "bg-red-100 text-red-700" },
};

export default function UniversitiesPage() {
  const { t } = useLanguage();
  const [unis, setUnis] = useState<University[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Form inputs
  const [name, setName] = useState("");
  const [country, setCountry] = useState("France");
  const [ranking, setRanking] = useState("");
  const [website, setWebsite] = useState("");
  const [requirements, setRequirements] = useState("");
  const [deadlines, setDeadlines] = useState("");
  const [status, setStatus] = useState("preparing");

  const [selectedUni, setSelectedUni] = useState<University | null>(null);

  async function load() {
    try {
      setLoading(true);
      const data = await universitiesApi.list();
      setUnis(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : t.authFailed);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function onCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    try {
      await universitiesApi.create({
        name,
        country: country || undefined,
        ranking: ranking ? Number(ranking) : undefined,
        website: website || undefined,
        requirements: requirements || undefined,
        deadlines: deadlines || undefined,
        application_status: status,
      });
      setName("");
      setRanking("");
      setWebsite("");
      setRequirements("");
      setDeadlines("");
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : t.authFailed);
    }
  }

  async function onDelete(id: string) {
    if (!confirm(t.deleteConfirm)) return;
    try {
      await universitiesApi.remove(id);
      setSelectedUni(null);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : t.authFailed);
    }
  }

  async function onUpdateStatus(id: string, newStatus: string) {
    try {
      await universitiesApi.update(id, { application_status: newStatus as any });
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : t.authFailed);
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 bg-white p-6 rounded-2xl shadow-xs">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-50 text-purple-700 text-xs font-semibold uppercase tracking-wider mb-2">
            <GraduationCap className="w-3.5 h-3.5" /> Module 2 — Universités Cibles
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900">{t.universitiesTitle}</h1>
          <p className="text-sm text-slate-500 mt-1">{t.universitiesIntro}</p>
        </div>
        {unis.length > 0 && (
          <div className="text-right bg-purple-50 p-3 rounded-xl border border-purple-100 shrink-0">
            <div className="text-2xl font-black text-purple-700">{unis.length}</div>
            <div className="text-[11px] text-purple-600 font-semibold">Établissements suivis</div>
          </div>
        )}
      </div>

      {error && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600" role="alert">
          {error}
        </p>
      )}

      {/* Add University Form */}
      <form onSubmit={onCreate} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <Plus className="w-4 h-4 text-purple-600" /> Ajouter une université cible
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={t.universityNamePlaceholder}
            required
            className="rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-purple-500 bg-white"
          />
          <select
            value={country}
            onChange={(e) => setCountry(e.target.value)}
            className="rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-purple-500 bg-white font-medium"
          >
            <option value="France">🇫🇷 France</option>
            <option value="Allemagne">🇩🇪 Allemagne</option>
            <option value="Canada">🇨🇦 Canada</option>
            <option value="Royaume-Uni">🇬🇧 Royaume-Uni</option>
            <option value="Belgique">🇧🇪 Belgique</option>
            <option value="Suisse">🇨🇭 Suisse</option>
            <option value="USA">🇺🇸 USA</option>
          </select>
          <input
            value={ranking}
            onChange={(e) => setRanking(e.target.value)}
            placeholder="Rang mondial QS/THE (ex. 120)"
            type="number"
            className="rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-purple-500 bg-white"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <input
            value={deadlines}
            onChange={(e) => setDeadlines(e.target.value)}
            placeholder="Date limite (ex. 15 Janvier 2027)"
            className="rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-purple-500 bg-white"
          />
          <input
            value={requirements}
            onChange={(e) => setRequirements(e.target.value)}
            placeholder="Exigences (ex. IELTS 7.0, GPA 3.5, 2 LORs)"
            className="rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-purple-500 bg-white"
          />
          <button
            type="submit"
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold rounded-xl transition flex items-center justify-center gap-2 shadow-xs"
          >
            <Plus className="w-4 h-4" /> Enregistrer l'Université
          </button>
        </div>
      </form>

      {/* University Grid */}
      {loading ? (
        <p className="text-sm text-slate-400 py-4 text-center">{t.loading}</p>
      ) : unis.length === 0 ? (
        <p className="text-xs text-slate-400 py-6 text-center bg-white rounded-2xl border border-dashed">{t.noUniversities}</p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {unis.map((u) => {
            const statusInfo = STATUS_LABELS[u.application_status || "preparing"] || STATUS_LABELS.preparing;
            return (
              <div
                key={u.id}
                className="bg-white rounded-2xl border border-slate-200 p-5 hover:border-purple-300 transition-colors shadow-xs flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="flex items-center gap-3">
                      <div className="shrink-0 w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600 font-bold">
                        <Trophy className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-900 text-base leading-snug">{u.name}</h3>
                        <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                          <Globe className="w-3 h-3 text-purple-500" />
                          {u.country || "International"}
                          {u.ranking != null ? ` · Rang #${u.ranking}` : ""}
                        </p>
                      </div>
                    </div>
                    <span className={`text-[10px] font-bold uppercase px-2.5 py-1 rounded-full ${statusInfo.color}`}>
                      {statusInfo.label}
                    </span>
                  </div>

                  {u.requirements && (
                    <div className="mt-3 p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-600">
                      <strong className="text-slate-900 block mb-0.5">Exigences :</strong>
                      {u.requirements}
                    </div>
                  )}

                  {u.deadlines && (
                    <p className="text-xs text-amber-700 font-semibold mt-3 flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5" /> Date limite : {u.deadlines}
                    </p>
                  )}
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <button
                    onClick={() => setSelectedUni(u)}
                    className="text-xs text-purple-600 font-semibold hover:underline"
                  >
                    Voir détails
                  </button>

                  <select
                    value={u.application_status || "preparing"}
                    onChange={(e) => onUpdateStatus(u.id, e.target.value)}
                    className="text-[11px] font-medium border rounded-lg px-2 py-1 bg-slate-50"
                  >
                    <option value="researching">En Recherche</option>
                    <option value="preparing">En Préparation</option>
                    <option value="submitted">Transmis</option>
                    <option value="accepted">Admis</option>
                    <option value="rejected">Refusé</option>
                  </select>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Detail Modal */}
      {selectedUni && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4" onClick={() => setSelectedUni(null)}>
          <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full p-6 relative space-y-4" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setSelectedUni(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-start gap-4">
              <div className="shrink-0 w-12 h-12 rounded-2xl bg-purple-50 flex items-center justify-center text-purple-600">
                <Trophy className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900">{selectedUni.name}</h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  {selectedUni.country} {selectedUni.ranking ? `· Classement #${selectedUni.ranking}` : ""}
                </p>
              </div>
            </div>

            <div className="space-y-3 text-xs text-slate-700">
              {selectedUni.requirements && (
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <strong className="block text-slate-900 mb-1">Pré-requis & Scores d'admission :</strong>
                  {selectedUni.requirements}
                </div>
              )}

              {selectedUni.deadlines && (
                <div className="p-3 bg-amber-50 rounded-xl border border-amber-100 text-amber-900 font-semibold flex items-center gap-2">
                  <Clock className="w-4 h-4 text-amber-600" />
                  <span>Deadline Candidature : {selectedUni.deadlines}</span>
                </div>
              )}

              {selectedUni.website && (
                <a
                  href={selectedUni.website}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 text-purple-600 font-bold hover:underline"
                >
                  Portail Officiel d'Admission <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => onDelete(selectedUni.id)}
                className="text-xs font-semibold text-red-600 hover:bg-red-50 px-3 py-1.5 rounded-lg transition flex items-center gap-1"
              >
                <AlertCircle className="w-3.5 h-3.5" /> Supprimer de mon suivi
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}