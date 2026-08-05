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
    <div className="flex items-center gap-1 text-sm" aria-label={t.language}>
      {options.map((opt) => (
        <button
          key={opt.code}
          onClick={() => setLang(opt.code)}
          className={`rounded-md px-2 py-1 transition-colors ${
            lang === opt.code
              ? "bg-gray-900 text-white"
              : "text-gray-600 hover:bg-gray-100"
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
