"use client";

import { useEffect, useRef, useState } from "react";
import { useLanguage } from "@/lib/language";
import { flashcardsApi, aiApi, chatMessagesApi, Flashcard } from "@/lib/api";
import { PageHeader } from "@/components/ui/PageHeader";
import {
  MessageSquare,
  Sparkles,
  BookOpen,
  Volume2,
  CheckCircle,
  RefreshCw,
  Send,
  HelpCircle,
  Mic,
  Headphones,
  PenTool,
  Award,
  Zap,
  VolumeX,
} from "lucide-react";

type Sender = "user" | "ai";

interface ChatMessage {
  sender: Sender;
  text: string;
  provider?: string;
}

const SPEAKING_PROMPTS = [
  {
    title: "Describe a challenge you overcame in your studies",
    prompt:
      "Describe a challenge you overcame during your studies. Use the AREA method: Answer, Reason, Example, Alternative.",
  },
  {
    title: "Explain your motivation to study abroad",
    prompt:
      "Explain why you want to study abroad. Focus on academic goals, cultural exchange, and career impact.",
  },
  {
    title: "Compare project-based vs exam-based learning",
    prompt:
      "Compare project-based learning with exam-based learning. Which one better prepares students for international universities?",
  },
];

const LISTENING_EXERCISES = [
  {
    title: "Lecture snippet — Renewable energy implementation",
    text: "Renewable energy adoption has accelerated in Europe, yet implementation gaps remain in sub-Saharan Africa due to infrastructure and financing constraints.",
    questions: [
      "Which region is mentioned as lagging behind?",
      "What are the two main barriers cited?",
    ],
  },
  {
    title: "Seminar excerpt — Academic Research Ethics",
    text: "Good research ethics require informed consent, transparent methodology, and clear attribution of prior work.",
    questions: ["Name one requirement of research ethics mentioned here."],
  },
];

