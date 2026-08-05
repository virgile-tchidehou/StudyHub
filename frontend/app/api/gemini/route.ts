import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { prompt, systemInstruction, mode } = body;

    if (!prompt) {
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      // Fallback intelligent response if key isn't provided yet
      return NextResponse.json({
        text: `[StudyHub AI Assistant]: Merci pour votre question. Pour activer la pleine puissance de Gemini 3.6 Flash, assurez-vous d'ajouter votre GEMINI_API_KEY. Voici une réponse préliminaire pour "${prompt.slice(0, 40)}..." : Assurez-vous d'avoir structuré votre CV au format Europass ou Canadien, d'avoir obtenu votre attestation de langue (IELTS 6.5+ ou TOEFL 90+) et de rédiger une lettre de motivation ciblée (SOP).`,
      });
    }

    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });

    let defaultSysInstruction = "Vous êtes StudyHub AI, un assistant d'accompagnement académique international et mentor d'études supérieures. Répondez de manière structurée, encourageante, professionnelle et pratique en français ou en anglais selon la langue du message du candidat.";

    if (mode === "english_coach") {
      defaultSysInstruction = "You are StudyHub AI English Coach. Help the student improve their English for IELTS, TOEFL, SOP writing, and academic interviews. Correct grammar mistakes politely, suggest elevated vocabulary, and provide clear actionable feedback.";
    } else if (mode === "technical_mentor") {
      defaultSysInstruction = "You are StudyHub Technical Mentor. Help students master technical topics (Embedded Systems, C/C++, Linux, ROS2, Data Science, AI, Cyber Security). Provide concise code examples, clear architectural explanations, and practical advice.";
    }

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: prompt,
      config: {
        systemInstruction: systemInstruction || defaultSysInstruction,
        temperature: 0.7,
      },
    });

    return NextResponse.json({
      text: response.text || "Désolé, aucune réponse générée.",
    });
  } catch (err) {
    console.error("Gemini API Error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Erreur interne Gemini API" },
      { status: 500 }
    );
  }
}
