import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { env } from '../config/env.js';
import { pool } from '../config/database.js';

const router = Router();
router.use(requireAuth);

const MODES = new Set(['english_coach', 'technical_mentor', 'interview', 'general']);
const PROVIDERS = new Set(['gemini', 'groq', 'auto']);
const DAILY_PLAN_STATUSES = new Set(['completed', 'dismissed']);
const MAX_PROMPT_LENGTH = 12000;
const MAX_HISTORY_MESSAGES = 12;
const MAX_HISTORY_MESSAGE_LENGTH = 4000;

function makeActionKey(category, title) {
  const safeCategory = String(category || 'general').toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 24);
  const safeTitle = String(title || 'action').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '').slice(0, 72);
  return `${safeCategory}:${safeTitle || 'action'}`;
}

function buildSystemInstruction(mode, profile = {}, contextSummary = '') {
  const context = `
You are part of StudyHub, an AI learning and international-study assistant.
User profile context (use only when relevant):
- Target degree: ${profile.target_degree || 'not specified'}
- Field: ${profile.field_of_study || 'not specified'}
- Target countries: ${Array.isArray(profile.target_countries) && profile.target_countries.length ? profile.target_countries.join(', ') : 'not specified'}
- Current academic level/result: ${profile.current_gpa || 'not specified'}
- Target English exam/score: ${profile.target_ielts || 'not specified'}
${contextSummary ? `\nStudyHub context:\n${contextSummary}` : ''}

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

async function getUserStudyContext(userId) {
  const [profile, goals, plannerTasks, documents, universities, scholarships, technicalProgress, recentMessages, dailyPlanEvents] = await Promise.all([
    getStoredProfile(userId),
    pool.query('SELECT title, description, target_date, progress, completed FROM goals WHERE user_id = $1 ORDER BY created_at DESC', [userId]),
    pool.query('SELECT title, category, duration_minutes, due_date, completed FROM planner_tasks WHERE user_id = $1 ORDER BY created_at DESC', [userId]),
    pool.query('SELECT title, status, type FROM documents WHERE user_id = $1 ORDER BY created_at DESC', [userId]),
    pool.query('SELECT name, country, application_status FROM universities WHERE user_id = $1 ORDER BY created_at DESC', [userId]),
    pool.query('SELECT name, deadline, status FROM scholarships WHERE user_id = $1 ORDER BY created_at DESC', [userId]),
    pool.query('SELECT track_id, node_id, status FROM technical_progress WHERE user_id = $1 ORDER BY created_at DESC', [userId]),
    pool.query('SELECT mode, sender, text FROM gemini_chat_messages WHERE user_id = $1 ORDER BY created_at DESC LIMIT 6', [userId]),
    pool.query(
      `SELECT action_key, status
       FROM ai_action_events
       WHERE user_id = $1 AND source = 'daily_plan' AND plan_date = CURRENT_DATE`,
      [userId]
    ).catch(() => ({ rows: [] })),
  ]);

  const dailyEventMap = (dailyPlanEvents?.rows || []).reduce((acc, row) => {
    if (row?.action_key && row?.status) acc[row.action_key] = row.status;
    return acc;
  }, {});

  return {
    profile,
    goals: (goals.rows || []).filter((goal) => !goal.completed).slice(0, 5),
    plannerTasks: (plannerTasks.rows || []).filter((task) => !task.completed).slice(0, 5),
    documents: (documents.rows || []).slice(0, 3),
    universities: (universities.rows || []).slice(0, 3),
    scholarships: (scholarships.rows || []).slice(0, 3),
    technicalProgress: (technicalProgress.rows || []).slice(0, 5),
    recentMessages: (recentMessages.rows || []).slice(0, 4),
    dailyEventMap,
  };
}

function buildContextSummary(context) {
  const parts = [];
  const profile = context.profile || {};

  if (profile.target_degree || profile.field_of_study) {
    parts.push(`- Profile: ${profile.target_degree || 'degree not set'} / ${profile.field_of_study || 'field not set'}`);
  }

  if (Array.isArray(profile.target_countries) && profile.target_countries.length) {
    parts.push(`- Target countries: ${profile.target_countries.join(', ')}`);
  }

  if (profile.target_ielts) {
    parts.push(`- IELTS target: ${profile.target_ielts}`);
  }

  if (context.goals?.length) {
    const goalSummary = context.goals.map((goal) => `${goal.title} (${goal.progress || 0}%)`).join(', ');
    parts.push(`- Active goals: ${goalSummary}`);
  }

  if (context.plannerTasks?.length) {
    const pendingTasks = context.plannerTasks.map((task) => `${task.title} [${task.category || 'general'}]`).join(', ');
    parts.push(`- Upcoming tasks: ${pendingTasks}`);
  }

  if (context.universities?.length) {
    const tracked = context.universities.map((uni) => uni.name).join(', ');
    parts.push(`- Universities tracked: ${tracked}`);
  }

  if (context.scholarships?.length) {
    const scholarships = context.scholarships.map((item) => item.name).join(', ');
    parts.push(`- Saved scholarships: ${scholarships}`);
  }

  if (context.technicalProgress?.length) {
    parts.push(`- Technical progress nodes: ${context.technicalProgress.length}`);
  }

  if (context.documents?.length) {
    const docs = context.documents.map((doc) => doc.title).join(', ');
    parts.push(`- Recent documents: ${docs}`);
  }

  return parts.join('\n');
}

function sanitizeHistory(history) {
  if (!Array.isArray(history)) return [];
  return history
    .filter((m) => m && (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string')
    .slice(-MAX_HISTORY_MESSAGES)
    .map((m) => ({ role: m.role, content: m.content.slice(0, MAX_HISTORY_MESSAGE_LENGTH) }));
}

function buildPromptWithHistory(prompt, history, contextSummary = '') {
  const cleanHistory = sanitizeHistory(history);
  const contextBlock = contextSummary ? `StudyHub context:\n${contextSummary}\n\n` : '';
  if (!cleanHistory.length) return `${contextBlock}Current learner message:\n${prompt}`;
  const transcript = cleanHistory.map((m) => `${m.role === 'user' ? 'Learner' : 'Coach'}: ${m.content}`).join('\n');
  return `${contextBlock}Recent conversation context:\n${transcript}\n\nCurrent learner message:\n${prompt}`;
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

function getOfflineAdvice(mode, userPrompt = '') {
  const greeting = userPrompt
    ? `\n\nVous avez écrit : « ${userPrompt.slice(0, 200)} »\n`
    : '\n';

  if (mode === 'english_coach') {
    return `Continuons en mode hors ligne.${greeting}\nRépondez en anglais en 4–6 phrases : présentez votre parcours académique et votre projet d'études à l'étranger. Quand l'IA sera de nouveau disponible, je corrigerai votre grammaire et votre vocabulaire.`;
  }
  if (mode === 'interview') {
    return `Entraînement entretien (mode hors ligne).${greeting}\nStructurez votre réponse en 60–90 secondes :\n1. Présentation courte\n2. Projet académique\n3. Lien avec votre objectif de carrière\n\nQuestion : Why did you choose your field of study, and how does it fit into your long-term career plan?`;
  }
  if (mode === 'technical_mentor') {
    return `Mentor technique (mode hors ligne).${greeting}\nIndiquez un sujet (C/C++, Linux embarqué, RTOS, MQTT, ROS2, IoT) et votre niveau actuel. Je vous proposerai un mini-plan d'étude et un exercice pratique.`;
  }
  return `Je suis disponible en mode hors ligne.${greeting}\nDécrivez votre objectif actuel (Master, pays, délais) et nous le transformerons en prochaines actions concrètes.`;
}

