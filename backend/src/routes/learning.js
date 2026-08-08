import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { buildLearningState, buildPriorityActions } from '../services/learning/context.js';
import {
  getCurriculumExercises,
  getCurriculumStats,
  generateCurriculum,
  updateExerciseStatus,
  buildFocusAreas,
} from '../services/learning/curriculum.js';

const router = Router();
router.use(requireAuth);

router.get('/state', async (req, res) => {
  try { res.json(await buildLearningState(req.user.id)); }
  catch (error) { console.error('learning state error:', error); res.status(500).json({ error: 'Unable to build learning state' }); }
});

router.get('/priorities', async (req, res) => {
  try {
    const state = await buildLearningState(req.user.id);
    res.json({ actions: buildPriorityActions(state), generatedAt: new Date().toISOString() });
  } catch (error) { console.error('learning priorities error:', error); res.status(500).json({ error: 'Unable to build learning priorities' }); }
});

router.get('/summary', async (req, res) => {
  try {
    const state = await buildLearningState(req.user.id);
    const actions = buildPriorityActions(state);
    const englishProgress = state.english.diagnostic?.score ?? state.english.flashcards.masteryPercent;
    const technicalProgress = state.technical.diagnostic?.score ?? state.technical.progressPercent;
    const overall = Math.round((englishProgress + technicalProgress + state.productivity.averageGoalProgress) / 3);
    res.json({ overallProgress: overall, english: state.english, technical: state.technical, applications: { universityCount: state.applications.universities.length, documentGroups: state.applications.documents.length }, productivity: state.productivity, nextActions: actions });
  } catch (error) { console.error('learning summary error:', error); res.status(500).json({ error: 'Unable to build learning summary' }); }
});

// ── Adaptive Curriculum ─────────────────────────────────────────

router.get('/curriculum', async (req, res) => {
  try {
    const userId = req.user.id;
    const [state, exercises, stats] = await Promise.all([
      buildLearningState(userId),
      getCurriculumExercises(userId),
      getCurriculumStats(userId),
    ]);
    res.json({
      exercises,
      stats,
      focusAreas: buildFocusAreas(state),
      generatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('curriculum fetch error:', error);
    res.status(500).json({ error: 'Unable to fetch curriculum' });
  }
});

router.post('/curriculum/generate', async (req, res) => {
  try {
    const state = await buildLearningState(req.user.id);
    const result = await generateCurriculum(req.user.id, state);
    const [exercises, stats] = await Promise.all([
      getCurriculumExercises(req.user.id),
      getCurriculumStats(req.user.id),
    ]);
    res.json({ ...result, exercises, stats, focusAreas: buildFocusAreas(state) });
  } catch (error) {
    console.error('curriculum generate error:', error);
    res.status(500).json({ error: 'Unable to generate curriculum' });
  }
});

router.patch('/curriculum/:id', async (req, res) => {
  try {
    const status = req.body?.status;
    const updated = await updateExerciseStatus(req.user.id, req.params.id, status);
    if (!updated) return res.status(404).json({ error: 'Exercise not found' });
    const stats = await getCurriculumStats(req.user.id);
    res.json({ exercise: updated, stats });
  } catch (error) {
    console.error('curriculum update error:', error);
    res.status(400).json({ error: error.message || 'Unable to update exercise' });
  }
});

export default router;
