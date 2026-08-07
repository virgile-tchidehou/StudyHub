import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { env } from '../config/env.js';
import { pool } from '../config/database.js';

const router = Router();
router.use(requireAuth);

const MODES = new Set(['english_coach', 'technical_mentor', 'interview', 'general']);
const PROVIDERS = new Set(['gemini', 'groq', 'auto']);
const MAX_PROMPT_LENGTH = 12000;
const MAX_HISTORY_MESSAGES = 12;
const MAX_HISTORY_MESSAGE_LENGTH = 4000;

function buildSystemInstruction(mode, profile = {}) {
  const context = `
You are part of StudyHub, an AI learning and international-study assistant.
User profile context (use only when relevant):
- Target degree: ${profile.target_degree || 'not specified'}
- Field: ${profile.field_of_study || 'not specified'}
- Target countries: ${Array.isArray(profile.target_countries) && profile.target_countries.length ? profile.target_countries.join(', ') : 'not specified'}
- Current academic level/result: ${profile.current_gpa || 'not specified'}
- Target English exam/score: ${profile.target_ielts || 'not specified'}

Never invent missing user information. Ask a concise follow-up question when it is necessary.
`;

  switch (mode) {
    case 'english_coach':
      return `${context}
You are StudyHub's AI English Coach. Help international-study applicants improve practical and academic English for IELTS, TOEFL and university communication.
Prioritize the learner's actual level and goal. When correcting English, use this structure when useful:
1. Corrected version
2. What was wrong
3. Better alternatives
4. One short practice task
For speaking practice, ask one question at a time and wait for the learner's answer. Do not overwhelm the learner with C1/C2 vocabulary unless it is appropriate.
Respond in English by default, but briefly explain difficult points in French when the learner needs it.`;
    case 'technical_mentor':
      return `${context}
You are StudyHub's Technical Mentor. Focus on Embedded Systems, IoT, C/C++, Python, Linux, RTOS, robotics, AI and engineering software.
Teach rather than simply provide answers. Adapt explanations to the learner's level, use practical examples, point out engineering trade-offs, and provide small exercises or interview questions when useful.
When code is requested, prefer correct, maintainable examples and explain important design decisions.`;
    case 'interview':
      return `${context}
You are a demanding but supportive interviewer for international university admissions, scholarships and technical interviews.
Ask one focused question at a time. After the user's answer, evaluate clarity, coherence, evidence, technical accuracy and communication. Give a concise score or assessment, then specific improvements and an improved example answer when useful.`;
    default:
      return `${context}
You are StudyHub's AI Mentor for international study preparation, scholarships, academic planning, career development and learning.
Give practical, structured and honest guidance. Separate facts from assumptions and never claim that a scholarship, university requirement or deadline is current unless reliable current data is supplied to you.`;
  }
}

function sanitizeProfile(profile) {
  if (!profile || typeof profile !== 'object') return {};
  return {
    target_degree: typeof profile.target_degree === 'string' ? profile.target_degree.slice(0, 120) : undefined,
    field_of_study: typeof profile.field_of_study === 'string' ? profile.field_of_study.slice(0, 255) : undefined,
    target_countries: Array.isArray(profile.target_countries) ? profile.target_countries.filter((x) => typeof x === 'string').slice(0, 10) : undefined,
    current_gpa: typeof profile.current_gpa === 'string' ? profile.current_gpa.slice(0, 50) : undefined,
    target_ielts: typeof profile.target_ielts === 'string' ? profile.target_ielts.slice(0, 50) : undefined,
  };
}

async function getStoredProfile(userId) {
  const { rows } = await pool.query(
    `SELECT target_degree, field_of_study, target_countries, current_gpa, target_ielts
     FROM user_profiles WHERE user_id = $1`,
    [userId]
  );
  return sanitizeProfile(rows[0]);
}