function buildOfflineNotice(failures = []) {
  if (!env.geminiApiKey && !env.groqApiKey) {
    return 'Aucune clé API configurée. Ajoutez GEMINI_API_KEY ou GROQ_API_KEY dans votre fichier .env.';
  }
  if (!failures.length) {
    return 'Les services IA sont temporairement indisponibles. Mode coaching hors ligne activé.';
  }
  const details = failures.map(({ provider, message }) => {
    if (message.includes('429')) return `${provider} : quota dépassé (429) — réessayez dans quelques minutes`;
    if (message.includes('403')) return `${provider} : clé refusée (403) — vérifiez la clé API`;
    if (message.includes('401')) return `${provider} : clé invalide (401)`;
    if (message.includes('fetch failed')) return `${provider} : erreur réseau`;
    return `${provider} : ${message}`;
  });
  return `IA indisponible (${details.join(' · ')}). Mode coaching hors ligne activé.`;
}

async function resolveAiResponse(requestPrompt, mode, systemInstruction, provider = 'auto') {
  const failures = [];
  const order = provider === 'groq'
    ? ['groq', 'gemini']
    : provider === 'gemini'
      ? ['gemini', 'groq']
      : ['gemini', 'groq'];

  for (const name of order) {
    if (name === 'gemini' && !env.geminiApiKey) continue;
    if (name === 'groq' && !env.groqApiKey) continue;
    try {
      const result = name === 'gemini'
        ? await callGemini(requestPrompt, mode, systemInstruction)
        : await callGroq(requestPrompt, mode, systemInstruction);
      return result;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      failures.push({ provider: name, message });
      console.warn(`${name} failed:`, message);
    }
  }

  return { failures };
}

