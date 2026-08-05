"use client";

import { useState, useEffect } from "react";
import { useLanguage } from "@/lib/language";
import { plannerApi, PlannerTask } from "@/lib/api";
import Image from "next/image";
import { Calendar, CheckCircle2, Circle, Clock, Plus, Tag, Flame, AlertCircle, Trash2 } from "lucide-react";

export default function PlannerPage() {
  const { t } = useLanguage();
  const [tasks, setTasks] = useState<PlannerTask[]>([]);
  const [loading, setLoading] = useState(true);

  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<PlannerTask["category"]>("english");
  const [duration, setDuration] = useState(30);
  const [dueDate, setDueDate] = useState(new Date().toISOString().split("T")[0]);

  async function load() {
    try {
      setLoading(true);
      const data = await plannerApi.list();
      setTasks(data || []);
    } catch (err) {
      console.error("Error loading planner tasks:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    try {
      const task = await plannerApi.create({
        title,
        category,
        durationMinutes: duration,
        dueDate,
      });
      setTasks((prev) => [task, ...prev]);
      setTitle("");
    } catch (err) {
      console.error("Error creating planner task:", err);
    }
  };

  const handleToggle = async (id: string) => {
    try {
      const updated = await plannerApi.toggle(id);
      setTasks((prev) => prev.map((t) => (t.id === id ? updated : t)));
    } catch {
      setTasks((prev) =>
        prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t))
      );
    }
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await plannerApi.remove(id);
      setTasks((prev) => prev.filter((t) => t.id !== id));
    } catch (err) {
      console.error("Error deleting task:", err);
    }
  };

  const completedCount = tasks.filter((t) => t.completed).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 bg-white p-6 rounded-2xl shadow-xs">
        <div className="flex items-center gap-4">
          <Image src="/logo.png" alt="StudyHub" width={48} height={48} priority />
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 text-amber-800 text-xs font-semibold uppercase tracking-wider mb-2">
              <Calendar className="w-3.5 h-3.5" /> Module 8 — Planning & Compte à Rebours
            </div>
            <h1 className="text-2xl font-extrabold text-slate-900">{t.planner}</h1>
            <p className="text-slate-600 text-sm mt-1">{t.plannerDesc}</p>
          </div>
        </div>
        <div className="flex items-center gap-3 bg-slate-900 text-white px-4 py-2.5 rounded-xl text-xs font-semibold shrink-0">
          <Flame className="w-4 h-4 text-amber-400" />
          <span>Série de Travail : 5 jours d'affilée</span>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Task List */}
        <div className="lg:col-span-2 space-y-4">
          {/* Add Task Form */}
          <form onSubmit={handleCreate} className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ajouter une tâche (ex. 30 min IELTS Speaking Part 2)"
              required
              className="w-full px-4 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white"
            />
            <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2">
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as PlannerTask["category"])}
                  className="px-3 py-1.5 border rounded-lg bg-slate-50 font-medium text-slate-700"
                >
                  <option value="english">🇬🇧 Anglais / Test</option>
                  <option value="technical">💻 Technique / Revision</option>
                  <option value="document">📄 Document / Visa</option>
                  <option value="university">🎓 Université / SOP</option>
                </select>

                <select
                  value={duration}
                  onChange={(e) => setDuration(Number(e.target.value))}
                  className="px-3 py-1.5 border rounded-lg bg-slate-50 font-medium text-slate-700"
                >
                  <option value={15}>15 min</option>
                  <option value={30}>30 min</option>
                  <option value={60}>1 heure</option>
                  <option value={120}>2 heures</option>
                </select>
              </div>

              <button
                type="submit"
                className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-semibold rounded-xl transition flex items-center gap-1.5 shadow-xs"
              >
                <Plus className="w-4 h-4" /> Ajouter
              </button>
            </div>
          </form>

          {/* Tasks List */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between pb-3 border-b text-xs font-bold text-slate-500">
              <span>Tâches enregistrées ({tasks.length})</span>
              <span>{completedCount} terminées</span>
            </div>

            {loading ? (
              <div className="p-8 text-center text-xs text-slate-400 animate-pulse">{t.loading}</div>
            ) : tasks.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400">Aucune tâche enregistrée.</div>
            ) : (
              tasks.map((task) => (
                <div
                  key={task.id}
                  onClick={() => handleToggle(task.id)}
                  className={`p-3.5 rounded-xl border cursor-pointer transition flex items-center justify-between ${
                    task.completed ? "bg-slate-50/60 border-slate-200 opacity-60" : "bg-white border-slate-200 hover:border-amber-300 shadow-xs"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <button className="text-amber-600 shrink-0">
                      {task.completed ? <CheckCircle2 className="w-5 h-5 text-emerald-600" /> : <Circle className="w-5 h-5 text-slate-300" />}
                    </button>
                    <div>
                      <h4 className={`text-xs sm:text-sm font-semibold ${task.completed ? "line-through text-slate-400" : "text-slate-900"}`}>
                        {task.title}
                      </h4>
                      <div className="flex items-center gap-3 text-[11px] text-slate-500 mt-1">
                        <span className="capitalize font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-100">
                          {task.category}
                        </span>
                        <span className="flex items-center gap-1 font-mono">
                          <Clock className="w-3 h-3 text-amber-600" /> {task.duration_minutes || task.durationMinutes || 30} min
                        </span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={(e) => handleDelete(task.id, e)}
                    className="p-1 text-slate-300 hover:text-red-600 transition"
                    title="Supprimer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right: Countdown Timers */}
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2 mb-3">
              <AlertCircle className="w-4 h-4 text-amber-600" />
              Compte à Rebours Candidatures & Visas
            </h3>
            <div className="space-y-3">
              <div className="p-3.5 rounded-xl bg-amber-50/70 border border-amber-200 text-xs">
                <div className="flex justify-between items-center font-bold text-slate-900">
                  <span>Polytechnique Montréal</span>
                  <span className="text-amber-700 bg-white px-2 py-0.5 rounded shadow-xs font-mono">J - 18</span>
                </div>
                <p className="text-slate-600 mt-1">Dépôt final dossier Master Génie Info</p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                <div className="flex justify-between items-center font-bold text-slate-900">
                  <span>Bourse Excellence Eiffel</span>
                  <span className="text-slate-700 bg-white px-2 py-0.5 rounded font-mono">J - 45</span>
                </div>
                <p className="text-slate-600 mt-1">Transmettre dossier à l'université d'accueil</p>
              </div>

              <div className="p-3.5 rounded-xl bg-purple-50/70 border border-purple-200 text-xs">
                <div className="flex justify-between items-center font-bold text-slate-900">
                  <span>Bourse DAAD Allemagne</span>
                  <span className="text-purple-700 bg-white px-2 py-0.5 rounded font-mono">J - 60</span>
                </div>
                <p className="text-slate-600 mt-1">Soumission sur le portail DAAD</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
