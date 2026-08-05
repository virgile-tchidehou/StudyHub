"use client";

import { useState } from "react";
import { authApi } from "@/lib/auth-client";
import { useLanguage } from "@/lib/language";

export default function LoginForm() {
  const { t } = useLanguage();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (mode === "signin") {
        await authApi.signInWithEmail({ email, password });
      } else {
        await authApi.signUpWithEmail({ name, email, password });
      }
      window.location.href = "/dashboard";
    } catch (err) {
      setError(err instanceof Error ? err.message : t.authFailed);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      {mode === "signup" && (
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            {t.name}
          </label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-gray-900"
            placeholder={t.namePlaceholder}
          />
        </div>
      )}

      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">
          {t.email}
        </label>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-gray-900"
          placeholder={t.emailPlaceholder}
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">
          {t.password}
        </label>
        <input
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-gray-900"
          placeholder={t.passwordPlaceholder}
        />
      </div>

      {error && (
        <p className="text-sm text-red-600" role="alert">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-gray-800 disabled:opacity-70"
      >
        {loading ? t.pleaseWait : mode === "signin" ? t.signIn : t.signUp}
      </button>

      <button
        type="button"
        disabled={loading}
        onClick={async () => {
          setLoading(true);
          setError(null);
          try {
            await authApi.signInWithEmail({
              email: "demo@studyhub.edu",
              password: "password123",
            });
            window.location.href = "/dashboard";
          } catch {
            window.location.href = "/dashboard";
          } finally {
            setLoading(false);
          }
        }}
        className="w-full rounded-lg bg-blue-50 border border-blue-200 px-4 py-2.5 text-sm font-semibold text-blue-700 transition-colors hover:bg-blue-100 flex items-center justify-center gap-2"
      >
        ⚡ Connexion Démo Rapide (1-Clic sans saisie)
      </button>

      <button
        type="button"
        onClick={() => {
          setMode(mode === "signin" ? "signup" : "signin");
          setError(null);
        }}
        className="w-full text-center text-sm text-gray-600 hover:text-gray-900"
      >
        {mode === "signin" ? t.needAccount : t.haveAccount}
      </button>
    </form>
  );
}
