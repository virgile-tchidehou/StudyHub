"use client";

import { LucideIcon } from "lucide-react";

type PageHeaderProps = {
  badge?: string;
  title: string;
  description?: string;
  actions?: React.ReactNode;
  gradient?: boolean;
};

export function PageHeader({ badge, title, description, actions, gradient }: PageHeaderProps) {
  if (gradient) {
    return (
      <section className="relative overflow-hidden rounded-3xl border border-indigo-100 bg-gradient-to-r from-indigo-600 via-violet-600 to-sky-600 text-white p-6 sm:p-8 shadow-lg shadow-indigo-500/20">
        <div className="absolute -top-16 -right-14 h-56 w-56 rounded-full bg-white/15 blur-2xl" />
        <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            {badge && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 border border-white/20 px-3 py-1 text-[11px] font-bold uppercase tracking-wider mb-3">
                {badge}
              </span>
            )}
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">{title}</h1>
            {description && <p className="text-sm text-indigo-100 mt-2 max-w-2xl">{description}</p>}
          </div>
          {actions && <div className="shrink-0">{actions}</div>}
        </div>
      </section>
    );
  }

  return (
    <header className="card !p-5 sm:!p-6">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          {badge && <span className="chip mb-3 text-indigo-700 border-indigo-100 bg-indigo-50">{badge}</span>}
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900">{title}</h1>
          {description && <p className="text-sm text-slate-500 mt-1.5 max-w-2xl">{description}</p>}
        </div>
        {actions && <div className="shrink-0">{actions}</div>}
      </div>
    </header>
  );
}

type StatCardProps = {
  icon: LucideIcon;
  label: string;
  value: string | number;
  sub?: string;
  color?: string;
  bg?: string;
};

export function StatCard({ icon: Icon, label, value, sub, color = "text-indigo-600", bg = "bg-indigo-50" }: StatCardProps) {
  return (
    <div className="card !p-4 flex items-center gap-3 hover:border-indigo-200 transition">
      <div className={`shrink-0 w-11 h-11 rounded-xl ${bg} flex items-center justify-center`}>
        <Icon className={`w-5 h-5 ${color}`} />
      </div>
      <div className="min-w-0">
        <div className="text-2xl font-black text-slate-900">{value}</div>
        <div className="text-[11px] text-slate-500 font-semibold truncate">{label}</div>
        {sub && <div className="text-[10px] text-slate-400 font-medium">{sub}</div>}
      </div>
    </div>
  );
}

export function SkillBar({ label, percent }: { label: string; percent: number }) {
  return (
    <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-4">
      <div className="flex justify-between text-sm mb-2">
        <span className="font-medium text-slate-700 capitalize">{label}</span>
        <strong className="text-indigo-600">{percent}%</strong>
      </div>
      <div className="progress-bar">
        <div className="progress-fill" style={{ width: `${percent}%` }} />
      </div>
    </div>
  );
}

export function LoadingState({ message = "Chargement…" }: { message?: string }) {
  return (
    <div className="flex items-center justify-center h-48">
      <div className="text-slate-400 text-sm animate-pulse flex items-center gap-2">
        <span className="w-4 h-4 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin" />
        {message}
      </div>
    </div>
  );
}

export function EmptyState({ title, description, action }: { title: string; description?: string; action?: React.ReactNode }) {
  return (
    <div className="card text-center py-12">
      <p className="font-semibold text-slate-800">{title}</p>
      {description && <p className="text-sm text-slate-500 mt-2 max-w-md mx-auto">{description}</p>}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}
