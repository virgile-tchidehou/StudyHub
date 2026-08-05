"use client";

import { useState, useEffect } from "react";
import { useLanguage } from "@/lib/language";
import { scholarshipsApi, Scholarship } from "@/lib/api";
import Image from "next/image";
import { Award, Search, Plus, ExternalLink, Calendar, DollarSign, Globe, Bookmark, Sparkles, RefreshCw, CheckCircle2, Zap } from "lucide-react";

export default function ScholarshipsPage() {
  const { t } = useLanguage();
  const [scholarships, setScholarships] = useState<Scholarship[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [countryFilter, setCountryFilter] = useState("all");

  // AI Live Search state
  const [aiSearching, setAiSearching] = useState(false);
  const [fieldOfStudy, setFieldOfStudy] = useState("Informatique / Embedded Systems / AI");
  const [targetLevel, setTargetLevel] = useState("Master");
  const [targetCountry, setTargetCountry] = useState("France");
  const [aiResults, setAiResults] = useState<Partial<Scholarship>[]>([]);

  // Manual Add Modal Form
  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState("");
  const [organization, setOrganization] = useState("");
  const [amount, setAmount] = useState("");
  const [deadline, setDeadline] = useState("");
  const [coverage, setCoverage] = useState("");
  const [country, setCountry] = useState("France");
  const [link, setLink] = useState("");

  async function load() {
    try {
      setLoading(true);
      const data = await scholarshipsApi.list();
      setScholarships(data || []);
    } catch (err) {
      console.error("Error loading scholarships:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    try {
      const newItem = await scholarshipsApi.create({
        name,
        organization: organization || "Fondation",
        amount: amount || "1,000 € / mois",
        deadline: deadline || "A venir",
        coverage: coverage || "Prise en charge partielle",
        country,
        status: "saved",
        link: link || "https://www.campusfrance.org",
      });
      setScholarships((prev) => [newItem, ...prev]);
      setShowModal(false);
      setName("");
      setOrganization("");
      setAmount("");
      setDeadline("");
      setCoverage("");
      setLink("");
    } catch (err) {
      console.error("Error creating scholarship:", err);
    }
  };

  const handleAISearch = async () => {
    setAiSearching(true);
    setAiResults([]);
    try {
      const res = await scholarshipsApi.aiSearch({
        field: fieldOfStudy,
        country: targetCountry,
        level: targetLevel,
      });
      setAiResults(res.results || []);
    } catch (err) {
      console.error("AI Search Error:", err);
    } finally {
      setAiSearching(false);
    }
  };

  const handleAddAIScholarship = async (item: Partial<Scholarship>) => {
    try {
      const newItem = await scholarshipsApi.create({
        name: item.name || "Bourse Internationale",
        organization: item.organization || "Organisme Officiel",
        amount: item.amount || "Allocation mensuelle",
        deadline: item.deadline || "Prochaine session",
        coverage: item.coverage || "Prise en charge complète ou partielle",
        country: item.country || targetCountry,
        status: "saved",
        link: item.link || "https://www.campusfrance.org",
      });
      setScholarships((prev) => [newItem, ...prev]);
      setAiResults((prev) => prev.filter((r) => r.name !== item.name));
    } catch (err) {
      console.error("Error adding AI scholarship:", err);
    }
  };

  const filtered = scholarships.filter((s) => {
    const matchesSearch =
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.organization.toLowerCase().includes(search.toLowerCase()) ||
      s.country.toLowerCase().includes(search.toLowerCase());
    const matchesCountry = countryFilter === "all" || s.country.toLowerCase() === countryFilter.toLowerCase();
    return matchesSearch && matchesCountry;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 bg-white p-6 rounded-2xl shadow-xs">
        <div className="flex items-center gap-4">
          <Image src="/logo.png" alt="StudyHub" width={48} height={48} priority />
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold uppercase tracking-wider mb-2">
              <Award className="w-3.5 h-3.5" /> Module 2 — Financement & Bourses
            </div>
            <h1 className="text-2xl font-extrabold text-slate-900">{t.scholarships}</h1>
            <p className="text-slate-600 text-sm mt-1">{t.scholarshipsDesc}</p>
          </div>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-xl transition shadow-xs"
        >
          <Plus className="w-4 h-4" /> Ajouter manuellement
        </button>
      </div>

      {/* AI Live Search Section — Tailored to Student Profile */}
      <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 text-white p-6 rounded-2xl shadow-md space-y-4">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-emerald-400" />
          <h2 className="font-bold text-base">Moteur IA de Recherche de Bourses Ciblées</h2>
        </div>
        <p className="text-xs text-emerald-100 max-w-3xl">
          L'IA analyse les bourses d'études réelles en cours et adaptées à vos critères (domaine, diplôme et pays visé).
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div>
            <label className="block text-emerald-200 mb-1 font-semibold">Domaine d'études</label>
            <input
              type="text"
              value={fieldOfStudy}
              onChange={(e) => setFieldOfStudy(e.target.value)}
              className="w-full px-3 py-2 bg-slate-800/80 border border-emerald-500/30 rounded-xl text-white outline-none focus:border-emerald-400"
            />
          </div>

          <div>
            <label className="block text-emerald-200 mb-1 font-semibold">Niveau visé</label>
            <select
              value={targetLevel}
              onChange={(e) => setTargetLevel(e.target.value)}
              className="w-full px-3 py-2 bg-slate-800/80 border border-emerald-500/30 rounded-xl text-white outline-none focus:border-emerald-400 font-medium"
            >
              <option value="Master">Master / Ingénieur</option>
              <option value="Licence / Bachelor">Licence / Bachelor</option>
              <option value="Doctorat / PhD">Doctorat / PhD</option>
            </select>
          </div>

          <div>
            <label className="block text-emerald-200 mb-1 font-semibold">Pays cible</label>
            <select
              value={targetCountry}
              onChange={(e) => setTargetCountry(e.target.value)}
              className="w-full px-3 py-2 bg-slate-800/80 border border-emerald-500/30 rounded-xl text-white outline-none focus:border-emerald-400 font-medium"
            >
              <option value="France">France</option>
              <option value="Allemagne">Allemagne</option>
              <option value="Canada">Canada</option>
              <option value="Royaume-Uni">Royaume-Uni</option>
              <option value="Belgique">Belgique</option>
              <option value="USA">USA</option>
            </select>
          </div>
        </div>

        <button
          onClick={handleAISearch}
          disabled={aiSearching}
          className="w-full sm:w-auto px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl transition flex items-center justify-center gap-2 shadow-xs"
        >
          {aiSearching ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
          {aiSearching ? "Recherche IA en cours..." : "Lancer la recherche IA de bourses"}
        </button>

        {/* AI Results */}
        {aiResults.length > 0 && (
          <div className="mt-4 pt-4 border-t border-emerald-800/60 space-y-3">
            <h3 className="text-xs font-bold text-emerald-300 uppercase tracking-wider">Bourses trouvées par l'IA :</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {aiResults.map((res, idx) => (
                <div key={idx} className="bg-slate-800/90 border border-emerald-500/30 p-4 rounded-xl flex items-start justify-between gap-3 text-xs">
                  <div>
                    <strong className="text-white block text-sm font-bold">{res.name}</strong>
                    <span className="text-emerald-300 block mt-0.5">{res.organization} · {res.amount}</span>
                    <p className="text-slate-300 mt-1 text-[11px]">{res.coverage}</p>
                  </div>
                  <button
                    onClick={() => handleAddAIScholarship(res)}
                    className="shrink-0 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] rounded-lg transition"
                  >
                    + Suivre
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Filters Bar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher Eiffel, DAAD, Chevening, Canada..."
            className="w-full pl-9 pr-4 py-2 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
          />
        </div>

        <div className="flex items-center gap-2 text-xs font-medium w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
          <span className="text-slate-500 mr-1">Pays :</span>
          {["all", "France", "Allemagne", "Canada", "Royaume-Uni", "Belgique", "USA"].map((c) => (
            <button
              key={c}
              onClick={() => setCountryFilter(c)}
              className={`px-3 py-1.5 rounded-lg capitalize transition whitespace-nowrap ${
                countryFilter === c
                  ? "bg-emerald-600 text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {c === "all" ? "Tous les pays" : c}
            </button>
          ))}
        </div>
      </div>

      {/* Scholarships Grid */}
      {loading ? (
        <div className="p-12 text-center text-slate-500 text-xs animate-pulse">Chargement des bourses…</div>
      ) : filtered.length === 0 ? (
        <div className="p-12 bg-white rounded-2xl border border-dashed text-center text-slate-500 text-xs">
          Aucune bourse trouvée pour ces critères.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-2xl border border-slate-200 p-6 hover:border-emerald-500 hover:shadow-md transition flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                    <Globe className="w-3 h-3 text-emerald-600" /> {item.country}
                  </span>
                  <span
                    className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      item.status === "applied"
                        ? "bg-blue-100 text-blue-700"
                        : item.status === "eligible"
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-amber-100 text-amber-800"
                    }`}
                  >
                    {item.status}
                  </span>
                </div>

                <h3 className="text-base font-bold text-slate-900 leading-snug">{item.name}</h3>
                <p className="text-xs text-slate-500 mt-1 font-medium">{item.organization}</p>

                <div className="mt-4 space-y-2 text-xs">
                  <div className="flex items-center gap-2 text-slate-700">
                    <DollarSign className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span className="font-bold">{item.amount}</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-600">
                    <Calendar className="w-4 h-4 text-slate-400 shrink-0" />
                    <span>Limite candidature : <strong className="text-slate-900">{item.deadline}</strong></span>
                  </div>
                </div>

                <div className="mt-4 p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-600 leading-relaxed">
                  <strong className="text-slate-900 block mb-1">Couverture :</strong>
                  {item.coverage}
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                <a
                  href={item.link}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 hover:text-emerald-800"
                >
                  Site Officiel <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Manual Add Scholarship Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl space-y-4">
            <h3 className="text-base font-bold text-slate-900">Ajouter une bourse à votre suivi</h3>
            <form onSubmit={handleCreate} className="space-y-3 text-xs">
              <div>
                <label className="block font-medium text-slate-700 mb-1">Nom de la bourse</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="ex. Bourse Chevening UK"
                  className="w-full px-3 py-2 border rounded-xl"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Organisme</label>
                <input
                  type="text"
                  value={organization}
                  onChange={(e) => setOrganization(e.target.value)}
                  placeholder="ex. FCO British Government"
                  className="w-full px-3 py-2 border rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Montant</label>
                  <input
                    type="text"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="ex. 1,200 £ / mois"
                    className="w-full px-3 py-2 border rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Pays</label>
                  <select
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    className="w-full px-3 py-2 border rounded-xl font-medium"
                  >
                    <option value="France">France</option>
                    <option value="Allemagne">Allemagne</option>
                    <option value="Canada">Canada</option>
                    <option value="Royaume-Uni">Royaume-Uni</option>
                    <option value="Belgique">Belgique</option>
                    <option value="USA">USA</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Date limite</label>
                <input
                  type="text"
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  placeholder="ex. 15 Novembre 2026"
                  className="w-full px-3 py-2 border rounded-xl"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Lien Web Officiel</label>
                <input
                  type="url"
                  value={link}
                  onChange={(e) => setLink(e.target.value)}
                  placeholder="https://..."
                  className="w-full px-3 py-2 border rounded-xl"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl"
                >
                  Ajouter
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
