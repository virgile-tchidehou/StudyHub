export const cn = (...classes: Array<string | false | undefined>) =>
  classes.filter(Boolean).join(" ");

const AI_PROVIDER_LABELS: Record<string, string> = {
  gemini: "Gemini",
  groq: "Groq",
  offline: "Hors ligne",
  offline_coach: "Hors ligne",
};

export function formatAiProvider(provider?: string) {
  if (!provider) return "";
  return AI_PROVIDER_LABELS[provider] || provider;
}
