const express = require('express');
const db = require('../db');
const { buildLearningState, buildPriorityActions } = require('../services/learning/context');

const router = express.Router();

function requireUser(req, res, next) {
  if (!req.user?.id) return res.status(401).json({ error: 'Authentication required' });
  next();
}

router.use(requireUser);

router.get('/state', async (req, res) => {
  try {
    const state = await buildLearningState(req.user.id);
    res.json(state);
  } catch (error) {
    console.error('learning state error:', error);
    res.status(500).json({ error: 'Unable to build learning state' });
  }
});

router.get('/priorities', async (req, res) => {
  try {
    const state = await buildLearningState(req.user.id);
    res.json({ actions: buildPriorityActions(state), generatedAt: new Date().toISOString() });
  } catch (error) {
    console.error('learning priorities error:', error);
    res.status(500).json({ error: 'Unable to build learning priorities' });
  }
});

router.get('/summary', async (req, res) => {
  try {
    const state = await buildLearningState(req.user.id);
    const actions = buildPriorityActions(state);
    const overall = Math.round((state.english.flashcards.masteryPercent + state.technical.progressPercent + state.productivity.averageGoalProgress) / 3);
    res.json({
      overallProgress: overall,
      english: state.english,
      technical: state.technical,
      applications: { universityCount: state.applications.universities.length, documentGroups: state.applications.documents.length },
      productivity: state.productivity,
      nextActions: actions,
    });
  } catch (error) {
    console.error('learning summary error:', error);
    res.status(500).json({ error: 'Unable to build learning summary' });
  }
});

module.exports = router;
