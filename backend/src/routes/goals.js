import { Router } from 'express';
import { pool } from '../config/database.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

// Apply auth to all routes
router.use(requireAuth);

// GET /api/goals - list current user's goals
router.get('/', async (req, res) => {
  try {
    const { rows } = await pool.query(
      'SELECT * FROM goals WHERE user_id = $1 ORDER BY created_at DESC',
      [req.user.id]
    );
    res.json(rows);
  } catch (error) {
    console.error('Error fetching goals:', error);
    res.status(500).json({ error: 'Failed to fetch goals' });
  }
});

// POST /api/goals - create a goal
router.post('/', async (req, res) => {
  try {
    const { title, description, targetDate } = req.body;
    if (!title || typeof title !== 'string') {
      return res.status(400).json({ error: 'Title is required' });
    }
    const { rows } = await pool.query(
      `INSERT INTO goals (title, description, target_date, user_id)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [title, description ?? null, targetDate ?? null, req.user.id]
    );
    res.status(201).json(rows[0]);
  } catch (error) {
    console.error('Error creating goal:', error);
    res.status(500).json({ error: 'Failed to create goal' });
  }
});

// PATCH /api/goals/:id - update a goal (progress / completed)
router.patch('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, targetDate, progress, completed } = req.body;
    const { rows } = await pool.query(
      `UPDATE goals
       SET title = COALESCE($1, title),
           description = COALESCE($2, description),
           target_date = COALESCE($3, target_date),
           progress = COALESCE($4, progress),
           completed = COALESCE($5, completed),
           updated_at = NOW()
       WHERE id = $6 AND user_id = $7
       RETURNING *`,
      [title ?? null, description ?? null, targetDate ?? null, progress ?? null, completed ?? null, id, req.user.id]
    );
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Goal not found' });
    }
    res.json(rows[0]);
  } catch (error) {
    console.error('Error updating goal:', error);
    res.status(500).json({ error: 'Failed to update goal' });
  }
});

// DELETE /api/goals/:id
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { rowCount } = await pool.query(
      'DELETE FROM goals WHERE id = $1 AND user_id = $2',
      [id, req.user.id]
    );
    if (rowCount === 0) {
      return res.status(404).json({ error: 'Goal not found' });
    }
    res.status(204).end();
  } catch (error) {
    console.error('Error deleting goal:', error);
    res.status(500).json({ error: 'Failed to delete goal' });
  }
});

export default router;