function buildRecommendationPayload(context) {
  const profile = context.profile || {};
  const actions = [];

  if (!profile.target_degree && !profile.field_of_study && !profile.target_countries?.length) {
    actions.push({
      title: 'Complétez votre profil StudyHub',
      detail: 'Ajoutez votre diplôme visé, votre domaine et vos pays cibles pour rendre l’IA plus précise.',
      priority: 'high',
    });
  }

  if (Array.isArray(context.goals) && context.goals.length) {
    const nextGoal = context.goals[0];
    actions.push({
      title: `Priorité : ${nextGoal.title}`,
      detail: `Vous avez un objectif actif. Definissez une prochaine action concrète pour avancer de ${nextGoal.progress || 0}% vers l’objectif.`,
      priority: 'high',
    });
  }

  if (Array.isArray(context.plannerTasks) && context.plannerTasks.length) {
    const nextTask = context.plannerTasks[0];
    actions.push({
      title: `Tâche à faire : ${nextTask.title}`,
      detail: `Planifiez ${nextTask.duration_minutes || 30} minutes sur ${nextTask.category || 'votre parcours'} aujourd’hui.`,
      priority: 'medium',
    });
  }

  if (Array.isArray(context.universities) && context.universities.length) {
    actions.push({
      title: 'Préparez vos documents d’application',
      detail: 'Revoyez les documents associés aux universités suivies pour éviter les oublis de dernière minute.',
      priority: 'medium',
    });
  }

  if (Array.isArray(context.scholarships) && context.scholarships.length) {
    actions.push({
      title: 'Vérifiez vos opportunités de financement',
      detail: 'Consultez les bourses sauvegardées et identifiez celles qui ont une deadline proche.',
      priority: 'medium',
    });
  }

  if (!actions.length) {
    actions.push({
      title: 'Commencez votre parcours',
      detail: 'Ajoutez un premier objectif, une première tâche et votre profil pour que StudyHub puisse vous guider.',
      priority: 'high',
    });
  }

  const focus = profile.target_ielts ? 'english_coach' : profile.field_of_study ? 'general' : 'general';

  return {
    title: 'Plan du jour StudyHub',
    summary: `Vous avez maintenant assez d’éléments pour progresser avec un plan simple et personnalisé.`,
    focus,
    actions: actions.slice(0, 4),
    generatedAt: new Date().toISOString(),
  };
}

