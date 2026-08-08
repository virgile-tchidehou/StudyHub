"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useLanguage } from "@/lib/language";
import {
  learningDiagnosticApi,
  type TechnicalTrack,
  type TechnicalDiagnosticQuestion,
  type TechnicalDiagnosticResult,
} from "@/lib/api";
import { PageHeader, LoadingState } from "@/components/ui/PageHeader";
import { DiagnosticQuiz, DiagnosticResultView } from "@/components/learning/DiagnosticQuiz";
import { ArrowRight, Cpu, Brain, Sparkles } from "lucide-react";

const LEVEL_LABELS: Record<string, string> = {
  beginner: "Beginner",
  intermediate: "Intermediate",
  advanced: "Advanced",
  expert: "Expert",
};

export default function TechnicalDiagnosticPage() {
  const { t } = useLanguage();
  const [tracks, setTracks] = useState<TechnicalTrack[]>([]);
  const [selectedTrack, setSelectedTrack] = useState("embedded");
  const [questions, setQuestions] = useState<TechnicalDiagnosticQuestion[]>([]);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [result, setResult] = useState<TechnicalDiagnosticResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    learningDiagnosticApi.technicalTracks()
      .then((data) => {
        setTracks(data.tracks);
        if (data.tracks.length) setSelectedTrack(data.tracks[0].id);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!selectedTrack) return;
    setLoading(true);
    setAnswers({});
    setResult(null);
    setError("");
    learningDiagnosticApi.technicalQuestions(selectedTrack)
      .then((data) => setQuestions(data.questions))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [selectedTrack]);

  async function submit() {
    if (Object.keys(answers).length !== questions.length) {
      setError("Please answer every question before submitting.");
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      const data = await learningDiagnosticApi.technicalSubmit(selectedTrack, answers);
      setResult(data.assessment);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unable to submit diagnostic.");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading && !questions.length) return <LoadingState message={t.loading} />;

  if (result) {
    return (
      <div className="max-w-3xl mx-auto space-y-6">
        <DiagnosticResultView
          title={`${t.technicalDiagnostic} — ${result.trackTitle}`}
          level={LEVEL_LABELS[result.level] || result.level}
          score={result.score}
          correct={result.correct}
          total={result.total}
          skillScores={result.skillScores}
          weaknesses={result.weaknesses}
          weaknessLabels={result.weaknessLabels}
          actions={
            <>
              <Link href="/dashboard/curriculum" className="btn btn-primary !text-sm">
                <Sparkles className="w-4 h-4" /> {t.curriculum}
              </Link>
              <Link href="/dashboard/technical-learning" className="btn btn-outline !text-sm">
                {t.technicalLearning} <ArrowRight className="w-4 h-4" />
              </Link>
            </>
          }
        />
      </div>
    );
  }

  const progress = questions.length ? Math.round((Object.keys(answers).length / questions.length) * 100) : 0;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <PageHeader
        badge="Adaptive Learning"
        title={t.technicalDiagnostic}
        description={t.technicalDiagnosticDesc}
      />

      <div className="grid gap-3 sm:grid-cols-2">
        {tracks.map((track) => {
          const Icon = track.id === "ai" ? Brain : Cpu;
          const isSelected = selectedTrack === track.id;
          return (
            <button
              key={track.id}
              onClick={() => setSelectedTrack(track.id)}
              className={`card !p-4 text-left transition ${isSelected ? "!border-indigo-400 ring-2 ring-indigo-500/20" : "hover:border-slate-300"}`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isSelected ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-600"}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-semibold text-sm text-slate-900">{track.title}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{track.questionCount} questions · {track.skills.length} skills</p>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {questions.length > 0 && (
        <div className="card !p-4 flex items-center justify-between gap-4">
          <span className="text-xs font-semibold text-slate-600">{questions.length} questions</span>
          <div className="flex items-center gap-3 flex-1 max-w-xs">
            <div className="progress-bar flex-1">
              <div className="progress-fill" style={{ width: `${progress}%` }} />
            </div>
            <span className="text-xs font-bold text-indigo-600">{progress}%</span>
          </div>
        </div>
      )}

      <DiagnosticQuiz
        questions={questions}
        answers={answers}
        onAnswer={(id, idx) => setAnswers((a) => ({ ...a, [id]: idx }))}
      />

      {error && <p className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</p>}

      <button disabled={submitting || !questions.length} onClick={submit} className="btn btn-primary w-full sm:w-auto disabled:opacity-50">
        {submitting ? "Evaluating…" : "Finish diagnostic"}
      </button>
    </div>
  );
}
