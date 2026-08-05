"use client";

import { useState, useEffect } from "react";
import { useLanguage } from "@/lib/language";
import { aiApi, technicalApi } from "@/lib/api";
import { Code, Cpu, Brain, Layers, CheckCircle, ChevronRight, Sparkles, BookOpen, Terminal, RefreshCw, Zap } from "lucide-react";

interface NodeItem {
  id: string;
  title: string;
  level: "Fondations" | "Intermédiaire" | "Avancé";
  description: string;
  prompt: string;
}

interface Track {
  id: string;
  title: string;
  icon: typeof Cpu;
  color: string;
  nodes: NodeItem[];
}

const tracks: Track[] = [
  {
    id: "embedded",
    title: "Systèmes Embarqués & Robotique (RTOS, C/C++, ARM)",
    icon: Cpu,
    color: "from-blue-600 to-indigo-700",
    nodes: [
      {
        id: "emb-1",
        title: "Gestion Mémoire C/C++ & Pointeurs ARM Cortex-M",
        level: "Fondations",
        description: "Compréhension de la Pile (Stack), du Tas (Heap) et de la mémoire volatile.",
        prompt: "Explique de façon concise la différence entre la Stack et la Heap en C pour microcontrôleurs ARM avec un exemple d'allocation mémoire.",
      },
      {
        id: "emb-2",
        title: "FreeRTOS Task Scheduling & Sémophores/Mutexes",
        level: "Intermédiaire",
        description: "Gestion de la concurrence, inversion de priorité et évitement des interblocages.",
        prompt: "Explique l'inversion de priorité dans FreeRTOS et comment les Mutex avec Priority Inheritance résolvent ce problème.",
      },
      {
        id: "emb-3",
        title: "Drivers Linux Embarqué & Device Tree",
        level: "Avancé",
        description: "Écriture de modules noyau Linux (Kernel Modules) et communication I2C/SPI.",
        prompt: "Qu'est-ce qu'un Device Tree en Linux Embarqué et comment un driver charge-t-il les registres I2C ?",
      },
    ],
  },
  {
    id: "ai",
    title: "Data Science & Intelligence Artificielle (Deep Learning & Edge AI)",
    icon: Brain,
    color: "from-purple-600 to-pink-600",
    nodes: [
      {
        id: "ai-1",
        title: "Mathématiques de l'IA & Algèbre Linéaire",
        level: "Fondations",
        description: "Multiplication matricielle, SVD, Gradient Descent et calcul tensoriel.",
        prompt: "Explique le fonctionnement du Gradient Descent et du Learning Rate avec des formules simples et intuitives.",
      },
      {
        id: "ai-2",
        title: "Deep Learning & Architecture Transformers",
        level: "Intermédiaire",
        description: "Mécanismes d'Attention (Self-Attention), Positional Encoding et LLMs.",
        prompt: "Explique le mécanisme de Self-Attention (Query, Key, Value) dans l'architecture Transformer.",
      },
      {
        id: "ai-3",
        title: "Model Optimization & Quantization (ONNX / TensorRT)",
        level: "Avancé",
        description: "Optimisation de modèles pour le déploiement edge/embarqué (FP16/INT8).",
        prompt: "Comment fonctionne la quantification de modèles d'IA INT8 et quels sont les avantages pour l'edge computing ?",
      },
    ],
  },
];

