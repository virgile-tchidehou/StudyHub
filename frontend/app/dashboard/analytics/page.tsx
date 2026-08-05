"use client";

import { useState, useEffect } from "react";
import { useLanguage } from "@/lib/language";
import { goalsApi, universitiesApi, documentsApi, scholarshipsApi, Goal, University, DocumentItem, Scholarship } from "@/lib/api";
import { BarChart3, CheckCircle, Clock, GraduationCap, Award, FileText, Target, TrendingUp, Sparkles, ShieldCheck } from "lucide-react";

export default function AnalyticsPage() {
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
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const completedGoals = goals.filter((g) => g.completed).length;
  const goalProgressAvg = goals.length ? Math.round(goals.reduce((acc, g) => acc + (g.progress || 0), 0) / goals.length) : 0;
  const approvedDocs = docs.filter((d) => d.status === "approved").length;
  const docsProgressAvg = docs.length ? Math.round((approvedDocs / docs.length) * 100) : 0;

  // Global Admission & Scholarship Readiness Score (0 to 100%)
  const overallReadiness = Math.min(
    100,
    Math.round(
      (goalProgressAvg * 0.3) +
      (docsProgressAvg * 0.3) +
      (unis.length > 0 ? 20 : 0) +
      (scholarships.length > 0 ? 20 : 0)
    )
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 bg-white p-6 rounded-2xl shadow-xs">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900 text-white text-xs font-semibold uppercase tracking-wider mb-2">
            <BarChart3 className="w-3.5 h-3.5 text-emerald-400" /> Module 9 — Analytics & Readiness
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900">{t.analytics}</h1>
          <p className="text-slate-600 text-sm mt-1">{t.analyticsDesc}</p>
        </div>
        <div className="flex items-center gap-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-4 rounded-2xl shadow-xs shrink-0">
          <div>
            <span className="text-[10px] uppercase font-bold text-blue-200 block">Global Readiness</span>
            <span className="text-3xl font-black">{overallReadiness}%</span>
          </div>
          <ShieldCheck className="w-8 h-8 text-blue-200" />
        </div>
      </div>

      {/* KPI Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider">Avancement Objectifs</span>
            <Target className="w-4 h-4 text-blue-600" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900">{goalProgressAvg}%</span>
            <span className="text-xs text-slate-500 font-medium">({completedGoals}/{goals.length} faits)</span>
          </div>
          <div className="w-full bg-slate-100 h-2 rounded-full mt-3 overflow-hidden">
            <div className="bg-blue-600 h-full rounded-full transition-all" style={{ width: `${goalProgressAvg}%` }} />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider">Universités Suivies</span>
            <GraduationCap className="w-4 h-4 text-purple-600" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900">{unis.length}</span>
            <span className="text-xs text-slate-500 font-medium">Candidatures</span>
          </div>
          <p className="text-xs text-slate-500 mt-3">Top classement : #60 (Paris-Saclay / TU Munich)</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider">Documents Prêts</span>
            <FileText className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900">{approvedDocs}/{docs.length}</span>
            <span className="text-xs text-slate-500 font-medium">Validés ({docsProgressAvg}%)</span>
          </div>
          <div className="w-full bg-slate-100 h-2 rounded-full mt-3 overflow-hidden">
            <div className="bg-emerald-600 h-full rounded-full transition-all" style={{ width: `${docsProgressAvg}%` }} />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider">Bourses Identifiées</span>
            <Award className="w-4 h-4 text-amber-600" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900">{scholarships.length}</span>
            <span className="text-xs text-slate-500 font-medium">Opportunités</span>
          </div>
          <p className="text-xs text-slate-500 mt-3">Eiffel, DAAD, Chevening, Fulbright</p>
        </div>
      </div>

      {/* Synthesis Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
          <h3 className="font-bold text-slate-900 text-sm mb-4 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-blue-600" /> Progression Globale du Dossier
          </h3>
          <div className="space-y-4 text-xs">
            <div>
              <div className="flex justify-between font-semibold text-slate-700 mb-1">
                <span>1. Préparation Linguistique (IELTS / TOEFL)</span>
                <span className="text-blue-600">80%</span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full">
                <div className="bg-blue-600 h-2 rounded-full w-[80%]" />
              </div>
            </div>

            <div>
              <div className="flex justify-between font-semibold text-slate-700 mb-1">
                <span>2. Rédaction Statement of Purpose (SOP)</span>
                <span className="text-purple-600">100%</span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full">
                <div className="bg-purple-600 h-2 rounded-full w-[100%]" />
              </div>
            </div>

            <div>
              <div className="flex justify-between font-semibold text-slate-700 mb-1">
                <span>3. Constitution Pièces Administratives & Visas</span>
                <span className="text-emerald-600">{docsProgressAvg}%</span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full">
                <div className="bg-emerald-600 h-2 rounded-full" style={{ width: `${docsProgressAvg}%` }} />
              </div>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-slate-900 to-indigo-950 text-white p-6 rounded-2xl shadow-xs space-y-4">
          <div className="flex items-center gap-2 text-indigo-300 text-[10px] uppercase font-bold tracking-wider">
            <Sparkles className="w-4 h-4 text-indigo-400" /> Recommandations Stratégiques du Mentor IA
          </div>
          <h4 className="text-base font-bold leading-snug">
            Prochaine étape prioritaire : Soumission des bourses et finalisation du relevé L3
          </h4>
          <p className="text-xs text-slate-300 leading-relaxed">
            Votre niveau d'anglais et votre SOP sont solides. Assurez-vous de faire traduire votre dernier relevé de notes par un traducteur assermenté et de vérifier vos garants financiers avant le dépôt Campus France / DAAD.
          </p>
        </div>
      </div>
    </div>
  );
}
