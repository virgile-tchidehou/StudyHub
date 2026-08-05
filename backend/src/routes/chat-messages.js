import { Router } from 'express';
import { pool } from '../config/database.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();
router.use(requireAuth);

router.get('/', async (req, res) => {
  try {
    const { rows } = await pool.query(
      'SELECT id, mode, sender, text, created_at FROM gemini_chat_messages WHERE user_id = $1 ORDER BY created_at ASC',
      [req.user.id]
    );
    res.json(rows);
  } catch (error) {
    console.error('Error fetching chat messages:', error);
    res.status(500).json({ error: 'Failed to fetch chat messages' });
  }
});

router.post('/', async (req, res) => {
  try {
    const { mode, sender, text } = req.body || {};
    if (!sender || !text) {
      return res.status(400).json({ error: 'sender and text are required' });
    }
    const { rows } = await pool.query(
      `INSERT INTO gemini_chat_messages (user_id, mode, sender, text)
       VALUES ($1, $2, $3, $4) RETURNING id, mode, sender, text, created_at`,
      [req.user.id, mode || 'english_coach', sender, text]
    );
    res.status(201).json(rows[0]);
  } catch (error) {
    console.error('Error creating chat message:', error);
    res.status(500).json({ error: 'Failed to create chat message' });
  }
});

router.delete('/', async (req, res) => {
  try {
    await pool.query(
      'DELETE FROM gemini_chat_messages WHERE user_id = $1 AND mode = $2',
      [req.user.id, req.body?.mode || 'english_coach']
    );
    res.status(204).send();
  } catch (error) {
    console.error('Error clearing chat messages:', error);
    res.status(500).json({ error: 'Failed to clear chat messages' });
  }
});

export default router;
