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
  ClipboardCheck,
  Bot,
  Code,
  Award,
  Calendar,
  BookOpen,
  BarChart3,
  LogOut,
  Menu,
  X,
  User,
  Zap,
  Sparkles,
  LucideIcon,
} from "lucide-react";

type NavItem = { label: string; href: string; icon: LucideIcon; badge?: string };
type NavSection = { title: string; items: NavItem[] };

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { t } = useLanguage();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  async function onSignOut() {
    await authApi.signOut();
    window.location.href = "/login";
  }

  const sections: NavSection[] = [
    {
      title: "Workspace",
      items: [
        { label: t.dashboard, href: "/dashboard", icon: LayoutDashboard },
        { label: t.goalTracker, href: "/dashboard/goals", icon: Target },
        { label: t.universitiesTitle, href: "/dashboard/universities", icon: GraduationCap },
        { label: t.scholarships, href: "/dashboard/scholarships", icon: Award, badge: "IA" },
        { label: t.documentsTitle, href: "/dashboard/documents", icon: FileText },
        { label: t.planner, href: "/dashboard/planner", icon: Calendar },
        { label: t.resources, href: "/dashboard/resources", icon: BookOpen },
        { label: t.analytics, href: "/dashboard/analytics", icon: BarChart3 },
      ],
    },
    {
      title: "Adaptive Learning",
      items: [
        { label: t.curriculum, href: "/dashboard/curriculum", icon: Sparkles, badge: "New" },
        { label: t.englishDiagnostic, href: "/dashboard/english-diagnostic", icon: ClipboardCheck },
        { label: t.technicalDiagnostic, href: "/dashboard/technical-diagnostic", icon: ClipboardCheck },
        { label: t.englishCoach, href: "/dashboard/english-coach", icon: MessageSquare },
        { label: t.aiMentor, href: "/dashboard/ai-mentor", icon: Bot },
        { label: t.technicalLearning, href: "/dashboard/technical-learning", icon: Code },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-transparent flex flex-col md:flex-row font-sans text-slate-800">
      <div className="md:hidden bg-slate-950 text-white flex items-center justify-between px-4 py-3 border-b border-slate-800">
        <Link href="/dashboard" className="flex items-center gap-2 font-bold text-base">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-500 to-violet-500 flex items-center justify-center text-white font-black text-sm">SH</div>
          <span>StudyHub</span>
        </Link>
        <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 text-slate-300 hover:text-white">
          {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-900 text-slate-300 transform transition-transform duration-200 ease-in-out md:translate-x-0 md:static md:inset-auto flex flex-col justify-between border-r border-slate-800/80 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div>
          <div className="p-6 border-b border-slate-800/80 hidden md:block">
            <Link href="/dashboard" className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-500 to-violet-500 flex items-center justify-center text-white font-black text-sm shadow-md shadow-indigo-500/30">SH</div>
              <div>
                <span className="font-bold text-base text-white tracking-wide block">StudyHub</span>
                <span className="text-[10px] text-indigo-400 font-semibold uppercase tracking-wider block">International Studies</span>
              </div>
            </Link>
          </div>

          <nav className="p-4 space-y-5 overflow-y-auto max-h-[calc(100vh-140px)]">
            {sections.map((section) => (
              <div key={section.title}>
                <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-500">{section.title}</div>
                <div className="space-y-1">
                  {section.items.map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname === item.href;
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setSidebarOpen(false)}
                        className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition ${
                          isActive
                            ? "bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-sm shadow-indigo-500/25"
                            : "text-slate-400 hover:text-white hover:bg-slate-800/60"
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <Icon className={`w-4 h-4 shrink-0 ${isActive ? "text-white" : "text-slate-400"}`} />
                          <span className="truncate">{item.label}</span>
                        </div>
                        {item.badge && (
                          <span className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded shrink-0 ml-1 ${isActive ? "bg-white/20 text-white" : "bg-indigo-950 text-indigo-400 border border-indigo-800/50"}`}>
                            {item.badge}
                          </span>
                        )}
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </nav>
        </div>

        <div className="p-4 border-t border-slate-800/80 bg-slate-950/60 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center border border-slate-700 shrink-0">
                <User className="w-4 h-4 text-slate-300" />
              </div>
              <div className="min-w-0">
                <span className="text-xs font-semibold text-white block truncate">Candidat International</span>
                <span className="text-[10px] text-slate-400 block">Master 2026-2027</span>
              </div>
            </div>
            <LanguageSwitcher />
          </div>
          <button onClick={onSignOut} className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-slate-800/80 hover:bg-red-950/60 text-slate-300 hover:text-red-300 text-xs font-medium transition border border-slate-700/50">
            <LogOut className="w-3.5 h-3.5" />
            <span>{t.signOut}</span>
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="hidden md:flex h-16 border-b border-slate-200/80 bg-white/70 backdrop-blur-xl px-8 items-center justify-between sticky top-0 z-30">
          <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-md border border-indigo-100">
            StudyHub Workspace
          </span>
          <div className="flex items-center gap-1.5 bg-violet-50 text-violet-700 px-3 py-1.5 rounded-full border border-violet-100 text-xs font-medium">
            <Zap className="w-3.5 h-3.5 text-violet-600" />
            Gemini & Groq
          </div>
        </header>
        <main className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-6">{children}</main>
      </div>
    </div>
  );
}