export default function EnglishCoachPage() {
  const { t } = useLanguage();
  const [cards, setCards] = useState<Flashcard[]>([]);
  const [activeTab, setActiveTab] = useState<"chat" | "flashcards" | "writing" | "speaking" | "listening">("chat");

  // AI Provider Switcher (Gemini / Groq / Auto)
  const [aiProvider, setAiProvider] = useState<"auto" | "gemini" | "groq">("auto");

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      sender: "ai",
      text: "Hello! I am your StudyHub AI English Coach. I can help you prepare for IELTS Speaking Part 1-3, TOEFL iBT, practice C1/C2 academic vocabulary, or review your Statement of Purpose (SOP). How can I assist you today?",
    },
  ]);
  const [prompt, setPrompt] = useState("");
  const [loadingAi, setLoadingAi] = useState(false);

  // Audio Speech Synthesis state
  const [speakingText, setSpeakingText] = useState<string | null>(null);

  const speakText = (text: string) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();

    if (speakingText === text) {
      setSpeakingText(null);
      return;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "en-US";
    utterance.rate = 0.95;
    utterance.onend = () => setSpeakingText(null);
    utterance.onerror = () => setSpeakingText(null);

    setSpeakingText(text);
    window.speechSynthesis.speak(utterance);
  };

  useEffect(() => {
    chatMessagesApi.list().then((history) => {
      if (Array.isArray(history) && history.length) {
        setMessages(history.map((m) => ({ sender: m.sender as Sender, text: m.text })));
      }
    }).catch(() => {});

    flashcardsApi.list().then(setCards).catch(() => {});
  }, []);

  const saveMessage = async (message: ChatMessage) => {
    try {
      await chatMessagesApi.create({ mode: "english_coach", sender: message.sender, text: message.text });
    } catch {}
  };

  const [sampleText, setSampleText] = useState("");
  const [correctionResult, setCorrectionResult] = useState<string | null>(null);
  const [correcting, setCorrecting] = useState(false);

  const [speakingPromptIndex, setSpeakingPromptIndex] = useState(0);
  const [speakingAnswer, setSpeakingAnswer] = useState("");
  const [speakingFeedback, setSpeakingFeedback] = useState<string | null>(null);
  const [speakingLoading, setSpeakingLoading] = useState(false);

  const [listeningIndex, setListeningIndex] = useState(0);
  const [listeningAnswers, setListeningAnswers] = useState<string[]>([]);
  const [listeningFeedback, setListeningFeedback] = useState<string | null>(null);
  const [listeningLoading, setListeningLoading] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loadingAi]);

  const handleSendMessage = async (customPrompt?: string) => {
    const textToSend = customPrompt || prompt;
    if (!textToSend.trim() || loadingAi) return;

    const userMessage: ChatMessage = { sender: "user", text: textToSend };
    setMessages((prev) => [...prev, userMessage]);
    saveMessage(userMessage);
    if (!customPrompt) setPrompt("");
    setLoadingAi(true);

    try {
      const res = await aiApi.ask(textToSend, "english_coach", aiProvider);
      const aiMessage: ChatMessage = { sender: "ai", text: res.text, provider: res.provider };
      setMessages((prev) => [...prev, aiMessage]);
      saveMessage(aiMessage);
    } catch {
      const fallback: ChatMessage = {
        sender: "ai",
        text: "When answering IELTS Speaking questions, use the AREA method (Answer, Reason, Example, Alternative) and link your sentences using connectors like 'furthermore' and 'consequently'.",
      };
      setMessages((prev) => [...prev, fallback]);
      saveMessage(fallback);
    } finally {
      setLoadingAi(false);
    }
  };

  const handleToggleCard = async (id: string) => {
    try {
      const updated = await flashcardsApi.toggleMastered(id);
      setCards((prev) => prev.map((c) => (c.id === id ? updated : c)));
    } catch {
      setCards((prev) =>
        prev.map((c) => (c.id === id ? { ...c, mastered: !c.mastered } : c))
      );
    }
  };

  const handleAnalyzeWriting = async () => {
    if (!sampleText.trim() || correcting) return;
    setCorrecting(true);
    setCorrectionResult(null);

    try {
      const p = `Please analyze the following academic text for an international university application SOP or IELTS Essay. Provide: 1) Grammatical corrections, 2) Vocabulary enhancement suggestions (C1/C2 band), 3) Structure & Clarity score out of 10:\n\n"${sampleText}"`;
      const res = await aiApi.ask(p, "english_coach", aiProvider);
      setCorrectionResult(res.text);
    } catch {
      setCorrectionResult(
        "Your text has a clear structure. To raise the level: replace 'very important' with 'pivotal' or 'paramount', and use logical connectors like 'furthermore' and 'consequently'."
      );
    } finally {
      setCorrecting(false);
    }
  };

  const handleSpeakingSubmit = async () => {
    if (!speakingAnswer.trim() || speakingLoading) return;
    setSpeakingLoading(true);
    setSpeakingFeedback(null);

    try {
      const p = `You are an IELTS Speaking examiner. Evaluate this answer: band score (out of 9), 2 strengths, 2 weaknesses, and an improved C1 version.\n\nQuestion: ${SPEAKING_PROMPTS[speakingPromptIndex].prompt}\nAnswer: ${speakingAnswer}`;
      const res = await aiApi.ask(p, "english_coach", aiProvider);
      setSpeakingFeedback(res.text);
    } catch {
      setSpeakingFeedback(
        "Good attempt. To improve: add specific examples, vary sentence structure, and use linking words like 'however' and 'moreover'."
      );
    } finally {
      setSpeakingLoading(false);
    }
  };

  const handleListeningSubmit = async () => {
    const allAnswered = listeningAnswers.every((a) => a && a.trim());
    if (!allAnswered || listeningLoading) return;
    setListeningLoading(true);
    setListeningFeedback(null);

    try {
      const p = `Evaluate these listening comprehension answers briefly based on this text: "${LISTENING_EXERCISES[listeningIndex].text}".\n\nStudent answers:\n${listeningAnswers.map((a, i) => `${i + 1}. ${a}`).join("\n")}`;
      const res = await aiApi.ask(p, "english_coach", aiProvider);
      setListeningFeedback(res.text);
    } catch {
      setListeningFeedback(
        "Review the text carefully. Listening practice improves when you replay short segments and note key nouns and verbs."
      );
    } finally {
      setListeningLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        badge="AI Coach & TTS"
        title={t.englishCoach}
        description={t.englishCoachDesc}
        actions={
          <div className="flex items-center gap-2 bg-slate-100 p-1.5 rounded-xl text-xs font-semibold text-slate-700">
            <Zap className="w-4 h-4 text-violet-600 ml-1" />
            {(["auto", "gemini", "groq"] as const).map((p) => (
              <button
                key={p}
                onClick={() => setAiProvider(p)}
                className={`px-2.5 py-1 rounded-lg transition capitalize ${aiProvider === p ? "bg-white text-indigo-600 shadow-xs" : "hover:text-slate-900"}`}
              >
                {p}
              </button>
            ))}
          </div>
        }
      />

      <div className="card !p-2">
        <div className="flex flex-wrap items-center gap-2 text-xs font-semibold">
          <button
            onClick={() => setActiveTab("chat")}
            className={`px-3 py-2 rounded-lg transition ${
              activeTab === "chat" ? "bg-white text-slate-900 shadow-xs" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            IELTS Speaking & Chat
          </button>
          <button
            onClick={() => setActiveTab("flashcards")}
            className={`px-3 py-2 rounded-lg transition ${
              activeTab === "flashcards" ? "bg-white text-slate-900 shadow-xs" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Vocab Builder ({cards.filter((c) => c.mastered).length}/{cards.length})
          </button>
          <button
            onClick={() => setActiveTab("writing")}
            className={`px-3 py-2 rounded-lg transition ${
              activeTab === "writing" ? "bg-white text-slate-900 shadow-xs" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Writing & SOP Corrector
          </button>
          <button
            onClick={() => setActiveTab("speaking")}
            className={`px-3 py-2 rounded-lg transition ${
              activeTab === "speaking" ? "bg-white text-slate-900 shadow-xs" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Speaking Practice
          </button>
          <button
            onClick={() => setActiveTab("listening")}
            className={`px-3 py-2 rounded-lg transition ${
              activeTab === "listening" ? "bg-white text-slate-900 shadow-xs" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Listening Exercises
          </button>
        </div>
      </div>
      {activeTab === "chat" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-xs flex flex-col h-[520px]">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50 rounded-t-2xl">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-xs font-semibold text-slate-700">
                  AI Coach ({aiProvider === "groq" ? "Groq Llama 3 70B" : "Gemini 3.6 Flash"})
                </span>
              </div>
              <span className="text-xs text-slate-500 font-medium">Target Score: IELTS 7.5+</span>
            </div>

            <div className="flex-1 p-4 overflow-y-auto space-y-4">
              {messages.map((m, idx) => (
                <div
                  key={idx}
                  className={`flex ${m.sender === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[82%] p-4 rounded-2xl text-xs sm:text-sm leading-relaxed relative group ${
                      m.sender === "user"
                        ? "bg-blue-600 text-white rounded-br-none"
                        : "bg-slate-100 text-slate-800 rounded-bl-none border border-slate-200/60"
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{m.text}</p>
                    {m.sender === "ai" && (
                      <button
                        onClick={() => speakText(m.text)}
                        className="mt-2 text-xs font-bold text-blue-600 flex items-center gap-1 hover:underline"
                      >
                        {speakingText === m.text ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                        {speakingText === m.text ? "Stop Audio" : "Écouter l'audio (TTS)"}
                      </button>
                    )}
                  </div>
                </div>
              ))}
              {loadingAi && (
                <div className="flex justify-start">
                  <div className="bg-slate-100 p-3 rounded-2xl text-xs text-slate-500 flex items-center gap-2">
                    <RefreshCw className="w-3.5 h-3.5 animate-spin text-blue-600" />
                    Analyzing your English response...
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            <div className="p-4 border-t border-slate-100 bg-slate-50/50 rounded-b-2xl">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                  placeholder="Type your answer in English or ask a question..."
                  className="flex-1 px-4 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                />
                <button
                  onClick={() => handleSendMessage()}
                  disabled={loadingAi || !prompt.trim()}
                  className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold text-xs rounded-xl transition flex items-center gap-1.5"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2 mb-3">
                <HelpCircle className="w-4 h-4 text-blue-600" />
                IELTS Speaking Cue Cards
              </h3>
              <p className="text-xs text-slate-500 mb-4">
                Click a prompt to simulate a live IELTS interview.
              </p>
              <div className="space-y-2">
                <button
                  onClick={() =>
                    handleSendMessage(
                      "Simulate IELTS Speaking Part 2. Give me a cue card topic about 'An academic project you completed'."
                    )
                  }
                  className="w-full text-left p-3 rounded-xl border border-slate-100 bg-slate-50 hover:bg-blue-50 hover:border-blue-200 transition text-xs font-semibold text-slate-700"
                >
                  Part 2: Academic Project Achievement
                </button>
                <button
                  onClick={() =>
                    handleSendMessage(
                      "Ask me 3 IELTS Speaking Part 1 questions about my degree, my motivation to study abroad, and my career plans."
                    )
                  }
                  className="w-full text-left p-3 rounded-xl border border-slate-100 bg-slate-50 hover:bg-blue-50 hover:border-blue-200 transition text-xs font-semibold text-slate-700"
                >
                  Part 1: Background & Target Major
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab Content 2: Flashcards */}
      {activeTab === "flashcards" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
            <div>
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Academic Vocabulary C1/C2</h3>
              <p className="text-xs text-slate-500">Memorize high-impact words for your SOP and essays with audio pronunciation.</p>
            </div>
            <span className="text-xs font-bold text-blue-700 bg-blue-50 px-3 py-1 rounded-full border border-blue-100">
              {cards.filter((c) => c.mastered).length} / {cards.length} mastered
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {cards.map((card) => (
              <div
                key={card.id}
                className={`p-5 rounded-2xl border transition shadow-xs ${
                  card.mastered
                    ? "bg-emerald-50/40 border-emerald-200"
                    : "bg-white border-slate-200 hover:shadow-md"
                }`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      {card.category}
                    </span>
                    <h4 className="text-base font-bold text-slate-900 mt-1 flex items-center gap-2">
                      {card.word}
                      <span className="text-xs font-normal text-slate-400 font-mono">{card.phonetic}</span>
                      <button
                        onClick={() => speakText(card.word)}
                        className="p-1 rounded bg-slate-100 text-blue-600 hover:bg-blue-50"
                        title="Listen Audio"
                      >
                        <Volume2 className="w-3.5 h-3.5" />
                      </button>
                    </h4>
                  </div>
                  <button
                    onClick={() => handleToggleCard(card.id)}
                    className={`p-1.5 rounded-lg text-xs font-medium transition ${
                      card.mastered
                        ? "bg-emerald-600 text-white"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    <CheckCircle className="w-4 h-4" />
                  </button>
                </div>

                <p className="text-xs text-slate-700 font-medium mt-3 leading-relaxed">{card.definition}</p>
                <p className="text-[11px] text-slate-500 italic mt-2 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                  &quot;{card.example}&quot;
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab Content 3: Writing Corrector */}
      {activeTab === "writing" && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div>
            <h3 className="text-base font-bold text-slate-900">SOP & Writing Corrector</h3>
            <p className="text-xs text-slate-500 mt-1">
              Paste a Statement of Purpose excerpt or IELTS essay. The AI will analyze vocabulary, coherence, and academic tone.
            </p>
          </div>

          <textarea
            value={sampleText}
            onChange={(e) => setSampleText(e.target.value)}
            rows={6}
            placeholder="Paste your SOP or essay here..."
            className="w-full p-4 text-xs sm:text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50 font-mono"
          />

          <button
            onClick={handleAnalyzeWriting}
            disabled={correcting || !sampleText.trim()}
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl transition flex items-center gap-2"
          >
            {correcting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            {correcting ? "Analyzing..." : "Analyze with AI"}
          </button>

          {correctionResult && (
            <div className="mt-6 p-5 rounded-2xl bg-slate-900 text-slate-100 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase tracking-wider text-blue-400 flex items-center gap-2">
                  <Sparkles className="w-4 h-4" /> AI Writing Report
                </h4>
                <button
                  onClick={() => speakText(correctionResult)}
                  className="text-xs font-semibold text-blue-300 hover:underline flex items-center gap-1"
                >
                  <Volume2 className="w-3.5 h-3.5" /> Listen Report
                </button>
              </div>
              <p className="text-xs sm:text-sm leading-relaxed whitespace-pre-wrap text-slate-200">
                {correctionResult}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Tab Content 4: Speaking Practice */}
      {activeTab === "speaking" && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Mic className="w-4 h-4 text-blue-600" /> Speaking Practice
              </h3>
              <p className="text-xs text-slate-500 mt-1">Answer the prompt below. The AI will evaluate your Band Score.</p>
            </div>
            <button
              onClick={() => {
                setSpeakingPromptIndex((i) => (i + 1) % SPEAKING_PROMPTS.length);
                setSpeakingAnswer("");
                setSpeakingFeedback(null);
              }}
              className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl transition flex items-center gap-2"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Next prompt
            </button>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
            <p className="text-xs font-bold text-slate-900">{SPEAKING_PROMPTS[speakingPromptIndex].title}</p>
            <p className="text-xs text-slate-600 mt-1">{SPEAKING_PROMPTS[speakingPromptIndex].prompt}</p>
          </div>

          <textarea
            value={speakingAnswer}
            onChange={(e) => setSpeakingAnswer(e.target.value)}
            rows={5}
            placeholder="Type your spoken response in English..."
            className="w-full p-4 text-xs sm:text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50"
          />

          <button
            onClick={handleSpeakingSubmit}
            disabled={speakingLoading || !speakingAnswer.trim()}
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl transition flex items-center gap-2"
          >
            {speakingLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <PenTool className="w-4 h-4" />}
            {speakingLoading ? "Evaluating..." : "Evaluate Speaking Answer"}
          </button>

          {speakingFeedback && (
            <div className="p-5 rounded-2xl bg-slate-900 text-slate-100 space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-blue-400 flex items-center gap-2">
                <Award className="w-4 h-4" /> Speaking Feedback & Band Score
              </h4>
              <p className="text-xs sm:text-sm leading-relaxed whitespace-pre-wrap text-slate-200">
                {speakingFeedback}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Tab Content 5: Listening */}
      {activeTab === "listening" && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Headphones className="w-4 h-4 text-blue-600" /> Listening Practice & Comprehension
              </h3>
              <p className="text-xs text-slate-500 mt-1">Listen to the excerpt audio or read the text, then answer questions.</p>
            </div>
            <button
              onClick={() => {
                setListeningIndex((i) => (i + 1) % LISTENING_EXERCISES.length);
                setListeningAnswers([]);
                setListeningFeedback(null);
              }}
              className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl transition flex items-center gap-2"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Next exercise
            </button>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-slate-700 uppercase tracking-wider">
                {LISTENING_EXERCISES[listeningIndex].title}
              </span>
              <button
                onClick={() => speakText(LISTENING_EXERCISES[listeningIndex].text)}
                className="px-3 py-1 bg-blue-600 text-white text-xs font-bold rounded-lg flex items-center gap-1"
              >
                <Volume2 className="w-3.5 h-3.5" /> Play Excerpt Audio
              </button>
            </div>
            <p className="text-xs sm:text-sm text-slate-900 leading-relaxed font-serif italic">
              &quot;{LISTENING_EXERCISES[listeningIndex].text}&quot;
            </p>
          </div>

          <div className="space-y-3">
            {LISTENING_EXERCISES[listeningIndex].questions.map((q, i) => (
              <div key={i} className="space-y-1">
                <p className="text-xs font-semibold text-slate-800">{i + 1}. {q}</p>
                <input
                  type="text"
                  value={listeningAnswers[i] || ""}
                  onChange={(e) =>
                    setListeningAnswers((prev) => {
                      const next = [...prev];
                      next[i] = e.target.value;
                      return next;
                    })
                  }
                  placeholder="Your answer..."
                  className="w-full p-3 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                />
              </div>
            ))}
          </div>

          <button
            onClick={handleListeningSubmit}
            disabled={listeningLoading || listeningAnswers.length !== LISTENING_EXERCISES[listeningIndex].questions.length}
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl transition flex items-center gap-2"
          >
            {listeningLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Volume2 className="w-4 h-4" />}
            {listeningLoading ? "Checking..." : "Check Answers with AI"}
          </button>

          {listeningFeedback && (
            <div className="p-5 rounded-2xl bg-slate-900 text-slate-100 space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-blue-400 flex items-center gap-2">
                <Award className="w-4 h-4" /> Listening Evaluation
              </h4>
              <p className="text-xs sm:text-sm leading-relaxed whitespace-pre-wrap text-slate-200">
                {listeningFeedback}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
