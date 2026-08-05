"use client";

import LoginForm from "@/components/auth/LoginForm";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { useLanguage } from "@/lib/language";
import Image from "next/image";

export default function LoginPage() {
  const { t } = useLanguage();

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="absolute right-4 top-4">
        <LanguageSwitcher />
      </div>
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-sm text-center">
        <Image src="/logo.png" alt="StudyHub" width={56} height={56} className="mx-auto mb-4" priority />
        <h1 className="text-2xl font-semibold text-gray-900">{t.loginTitle}</h1>
        <p className="mt-2 text-sm text-gray-600">{t.loginSubtitle}</p>
        <div className="mt-6">
          <LoginForm />
        </div>
      </div>
    </div>
  );
}
