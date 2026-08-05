import { Router } from 'express';
import aiRouter from './ai.js';

const router = Router();

// Delegate to unified AI router for full compatibility
router.use('/', aiRouter);

export default router;
