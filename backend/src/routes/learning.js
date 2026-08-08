import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { buildLearningState, buildPriorityActions } from '../services/learning/context.js';

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
    const overall = Math.round((englishProgress + state.technical.progressPercent + state.productivity.averageGoalProgress) / 3);
    res.json({ overallProgress: overall, english: state.english, technical: state.technical, applications: { universityCount: state.applications.universities.length, documentGroups: state.applications.documents.length }, productivity: state.productivity, nextActions: actions });
  } catch (error) { console.error('learning summary error:', error); res.status(500).json({ error: 'Unable to build learning summary' }); }
});

export default router;
