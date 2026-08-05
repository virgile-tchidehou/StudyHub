import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { pool } from '../config/database.js';

const router = Router();
router.use(requireAuth);

// GET /api/technical/progress
router.get('/progress', async (req, res) => {
  try {
    const userId = req.user.id;
    const { rows } = await pool.query(
      'SELECT track_id, node_id, status FROM technical_progress WHERE user_id = $1',
      [userId]
    );
    res.json(rows);
  } catch (error) {
    console.error('Error fetching technical progress:', error);
    res.status(500).json({ error: 'Failed to fetch technical progress' });
  }
});

// POST /api/technical/toggle
router.post('/toggle', async (req, res) => {
  try {
    const userId = req.user.id;
    const { trackId, nodeId } = req.body || {};

    if (!trackId || !nodeId) {
      return res.status(400).json({ error: 'trackId and nodeId are required' });
    }

    const check = await pool.query(
      'SELECT id FROM technical_progress WHERE user_id = $1 AND track_id = $2 AND node_id = $3',
      [userId, trackId, nodeId]
    );

    if (check.rows.length > 0) {
      await pool.query(
        'DELETE FROM technical_progress WHERE id = $1',
        [check.rows[0].id]
      );
      return res.json({ trackId, nodeId, status: 'unmastered' });
    } else {
      await pool.query(
        'INSERT INTO technical_progress (user_id, track_id, node_id, status) VALUES ($1, $2, $3, $4)',
        [userId, trackId, nodeId, 'completed']
      );
      return res.json({ trackId, nodeId, status: 'completed' });
    }
  } catch (error) {
    console.error('Error toggling technical progress:', error);
    res.status(500).json({ error: 'Failed to toggle technical progress' });
  }
});

export default router;
