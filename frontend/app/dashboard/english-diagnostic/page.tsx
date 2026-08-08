"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useLanguage } from "@/lib/language";
import { learningDiagnosticApi, type EnglishDiagnosticQuestion, type EnglishDiagnosticResult } from "@/lib/api";
import { PageHeader, LoadingState } from "@/components/ui/PageHeader";
import { DiagnosticQuiz, DiagnosticResultView } from "@/components/learning/DiagnosticQuiz";
import { ArrowRight, Sparkles } from "lucide-react";

export default function EnglishDiagnosticPage() {
  const { t } = useLanguage();
  const [questions, setQuestions] = useState<EnglishDiagnosticQuestion[]>([]);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [result, setResult] = useState<EnglishDiagnosticResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    learningDiagnosticApi.questions()
      .then((data) => setQuestions(data.questions))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  async function submit() {
    if (Object.keys(answers).length !== questions.length) {
      setError("Please answer every question before submitting.");
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      const data = await learningDiagnosticApi.submit(answers);
      setResult(data.assessment);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unable to submit diagnostic.");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) return <LoadingState message={t.loading} />;

  if (result) {
    return (
      <div className="max-w-3xl mx-auto space-y-6">
        <DiagnosticResultView
          title={`${t.englishDiagnostic} — completed`}
          level={result.level}
          score={result.score}
          correct={result.correct}
          total={result.total}
          skillScores={result.skillScores}
          weaknesses={result.weaknesses}
          actions={
            <>
              <Link href="/dashboard/curriculum" className="btn btn-primary !text-sm">
                <Sparkles className="w-4 h-4" /> {t.curriculum}
              </Link>
              <Link href="/dashboard/english-coach" className="btn btn-outline !text-sm">
                {t.englishCoach} <ArrowRight className="w-4 h-4" />
              </Link>
            </>
          }
        />
      </div>
    );
  }

  const progress = Math.round((Object.keys(answers).length / questions.length) * 100);

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <PageHeader
        badge="Adaptive Learning"
        title={t.englishDiagnostic}
        description="A short assessment to establish your starting point for a personalised English plan."
      />

      <div className="card !p-4 flex items-center justify-between gap-4">
        <span className="text-xs font-semibold text-slate-600">{questions.length} questions · A1 → B2</span>
        <div className="flex items-center gap-3 flex-1 max-w-xs">
          <div className="progress-bar flex-1">
            <div className="progress-fill" style={{ width: `${progress}%` }} />
          </div>
          <span className="text-xs font-bold text-indigo-600">{progress}%</span>
        </div>
      </div>

      <DiagnosticQuiz
        questions={questions}
        answers={answers}
        onAnswer={(id, idx) => setAnswers((a) => ({ ...a, [id]: idx }))}
      />

      {error && <p className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</p>}

      <button disabled={submitting} onClick={submit} className="btn btn-primary w-full sm:w-auto disabled:opacity-50">
        {submitting ? "Evaluating…" : "Finish diagnostic"}
      </button>
    </div>
  );
}
