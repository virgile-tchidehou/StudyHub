import { Router } from 'express';
import { pool } from '../config/database.js';
import { requireAuth } from '../middleware/auth.js';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

const router = Router();

// Ensure uploads directory exists
const uploadsDir = path.resolve(process.cwd(), '..', 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadsDir),
  filename: (_req, file, cb) => {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, unique + path.extname(file.originalname));
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowed = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('File type not allowed'));
    }
  },
});

router.use(requireAuth);

// GET /api/documents - list current user's documents
router.get('/', async (req, res) => {
  try {
    const { rows } = await pool.query(
      'SELECT * FROM documents WHERE user_id = $1 ORDER BY created_at DESC',
      [req.user.id]
    );
    res.json(rows);
  } catch (error) {
    console.error('Error fetching documents:', error);
    res.status(500).json({ error: 'Failed to fetch documents' });
  }
});

// GET /api/documents/:id - get a single document
router.get('/:id', async (req, res) => {
  try {
    const { rows } = await pool.query(
      'SELECT * FROM documents WHERE id = $1 AND user_id = $2',
      [req.params.id, req.user.id]
    );
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Document not found' });
    }
    res.json(rows[0]);
  } catch (error) {
    console.error('Error fetching document:', error);
    res.status(500).json({ error: 'Failed to fetch document' });
  }
});

// POST /api/documents - add a document record (with optional file upload)
router.post('/', upload.single('file'), async (req, res) => {
  try {
    const { title, type, status, content, universityId } = req.body;
    if (!title || typeof title !== 'string') {
      return res.status(400).json({ error: 'Title is required' });
    }
    const filePath = req.file ? `/uploads/${req.file.filename}` : null;
    const { rows } = await pool.query(
      `INSERT INTO documents (title, type, status, content, university_id, user_id, file_path)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [title, type ?? null, status ?? 'draft', content ?? null, universityId ?? null, req.user.id, filePath]
    );
    res.status(201).json(rows[0]);
  } catch (error) {
    console.error('Error creating document:', error);
    res.status(500).json({ error: 'Failed to create document' });
  }
});

// PATCH /api/documents/:id - update a document
router.patch('/:id', upload.single('file'), async (req, res) => {
  try {
    const { title, type, status, content, universityId } = req.body;
    const filePath = req.file ? `/uploads/${req.file.filename}` : null;
    const { rows } = await pool.query(
      `UPDATE documents SET title = COALESCE($1, title), type = COALESCE($2, type), status = COALESCE($3, status), content = COALESCE($4, content), university_id = COALESCE($5, university_id), file_path = COALESCE($6, file_path), updated_at = NOW()
       WHERE id = $7 AND user_id = $8 RETURNING *`,
      [title ?? null, type ?? null, status ?? null, content ?? null, universityId ?? null, filePath ?? null, req.params.id, req.user.id]
    );
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Document not found' });
    }
    res.json(rows[0]);
  } catch (error) {
    console.error('Error updating document:', error);
    res.status(500).json({ error: 'Failed to update document' });
  }
});

// DELETE /api/documents/:id - remove a document
router.delete('/:id', async (req, res) => {
  try {
    const { rowCount } = await pool.query(
      'DELETE FROM documents WHERE id = $1 AND user_id = $2',
      [req.params.id, req.user.id]
    );
    if (rowCount === 0) {
      return res.status(404).json({ error: 'Document not found' });
    }
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting document:', error);
    res.status(500).json({ error: 'Failed to delete document' });
  }
});

export default router;
