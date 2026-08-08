import { pool } from '../../config/database.js';

function asNumber(value, fallback = 0) {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function normaliseList(value) {
  if (Array.isArray(value)) return value.filter(Boolean).map(String);
  if (typeof value === 'string') {
    try { const parsed = JSON.parse(value); if (Array.isArray(parsed)) return parsed.filter(Boolean).map(String); } catch (_) {}
    return value.split(',').map((v) => v.trim()).filter(Boolean);
  }
  return [];
}

function parseAssessmentResult(row) {
  if (!row) return null;
  const result = typeof row.result === 'string' ? JSON.parse(row.result) : row.result;
  return {
    score: row.score,
    level: row.level,
    track: result?.track || null,
    weaknesses: result?.weaknesses || [],
    weaknessLabels: result?.weaknessLabels || [],
    skillScores: result?.skillScores || {},
    assessedAt: row.created_at,
  };
}

export async function buildLearningState(userId) {
  const [profile, goals, tasks, technical, flashcards, universities, documents, englishAssessment, technicalAssessment] = await Promise.all([
    pool.query(`SELECT target_degree, field_of_study, target_countries, current_gpa, target_ielts FROM user_profiles WHERE user_id = $1 LIMIT 1`, [userId]),
    pool.query(`SELECT id, title, description, category, target_date, progress, completed, user_id, created_at, updated_at FROM goals WHERE user_id = $1 ORDER BY updated_at DESC LIMIT 20`, [userId]),
    pool.query(`SELECT title, category, duration_minutes, completed, due_date FROM planner_tasks WHERE user_id = $1 ORDER BY completed ASC, due_date ASC NULLS LAST LIMIT 30`, [userId]),
    pool.query(`SELECT track_id, node_id, status FROM technical_progress WHERE user_id = $1`, [userId]),
    pool.query(`SELECT category, COUNT(*)::int AS total, COUNT(*) FILTER (WHERE mastered = true)::int AS mastered FROM flashcards WHERE user_id = $1 GROUP BY category`, [userId]),
    pool.query(`SELECT name, country, application_status FROM universities WHERE user_id = $1 ORDER BY updated_at DESC LIMIT 20`, [userId]),
    pool.query(`SELECT type, status, COUNT(*)::int AS count FROM documents WHERE user_id = $1 GROUP BY type, status`, [userId]),
    pool.query(`SELECT score, level, result, created_at FROM learning_assessments WHERE user_id = $1 AND assessment_type = 'english' ORDER BY created_at DESC LIMIT 1`, [userId]),
    pool.query(`SELECT score, level, result, created_at FROM learning_assessments WHERE user_id = $1 AND assessment_type LIKE 'technical_%' ORDER BY created_at DESC LIMIT 1`, [userId]),
  ]);

  const p = profile.rows[0] || {};
  const technicalRows = technical.rows;
  const technicalCompleted = technicalRows.filter((r) => String(r.status).toLowerCase() === 'completed').length;
  const technicalTotal = technicalRows.length;
  const taskRows = tasks.rows;
  const completedTasks = taskRows.filter((t) => t.completed).length;
  const pendingTasks = taskRows.filter((t) => !t.completed).length;
  const flashcardTotal = flashcards.rows.reduce((sum, r) => sum + asNumber(r.total), 0);
  const flashcardMastered = flashcards.rows.reduce((sum, r) => sum + asNumber(r.mastered), 0);
  const goalRows = goals.rows;
  const goalProgress = goalRows.length ? Math.round(goalRows.reduce((sum, g) => sum + asNumber(g.progress), 0) / goalRows.length) : 0;
  const latestEnglish = englishAssessment.rows[0] || null;
  const englishResult = latestEnglish?.result || null;
  const latestTechnical = technicalAssessment.rows[0] || null;
  const technicalDiagnostic = parseAssessmentResult(latestTechnical);

  return {
    profile: { targetDegree: p.target_degree || null, fieldOfStudy: p.field_of_study || null, targetCountries: normaliseList(p.target_countries), currentGpa: p.current_gpa || null, targetIelts: p.target_ielts || null },
    english: {
      diagnostic: latestEnglish ? { score: latestEnglish.score, level: latestEnglish.level, weaknesses: englishResult?.weaknesses || [], assessedAt: latestEnglish.created_at } : null,
      flashcards: { total: flashcardTotal, mastered: flashcardMastered, masteryPercent: flashcardTotal ? Math.round((flashcardMastered / flashcardTotal) * 100) : 0 },
      targetIelts: p.target_ielts || null,
      status: latestEnglish ? 'assessed' : 'not_assessed',
    },
    technical: {
      diagnostic: technicalDiagnostic,
      totalNodes: technicalTotal,
      completedNodes: technicalCompleted,
      progressPercent: technicalTotal ? Math.round((technicalCompleted / technicalTotal) * 100) : 0,
      tracks: technicalRows,
      status: latestTechnical ? 'assessed' : 'not_assessed',
    },
    applications: { universities: universities.rows, documents: documents.rows },
    productivity: { goals: goalRows, averageGoalProgress: goalProgress, plannerCompleted: completedTasks, plannerPending: pendingTasks },
  };
}

export function buildPriorityActions(state) {
  const actions = [];
  if (!state.profile.targetDegree || !state.profile.fieldOfStudy) actions.push({ type: 'profile', title: 'Complete your academic profile', reason: 'StudyHub needs your target degree and field to personalise your roadmap.', durationMinutes: 10 });
  if (state.english.status === 'not_assessed') actions.push({ type: 'english_assessment', title: 'Take an English diagnostic', reason: 'Measure your current level before building an IELTS plan.', durationMinutes: 20 });
  else if (state.english.diagnostic?.weaknesses?.length) actions.push({ type: 'english_practice', title: `Practice ${state.english.diagnostic.weaknesses.join(' and ')}`, reason: 'Your latest diagnostic identified these areas as priorities.', durationMinutes: 25 });
  else if (state.english.flashcards.masteryPercent < 70) actions.push({ type: 'english_practice', title: 'Practice English vocabulary', reason: 'Your vocabulary mastery is below the current 70% practice threshold.', durationMinutes: 20 });
  if (state.technical.status === 'not_assessed') actions.push({ type: 'technical_assessment', title: 'Take a technical skills diagnostic', reason: 'Establish your Embedded Systems / AI skill baseline before building a curriculum.', durationMinutes: 25 });
  else if (state.technical.diagnostic?.weaknessLabels?.length) actions.push({ type: 'technical_practice', title: `Strengthen ${state.technical.diagnostic.weaknessLabels.slice(0, 2).join(' and ')}`, reason: 'Your latest technical diagnostic flagged these skill areas as priorities.', durationMinutes: 45 });
  else if (state.technical.progressPercent < 60) actions.push({ type: 'technical', title: 'Advance your technical track', reason: 'Your technical roadmap still has unfinished learning nodes.', durationMinutes: 45 });
  if (state.applications.universities.length === 0) actions.push({ type: 'university_research', title: 'Start your university shortlist', reason: 'Add target universities so StudyHub can track requirements and deadlines.', durationMinutes: 25 });
  if (state.productivity.plannerPending > 0) actions.push({ type: 'planner', title: 'Complete a pending StudyHub task', reason: 'Finishing an existing task is the fastest way to maintain momentum.', durationMinutes: 20 });
  return actions.slice(0, 5);
}