function buildDailyPlanPayload(context) {
  const profile = context.profile || {};
  const dailyEventMap = context.dailyEventMap || {};
  const actions = [];
  const progressSummary = {
    activeGoals: Array.isArray(context.goals) ? context.goals.length : 0,
    pendingTasks: Array.isArray(context.plannerTasks) ? context.plannerTasks.length : 0,
    universities: Array.isArray(context.universities) ? context.universities.length : 0,
    scholarships: Array.isArray(context.scholarships) ? context.scholarships.length : 0,
  };

  if (!profile.target_degree && !profile.field_of_study && !profile.target_countries?.length) {
    actions.push({
      title: 'Compléter votre profil',
      detail: 'Renseignez votre diplôme visé, votre domaine et vos pays cibles pour que le coach adapte ses conseils.',
      category: 'profile',
      etaMinutes: 15,
    });
  }

  if (Array.isArray(context.goals) && context.goals.length) {
    const nextGoal = context.goals[0];
    actions.push({
      title: `Avancer sur “${nextGoal.title}”`,
      detail: `Votre objectif principal est à ${nextGoal.progress || 0}%. Définissez une action de 20 à 30 minutes aujourd’hui pour le faire progresser.`,
      category: 'goal',
      etaMinutes: 25,
    });
  }

  if (Array.isArray(context.plannerTasks) && context.plannerTasks.length) {
    const nextTask = context.plannerTasks[0];
    actions.push({
      title: `Faire : ${nextTask.title}`,
      detail: `Planifiez ${nextTask.duration_minutes || 30} minutes pour cette tâche et marquez-la comme commencée.`,
      category: 'planner',
      etaMinutes: nextTask.duration_minutes || 30,
    });
  }

  if (Array.isArray(context.universities) && context.universities.length) {
    actions.push({
      title: 'Préparer les documents de candidature',
      detail: 'Vérifiez les documents associés à vos universités suivies et rassemblez ce qui manque.',
      category: 'documents',
      etaMinutes: 20,
    });
  }

  if (Array.isArray(context.scholarships) && context.scholarships.length) {
    actions.push({
      title: 'Revoir les bourses à suivre',
      detail: 'Identifiez les bourses pour lesquelles une deadline approche ou un document doit être finalisé.',
      category: 'scholarships',
      etaMinutes: 15,
    });
  }

  if (!actions.length) {
    actions.push({
      title: 'Démarrer votre parcours StudyHub',
      detail: 'Ajoutez un premier objectif, une première tâche et votre profil pour obtenir un plan quotidien utile.',
      category: 'starter',
      etaMinutes: 20,
    });
  }

  const normalizedActions = actions.slice(0, 4).map((action) => {
    const actionKey = makeActionKey(action.category, action.title);
    return {
      ...action,
      actionKey,
      state: dailyEventMap[actionKey] || 'pending',
    };
  });

  const completedToday = normalizedActions.filter((a) => a.state === 'completed').length;
  const dismissedToday = normalizedActions.filter((a) => a.state === 'dismissed').length;

  const focus = profile.target_ielts ? 'english_coach' : profile.field_of_study ? 'general' : 'general';
  return {
    title: 'Plan du jour StudyHub',
    focus,
    summary: 'Voici la séquence la plus utile à suivre aujourd’hui pour avancer sans perdre de temps.',
    progressSummary,
    tracking: {
      completedToday,
      dismissedToday,
      totalActions: normalizedActions.length,
    },
    actions: normalizedActions,
    generatedAt: new Date().toISOString(),
  };
}

