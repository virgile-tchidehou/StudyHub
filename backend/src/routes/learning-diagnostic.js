import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { pool } from '../config/database.js';
import { getDiagnosticQuestions, scoreDiagnostic } from '../services/learning/diagnostic.js';

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

export default router;
