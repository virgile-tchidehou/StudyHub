import { Router } from 'express';
import { pool } from '../config/database.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

router.use(requireAuth);

// GET /api/universities - list current user's tracked universities
router.get('/', async (req, res) => {
  try {
    const { rows } = await pool.query(
      'SELECT * FROM universities WHERE user_id = $1 ORDER BY ranking ASC NULLS LAST',
      [req.user.id]
    );
    res.json(rows);
  } catch (error) {
    console.error('Error fetching universities:', error);
    res.status(500).json({ error: 'Failed to fetch universities' });
  }
});

// GET /api/universities/:id - get a single university
router.get('/:id', async (req, res) => {
  try {
    const { rows } = await pool.query(
      'SELECT * FROM universities WHERE id = $1 AND user_id = $2',
      [req.params.id, req.user.id]
    );
    if (rows.length === 0) {
      return res.status(404).json({ error: 'University not found' });
    }
    res.json(rows[0]);
  } catch (error) {
    console.error('Error fetching university:', error);
    res.status(500).json({ error: 'Failed to fetch university' });
  }
});

// POST /api/universities - add a university
router.post('/', async (req, res) => {
  try {
    const { name, country, description, website, ranking, requirements, deadlines } = req.body;
    if (!name || typeof name !== 'string') {
      return res.status(400).json({ error: 'Name is required' });
    }
    const { rows } = await pool.query(
      `INSERT INTO universities (name, country, description, website, ranking, requirements, deadlines, user_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
      [name, country ?? null, description ?? null, website ?? null, ranking ?? null, requirements ?? null, deadlines ?? null, req.user.id]
    );
    res.status(201).json(rows[0]);
  } catch (error) {
    console.error('Error creating university:', error);
    res.status(500).json({ error: 'Failed to create university' });
  }
});

// DELETE /api/universities/:id - remove a university
router.delete('/:id', async (req, res) => {
  try {
    const { rowCount } = await pool.query(
      'DELETE FROM universities WHERE id = $1 AND user_id = $2',
      [req.params.id, req.user.id]
    );
    if (rowCount === 0) {
      return res.status(404).json({ error: 'University not found' });
    }
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting university:', error);
    res.status(500).json({ error: 'Failed to delete university' });
  }
});

export default router;
