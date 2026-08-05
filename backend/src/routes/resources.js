import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { pool } from '../config/database.js';

const router = Router();
router.use(requireAuth);

const DEFAULT_RESOURCES = [
  {
    title: "Guide Officiel Campus France — Étapes & Procédure",
    category: "Guide",
    url: "https://www.campusfrance.org",
    description: "Guide pas-à-pas pour la constitution du dossier Campus France, entretien et validation de visa.",
    tags: ["CampusFrance", "Guide", "Visa", "France"]
  },
  {
    title: "Modèle Statement of Purpose (SOP) Gagnant Master",
    category: "Template",
    url: "https://github.com",
    description: "Structure recommandée en 5 paragraphes (Accroche, Parcours Académique, Projet Pro, Pourquoi cette université, Conclusion).",
    tags: ["SOP", "Template", "LettreMotivation", "Master"]
  },
  {
    title: "IELTS Academic Vocabulary 1000+ Words (PDF)",
    category: "PDF",
    url: "https://ielts.org",
    description: "Vocabulaire C1/C2 classé par thématiques académiques pour réussir le Writing Task 2 & Speaking Part 3.",
    tags: ["IELTS", "Vocabulary", "PDF", "English"]
  },
  {
    title: "Europass CV Academic Generator",
    category: "Guide",
    url: "https://europa.eu/europass",
    description: "Générateur officiel de CV conforme aux normes des universités européennes.",
    tags: ["CV", "Europass", "Academic", "Europe"]
  },
  {
    title: "Chaîne YouTube — Mock Interviews & Campus France Tips",
    category: "YouTube",
    url: "https://youtube.com",
    description: "Vidéos de conseils pour réussir les entretiens de bourses et d'admission en Master.",
    tags: ["YouTube", "Interview", "Conseils", "Entretien"]
  }
];

// GET /api/resources
router.get('/', async (req, res) => {
  try {
    const userId = req.user.id;
    const { rows } = await pool.query(
      'SELECT * FROM resources WHERE user_id IS NULL OR user_id = $1 ORDER BY created_at DESC',
      [userId]
    );

    if (rows.length === 0) {
      const seeded = [];
      for (const r of DEFAULT_RESOURCES) {
        const resRow = await pool.query(
          `INSERT INTO resources (title, category, url, description, tags, user_id)
           VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
          [r.title, r.category, r.url, r.description, r.tags, userId]
        );
        seeded.push(resRow.rows[0]);
      }
      return res.json(seeded);
    }

    res.json(rows);
  } catch (error) {
    console.error('Error fetching resources:', error);
    res.status(500).json({ error: 'Failed to fetch resources' });
  }
});

// POST /api/resources
router.post('/', async (req, res) => {
  try {
    const userId = req.user.id;
    const { title, category, url, description, tags } = req.body || {};

    if (!title || !title.trim() || !url) {
      return res.status(400).json({ error: 'Title and URL are required' });
    }

    const { rows } = await pool.query(
      `INSERT INTO resources (title, category, url, description, tags, user_id)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [
        title.trim(),
        category || 'Guide',
        url.trim(),
        description || '',
        Array.isArray(tags) ? tags : ['StudyHub'],
        userId,
      ]
    );

    res.status(201).json(rows[0]);
  } catch (error) {
    console.error('Error adding resource:', error);
    res.status(500).json({ error: 'Failed to add resource' });
  }
});

export default router;