router.post('/ask', async (req, res) => {
  try {
    const { prompt, mode = 'general', provider = 'auto', history = [] } = req.body || {};
    if (!prompt || typeof prompt !== 'string' || !prompt.trim()) return res.status(400).json({ error: 'Prompt is required' });
    if (prompt.length > MAX_PROMPT_LENGTH) return res.status(413).json({ error: `Prompt is too long (maximum ${MAX_PROMPT_LENGTH} characters)` });
    if (!MODES.has(mode)) return res.status(400).json({ error: 'Invalid AI mode' });
    if (!PROVIDERS.has(provider)) return res.status(400).json({ error: 'Invalid AI provider' });

    const context = await getUserStudyContext(req.user.id);
    const profile = context.profile || {};
    const systemInstruction = buildSystemInstruction(mode, profile, buildContextSummary(context));
    const requestPrompt = buildPromptWithHistory(prompt.trim(), history, buildContextSummary(context));

    const aiResult = await resolveAiResponse(requestPrompt, mode, systemInstruction, provider);
    if (aiResult.text) {
      return res.json(aiResult);
    }

    return res.json({
      text: getOfflineAdvice(mode, prompt.trim()),
      provider: 'offline',
      notice: buildOfflineNotice(aiResult.failures),
    });
  } catch (error) {
    console.error('AI route error:', error);
    return res.status(500).json({ error: 'Erreur lors de la communication avec le service IA' });
  }
});

router.post('/recommendations', async (req, res) => {
  try {
    const context = await getUserStudyContext(req.user.id);
    return res.json(buildRecommendationPayload(context));
  } catch (error) {
    console.error('AI recommendations error:', error);
    return res.status(500).json({ error: 'Erreur lors de la génération des recommandations StudyHub' });
  }
});

router.post('/daily-plan', async (req, res) => {
  try {
    const context = await getUserStudyContext(req.user.id);
    return res.json(buildDailyPlanPayload(context));
  } catch (error) {
    console.error('AI daily plan error:', error);
    return res.status(500).json({ error: 'Erreur lors de la génération du plan quotidien StudyHub' });
  }
});

router.post('/daily-plan/action', async (req, res) => {
  try {
    const { actionKey, actionTitle, category = 'general', status } = req.body || {};

    if (!actionKey || typeof actionKey !== 'string') {
      return res.status(400).json({ error: 'actionKey is required' });
    }
    if (!actionTitle || typeof actionTitle !== 'string') {
      return res.status(400).json({ error: 'actionTitle is required' });
    }
    if (!DAILY_PLAN_STATUSES.has(status)) {
      return res.status(400).json({ error: 'Invalid status (completed | dismissed)' });
    }

    const { rows } = await pool.query(
      `INSERT INTO ai_action_events (user_id, plan_date, action_key, action_title, category, status, source, updated_at)
       VALUES ($1, CURRENT_DATE, $2, $3, $4, $5, 'daily_plan', NOW())
       ON CONFLICT (user_id, plan_date, action_key)
       DO UPDATE SET
         status = EXCLUDED.status,
         action_title = EXCLUDED.action_title,
         category = EXCLUDED.category,
         updated_at = NOW()
       RETURNING action_key, action_title, category, status, plan_date, updated_at`,
      [req.user.id, actionKey.slice(0, 120), actionTitle.slice(0, 255), String(category).slice(0, 100), status]
    );

    return res.json(rows[0]);
  } catch (error) {
    console.error('AI daily plan action error:', error);
    return res.status(500).json({ error: 'Erreur lors de l\'enregistrement de l\'action IA' });
  }
});

router.get('/daily-plan/progress', async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT status, COUNT(*)::int AS count
       FROM ai_action_events
       WHERE user_id = $1 AND source = 'daily_plan' AND plan_date = CURRENT_DATE
       GROUP BY status`,
      [req.user.id]
    );

    const completed = rows.find((r) => r.status === 'completed')?.count || 0;
    const dismissed = rows.find((r) => r.status === 'dismissed')?.count || 0;
    const total = completed + dismissed;

    return res.json({ completed, dismissed, total, date: new Date().toISOString().slice(0, 10) });
  } catch (error) {
    console.error('AI daily plan progress error:', error);
    return res.status(500).json({ error: 'Erreur lors de la récupération de la progression quotidienne IA' });
  }
});

export default router;
