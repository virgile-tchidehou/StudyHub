import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { env } from '../config/env.js';

const router = Router();
router.use(requireAuth);

function buildSystemInstruction(mode) {
  switch (mode) {
    case 'english_coach':
      return `You are StudyHub's AI English Coach for international students preparing for IELTS, TOEFL, and academic SOPs.
Help with speaking (Part 1-3), grammar corrections, C1/C2 vocabulary enhancements, and essay feedback.
Be encouraging, structured, and give actionable band-score advice. Respond in clear English.`;
    case 'technical_mentor':
      return `You are StudyHub's Technical Mentor for Master & PhD applicants.
Explain engineering concepts (Embedded Systems, RTOS, ARM, C/C++, AI, Data Science, Linux) concisely with clear code snippets and interview whiteboard tips.`;
    case 'interview':
      return `Vous êtes un membre exigeant et bienveillant du jury d'entretien Campus France / Bourses d'Excellence DAAD / Visa d'Études.
Posez une question ciblée sur les motivations, le projet d'études, l'adéquation diplôme-carrière, ou le plan de financement. Évaluez la réponse et donnez un conseil d'amélioration immédiat.`;
    case 'general':
    default:
      return "Vous êtes un mentor expert en orientation et candidatures aux études internationales pour Master, Doctorat et bourses d'études à l'étranger.";
  }
}

async function callGemini(prompt, mode, systemInstruction) {
  const system = systemInstruction || buildSystemInstruction(mode);
  const url = `${env.geminiApiUrl}/${env.geminiModel}:generateContent?key=${env.geminiApiKey}`;

  const body = {
    contents: [{ parts: [{ text: prompt }] }],
    systemInstruction: { parts: [{ text: system }] },
    generationConfig: { temperature: 0.7, maxOutputTokens: 1024 }
  };

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Gemini error (${response.status}): ${errorText}`);
  }

  const data = await response.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || 'Réponse reçue.';
  return { text, provider: 'gemini' };
}

async function callGroq(prompt, mode, systemInstruction) {
  const system = systemInstruction || buildSystemInstruction(mode);
  const url = env.groqApiUrl;

  const body = {
    model: env.groqModel,
    messages: [
      { role: 'system', content: system },
      { role: 'user', content: prompt }
    ],
    temperature: 0.7,
    max_tokens: 1024
  };

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${env.groqApiKey}`
    },
    body: JSON.stringify(body)
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Groq error (${response.status}): ${errorText}`);
  }

  const data = await response.json();
  const text = data?.choices?.[0]?.message?.content || 'Réponse reçue de Groq.';
  return { text, provider: 'groq' };
}

// POST /api/ai/ask
router.post('/ask', async (req, res) => {
  try {
    const { prompt, mode, provider = 'auto', systemInstruction } = req.body || {};

    if (!prompt || typeof prompt !== 'string' || !prompt.trim()) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    // Provider selection logic (Groq / Gemini / Fallback)
    if (provider === 'groq' && env.groqApiKey) {
      try {
        const result = await callGroq(prompt, mode, systemInstruction);
        return res.json(result);
      } catch (err) {
        console.warn('Groq failed, falling back to Gemini/offline:', err.message);
      }
    }

    if (env.geminiApiKey) {
      try {
        const result = await callGemini(prompt, mode, systemInstruction);
        return res.json(result);
      } catch (err) {
        console.warn('Gemini failed:', err.message);
      }
    }

    if (env.groqApiKey) {
      try {
        const result = await callGroq(prompt, mode, systemInstruction);
        return res.json(result);
      } catch (err) {
        console.warn('Groq failed:', err.message);
      }
    }

    // Offline Intelligent Coach Response if API keys not configured
    const offlineAdvice = getOfflineAdvice(prompt, mode);
    return res.json({
      text: offlineAdvice,
      provider: 'offline_coach',
      notice: 'Clés API Gemini/Groq non configurées dans le .env — Mode Assistant Étudiant Actif.'
    });
  } catch (error) {
    console.error('AI route error:', error);
    res.status(500).json({ error: 'Erreur lors de la communication avec le service IA' });
  }
});

function getOfflineAdvice(prompt, mode) {
  const p = prompt.toLowerCase();
  if (mode === 'english_coach' || p.includes('speaking') || p.includes('ielts')) {
    return `Conseil Coach IELTS (Mode Assistant) :
Pour répondre avec succès aux questions d'oral (Speaking Part 2 & 3), appliquez la structure AREA :
1. Answer : Répondez directement à la question.
2. Reason : Donnez la raison principale.
3. Example : Illustrez avec une expérience personnelle ou académique.
4. Alternative : Évoquez un contre-exemple ou une perspective d'avenir.

Exemple de connecteurs C1 : "Furthermore", "Consequently", "Pivotal", "Paramount".`;
  }
  if (mode === 'interview' || p.includes('campus france') || p.includes('entretien')) {
    return `Conseil Entretien Campus France & Visas :
Le jury cherche 3 éléments essentiels :
1. La cohérence du parcours : Pourquoi ce Master précisément après votre diplôme actuel ?
2. Le projet professionnel : Quel poste viserez-vous après l'obtention du diplôme ?
3. Le plan de financement : Justifiez les ressources financières et l'autonomie sur place.`;
  }
  return `Bonjour ! Pour maximiser vos chances d'admission en Master et l'obtention d'une bourse d'excellence :
- Assurez-vous que votre CV Académique respecte la norme Europass.
- Rédigez votre Statement of Purpose en montrant ce que VOUS allez apporter à l'université.
- Préparez votre attestation d'anglais (IELTS 7.0+ ou TOEFL 90+).`;
}

export default router;
