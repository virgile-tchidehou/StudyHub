"use client";

import Link from "next/link";
import { useLanguage } from "@/lib/language";
import {
  Target,
  GraduationCap,
  FileText,
  Award,
  BookOpen,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Clock,
  MapPin,
  FolderOpen,
} from "lucide-react";

const features = [
  {
    icon: Target,
    titleKey: "goalTracker",
    descKey: "goalTrackerDesc",
    color: "bg-blue-50 text-blue-700 border-blue-200",
  },
  {
    icon: GraduationCap,
    titleKey: "universitiesTitle",
    descKey: "universitiesDesc",
    color: "bg-purple-50 text-purple-700 border-purple-200",
  },
  {
    icon: FileText,
    titleKey: "documentsTitle",
    descKey: "documentsDesc",
    color: "bg-emerald-50 text-emerald-700 border-emerald-200",
  },
  {
    icon: Award,
    titleKey: "scholarships",
    descKey: "scholarshipsDesc",
    color: "bg-amber-50 text-amber-800 border-amber-200",
  },
  {
    icon: BookOpen,
    titleKey: "resources",
    descKey: "resourcesDesc",
    color: "bg-teal-50 text-teal-800 border-teal-200",
  },
  {
    icon: Sparkles,
    titleKey: "englishCoach",
    descKey: "englishCoachDesc",
    color: "bg-indigo-50 text-indigo-700 border-indigo-200",
  },
];

export default function HomePage() {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Hero — compact, not full-screen on mobile */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 px-4 py-10 sm:px-6 sm:py-14 lg:px-8 lg:py-20">
        <div className="relative z-10 mx-auto max-w-4xl text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-semibold uppercase tracking-wider border border-blue-400/30 mb-6">
            <Sparkles className="w-3.5 h-3.5" /> StudyHub International
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-tight text-white">
            Votre espace d&apos;accompagnement
            <br />
            <span className="text-blue-400">étudiant international</span>
          </h1>

          <p className="mt-5 text-slate-300 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
            Centralisez vos candidatures, suivez vos bourses, organisez vos
            documents et préparez vos entretiens — le tout dans une seule
            plateforme intelligente.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/login"
              className="w-full sm:w-auto px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm rounded-xl transition shadow-lg shadow-blue-600/25 flex items-center justify-center gap-2"
            >
              Démarrer
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="#features"
              className="w-full sm:w-auto px-6 py-3 bg-white/10 hover:bg-white/20 text-white font-medium text-sm rounded-xl transition border border-white/20 flex items-center justify-center gap-2"
            >
              Découvrir
            </Link>
          </div>
        </div>
      </section>

      {/* Features — compact preview */}
      <section
        id="features"
        className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8"
      >
        <h2 className="text-xl font-bold text-slate-900 text-center">
          Tout ce dont vous avez besoin
        </h2>
        <p className="mt-2 text-center text-sm text-slate-500 max-w-lg mx-auto">
          Six modules clés pour organiser et suivre votre projet d&apos;études
          à l&apos;international.
        </p>

        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {features.map((feat) => {
            const Icon = feat.icon;
            return (
              <div
                key={feat.titleKey}
                className="group bg-white rounded-2xl border border-slate-200 p-5 hover:border-blue-400 hover:shadow-md transition-all duration-200 flex items-start gap-4"
              >
                <div
                  className={`shrink-0 p-3 rounded-xl border ${feat.color}`}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm group-hover:text-blue-600 transition-colors">
                    {t[feat.titleKey as keyof typeof t]}
                  </h3>
                  <p className="mt-1 text-xs text-slate-500 leading-relaxed">
                    {t[feat.descKey as keyof typeof t]}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* CTA — inline */}
      <section className="bg-white border-t border-slate-100">
        <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-bold text-slate-900">
              Prêt à commencer ?
            </h3>
            <p className="text-sm text-slate-500 mt-1">
              Connectez-vous ou créez un compte en quelques secondes.
            </p>
          </div>
          <Link
            href="/login"
            className="w-full sm:w-auto px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-sm rounded-xl transition flex items-center justify-center gap-2"
          >
            <CheckCircle2 className="w-4 h-4" />
            Se connecter
          </Link>
        </div>
      </section>

      {/* Footer — minimal */}
      <footer className="bg-slate-900 text-slate-400 py-6">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs">
          <span>© {new Date().getFullYear()} StudyHub. Tous droits réservés.</span>
          <span>Études internationales · Mentorat IA · Bourses</span>
        </div>
      </footer>
    </div>
  );
}
