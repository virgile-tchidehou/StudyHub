"use client";

import { useEffect, useState } from "react";
import { goalsApi, type Goal } from "@/lib/api";
import { useLanguage } from "@/lib/language";
import Image from "next/image";
import { Clock, CheckCircle2, Plus, Trash2, Target, Calendar, Filter, Edit3, X, Sparkles } from "lucide-react";

export default function GoalsPage() {
  const { t } = useLanguage();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Form inputs
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("académique");
  const [targetDate, setTargetDate] = useState("");
  const [progress, setProgress] = useState(0);

  // Filter
  const [filterCategory, setFilterCategory] = useState("all");

  // Edit modal
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);

  async function load() {
    try {
      setLoading(true);
      const data = await goalsApi.list();
      setGoals(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : t.authFailed);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function onCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    try {
      await goalsApi.create({
        title,
        description: description || undefined,
        category,
        targetDate: targetDate || undefined
      });
      setTitle("");
      setDescription("");
      setTargetDate("");
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : t.authFailed);
    }
  }

  async function onToggle(id: string, completed: boolean) {
    try {
      await goalsApi.update(id, { completed: !completed, progress: completed ? 0 : 100 });
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : t.authFailed);
    }
  }

  async function onSaveEdit(e: React.FormEvent) {
    e.preventDefault();
    if (!editingGoal) return;
    try {
      await goalsApi.update(editingGoal.id, {
        title: editingGoal.title,
        description: editingGoal.description,
        progress: editingGoal.progress,
        completed: editingGoal.progress === 100,
      });
      setEditingGoal(null);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : t.authFailed);
    }
  }

  async function onDelete(id: string) {
    try {
      await goalsApi.remove(id);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : t.authFailed);
    }
  }

  const filteredGoals = goals.filter(
    (g) => filterCategory === "all" || (g.category || "académique").toLowerCase() === filterCategory.toLowerCase()
  );

  const completedCount = goals.filter((g) => g.completed).length;
  const progressPercent = goals.length > 0 ? Math.round((completedCount / goals.length) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 bg-white p-6 rounded-2xl shadow-xs">
        <div className="flex items-center gap-4">
          <Image src="/logo.png" alt="StudyHub" width={48} height={48} priority />
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold uppercase tracking-wider mb-2">
              <Target className="w-3.5 h-3.5" /> Module 1 — Goal Tracker
            </div>
            <h1 className="text-2xl font-extrabold text-slate-900">{t.goalTracker}</h1>
            <p className="text-sm text-slate-500 mt-1">{t.goalsIntro}</p>
          </div>
        </div>
        {goals.length > 0 && (
          <div className="text-right bg-blue-50 p-3 rounded-xl border border-blue-100 shrink-0">
            <div className="text-2xl font-black text-blue-700">{progressPercent}%</div>
            <div className="text-[11px] text-blue-600 font-semibold">{completedCount} sur {goals.length} validés</div>
          </div>
        )}
      </div>

      {/* Progress Bar */}
      {goals.length > 0 && (
        <div className="h-3 bg-slate-100 rounded-full overflow-hidden p-0.5 border border-slate-200">
          <div
            className="h-full bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full transition-all duration-500"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      )}

      {error && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600" role="alert">
          {error}
        </p>
      )}

      {/* Create Goal Form */}
      <form onSubmit={onCreate} className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={t.goalTitlePlaceholder}
            className="rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          />
          <input
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder={t.descriptionPlaceholder}
            className="rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          />
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="px-3 py-1.5 border rounded-lg bg-slate-50 font-medium text-slate-700"
            >
              <option value="académique">🎓 Académique (Master/Diplôme)</option>
              <option value="langue">🇬🇧 Langue (IELTS / TOEFL)</option>
              <option value="visa">🛂 Administrative & Visa</option>
              <option value="financement">💰 Bourse & Financement</option>
            </select>

            <input
              type="date"
              value={targetDate}
              onChange={(e) => setTargetDate(e.target.value)}
              className="px-3 py-1.5 border rounded-lg bg-slate-50 font-medium text-slate-700"
            />
          </div>

          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl transition flex items-center gap-1.5 shadow-xs"
          >
            <Plus className="w-4 h-4" /> {t.addGoal}
          </button>
        </div>
      </form>

      {/* Category Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs font-medium">
        <span className="text-slate-500 mr-1 flex items-center gap-1"><Filter className="w-3 h-3" /> Catégorie :</span>
        {["all", "académique", "langue", "visa", "financement"].map((cat) => (
          <button
            key={cat}
            onClick={() => setFilterCategory(cat)}
            className={`px-3 py-1.5 rounded-lg capitalize transition whitespace-nowrap ${
              filterCategory === cat
                ? "bg-slate-900 text-white"
                : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-100"
            }`}
          >
            {cat === "all" ? "Toutes les catégories" : cat}
          </button>
        ))}
      </div>

      {/* Goals List */}
      {loading ? (
        <p className="text-sm text-slate-400 py-4 text-center">{t.loading}</p>
      ) : filteredGoals.length === 0 ? (
        <p className="text-xs text-slate-400 py-6 text-center bg-white rounded-2xl border border-dashed">
          {t.noGoals}
        </p>
      ) : (
        <ul className="space-y-2.5">
          {filteredGoals.map((goal) => (
            <li
              key={goal.id}
              className="flex items-center justify-between bg-white rounded-2xl border border-slate-200 p-4 hover:border-blue-300 transition shadow-xs"
            >
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <button onClick={() => onToggle(goal.id, goal.completed)}>
                  {goal.completed ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                  ) : (
                    <Clock className="w-5 h-5 text-slate-300 hover:text-blue-500 shrink-0 transition" />
                  )}
                </button>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className={`text-sm font-semibold ${goal.completed ? "line-through text-slate-400" : "text-slate-900"}`}>
                      {goal.title}
                    </p>
                    <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                      {goal.category || "académique"}
                    </span>
                  </div>
                  {goal.description && (
                    <p className="text-xs text-slate-500 mt-0.5">{goal.description}</p>
                  )}
                  {goal.target_date && (
                    <p className="text-[11px] text-slate-400 mt-1 flex items-center gap-1 font-mono">
                      <Calendar className="w-3 h-3 text-blue-500" /> Échéance : {new Date(goal.target_date).toLocaleDateString()}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-3 shrink-0 ml-3">
                <div className="text-right">
                  <span className="text-xs font-bold text-blue-600">{goal.progress || (goal.completed ? 100 : 0)}%</span>
                  <div className="w-16 bg-slate-100 h-1.5 rounded-full overflow-hidden mt-1">
                    <div className="bg-blue-600 h-full rounded-full" style={{ width: `${goal.progress || (goal.completed ? 100 : 0)}%` }} />
                  </div>
                </div>

                <button
                  onClick={() => setEditingGoal(goal)}
                  className="text-slate-400 hover:text-blue-600 transition p-1"
                  title="Modifier"
                >
                  <Edit3 className="w-4 h-4" />
                </button>

                <button
                  onClick={() => onDelete(goal.id)}
                  className="text-slate-400 hover:text-red-600 transition p-1"
                  title={t.delete}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {/* Edit Modal */}
      {editingGoal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900">Modifier l'objectif</h3>
              <button onClick={() => setEditingGoal(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={onSaveEdit} className="space-y-3 text-sm">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Titre</label>
                <input
                  type="text"
                  required
                  value={editingGoal.title}
                  onChange={(e) => setEditingGoal({ ...editingGoal, title: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Description</label>
                <textarea
                  value={editingGoal.description || ""}
                  onChange={(e) => setEditingGoal({ ...editingGoal, description: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl"
                  rows={2}
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Progression ({editingGoal.progress}%)</label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={editingGoal.progress}
                  onChange={(e) => setEditingGoal({ ...editingGoal, progress: Number(e.target.value) })}
                  className="w-full accent-blue-600"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingGoal(null)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-xl"
                >
                  Enregistrer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}