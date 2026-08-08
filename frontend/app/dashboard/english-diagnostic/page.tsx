"use client";

import { useEffect, useState } from "react";
import { learningDiagnosticApi, type EnglishDiagnosticQuestion, type EnglishDiagnosticResult } from "@/lib/api";

export default function EnglishDiagnosticPage() {
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
    setSubmitting(true); setError("");
    try {
      const data = await learningDiagnosticApi.submit(answers);
      setResult(data.assessment);
    } catch (e) { setError(e instanceof Error ? e.message : "Unable to submit diagnostic."); }
    finally { setSubmitting(false); }
  }

  if (loading) return <main className="mx-auto max-w-3xl p-8">Loading diagnostic…</main>;
  if (result) return (
    <main className="mx-auto max-w-3xl space-y-6 p-8">
      <section className="rounded-2xl border p-8">
        <p className="text-sm font-medium">English diagnostic completed</p>
        <h1 className="mt-2 text-4xl font-bold">{result.level}</h1>
        <p className="mt-2 text-lg">Score: {result.score}% ({result.correct}/{result.total})</p>
        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          {Object.entries(result.skillScores).map(([skill, score]) => (
            <div key={skill} className="rounded-xl border p-4">
              <div className="flex justify-between"><span className="capitalize">{skill}</span><strong>{Math.round((score.correct / score.total) * 100)}%</strong></div>
            </div>
          ))}
        </div>
        {result.weaknesses.length > 0 && <p className="mt-6">Priority areas: <strong>{result.weaknesses.join(", ")}</strong></p>}
      </section>
    </main>
  );

  return (
    <main className="mx-auto max-w-3xl space-y-6 p-8">
      <header>
        <p className="text-sm font-medium">StudyHub Adaptive Learning</p>
        <h1 className="mt-1 text-3xl font-bold">English Diagnostic</h1>
        <p className="mt-2 opacity-70">A short assessment to establish a starting point for your personalised English plan.</p>
      </header>
      {questions.map((q, index) => (
        <section key={q.id} className="rounded-2xl border p-6">
          <p className="text-sm opacity-60">Question {index + 1} · {q.level}</p>
          <h2 className="mt-2 font-semibold">{q.prompt}</h2>
          <div className="mt-4 space-y-2">
            {q.options.map((option, optionIndex) => (
              <label key={option} className="flex cursor-pointer gap-3 rounded-xl border p-3 hover:bg-black/[.03]">
                <input type="radio" name={q.id} checked={answers[q.id] === optionIndex} onChange={() => setAnswers((a) => ({ ...a, [q.id]: optionIndex }))} />
                <span>{option}</span>
              </label>
            ))}
          </div>
        </section>
      ))}
      {error && <p className="rounded-xl border p-4 text-sm">{error}</p>}
      <button disabled={submitting} onClick={submit} className="rounded-xl border px-6 py-3 font-semibold disabled:opacity-50">
        {submitting ? "Evaluating…" : "Finish diagnostic"}
      </button>
    </main>
  );
}
