const db = require('../../db');

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

async function buildLearningState(userId) {
  const [profile, goals, tasks, technical, flashcards, universities, documents] = await Promise.all([
    db.query(`SELECT target_degree, field_of_study, target_countries, current_gpa, target_ielts FROM user_profiles WHERE user_id = $1 LIMIT 1`, [userId]),
    db.query(`SELECT title, category, progress, completed FROM goals WHERE user_id = $1 ORDER BY updated_at DESC LIMIT 20`, [userId]),
    db.query(`SELECT title, category, duration_minutes, completed, due_date FROM planner_tasks WHERE user_id = $1 ORDER BY completed ASC, due_date ASC NULLS LAST LIMIT 30`, [userId]),
    db.query(`SELECT track_id, node_id, status FROM technical_progress WHERE user_id = $1`, [userId]),
    db.query(`SELECT category, COUNT(*)::int AS total, COUNT(*) FILTER (WHERE mastered = true)::int AS mastered FROM flashcards WHERE user_id = $1 GROUP BY category`, [userId]),
    db.query(`SELECT name, country, application_status FROM universities WHERE user_id = $1 ORDER BY updated_at DESC LIMIT 20`, [userId]),
    db.query(`SELECT type, status, COUNT(*)::int AS count FROM documents WHERE user_id = $1 GROUP BY type, status`, [userId]),
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

  return {
    profile: {
      targetDegree: p.target_degree || null,
      fieldOfStudy: p.field_of_study || null,
      targetCountries: normaliseList(p.target_countries),
      currentGpa: p.current_gpa || null,
      targetIelts: p.target_ielts || null,
    },
    english: {
      flashcards: { total: flashcardTotal, mastered: flashcardMastered, masteryPercent: flashcardTotal ? Math.round((flashcardMastered / flashcardTotal) * 100) : 0 },
      targetIelts: p.target_ielts || null,
      status: flashcardTotal ? (flashcardMastered / flashcardTotal >= 0.7 ? 'developing' : 'needs_practice') : 'not_assessed',
    },
    technical: {
      totalNodes: technicalTotal,
      completedNodes: technicalCompleted,
      progressPercent: technicalTotal ? Math.round((technicalCompleted / technicalTotal) * 100) : 0,
      tracks: technicalRows,
    },
    applications: {
      universities: universities.rows,
      documents: documents.rows,
    },
    productivity: {
      goals: goalRows,
      averageGoalProgress: goalProgress,
      plannerCompleted: completedTasks,
      plannerPending: pendingTasks,
    },
  };
}

function buildPriorityActions(state) {
  const actions = [];
  if (!state.profile.targetDegree || !state.profile.fieldOfStudy) {
    actions.push({ type: 'profile', title: 'Complete your academic profile', reason: 'StudyHub needs your target degree and field to personalise your roadmap.', durationMinutes: 10 });
  }
  if (state.english.status === 'not_assessed') {
    actions.push({ type: 'english_assessment', title: 'Take an English diagnostic', reason: 'Measure your current level before building an IELTS plan.', durationMinutes: 20 });
  } else if (state.english.flashcards.masteryPercent < 70) {
    actions.push({ type: 'english_practice', title: 'Practice English vocabulary', reason: 'Your vocabulary mastery is below the current 70% practice threshold.', durationMinutes: 20 });
  }
  if (state.technical.progressPercent < 60) {
    actions.push({ type: 'technical', title: 'Advance your technical track', reason: 'Your technical roadmap still has unfinished learning nodes.', durationMinutes: 45 });
  }
  if (state.applications.universities.length === 0) {
    actions.push({ type: 'university_research', title: 'Start your university shortlist', reason: 'Add target universities so StudyHub can track requirements and deadlines.', durationMinutes: 25 });
  }
  if (state.productivity.plannerPending > 0) {
    actions.push({ type: 'planner', title: 'Complete a pending StudyHub task', reason: 'Finishing an existing task is the fastest way to maintain momentum.', durationMinutes: 20 });
  }
  return actions.slice(0, 5);
}

module.exports = { buildLearningState, buildPriorityActions };
