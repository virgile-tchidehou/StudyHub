"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { defaultLang, getDictionary, type Dict, type Lang } from "./i18n";

const LANG_COOKIE = "NEXT_LOCALE";

type LanguageContextValue = {
  lang: Lang;
  t: Dict;
  setLang: (lang: Lang) => void;
};

const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(defaultLang);

  // Read persisted language on mount (client only)
  useEffect(() => {
    const stored = (localStorage.getItem(LANG_COOKIE) as Lang) || defaultLang;
    if (stored === "fr" || stored === "en") setLangState(stored);
  }, []);

  function setLang(next: Lang) {
    setLangState(next);
    localStorage.setItem(LANG_COOKIE, next);
    document.cookie = `${LANG_COOKIE}=${next}; path=/; max-age=31536000; samesite=lax`;
    document.documentElement.lang = next;
  }

  return (
    <LanguageContext.Provider value={{ lang, t: getDictionary(lang), setLang }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage(): LanguageContextValue {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    // Safe fallback if used outside provider
    return { lang: defaultLang, t: getDictionary(defaultLang), setLang: () => {} };
  }
  return ctx;
}