function sanitizeHistory(history) {
  if (!Array.isArray(history)) return [];
  return history
    .filter((m) => m && (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string')
    .slice(-MAX_HISTORY_MESSAGES)
    .map((m) => ({ role: m.role, content: m.content.slice(0, MAX_HISTORY_MESSAGE_LENGTH) }));
}

function buildPromptWithHistory(prompt, history) {
  const cleanHistory = sanitizeHistory(history);
  if (!cleanHistory.length) return prompt;
  const transcript = cleanHistory.map((m) => `${m.role === 'user' ? 'Learner' : 'Coach'}: ${m.content}`).join('\n');
  return `Recent conversation context:\n${transcript}\n\nCurrent learner message:\n${prompt}`;
}

async function callGemini(prompt, mode, systemInstruction) {
  const url = `${env.geminiApiUrl}/${env.geminiModel}:generateContent?key=${env.geminiApiKey}`;
  const body = {
    contents: [{ parts: [{ text: prompt }] }],
    systemInstruction: { parts: [{ text: systemInstruction || buildSystemInstruction(mode) }] },
    generationConfig: { temperature: mode === 'english_coach' ? 0.5 : 0.7, maxOutputTokens: 1400 },
  };
  const response = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
  if (!response.ok) throw new Error(`Gemini error (${response.status})`);
  const data = await response.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error('Gemini returned an empty response');
  return { text, provider: 'gemini' };
}

async function callGroq(prompt, mode, systemInstruction) {
  const response = await fetch(env.groqApiUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${env.groqApiKey}` },
    body: JSON.stringify({
      model: env.groqModel,
      messages: [
        { role: 'system', content: systemInstruction || buildSystemInstruction(mode) },
        { role: 'user', content: prompt },
      ],
      temperature: mode === 'english_coach' ? 0.5 : 0.7,
      max_tokens: 1400,
    }),
  });
  if (!response.ok) throw new Error(`Groq error (${response.status})`);
  const data = await response.json();
  const text = data?.choices?.[0]?.message?.content;
  if (!text) throw new Error('Groq returned an empty response');
  return { text, provider: 'groq' };
}

function getOfflineAdvice(mode) {
  if (mode === 'english_coach') return `Let's practice English together.\n\nTell me about your academic background and why you want to study abroad.\n\nAnswer in English in 4–6 sentences. I will correct your grammar, vocabulary and clarity.`;
  if (mode === 'interview') return `Interview practice:\n\nWhy did you choose your field of study, and how does it fit into your long-term career plan?\n\nAnswer naturally in 60–90 seconds. I will evaluate your response.`;
  if (mode === 'technical_mentor') return `Technical practice:\n\nChoose one topic (C/C++, embedded Linux, RTOS, MQTT, ROS2 or IoT) and tell me your current level. I will build a short learning path and give you a practical exercise.`;
  return `I'm ready to help you plan your international-study journey. Tell me your current objective, and we will turn it into concrete next steps.`;
}

router.post('/ask', async (req, res) => {
  try {
    const { prompt, mode = 'general', provider = 'auto', history = [] } = req.body || {};
    if (!prompt || typeof prompt !== 'string' || !prompt.trim()) return res.status(400).json({ error: 'Prompt is required' });
    if (prompt.length > MAX_PROMPT_LENGTH) return res.status(413).json({ error: `Prompt is too long (maximum ${MAX_PROMPT_LENGTH} characters)` });
    if (!MODES.has(mode)) return res.status(400).json({ error: 'Invalid AI mode' });
    if (!PROVIDERS.has(provider)) return res.status(400).json({ error: 'Invalid AI provider' });

    const profile = await getStoredProfile(req.user.id);
    const systemInstruction = buildSystemInstruction(mode, profile);
    const requestPrompt = buildPromptWithHistory(prompt.trim(), history);

    if (provider === 'groq' && env.groqApiKey) {
      try { return res.json(await callGroq(requestPrompt, mode, systemInstruction)); } catch (error) { console.warn('Groq failed:', error.message); }
    }
    if (env.geminiApiKey) {
      try { return res.json(await callGemini(requestPrompt, mode, systemInstruction)); } catch (error) { console.warn('Gemini failed:', error.message); }
    }
    if (env.groqApiKey) {
      try { return res.json(await callGroq(requestPrompt, mode, systemInstruction)); } catch (error) { console.warn('Groq fallback failed:', error.message); }
    }

    return res.json({ text: getOfflineAdvice(mode), provider: 'offline_coach', notice: 'No AI provider is configured. StudyHub is running in offline coaching mode.' });
  } catch (error) {
    console.error('AI route error:', error);
    return res.status(500).json({ error: 'Erreur lors de la communication avec le service IA' });
  }
});

export default router;
