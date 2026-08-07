"use client";

import { useEffect, useState } from "react";
import { useLanguage } from "@/lib/language";
import { aiApi, chatMessagesApi, profileApi, StudyProfile, AIHistoryMessage, AIMode } from "@/lib/api";
import Image from "next/image";
import { Bot, Send, ShieldCheck, Video, RefreshCw, Zap, UserRound, BrainCircuit, Target } from "lucide-react";

type Mode = "interview" | "general" | "technical_mentor";
type Message = { sender: "user" | "ai"; text: string; provider?: string };

const MODE_INFO: Record<Mode, { label: string; title: string; description: string; icon: string }> = {
  interview: {
    label: "Entretien & Admission",
    title: "Jury Virtuel — Campus France / Bourses / Visa",
    description: "Une question à la fois, puis une évaluation concrète de votre réponse.",
    icon: "🎤",
  },
  general: {
    label: "Mentor Candidature",
    title: "Mentor — Stratégie d'études internationales",
    description: "Projet académique, choix de Master, candidature, financement et organisation.",
    icon: "🎓",
  },
  technical_mentor: {
    label: "Mentor Technique",
    title: "Mentor — Embedded Systems, IoT & Robotics",
    description: "Apprentissage guidé, projets, concepts techniques et préparation aux entretiens.",
    icon: "⚙️",
  },
};

