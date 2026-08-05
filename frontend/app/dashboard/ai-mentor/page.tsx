"use client";

import { useState } from "react";
import { useLanguage } from "@/lib/language";
import { aiApi } from "@/lib/api";
import { Bot, Sparkles, Send, ShieldCheck, GraduationCap, Video, HelpCircle, FileCheck, RefreshCw, Zap } from "lucide-react";

export default function AiMentorPage() {
  const { t } = useLanguage();
  const [activeMode, setActiveMode] = useState<"interview" | "sop_review" | "tech_concept">("interview");
  const [aiProvider, setAiProvider] = useState<"auto" | "gemini" | "groq">("auto");
  const [prompt, setPrompt] = useState("");
  const [messages, setMessages] = useState<Array<{ sender: "user" | "ai"; text: string; provider?: string }>>([
    {
      sender: "ai",
      text: "Bonjour ! Je suis votre Mentor IA StudyHub. Je peux simuler votre entretien Campus France, DAAD ou de visa d'études, évaluer votre projet académique ou vous expliquer des concepts scientifiques complexes. Que souhaitez-vous préparer aujourd'hui ?",
    },
  ]);
  const [loading, setLoading] = useState(false);

  const handleSend = async (customText?: string) => {
    const textToSend = customText || prompt;
    if (!textToSend.trim() || loading) return;

    setMessages((prev) => [...prev, { sender: "user", text: textToSend }]);
    if (!customText) setPrompt("");
    setLoading(true);

    let sysInst = "Vous êtes le Mentor IA d'admission aux études internationales (Campus France, DAAD, Bourses d'Excellence, Visas). Soyez exigeant, bienveillant et synthétique.";
    if (activeMode === "interview") {
      sysInst = "Vous êtes un membre du jury d'entretien Campus France / DAAD. Posez une question ciblée à la fois au candidat sur ses motivations, son projet d'études, son financement ou son retour au pays. Après sa réponse, donnez une note/feedback constructif et posez la question suivante.";
    } else if (activeMode === "tech_concept") {
      sysInst = "Vous êtes un professeur encadrant de Master / Doctorat. Expliquez les concepts scientifiques et techniques de manière pédagogique, avec des exemples clairs et concis.";
    }

    try {
      const res = await aiApi.ask(textToSend, activeMode === "interview" ? "interview" : "general", aiProvider, sysInst);
      setMessages((prev) => [...prev, { sender: "ai", text: res.text, provider: res.provider }]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          sender: "ai",
          text: "Pour votre entretien Campus France, préparez 3 points clés : 1) Pourquoi la France et ce Master spécifique ? 2) Quel est votre projet professionnel après le diplôme ? 3) Comment financerez-vous vos études ?",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 bg-white p-6 rounded-2xl shadow-xs">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-50 text-purple-700 text-xs font-semibold uppercase tracking-wider mb-2">
            <Bot className="w-3.5 h-3.5" /> Module 5 — AI Mentor & Jury Virtuel
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900">{t.aiMentor}</h1>
          <p className="text-slate-600 text-sm mt-1">{t.aiMentorDesc}</p>
        </div>

        {/* AI Provider Switcher */}
        <div className="flex items-center gap-2 bg-slate-100 p-1.5 rounded-xl text-xs font-semibold text-slate-700 shrink-0">
          <Zap className="w-4 h-4 text-purple-600 ml-1" />
          <span>Moteur IA :</span>
          <button
            onClick={() => setAiProvider("auto")}
            className={`px-2.5 py-1 rounded-lg transition ${aiProvider === "auto" ? "bg-white text-purple-700 shadow-xs" : "hover:text-slate-900"}`}
          >
            Auto
          </button>
          <button
            onClick={() => setAiProvider("gemini")}
            className={`px-2.5 py-1 rounded-lg transition ${aiProvider === "gemini" ? "bg-white text-purple-700 shadow-xs" : "hover:text-slate-900"}`}
          >
            Gemini 3.6
          </button>
          <button
            onClick={() => setAiProvider("groq")}
            className={`px-2.5 py-1 rounded-lg transition ${aiProvider === "groq" ? "bg-white text-purple-700 shadow-xs" : "hover:text-slate-900"}`}
          >
            Groq Llama 3
          </button>
        </div>
      </div>

      {/* Mode Switcher Tabs */}
      <div className="flex flex-wrap items-center gap-2 bg-slate-100 p-1.5 rounded-xl text-xs font-semibold">
        <button
          onClick={() => setActiveMode("interview")}
          className={`px-4 py-2 rounded-lg transition ${
            activeMode === "interview" ? "bg-white text-purple-700 shadow-xs font-bold" : "text-slate-600 hover:text-slate-900"
          }`}
        >
          🇫🇷 Simulation Entretien (Campus France / Visas)
        </button>
        <button
          onClick={() => setActiveMode("sop_review")}
          className={`px-4 py-2 rounded-lg transition ${
            activeMode === "sop_review" ? "bg-white text-purple-700 shadow-xs font-bold" : "text-slate-600 hover:text-slate-900"
          }`}
        >
          📄 Critique de Projet & SOP
        </button>
        <button
          onClick={() => setActiveMode("tech_concept")}
          className={`px-4 py-2 rounded-lg transition ${
            activeMode === "tech_concept" ? "bg-white text-purple-700 shadow-xs font-bold" : "text-slate-600 hover:text-slate-900"
          }`}
        >
          🎓 Tuteur Académique & Sciences
        </button>
      </div>

      {/* Main Mentor Chat Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-xs flex flex-col h-[530px]">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50 rounded-t-2xl">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-purple-600 animate-pulse" />
              <span className="text-xs font-semibold text-slate-700">
                {activeMode === "interview" && "Jury Virtuel — Entretien Campus France & Visas"}
                {activeMode === "sop_review" && "Expert Candidatures — Evaluation de Projet"}
                {activeMode === "tech_concept" && "Mentor Scientifique & Ingénierie"}
              </span>
            </div>
            <span className="text-[10px] uppercase font-bold text-purple-700 bg-purple-50 border border-purple-100 px-2.5 py-1 rounded-full">
              {aiProvider === "groq" ? "Groq Llama 3 70B" : "Gemini 3.6 Flash"}
            </span>
          </div>

          <div className="flex-1 p-4 overflow-y-auto space-y-4">
            {messages.map((m, idx) => (
              <div
                key={idx}
                className={`flex ${m.sender === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[85%] p-4 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                    m.sender === "user"
                      ? "bg-purple-700 text-white rounded-br-none"
                      : "bg-slate-100 text-slate-800 rounded-bl-none border border-slate-200/60"
                  }`}
                >
                  <p className="whitespace-pre-wrap">{m.text}</p>
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-slate-100 p-3 rounded-2xl text-xs text-slate-500 flex items-center gap-2">
                  <RefreshCw className="w-3.5 h-3.5 animate-spin text-purple-600" />
                  Le Mentor IA formule sa réponse...
                </div>
              </div>
            )}
          </div>

          <div className="p-4 border-t border-slate-100 bg-slate-50/50 rounded-b-2xl">
            <div className="flex gap-2">
              <input
                type="text"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                placeholder="Posez votre question ou répondez au jury..."
                className="flex-1 px-4 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white"
              />
              <button
                onClick={() => handleSend()}
                disabled={loading || !prompt.trim()}
                className="px-4 py-2.5 bg-purple-700 hover:bg-purple-800 disabled:opacity-50 text-white font-semibold text-xs rounded-xl transition flex items-center gap-1.5"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Quick Question Scenarios */}
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2 mb-3">
              <Video className="w-4 h-4 text-purple-600" />
              Scénarios d'Entretien Rapides
            </h3>
            <div className="space-y-2">
              <button
                onClick={() =>
                  handleSend(
                    "Commence l'entretien Campus France. Pose-moi la première question sur les motifs du choix de mes universités."
                  )
                }
                className="w-full text-left p-3 rounded-xl border border-slate-100 bg-slate-50 hover:bg-purple-50 hover:border-purple-200 transition text-xs font-semibold text-slate-700"
              >
                🇫🇷 Lancer simulation Campus France
              </button>
              <button
                onClick={() =>
                  handleSend(
                    "Simule un entretien pour la Bourse DAAD en Allemagne. Demande-moi d'expliquer mon projet de recherche de Master."
                  )
                }
                className="w-full text-left p-3 rounded-xl border border-slate-100 bg-slate-50 hover:bg-purple-50 hover:border-purple-200 transition text-xs font-semibold text-slate-700"
              >
                🇩🇪 Lancer simulation Bourse DAAD
              </button>
              <button
                onClick={() =>
                  handleSend(
                    "Comment justifier auprès du consulat mes moyens financiers et garants de manière convaincante ?"
                  )
                }
                className="w-full text-left p-3 rounded-xl border border-slate-100 bg-slate-50 hover:bg-purple-50 hover:border-purple-200 transition text-xs font-semibold text-slate-700"
              >
                💰 Conseil Visa : Plan de Financement
              </button>
            </div>
          </div>

          <div className="bg-slate-900 text-white p-5 rounded-2xl shadow-xs border border-slate-800 space-y-2">
            <div className="flex items-center gap-2 text-purple-400 text-xs font-bold uppercase tracking-wider">
              <ShieldCheck className="w-4 h-4" /> Clés de Réussite aux Entretiens
            </div>
            <ul className="text-xs text-slate-300 space-y-2 leading-relaxed">
              <li className="flex items-start gap-1.5">
                <span className="text-purple-400 font-bold">•</span>
                <span>Liez directement chaque cours du Master à votre projet professionnel futur.</span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-purple-400 font-bold">•</span>
                <span>Démontrez votre autonomie financière et la clarté de vos garants.</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
