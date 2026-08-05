import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { pool } from '../config/database.js';

const router = Router();
router.use(requireAuth);

const DEFAULT_TASKS = [
  { title: "Réviser IELTS Speaking Part 2 avec l'IA (30 min)", category: "english", duration_minutes: 30, due_date: "Aujourd'hui" },
  { title: "Finaliser la rédaction du Statement of Purpose (SOP)", category: "university", duration_minutes: 60, due_date: "Aujourd'hui" },
  { title: "Demander la lettre de recommandation à M. le Professeur", category: "document", duration_minutes: 15, due_date: "Demain" },
  { title: "Réviser le cours de FreeRTOS & Mutexes (Tech Learning)", category: "technical", duration_minutes: 45, due_date: "Cette semaine" }
];

// GET /api/planner
router.get('/', async (req, res) => {
  try {
    const userId = req.user.id;
    const { rows } = await pool.query(
      'SELECT * FROM planner_tasks WHERE user_id = $1 ORDER BY created_at DESC',
      [userId]
    );

    if (rows.length === 0) {
      const seeded = [];
      for (const t of DEFAULT_TASKS) {
        const resTask = await pool.query(
          `INSERT INTO planner_tasks (title, category, duration_minutes, due_date, user_id)
           VALUES ($1, $2, $3, $4, $5) RETURNING *`,
          [t.title, t.category, t.duration_minutes, t.due_date, userId]
        );
        seeded.push(resTask.rows[0]);
      }
      return res.json(seeded);
    }

    res.json(rows);
  } catch (error) {
    console.error('Error fetching planner tasks:', error);
    res.status(500).json({ error: 'Failed to fetch planner tasks' });
  }
});

// POST /api/planner
router.post('/', async (req, res) => {
  try {
    const userId = req.user.id;
    const { title, category, durationMinutes, dueDate } = req.body || {};

    if (!title || !title.trim()) {
      return res.status(400).json({ error: 'Task title is required' });
    }

    const { rows } = await pool.query(
      `INSERT INTO planner_tasks (title, category, duration_minutes, due_date, user_id)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [
        title.trim(),
        category || 'english',
        Number(durationMinutes) || 30,
        dueDate || new Date().toISOString().split('T')[0],
        userId,
      ]
    );

    res.status(201).json(rows[0]);
  } catch (error) {
    console.error('Error creating planner task:', error);
    res.status(500).json({ error: 'Failed to create task' });
  }
});

// PATCH /api/planner
router.patch('/', async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.body || {};

    if (!id) {
      return res.status(400).json({ error: 'Task ID is required' });
    }

    const { rows } = await pool.query(
      `UPDATE planner_tasks
       SET completed = NOT completed,
           updated_at = NOW()
       WHERE id = $1 AND user_id = $2
       RETURNING *`,
      [id, userId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Task not found' });
    }

    res.json(rows[0]);
  } catch (error) {
    console.error('Error toggling task:', error);
    res.status(500).json({ error: 'Failed to update task' });
  }
});

// DELETE /api/planner/:id
router.delete('/:id', async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const { rowCount } = await pool.query(
      'DELETE FROM planner_tasks WHERE id = $1 AND user_id = $2',
      [id, userId]
    );

    if (rowCount === 0) {
      return res.status(404).json({ error: 'Task not found' });
    }

    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    console.error('Error deleting task:', error);
    res.status(500).json({ error: 'Failed to delete task' });
  }
});

export default router;