export default function TechnicalLearningPage() {
  const { t } = useLanguage();
  const [selectedTrack, setSelectedTrack] = useState(tracks[0]);
  const [activeNode, setActiveNode] = useState<NodeItem>(tracks[0].nodes[0]);
  const [masteredNodes, setMasteredNodes] = useState<string[]>([]);
  const [aiExplanation, setAiExplanation] = useState<string | null>(null);
  const [loadingAi, setLoadingAi] = useState(false);
  const [aiProvider, setAiProvider] = useState<"auto" | "gemini" | "groq">("auto");

  useEffect(() => {
    technicalApi.getProgress().then((data) => {
      if (Array.isArray(data)) {
        setMasteredNodes(data.map((d) => d.node_id));
      }
    }).catch(() => {});
  }, []);

  const handleToggleMastered = async (nodeId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const res = await technicalApi.toggleNode(selectedTrack.id, nodeId);
      if (res.status === "completed") {
        setMasteredNodes((prev) => [...prev, nodeId]);
      } else {
        setMasteredNodes((prev) => prev.filter((id) => id !== nodeId));
      }
    } catch {
      setMasteredNodes((prev) =>
        prev.includes(nodeId) ? prev.filter((id) => id !== nodeId) : [...prev, nodeId]
      );
    }
  };

  const handleExplain = async (node: NodeItem) => {
    setActiveNode(node);
    setLoadingAi(true);
    setAiExplanation(null);

    try {
      const res = await aiApi.ask(node.prompt, "technical_mentor", aiProvider);
      setAiExplanation(res.text);
    } catch {
      setAiExplanation(
        `Explication technique pour "${node.title}" :\nCe concept est fondamental pour réussir les entretiens techniques de Master. Assurez-vous de pouvoir écrire une implémentation minimale sur tableau blanc.`
      );
    } finally {
      setLoadingAi(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 bg-white p-6 rounded-2xl shadow-xs">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900 text-white text-xs font-semibold uppercase tracking-wider mb-2">
            <Code className="w-3.5 h-3.5 text-blue-400" /> Module 6 — Roadmaps Techniques & Ingénierie
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900">{t.technicalLearning}</h1>
          <p className="text-slate-600 text-sm mt-1">{t.technicalLearningDesc}</p>
        </div>

        {/* AI Provider Switcher */}
        <div className="flex items-center gap-2 bg-slate-100 p-1.5 rounded-xl text-xs font-semibold text-slate-700 shrink-0">
          <Zap className="w-4 h-4 text-blue-600 ml-1" />
          <span>Moteur IA :</span>
          <button
            onClick={() => setAiProvider("auto")}
            className={`px-2.5 py-1 rounded-lg transition ${aiProvider === "auto" ? "bg-white text-blue-600 shadow-xs" : "hover:text-slate-900"}`}
          >
            Auto
          </button>
          <button
            onClick={() => setAiProvider("gemini")}
            className={`px-2.5 py-1 rounded-lg transition ${aiProvider === "gemini" ? "bg-white text-blue-600 shadow-xs" : "hover:text-slate-900"}`}
          >
            Gemini
          </button>
          <button
            onClick={() => setAiProvider("groq")}
            className={`px-2.5 py-1 rounded-lg transition ${aiProvider === "groq" ? "bg-white text-purple-600 shadow-xs" : "hover:text-slate-900"}`}
          >
            Groq Llama 3
          </button>
        </div>
      </div>

      {/* Track Selector Tabs */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {tracks.map((track) => {
          const Icon = track.icon;
          const isSelected = selectedTrack.id === track.id;
          return (
            <button
              key={track.id}
              onClick={() => {
                setSelectedTrack(track);
                setActiveNode(track.nodes[0]);
                setAiExplanation(null);
              }}
              className={`p-5 rounded-2xl border text-left transition flex items-start gap-4 shadow-xs ${
                isSelected
                  ? "bg-white border-blue-600 ring-2 ring-blue-500/20 shadow-md"
                  : "bg-white border-slate-200 hover:border-slate-300"
              }`}
            >
              <div className={`p-3 rounded-xl bg-gradient-to-br ${track.color} text-white shrink-0 shadow-xs`}>
                <Icon className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-sm">{track.title}</h3>
                <p className="text-xs text-slate-500 mt-1">{track.nodes.length} Modules de préparation au Master</p>
              </div>
            </button>
          );
        })}
      </div>

      {/* Learning Tree & AI Assistant Split View */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Node Tree Steps */}
        <div className="lg:col-span-5 space-y-3">
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-4 flex items-center justify-between">
              <span>Feuille de Route & Modules</span>
              <span className="text-[10px] text-slate-400 font-normal">Cliquer pour cours IA</span>
            </h3>

            <div className="space-y-3">
              {selectedTrack.nodes.map((node, index) => {
                const isActive = activeNode.id === node.id;
                const isMastered = masteredNodes.includes(node.id);
                return (
                  <div
                    key={node.id}
                    onClick={() => handleExplain(node)}
                    className={`p-4 rounded-xl border cursor-pointer transition ${
                      isActive
                        ? "bg-blue-50/70 border-blue-400 ring-1 ring-blue-400"
                        : "bg-slate-50 hover:bg-slate-100/80 border-slate-200"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-white border border-slate-200 text-slate-600">
                        Étape {index + 1} — {node.level}
                      </span>

                      <button
                        onClick={(e) => handleToggleMastered(node.id, e)}
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 transition ${
                          isMastered ? "bg-emerald-100 text-emerald-800" : "bg-slate-200 text-slate-600 hover:bg-slate-300"
                        }`}
                      >
                        <CheckCircle className="w-3 h-3" /> {isMastered ? "Maîtrisé" : "Marquer maîtrisé"}
                      </button>
                    </div>

                    <h4 className="text-xs sm:text-sm font-bold text-slate-900 leading-snug">{node.title}</h4>
                    <p className="text-xs text-slate-500 mt-1">{node.description}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* AI Tutor Panel */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col min-h-[420px]">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-blue-600" />
              <h3 className="text-sm sm:text-base font-bold text-slate-900">
                Tuteur IA : {activeNode.title}
              </h3>
            </div>
            <button
              onClick={() => handleExplain(activeNode)}
              className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl transition flex items-center gap-1.5"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loadingAi ? "animate-spin" : ""}`} /> Générer Cours Synthétique
            </button>
          </div>

          <div className="flex-1 bg-slate-900 text-slate-100 p-5 rounded-xl font-mono text-xs leading-relaxed overflow-y-auto">
            {loadingAi ? (
              <div className="flex items-center justify-center h-48 text-slate-400 gap-2">
                <RefreshCw className="w-4 h-4 animate-spin text-blue-400" />
                L'IA ({aiProvider === "groq" ? "Groq Llama 3" : "Gemini 3.6"}) rédige la fiche de cours et les conseils tableau blanc...
              </div>
            ) : aiExplanation ? (
              <p className="whitespace-pre-wrap font-sans text-xs sm:text-sm text-slate-200 leading-relaxed">
                {aiExplanation}
              </p>
            ) : (
              <div className="text-center text-slate-400 py-12">
                <Terminal className="w-8 h-8 mx-auto mb-2 text-slate-600" />
                Sélectionnez un sujet à gauche pour générer le cours et les questions d'entretien.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