export default function AiMentorPage() {
  const { t } = useLanguage();
  const [activeMode, setActiveMode] = useState<Mode>("interview");
  const [aiProvider, setAiProvider] = useState<"auto" | "gemini" | "groq">("auto");
  const [prompt, setPrompt] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [history, setHistory] = useState<AIHistoryMessage[]>([]);
  const [profile, setProfile] = useState<StudyProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingContext, setLoadingContext] = useState(true);

  useEffect(() => {
    Promise.all([
      profileApi.get().catch(() => null),
      chatMessagesApi.list().catch(() => []),
    ]).then(([p, saved]) => {
      setProfile(p);
      if (Array.isArray(saved) && saved.length) {
        const restored = saved.slice(-20).map((m) => ({
          sender: m.sender === "user" ? "user" as const : "ai" as const,
          text: m.text,
        }));
        setMessages(restored);
        setHistory(saved.slice(-12).map((m) => ({
          role: m.sender === "user" ? "user" as const : "assistant" as const,
          content: m.text,
        })));
      } else {
        setMessages([{
          sender: "ai",
          text: "Bonjour ! Je suis votre Mentor IA StudyHub. Je connais désormais votre contexte StudyHub et je peux vous accompagner sur votre candidature, vos entretiens et votre progression technique. Choisissez un mode et commençons.",
        }]);
      }
      setLoadingContext(false);
    });
  }, []);

  const saveMessage = async (message: Message) => {
    try {
      await chatMessagesApi.create({ mode: activeMode, sender: message.sender, text: message.text, provider: message.provider });
    } catch {}
  };

  const handleSend = async (customText?: string) => {
    const text = (customText ?? prompt).trim();
    if (!text || loading) return;

    const userMessage: Message = { sender: "user", text };
    const nextHistory = [...history, { role: "user" as const, content: text }].slice(-12);
    setMessages((prev) => [...prev, userMessage]);
    setHistory(nextHistory);
    if (!customText) setPrompt("");
    setLoading(true);
    await saveMessage(userMessage);

    try {
      const res = await aiApi.ask(text, activeMode as AIMode, aiProvider, nextHistory);
      const aiMessage: Message = { sender: "ai", text: res.text, provider: res.provider };
      setMessages((prev) => [...prev, aiMessage]);
      setHistory([...nextHistory, { role: "assistant", content: res.text }].slice(-12));
      await saveMessage(aiMessage);
    } catch {
      const fallback: Message = {
        sender: "ai",
        text: "Je n'ai pas pu joindre le moteur IA. Vérifiez la configuration de l'API puis réessayez. Votre conversation reste disponible dans StudyHub.",
      };
      setMessages((prev) => [...prev, fallback]);
    } finally {
      setLoading(false);
    }
  };

  const info = MODE_INFO[activeMode];

  return (
    <div className="space-y-6">
      <div className="border-b border-slate-200 bg-white p-6 rounded-2xl shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex items-center gap-4">
            <Image src="/logo.png" alt="StudyHub" width={48} height={48} priority />
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-50 text-purple-700 text-xs font-semibold uppercase tracking-wider mb-2">
                <Bot className="w-3.5 h-3.5" /> AI Mentor
              </div>
              <h1 className="text-2xl font-extrabold text-slate-900">{t.aiMentor}</h1>
              <p className="text-slate-600 text-sm mt-1">{info.description}</p>
            </div>
          </div>

          <div className="flex items-center gap-2 bg-slate-100 p-1.5 rounded-xl text-xs font-semibold text-slate-700 shrink-0">
            <Zap className="w-4 h-4 text-purple-600 ml-1" />
            <span>Moteur :</span>
            {(["auto", "gemini", "groq"] as const).map((provider) => (
              <button key={provider} onClick={() => setAiProvider(provider)} className={`px-2.5 py-1 rounded-lg transition ${aiProvider === provider ? "bg-white text-purple-700 shadow-xs" : "hover:text-slate-900"}`}>
                {provider === "auto" ? "Auto" : provider === "gemini" ? "Gemini" : "Groq"}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-2">
          {(Object.keys(MODE_INFO) as Mode[]).map((mode) => (
            <button key={mode} onClick={() => setActiveMode(mode)} className={`text-left p-3 rounded-xl border transition ${activeMode === mode ? "border-purple-300 bg-purple-50" : "border-slate-200 bg-slate-50 hover:bg-white"}`}>
              <div className="text-lg">{MODE_INFO[mode].icon}</div>
              <div className="text-xs font-bold text-slate-900 mt-1">{MODE_INFO[mode].label}</div>
              <div className="text-[11px] text-slate-500 mt-1">{MODE_INFO[mode].description}</div>
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-xs flex flex-col h-[590px]">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50 rounded-t-2xl">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-purple-600 animate-pulse" />
              <span className="text-xs font-semibold text-slate-700">{info.title}</span>
            </div>
            <span className="text-[10px] uppercase font-bold text-purple-700 bg-purple-50 border border-purple-100 px-2.5 py-1 rounded-full">
              {aiProvider === "auto" ? "Auto" : aiProvider}
            </span>
          </div>

          <div className="flex-1 p-4 overflow-y-auto space-y-4">
            {loadingContext && <div className="text-xs text-slate-500">Chargement de votre contexte StudyHub...</div>}
            {messages.map((m, idx) => (
              <div key={`${idx}-${m.sender}`} className={`flex ${m.sender === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[85%] p-4 rounded-2xl text-xs sm:text-sm leading-relaxed ${m.sender === "user" ? "bg-purple-700 text-white rounded-br-none" : "bg-slate-100 text-slate-800 rounded-bl-none border border-slate-200/60"}`}>
                  <p className="whitespace-pre-wrap">{m.text}</p>
                  {m.provider && <div className="mt-2 text-[10px] opacity-60">{m.provider}</div>}
                </div>
              </div>
            ))}
            {loading && <div className="flex justify-start"><div className="bg-slate-100 p-3 rounded-2xl text-xs text-slate-500 flex items-center gap-2"><RefreshCw className="w-3.5 h-3.5 animate-spin text-purple-600" />Le Mentor IA réfléchit...</div></div>}
          </div>

          <div className="p-4 border-t border-slate-100 bg-slate-50/50 rounded-b-2xl">
            <div className="flex gap-2">
              <input value={prompt} onChange={(e) => setPrompt(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleSend()} placeholder={activeMode === "interview" ? "Répondez au jury..." : "Posez votre question..."} className="flex-1 px-4 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white" />
              <button onClick={() => handleSend()} disabled={loading || !prompt.trim()} className="px-4 py-2.5 bg-purple-700 hover:bg-purple-800 disabled:opacity-50 text-white font-semibold text-xs rounded-xl transition"><Send className="w-4 h-4" /></button>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2 mb-3"><UserRound className="w-4 h-4 text-purple-600" /> Contexte utilisé</h3>
            {profile ? (
              <div className="space-y-2 text-xs text-slate-600">
                <p><b>Diplôme :</b> {profile.target_degree || "À définir"}</p>
                <p><b>Domaine :</b> {profile.field_of_study || "À définir"}</p>
                <p><b>Pays :</b> {profile.target_countries?.length ? profile.target_countries.join(", ") : "À définir"}</p>
                <p><b>IELTS :</b> {profile.target_ielts || "À définir"}</p>
                <p><b>Progression :</b> {history.length} messages de contexte disponibles</p>
              </div>
            ) : <p className="text-xs text-slate-500">Complétez votre profil pour personnaliser davantage le Mentor.</p>}
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2 mb-3"><Target className="w-4 h-4 text-purple-600" /> Démarrer rapidement</h3>
            <div className="space-y-2">
              <button onClick={() => handleSend("Commence une simulation d'entretien. Pose-moi la première question et attends ma réponse.")} className="w-full text-left p-3 rounded-xl border border-slate-100 bg-slate-50 hover:bg-purple-50 text-xs font-semibold text-slate-700">🎤 Lancer un entretien</button>
              <button onClick={() => { setActiveMode("technical_mentor"); handleSend("Évalue mes connaissances actuelles en systèmes embarqués et propose-moi un premier exercice pratique."); }} className="w-full text-left p-3 rounded-xl border border-slate-100 bg-slate-50 hover:bg-purple-50 text-xs font-semibold text-slate-700">⚙️ Évaluer mon niveau technique</button>
              <button onClick={() => { setActiveMode("general"); handleSend("Analyse mon projet d'études et donne-moi les trois prochaines actions les plus importantes."); }} className="w-full text-left p-3 rounded-xl border border-slate-100 bg-slate-50 hover:bg-purple-50 text-xs font-semibold text-slate-700">🎓 Construire mes prochaines étapes</button>
            </div>
          </div>

          <div className="bg-slate-900 text-white p-5 rounded-2xl shadow-xs space-y-2">
            <div className="flex items-center gap-2 text-purple-400 text-xs font-bold uppercase tracking-wider"><BrainCircuit className="w-4 h-4" /> Mentor adaptatif</div>
            <p className="text-xs text-slate-300 leading-relaxed">StudyHub combine votre profil et votre historique récent pour éviter de repartir de zéro à chaque question.</p>
            <div className="flex items-start gap-1.5 text-[11px] text-slate-400"><ShieldCheck className="w-3.5 h-3.5 shrink-0 text-purple-400" /> Le contexte reste limité au nécessaire pour chaque session.</div>
          </div>
        </div>
      </div>
    </div>
  );
}
