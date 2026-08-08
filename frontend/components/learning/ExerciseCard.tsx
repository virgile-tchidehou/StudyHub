"use client";

import { useState } from "react";
import { CheckCircle2, SkipForward, Clock, Sparkles, BookOpen, Code, MessageSquare } from "lucide-react";
import type { CurriculumExercise } from "@/lib/api";

const DOMAIN_META = {
  english: { icon: MessageSquare, color: "text-sky-600", bg: "bg-sky-50", border: "border-sky-100" },
  technical: { icon: Code, color: "text-violet-600", bg: "bg-violet-50", border: "border-violet-100" },
};

const TYPE_LABELS: Record<string, string> = {
  practice: "Practice",
  quiz: "Quiz",
  writing: "Writing",
  coding: "Coding",
};

type ExerciseCardProps = {
  exercise: CurriculumExercise;
  onComplete: (id: string) => void;
  onSkip: (id: string) => void;
  busy?: boolean;
};

export function ExerciseCard({ exercise, onComplete, onSkip, busy }: ExerciseCardProps) {
  const [expanded, setExpanded] = useState(false);
  const meta = DOMAIN_META[exercise.domain as keyof typeof DOMAIN_META] || DOMAIN_META.technical;
  const Icon = meta.icon;
  const hint = exercise.content?.hint;
  const isDone = exercise.status !== "pending";

  return (
    <article className={`card !p-0 overflow-hidden transition ${isDone ? "opacity-75" : "hover:border-indigo-200"}`}>
      <div className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 min-w-0">
            <div className={`shrink-0 w-10 h-10 rounded-xl ${meta.bg} ${meta.border} border flex items-center justify-center`}>
              <Icon className={`w-5 h-5 ${meta.color}`} />
            </div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <span className={`chip ${meta.bg} ${meta.color} ${meta.border}`}>{exercise.domain}</span>
                <span className="chip">{TYPE_LABELS[exercise.exercise_type] || exercise.exercise_type}</span>
                {exercise.source === "ai" && (
                  <span className="chip text-violet-700 bg-violet-50 border-violet-100">
                    <Sparkles className="w-3 h-3" /> IA
                  </span>
                )}
              </div>
              <h3 className="font-bold text-slate-900 text-sm sm:text-base">{exercise.title}</h3>
              <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                <Clock className="w-3 h-3" /> {exercise.duration_minutes} min · {exercise.skill}
              </p>
            </div>
          </div>
          {isDone && (
            <span className={`chip shrink-0 ${exercise.status === "completed" ? "text-emerald-700 bg-emerald-50 border-emerald-100" : "text-amber-700 bg-amber-50 border-amber-100"}`}>
              {exercise.status === "completed" ? "Done" : "Skipped"}
            </span>
          )}
        </div>

        <button
          onClick={() => setExpanded(!expanded)}
          className="mt-3 text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
        >
          <BookOpen className="w-3.5 h-3.5" />
          {expanded ? "Hide exercise" : "Show exercise"}
        </button>

        {expanded && (
          <div className="mt-3 rounded-xl bg-slate-50 border border-slate-100 p-4 space-y-3">
            <p className="text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">{exercise.prompt}</p>
            {hint && (
              <p className="text-xs text-slate-500 border-l-2 border-indigo-300 pl-3">
                <strong>Hint:</strong> {hint}
              </p>
            )}
            {exercise.exercise_type === "quiz" && exercise.content?.options && (
              <ul className="space-y-1.5">
                {exercise.content.options.map((opt: string, i: number) => (
                  <li key={i} className="text-xs text-slate-600 flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-white border border-slate-200 flex items-center justify-center text-[10px] font-bold">{String.fromCharCode(65 + i)}</span>
                    {opt}
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>

      {!isDone && (
        <div className="flex items-center gap-2 px-5 py-3 bg-slate-50/80 border-t border-slate-100">
          <button
            disabled={busy}
            onClick={() => onComplete(exercise.id)}
            className="btn btn-primary !py-2 !px-3 !text-xs flex-1 sm:flex-none disabled:opacity-50"
          >
            <CheckCircle2 className="w-3.5 h-3.5" /> Complete
          </button>
          <button
            disabled={busy}
            onClick={() => onSkip(exercise.id)}
            className="btn btn-outline !py-2 !px-3 !text-xs disabled:opacity-50"
          >
            <SkipForward className="w-3.5 h-3.5" /> Skip
          </button>
        </div>
      )}
    </article>
  );
}
