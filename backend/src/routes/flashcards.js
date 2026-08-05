import { Router } from 'express';
import { pool } from '../config/database.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();
router.use(requireAuth);

router.get('/', async (req, res) => {
  try {
    const { rows } = await pool.query(
      'SELECT * FROM flashcards WHERE user_id = $1 ORDER BY created_at DESC',
      [req.user.id]
    );
    res.json(rows);
  } catch (error) {
    console.error('Error fetching flashcards:', error);
    res.status(500).json({ error: 'Failed to fetch flashcards' });
  }
});

router.patch('/', async (req, res) => {
  try {
    const { id } = req.body;
    if (!id) {
      return res.status(400).json({ error: 'Flashcard id is required' });
    }
    const { rows } = await pool.query(
      `UPDATE flashcards SET mastered = NOT mastered, updated_at = NOW()
       WHERE id = $1 AND user_id = $2 RETURNING *`,
      [id, req.user.id]
    );
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Flashcard not found' });
    }
    res.json(rows[0]);
  } catch (error) {
    console.error('Error toggling flashcard:', error);
    res.status(500).json({ error: 'Failed to toggle flashcard' });
  }
});

export default router;
