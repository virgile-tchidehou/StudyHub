"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { useLanguage } from "@/lib/language";
import { authApi } from "@/lib/auth-client";
import {
  LayoutDashboard,
  Target,
  GraduationCap,
  FileText,
  MessageSquare,
  Bot,
  Code,
  Award,
  Calendar,
  BookOpen,
  BarChart3,
  LogOut,
  Sparkles,
  Menu,
  X,
  User,
  Zap,
} from "lucide-react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { t } = useLanguage();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  async function onSignOut() {
    await authApi.signOut();
    window.location.href = "/login";
  }

  const navItems = [
    { label: t.dashboard, href: "/dashboard", icon: LayoutDashboard },
    { label: t.goalTracker, href: "/dashboard/goals", icon: Target },
    { label: t.universitiesTitle, href: "/dashboard/universities", icon: GraduationCap },
    { label: t.scholarships, href: "/dashboard/scholarships", icon: Award, badge: "IA Search" },
    { label: t.documentsTitle, href: "/dashboard/documents", icon: FileText },
    { label: t.englishCoach, href: "/dashboard/english-coach", icon: MessageSquare, badge: "TTS Audio" },
    { label: t.aiMentor, href: "/dashboard/ai-mentor", icon: Bot, badge: "Jury" },
    { label: t.technicalLearning, href: "/dashboard/technical-learning", icon: Code },
    { label: t.planner, href: "/dashboard/planner", icon: Calendar },
    { label: t.resources, href: "/dashboard/resources", icon: BookOpen },
    { label: t.analytics, href: "/dashboard/analytics", icon: BarChart3 },
  ];

  return (
    <div className="min-h-screen bg-slate-50/70 flex flex-col md:flex-row font-sans text-slate-800">
      {/* Mobile Top Navbar */}
      <div className="md:hidden bg-slate-900 text-white flex items-center justify-between px-4 py-3 border-b border-slate-800">
        <Link href="/dashboard" className="flex items-center gap-2 font-bold text-base">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white font-black text-sm shadow-md">
            SH
          </div>
          <span>StudyHub</span>
        </Link>
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 text-slate-300 hover:text-white"
        >
          {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Sidebar Navigation */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-slate-900 text-slate-300 transform transition-transform duration-200 ease-in-out md:translate-x-0 md:static md:inset-auto flex flex-col justify-between border-r border-slate-800/80 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div>
          {/* Brand Logo */}
          <div className="p-6 border-b border-slate-800/80 hidden md:flex items-center justify-between">
            <Link href="/dashboard" className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white font-black text-sm shadow-md">
                SH
              </div>
              <div>
                <span className="font-bold text-base text-white tracking-wide block">StudyHub</span>
                <span className="text-[10px] text-blue-400 font-semibold uppercase tracking-wider block">
                  International Studies
                </span>
              </div>
            </Link>
          </div>

          {/* Navigation Links */}
          <nav className="p-4 space-y-1 overflow-y-auto max-h-[calc(100vh-140px)]">
            <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-500">
              Navigation & Modules
            </div>
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition ${
                    isActive
                      ? "bg-blue-600 text-white shadow-sm"
                      : "text-slate-400 hover:text-white hover:bg-slate-800/60"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 ${isActive ? "text-white" : "text-slate-400"}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span
                      className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded ${
                        isActive
                          ? "bg-white/20 text-white"
                          : "bg-blue-950 text-blue-400 border border-blue-800/50"
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* User Profile & Footer Controls */}
        <div className="p-4 border-t border-slate-800/80 bg-slate-950/40 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-slate-300 font-bold text-xs border border-slate-700">
                <User className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs font-semibold text-white block">Candidat International</span>
                <span className="text-[10px] text-slate-400 block">Master & Bourses 2026-2027</span>
              </div>
            </div>
            <LanguageSwitcher />
          </div>

          <button
            onClick={onSignOut}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-slate-800/80 hover:bg-red-950/60 text-slate-300 hover:text-red-300 text-xs font-medium transition border border-slate-700/50"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>{t.signOut}</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="hidden md:flex h-16 border-b border-slate-200 bg-white/80 backdrop-blur-md px-8 items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2.5 py-1 rounded-md border border-blue-100">
              Espace Candidat
            </span>
            <span className="text-xs text-slate-500 font-medium">
              Plateforme Unifiée de Candidature & Bourses Internationales
            </span>
          </div>

          <div className="flex items-center gap-3 text-xs font-medium text-slate-600">
            <div className="flex items-center gap-1.5 bg-purple-50 text-purple-700 px-3 py-1.5 rounded-full border border-purple-100">
              <Zap className="w-3.5 h-3.5 text-purple-600" />
              <span>Multi-IA : Gemini 3.6 & Groq Llama 3</span>
            </div>
          </div>
        </header>

        <main className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-6">
          {children}
        </main>
      </div>
    </div>
  );
}
