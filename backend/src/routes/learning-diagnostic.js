import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { pool } from '../config/database.js';
import { getDiagnosticQuestions, scoreDiagnostic } from '../services/learning/diagnostic.js';
import {
  getAvailableTracks,
  getTechnicalQuestions,
  scoreTechnicalDiagnostic,
} from '../services/learning/technical-diagnostic.js';

const router = Router();
router.use(requireAuth);

router.get('/english/questions', (_req, res) => {
  res.json({ questions: getDiagnosticQuestions(), total: getDiagnosticQuestions().length });
});

router.post('/english/submit', async (req, res) => {
  try {
    const result = scoreDiagnostic(req.body?.answers || {});
    const userId = req.user.id;

    await pool.query(
      `INSERT INTO learning_assessments
        (user_id, assessment_type, score, level, result, created_at)
       VALUES ($1, 'english', $2, $3, $4::jsonb, NOW())`,
      [userId, result.score, result.level, JSON.stringify(result)]
    );

    res.json({
      assessment: result,
      recommendation: result.weaknesses.length
        ? `Focus next on ${result.weaknesses.join(' and ')}.`
        : 'Keep progressing with balanced English practice.',
    });
  } catch (error) {
    console.error('English diagnostic error:', error);
    res.status(500).json({ error: 'Unable to save English diagnostic' });
  }
});

router.get('/english/latest', async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT score, level, result, created_at
       FROM learning_assessments
       WHERE user_id = $1 AND assessment_type = 'english'
       ORDER BY created_at DESC LIMIT 1`,
      [req.user.id]
    );
    res.json(rows[0] || null);
  } catch (error) {
    console.error('English diagnostic history error:', error);
    res.status(500).json({ error: 'Unable to fetch English diagnostic' });
  }
});

// ── Technical diagnostic ────────────────────────────────────────

router.get('/technical/tracks', (_req, res) => {
  res.json({ tracks: getAvailableTracks() });
});

router.get('/technical/questions', (req, res) => {
  const track = String(req.query.track || 'embedded');
  const questions = getTechnicalQuestions(track);
  if (!questions.length) {
    return res.status(400).json({ error: `Unknown track: ${track}` });
  }
  res.json({ track, questions, total: questions.length });
});

router.post('/technical/submit', async (req, res) => {
  try {
    const track = String(req.body?.track || 'embedded');
    const result = scoreTechnicalDiagnostic(track, req.body?.answers || {});
    const userId = req.user.id;

    await pool.query(
      `INSERT INTO learning_assessments
        (user_id, assessment_type, score, level, result, created_at)
       VALUES ($1, $2, $3, $4, $5::jsonb, NOW())`,
      [userId, `technical_${track}`, result.score, result.level, JSON.stringify(result)]
    );

    const focus = result.weaknessLabels.length
      ? result.weaknessLabels.join(' and ')
      : 'balanced practice across your track';

    res.json({
      assessment: result,
      recommendation: result.weaknesses.length
        ? `Priority: strengthen ${focus}.`
        : 'Solid foundation — keep advancing through your technical roadmap.',
    });
  } catch (error) {
    console.error('Technical diagnostic error:', error);
    res.status(500).json({ error: error.message || 'Unable to save technical diagnostic' });
  }
});

router.get('/technical/latest', async (req, res) => {
  try {
    const track = String(req.query.track || 'embedded');
    const { rows } = await pool.query(
      `SELECT score, level, result, created_at
       FROM learning_assessments
       WHERE user_id = $1 AND assessment_type = $2
       ORDER BY created_at DESC LIMIT 1`,
      [req.user.id, `technical_${track}`]
    );
    res.json(rows[0] || null);
  } catch (error) {
    console.error('Technical diagnostic history error:', error);
    res.status(500).json({ error: 'Unable to fetch technical diagnostic' });
  }
});

export default router;
