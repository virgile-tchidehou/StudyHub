"use client";

type Question = { id: string; level: string; prompt: string; options: string[]; skillLabel?: string };

type DiagnosticQuizProps = {
  questions: Question[];
  answers: Record<string, number>;
  onAnswer: (questionId: string, optionIndex: number) => void;
};

export function DiagnosticQuiz({ questions, answers, onAnswer }: DiagnosticQuizProps) {
  return (
    <div className="space-y-4">
      {questions.map((q, index) => (
        <section key={q.id} className="card !p-5 sm:!p-6">
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <span className="chip text-indigo-700 bg-indigo-50 border-indigo-100">
              Q{index + 1}
            </span>
            <span className="chip">{q.level}</span>
            {q.skillLabel && <span className="chip">{q.skillLabel}</span>}
          </div>
          <h2 className="font-semibold text-slate-900 leading-snug">{q.prompt}</h2>
          <div className="mt-4 space-y-2">
            {q.options.map((option, optionIndex) => {
              const selected = answers[q.id] === optionIndex;
              return (
                <label
                  key={option}
                  className={`flex cursor-pointer gap-3 rounded-xl border p-3.5 transition ${
                    selected
                      ? "border-indigo-400 bg-indigo-50/60 ring-1 ring-indigo-400/30"
                      : "border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                  }`}
                >
                  <input
                    type="radio"
                    name={q.id}
                    checked={selected}
                    onChange={() => onAnswer(q.id, optionIndex)}
                    className="mt-0.5 accent-indigo-600"
                  />
                  <span className="text-sm text-slate-700">{option}</span>
                </label>
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
}

type DiagnosticResultProps = {
  title: string;
  level: string;
  score: number;
  correct: number;
  total: number;
  skillScores: Record<string, { correct: number; total: number; label?: string }>;
  weaknesses: string[];
  weaknessLabels?: string[];
  actions?: React.ReactNode;
};

export function DiagnosticResultView({
  title,
  level,
  score,
  correct,
  total,
  skillScores,
  weaknesses,
  weaknessLabels,
  actions,
}: DiagnosticResultProps) {
  const labels = weaknessLabels?.length ? weaknessLabels : weaknesses;

  return (
    <section className="card !p-6 sm:!p-8">
      <p className="text-sm font-medium text-slate-500">{title}</p>
      <h1 className="mt-2 text-4xl sm:text-5xl font-black text-indigo-600 capitalize">{level}</h1>
      <p className="mt-2 text-lg text-slate-700">
        Score: <strong>{score}%</strong> ({correct}/{total})
      </p>

      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        {Object.entries(skillScores).map(([skill, s]) => {
          const pct = Math.round((s.correct / s.total) * 100);
          return (
            <div key={skill} className="rounded-xl border border-slate-100 bg-slate-50/50 p-4">
              <div className="flex justify-between text-sm mb-2">
                <span className="font-medium capitalize">{s.label || skill}</span>
                <strong className="text-indigo-600">{pct}%</strong>
              </div>
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: `${pct}%` }} />
              </div>
            </div>
          );
        })}
      </div>

      {labels.length > 0 && (
        <p className="mt-6 text-sm text-slate-600">
          Priority areas: <strong className="text-slate-900">{labels.join(", ")}</strong>
        </p>
      )}

      {actions && <div className="mt-8 flex flex-wrap gap-3">{actions}</div>}
    </section>
  );
}
