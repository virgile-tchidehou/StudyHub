"use client";

import { useLanguage } from "@/lib/language";
import type { Lang } from "@/lib/i18n";

export default function LanguageSwitcher() {
  const { lang, setLang, t } = useLanguage();

  const options: { code: Lang; label: string }[] = [
    { code: "fr", label: "🇫🇷 FR" },
    { code: "en", label: "🇬🇧 EN" },
  ];

  return (
    <div className="inline-flex items-center gap-1 rounded-lg border border-slate-700 bg-slate-800 p-1 text-sm" aria-label={t.language}>
      {options.map((opt) => (
        <button
          key={opt.code}
          onClick={() => setLang(opt.code)}
          className={`rounded-md px-2 py-1 text-xs font-semibold transition-colors ${
            lang === opt.code
              ? "bg-white text-slate-900"
              : "text-slate-300 hover:bg-slate-700 hover:text-white"
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
