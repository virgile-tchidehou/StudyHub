"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useLanguage } from "@/lib/language";
import { goalsApi, universitiesApi, documentsApi, scholarshipsApi, Goal, University, DocumentItem, Scholarship } from "@/lib/api";
import {
  Target,
  GraduationCap,
  FileText,
  Award,
  Sparkles,
  ArrowRight,
  Clock,
  CheckCircle2,
  Plus,
  FolderOpen,
  Zap,
  TrendingUp,
  AlertCircle,
  Calendar,
  BookOpen,
} from "lucide-react";

export default function DashboardPage() {
  const { t } = useLanguage();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [unis, setUnis] = useState<University[]>([]);
  const [docs, setDocs] = useState<DocumentItem[]>([]);
  const [scholarships, setScholarships] = useState<Scholarship[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([goalsApi.list(), universitiesApi.list(), documentsApi.list(), scholarshipsApi.list()])
      .then(([g, u, d, s]) => {
        setGoals(g || []);
        setUnis(u || []);
        setDocs(d || []);
        setScholarships(s || []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const completedGoals = goals.filter((g) => g.completed).length;
  const approvedDocs = docs.filter((d) => d.status === "approved").length;

  // Calculate overall dossier readiness %
  const readinessScore = Math.min(
    100,
    Math.round(
      (goals.length ? (completedGoals / goals.length) * 30 : 10) +
      (docs.length ? (approvedDocs / docs.length) * 30 : 10) +
      (unis.length ? 20 : 0) +
      (scholarships.length ? 20 : 0)
    )
  );

  const stats = [
    { label: t.goals, value: goals.length, sub: `${completedGoals} terminés`, icon: Target, color: "text-blue-600", bg: "bg-blue-50" },
    { label: t.universitiesTitle, value: unis.length, sub: "Candidatures", icon: GraduationCap, color: "text-purple-600", bg: "bg-purple-50" },
    { label: t.documentsTitle, value: docs.length, sub: `${approvedDocs} validés`, icon: FolderOpen, color: "text-emerald-600", bg: "bg-emerald-50" },
    { label: t.scholarships, value: scholarships.length, sub: "Opportunités", icon: Award, color: "text-amber-700", bg: "bg-amber-50" },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-slate-400 text-sm animate-pulse flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-blue-600 animate-spin" />
          Chargement de votre espace StudyHub…
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Image src="/logo.png" alt="StudyHub" width={64} height={64} priority />
        <div>
          <h1 className="text-2xl font-extrabold">{t.welcomeBack}</h1>
          <p className="text-sm text-slate-500 mt-1 max-w-2xl">{t.pickModule}</p>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="bg-white rounded-xl border border-slate-200 p-4 flex items-center gap-3 shadow-xs hover:border-blue-300 transition">
              <div className={`shrink-0 w-10 h-10 rounded-xl ${s.bg} flex items-center justify-center`}>
                <Icon className={`w-5 h-5 ${s.color}`} />
              </div>
              <div>
                <div className="text-2xl font-black text-slate-900">{s.value}</div>
                <div className="text-[11px] text-slate-500 font-semibold">{s.label}</div>
                <div className="text-[10px] text-slate-400 font-medium">{s.sub}</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Countdown Warning Strip */}
      <div className="bg-amber-50/80 border border-amber-200/80 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-amber-900">
        <div className="flex items-center gap-2.5">
          <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
          <div>
            <strong className="font-bold">Prochaine Deadline Prioritaire :</strong> Bourse d'Excellence Eiffel & Universités Françaises (Campus France)
          </div>
        </div>
        <Link href="/dashboard/planner" className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-semibold transition shrink-0">
          Voir le Planning
        </Link>
      </div>

      {/* Quick sections — compact cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Goals */}
        <section className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-slate-900 flex items-center gap-2 text-sm">
              <Target className="w-4 h-4 text-blue-600" /> {t.goalTracker}
            </h2>
            <Link href="/dashboard/goals" className="text-xs text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1">
              Voir tout <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          {goals.length === 0 ? (
            <p className="text-xs text-slate-400 py-4 text-center">{t.noGoals}</p>
          ) : (
            <ul className="space-y-2">
              {goals.slice(0, 3).map((g) => (
                <li key={g.id} className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0">
                  <div className="flex items-center gap-2 min-w-0">
                    {g.completed ? <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" /> : <Clock className="w-4 h-4 text-slate-400 shrink-0" />}
                    <span className={`text-xs font-medium truncate ${g.completed ? "line-through text-slate-400" : "text-slate-700"}`}>{g.title}</span>
                  </div>
                  <span className="text-[11px] font-bold text-blue-600 shrink-0 ml-2">{g.progress || 0}%</span>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Universities */}
        <section className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-slate-900 flex items-center gap-2 text-sm">
              <GraduationCap className="w-4 h-4 text-purple-600" /> {t.universitiesTitle}
            </h2>
            <Link href="/dashboard/universities" className="text-xs text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1">
              Voir tout <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          {unis.length === 0 ? (
            <p className="text-xs text-slate-400 py-4 text-center">Aucune université suivie</p>
          ) : (
            <ul className="space-y-2">
              {unis.slice(0, 3).map((u) => (
                <li key={u.id} className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0">
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-slate-800 truncate">{u.name}</p>
                    <p className="text-[11px] text-slate-400">{u.country || "—"}{u.ranking ? ` · #${u.ranking}` : ""}</p>
                  </div>
                  <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-purple-50 text-purple-700 border border-purple-100">
                    {u.application_status || "Suivi"}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Documents */}
        <section className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-slate-900 flex items-center gap-2 text-sm">
              <FileText className="w-4 h-4 text-emerald-600" /> {t.documentsTitle}
            </h2>
            <Link href="/dashboard/documents" className="text-xs text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1">
              Voir tout <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          {docs.length === 0 ? (
            <p className="text-xs text-slate-400 py-4 text-center">{t.noDocuments}</p>
          ) : (
            <ul className="space-y-2">
              {docs.slice(0, 3).map((d) => (
                <li key={d.id} className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0">
                  <div className="flex items-center gap-2 min-w-0">
                    <FileText className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="text-xs font-medium text-slate-700 truncate">{d.title}</span>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${d.status === "approved" ? "bg-emerald-100 text-emerald-700" : d.status === "pending" ? "bg-amber-100 text-amber-700" : "bg-gray-100 text-gray-600"}`}>
                    {d.status}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Scholarships */}
        <section className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-slate-900 flex items-center gap-2 text-sm">
              <Award className="w-4 h-4 text-amber-700" /> {t.scholarships}
            </h2>
            <Link href="/dashboard/scholarships" className="text-xs text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1">
              Voir tout <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          {scholarships.length === 0 ? (
            <p className="text-xs text-slate-400 py-4 text-center">Aucune bourse sauvegardée</p>
          ) : (
            <ul className="space-y-2">
              {scholarships.slice(0, 3).map((s) => (
                <li key={s.id} className="py-2 border-b border-slate-100 last:border-0 flex items-center justify-between">
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-slate-800 truncate">{s.name}</p>
                    <p className="text-[10px] text-slate-400 truncate">{s.organization} · {s.amount}</p>
                  </div>
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded shrink-0 ml-2">
                    {s.country}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      {/* AI Assistant strip */}
      <section className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white rounded-2xl p-6 shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-amber-300" />
            <h2 className="font-bold text-base">Assistant Multimodal IA (Gemini 3.6 & Groq Llama 3)</h2>
          </div>
          <p className="text-xs text-blue-100">Préparez vos simulations d'entretien Campus France / Visa ou révisez votre Statement of Purpose en direct.</p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <Link href="/dashboard/english-coach" className="px-4 py-2 bg-white text-blue-600 hover:bg-blue-50 text-xs font-bold rounded-xl transition shadow-xs">
            Coach Anglais
          </Link>
          <Link href="/dashboard/ai-mentor" className="px-4 py-2 bg-slate-900 text-white hover:bg-slate-800 text-xs font-bold rounded-xl transition shadow-xs">
            Mentor Entretien
          </Link>
        </div>
      </section>
    </div>
  );
}
