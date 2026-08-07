import type { Metadata } from "next";
import "../styles/globals.css";
import { LanguageProvider } from "@/lib/language";

export const metadata: Metadata = {
  title: "StudyHub",
  description: "StudyHub — plateforme d'accompagnement aux études internationales",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body className="antialiased text-slate-900">
        <LanguageProvider>{children}</LanguageProvider>
      </body>
    </html>
  );
}
