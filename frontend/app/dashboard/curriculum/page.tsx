"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useLanguage } from "@/lib/language";
import { learningApi, type CurriculumExercise, type CurriculumFocusArea } from "@/lib/api";
import { PageHeader, StatCard, LoadingState, EmptyState } from "@/components/ui/PageHeader";
import { ExerciseCard } from "@/components/learning/ExerciseCard";
import { Sparkles, BookOpen, CheckCircle2, Clock, Target, RefreshCw, ClipboardCheck } from "lucide-react";

export default function CurriculumPage() {
  const { t } = useLanguage();
  const [exercises, setExercises] = useState<CurriculumExercise[]>([]);
  const [focusAreas, setFocusAreas] = useState<CurriculumFocusArea[]>([]);
  const [stats, setStats] = useState({ pending: 0, completed: 0, skipped: 0, total: 0 });
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [message, setMessage] = useState("");

  async function load() {
    const data = await learningApi.curriculum();
    setExercises(data.exercises);
    setFocusAreas(data.focusAreas);
    setStats(data.stats);
  }

  useEffect(() => {
    load().catch(() => {}).finally(() => setLoading(false));
  }, []);

  async function generate() {
    setGenerating(true);
    setMessage("");
    try {
      const data = await learningApi.generateCurriculum();
      setExercises(data.exercises);
      setFocusAreas(data.focusAreas);
      setStats(data.stats);
      setMessage(data.message);
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Generation failed");
    } finally {
      setGenerating(false);
    }
  }

  async function updateStatus(id: string, status: "completed" | "skipped") {
    setBusyId(id);
    try {
      const data = await learningApi.updateExercise(id, status);
      setExercises((prev) => prev.map((e) => (e.id === id ? data.exercise : e)));
      setStats(data.stats);
    } finally {
      setBusyId(null);
    }
  }

  const pending = exercises.filter((e) => e.status === "pending");
  const done = exercises.filter((e) => e.status !== "pending");

  if (loading) return <LoadingState message={t.loading} />;

  return (
    <div className="space-y-6">
      <PageHeader
        gradient
        badge="Adaptive Learning Engine"
        title={t.curriculum}
        description={t.curriculumDesc}
        actions={
          <button
            onClick={generate}
            disabled={generating}
            className="btn bg-white text-indigo-700 hover:bg-indigo-50 !text-sm shadow-sm disabled:opacity-60"
          >
            <RefreshCw className={`w-4 h-4 ${generating ? "animate-spin" : ""}`} />
            {generating ? t.pleaseWait : t.generateExercises}
          </button>
        }
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard icon={Clock} label="Pending" value={stats.pending} color="text-amber-600" bg="bg-amber-50" />
        <StatCard icon={CheckCircle2} label="Completed" value={stats.completed} color="text-emerald-600" bg="bg-emerald-50" />
        <StatCard icon={BookOpen} label="Total" value={stats.total} color="text-indigo-600" bg="bg-indigo-50" />
        <StatCard icon={Target} label="Focus areas" value={focusAreas.length} sub="From diagnostics" color="text-violet-600" bg="bg-violet-50" />
      </div>

      {message && (
        <div className="rounded-xl border border-indigo-100 bg-indigo-50/80 px-4 py-3 text-sm text-indigo-800">
          {message}
        </div>
      )}

      {/* Focus areas from diagnostics */}
      {focusAreas.length > 0 && (
        <section className="card">
          <h2 className="font-bold text-slate-900 text-sm flex items-center gap-2 mb-4">
            <Sparkles className="w-4 h-4 text-violet-600" /> {t.focusAreas}
          </h2>
          <div className="flex flex-wrap gap-2">
            {focusAreas.map((area) => (
              <span key={`${area.domain}-${area.skill}`} className="chip">
                {area.label} · <span className="font-normal opacity-70">{area.reason}</span>
              </span>
            ))}
          </div>
          {(focusAreas.some((a) => a.reason.includes("diagnostic first"))) && (
            <div className="mt-4 flex flex-wrap gap-2">
              <Link href="/dashboard/english-diagnostic" className="btn btn-outline !text-xs !py-2">
                <ClipboardCheck className="w-3.5 h-3.5" /> {t.englishDiagnostic}
              </Link>
              <Link href="/dashboard/technical-diagnostic" className="btn btn-outline !text-xs !py-2">
                <ClipboardCheck className="w-3.5 h-3.5" /> {t.technicalDiagnostic}
              </Link>
            </div>
          )}
        </section>
      )}

      {/* Pending exercises */}
      <section className="space-y-4">
        <h2 className="font-bold text-slate-900 text-sm">{t.pendingExercises} ({pending.length})</h2>
        {pending.length === 0 ? (
          <EmptyState
            title={t.noExercises}
            description={t.noExercisesDesc}
            action={
              <button onClick={generate} disabled={generating} className="btn btn-primary !text-sm">
                <Sparkles className="w-4 h-4" /> {t.generateExercises}
              </button>
            }
          />
        ) : (
          pending.map((ex) => (
            <ExerciseCard
              key={ex.id}
              exercise={ex}
              busy={busyId === ex.id}
              onComplete={(id) => updateStatus(id, "completed")}
              onSkip={(id) => updateStatus(id, "skipped")}
            />
          ))
        )}
      </section>

      {/* Completed / skipped history */}
      {done.length > 0 && (
        <section className="space-y-4">
          <h2 className="font-bold text-slate-500 text-sm">{t.exerciseHistory} ({done.length})</h2>
          {done.slice(0, 5).map((ex) => (
            <ExerciseCard
              key={ex.id}
              exercise={ex}
              onComplete={() => {}}
              onSkip={() => {}}
            />
          ))}
        </section>
      )}
    </div>
  );
}
