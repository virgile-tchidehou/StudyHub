"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useLanguage } from "@/lib/language";
import { goalsApi, universitiesApi, documentsApi, scholarshipsApi, aiApi, learningApi, Goal, University, DocumentItem, Scholarship, AIDailyPlan, LearningSummary } from "@/lib/api";
import { PageHeader, StatCard } from "@/components/ui/PageHeader";
import {
  Target,
  GraduationCap,
  FileText,
  Award,
  Sparkles,
  ArrowRight,
  Clock,
  CheckCircle2,
  FolderOpen,
  Zap,
  AlertCircle,
  XCircle,
  BookOpen,
  Code,
  MessageSquare,
} from "lucide-react";

export default function DashboardPage() {
  const { t } = useLanguage();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [unis, setUnis] = useState<University[]>([]);
  const [docs, setDocs] = useState<DocumentItem[]>([]);
  const [scholarships, setScholarships] = useState<Scholarship[]>([]);
  const [dailyPlan, setDailyPlan] = useState<AIDailyPlan | null>(null);
  const [learning, setLearning] = useState<LearningSummary | null>(null);
  const [updatingActionKey, setUpdatingActionKey] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([goalsApi.list(), universitiesApi.list(), documentsApi.list(), scholarshipsApi.list(), aiApi.dailyPlan(), learningApi.summary()])
      .then(([g, u, d, s, plan, summary]) => {
        setGoals(g || []);
        setUnis(u || []);
        setDocs(d || []);
        setScholarships(s || []);
        setDailyPlan(plan || null);
        setLearning(summary || null);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const markDailyPlanAction = async (action: AIDailyPlan["actions"][number], status: "completed" | "dismissed") => {
    if (updatingActionKey) return;
    setUpdatingActionKey(action.actionKey);
    try {
      await aiApi.updateDailyPlanAction({
        actionKey: action.actionKey,
        actionTitle: action.title,
        category: action.category,
        status,
      });
      const refreshed = await aiApi.dailyPlan();
      setDailyPlan(refreshed);
    } catch {
      // keep silent in dashboard for now
    } finally {
      setUpdatingActionKey(null);
    }
  };

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
      <PageHeader
        gradient
        badge="StudyHub"
        title={t.welcomeBack}
        description={t.pickModule}
        actions={
          <div className="w-full sm:w-[280px] rounded-2xl border border-white/20 bg-white/10 backdrop-blur-sm p-4">
            <div className="flex items-center justify-between text-xs mb-2">
              <span className="font-semibold text-indigo-100">Dossier readiness</span>
              <span className="font-bold text-white">{readinessScore}%</span>
            </div>
            <div className="h-2 w-full rounded-full bg-white/30 overflow-hidden">
              <div className="h-full bg-white rounded-full transition-all duration-500" style={{ width: `${readinessScore}%` }} />
            </div>
          </div>
        }
      />

      {/* Stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {stats.map((s) => (
          <StatCard key={s.label} icon={s.icon} label={s.label} value={s.value} sub={s.sub} color={s.color} bg={s.bg} />
        ))}
      </div>

      {/* Adaptive Learning strip */}
      {learning && (
        <section className="card">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-5">
            <div>
              <h2 className="font-bold text-slate-900 flex items-center gap-2 text-sm">
                <Sparkles className="w-4 h-4 text-violet-600" /> {t.learningProgress}
              </h2>
              <p className="text-xs text-slate-500 mt-1">Overall: <strong className="text-indigo-600">{learning.overallProgress}%</strong></p>
            </div>
            <Link href="/dashboard/curriculum" className="btn btn-primary !text-xs !py-2">
              <BookOpen className="w-3.5 h-3.5" /> {t.curriculum}
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
            <div className="rounded-xl border border-sky-100 bg-sky-50/50 p-4">
              <div className="flex items-center gap-2 text-sky-700 text-xs font-bold mb-2"><MessageSquare className="w-3.5 h-3.5" /> English</div>
              <p className="text-2xl font-black text-slate-900">
                {learning.english.diagnostic?.score ?? learning.english.flashcards.masteryPercent}%
              </p>
              <p className="text-[10px] text-slate-500 mt-1">
                {learning.english.status === "assessed" ? `Level ${learning.english.diagnostic?.level}` : t.takeDiagnostic}
              </p>
            </div>
            <div className="rounded-xl border border-violet-100 bg-violet-50/50 p-4">
              <div className="flex items-center gap-2 text-violet-700 text-xs font-bold mb-2"><Code className="w-3.5 h-3.5" /> Technical</div>
              <p className="text-2xl font-black text-slate-900">
                {learning.technical.diagnostic?.score ?? learning.technical.progressPercent}%
              </p>
              <p className="text-[10px] text-slate-500 mt-1">
                {learning.technical.status === "assessed" ? `Level ${learning.technical.diagnostic?.level}` : t.takeDiagnostic}
              </p>
            </div>
            <div className="rounded-xl border border-emerald-100 bg-emerald-50/50 p-4">
              <div className="flex items-center gap-2 text-emerald-700 text-xs font-bold mb-2"><Target className="w-3.5 h-3.5" /> Goals</div>
              <p className="text-2xl font-black text-slate-900">{learning.productivity.averageGoalProgress}%</p>
              <p className="text-[10px] text-slate-500 mt-1">{learning.productivity.goals.length} active goals</p>
            </div>
          </div>
          {learning.nextActions.length > 0 && (
            <ul className="space-y-2">
              {learning.nextActions.slice(0, 3).map((action) => (
                <li key={action.title} className="flex items-center justify-between gap-3 rounded-xl bg-slate-50 border border-slate-100 px-3 py-2.5 text-xs">
                  <span className="font-semibold text-slate-800">{action.title}</span>
                  <span className="chip shrink-0">{action.durationMinutes} min</span>
                </li>
              ))}
            </ul>
          )}
        </section>
      )}

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

      {/* AI Daily Plan */}
      {dailyPlan && (
        <section className="bg-white/90 rounded-2xl border border-slate-200 p-5 shadow-sm backdrop-blur-sm">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
            <div>
              <h2 className="font-bold text-slate-900 flex items-center gap-2 text-sm">
                <Zap className="w-4 h-4 text-purple-600" /> Plan quotidien IA
              </h2>
              <p className="text-xs text-slate-500 mt-1">{dailyPlan.summary}</p>
            </div>
            <Link href="/dashboard/ai-mentor" className="text-xs text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1">
              Ouvrir le Mentor <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 mb-4 text-[11px]">
            <div className="rounded-lg border border-slate-100 bg-slate-50 p-2"><b>{dailyPlan.progressSummary.activeGoals}</b> objectifs actifs</div>
            <div className="rounded-lg border border-slate-100 bg-slate-50 p-2"><b>{dailyPlan.progressSummary.pendingTasks}</b> tâches à venir</div>
            <div className="rounded-lg border border-slate-100 bg-emerald-50 p-2"><b>{dailyPlan.tracking.completedToday}</b> actions complétées</div>
            <div className="rounded-lg border border-slate-100 bg-amber-50 p-2"><b>{dailyPlan.tracking.dismissedToday}</b> actions ignorées</div>
          </div>

          <ul className="space-y-2">
            {dailyPlan.actions.map((action) => {
              const isBusy = updatingActionKey === action.actionKey;
              return (
                <li key={action.actionKey} className="rounded-xl border border-slate-100 bg-slate-50/60 p-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-slate-800">{action.title}</p>
                      <p className="text-xs text-slate-500 mt-1">{action.detail}</p>
                      <p className="text-[10px] uppercase tracking-wider text-purple-600 mt-1">{action.etaMinutes} min • {action.category}</p>
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${action.state === "completed" ? "bg-emerald-100 text-emerald-700" : action.state === "dismissed" ? "bg-amber-100 text-amber-700" : "bg-slate-100 text-slate-600"}`}>
                      {action.state === "completed" ? "complétée" : action.state === "dismissed" ? "ignorée" : "à faire"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <button
                      disabled={isBusy}
                      onClick={() => markDailyPlanAction(action, "completed")}
                      className="text-xs px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white disabled:opacity-60 flex items-center gap-1"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" /> Fait
                    </button>
                    <button
                      disabled={isBusy}
                      onClick={() => markDailyPlanAction(action, "dismissed")}
                      className="text-xs px-2.5 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-white disabled:opacity-60 flex items-center gap-1"
                    >
                      <XCircle className="w-3.5 h-3.5" /> Ignorer
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        </section>
      )}

      {/* Quick sections — compact cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Goals */}
        <section className="bg-white/90 rounded-2xl border border-slate-200 p-5 shadow-sm backdrop-blur-sm">
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
        <section className="bg-white/90 rounded-2xl border border-slate-200 p-5 shadow-sm backdrop-blur-sm">
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
        <section className="bg-white/90 rounded-2xl border border-slate-200 p-5 shadow-sm backdrop-blur-sm">
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
        <section className="bg-white/90 rounded-2xl border border-slate-200 p-5 shadow-sm backdrop-blur-sm">
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
