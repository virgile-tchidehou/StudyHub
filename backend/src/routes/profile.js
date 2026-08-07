import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { pool } from '../config/database.js';

const router = Router();
router.use(requireAuth);

const EMPTY_PROFILE = {
  target_degree: null,
  field_of_study: null,
  target_countries: [],
  current_gpa: null,
  target_ielts: null,
};

router.get('/', async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT target_degree, field_of_study, target_countries, current_gpa, target_ielts, updated_at
       FROM user_profiles WHERE user_id = $1`,
      [req.user.id]
    );
    return res.json(rows[0] || EMPTY_PROFILE);
  } catch (error) {
    console.error('Profile GET error:', error);
    return res.status(500).json({ error: 'Unable to load profile' });
  }
});

router.put('/', async (req, res) => {
  try {
    const body = req.body || {};
    const targetDegree = typeof body.target_degree === 'string' ? body.target_degree.trim().slice(0, 100) : null;
    const field = typeof body.field_of_study === 'string' ? body.field_of_study.trim().slice(0, 255) : null;
    const countries = Array.isArray(body.target_countries)
      ? body.target_countries.filter((c) => typeof c === 'string').map((c) => c.trim()).filter(Boolean).slice(0, 15)
      : [];
    const gpa = typeof body.current_gpa === 'string' ? body.current_gpa.trim().slice(0, 50) : null;
    const ielts = typeof body.target_ielts === 'string' ? body.target_ielts.trim().slice(0, 50) : null;

    const { rows } = await pool.query(
      `INSERT INTO user_profiles (user_id, target_degree, field_of_study, target_countries, current_gpa, target_ielts, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, NOW())
       ON CONFLICT (user_id) DO UPDATE SET
         target_degree = EXCLUDED.target_degree,
         field_of_study = EXCLUDED.field_of_study,
         target_countries = EXCLUDED.target_countries,
         current_gpa = EXCLUDED.current_gpa,
         target_ielts = EXCLUDED.target_ielts,
         updated_at = NOW()
       RETURNING target_degree, field_of_study, target_countries, current_gpa, target_ielts, updated_at`,
      [req.user.id, targetDegree, field, countries, gpa, ielts]
    );

    return res.json(rows[0]);
  } catch (error) {
    console.error('Profile PUT error:', error);
    return res.status(500).json({ error: 'Unable to save profile' });
  }
});

export default router;
