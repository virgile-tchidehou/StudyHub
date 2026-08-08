import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import goalsRouter from './src/routes/goals.js';
import universitiesRouter from './src/routes/universities.js';
import documentsRouter from './src/routes/documents.js';
import authRoutes from './src/routes/auth.js';
import profileRouter from './src/routes/profile.js';
import geminiRouter from './src/routes/gemini.js';
import aiRouter from './src/routes/ai.js';
import flashcardsRouter from './src/routes/flashcards.js';
import chatMessagesRouter from './src/routes/chat-messages.js';
import scholarshipsRouter from './src/routes/scholarships.js';
import plannerRouter from './src/routes/planner.js';
import resourcesRouter from './src/routes/resources.js';
import technicalRouter from './src/routes/technical.js';
import learningRouter from './src/routes/learning.js';
import learningDiagnosticRouter from './src/routes/learning-diagnostic.js';
import { env } from './src/config/env.js';
import { healthCheck } from './src/config/database.js';

dotenv.config();

const app = express();
const FRONTEND_URL = env.frontendUrl;
app.use(cors({ origin: FRONTEND_URL, credentials: true }));
app.options('*', cors({ origin: FRONTEND_URL, credentials: true }));

// Better Auth must run before express.json() — JSON parser consumes the request stream.
app.use('/api/auth', authRoutes);
app.use(express.json({ limit: '1mb' }));

app.use('/api/goals', goalsRouter);
app.use('/api/universities', universitiesRouter);
app.use('/api/documents', documentsRouter);
app.use('/api/scholarships', scholarshipsRouter);
app.use('/api/planner', plannerRouter);
app.use('/api/resources', resourcesRouter);
app.use('/api/technical', technicalRouter);
app.use('/api/learning', learningRouter);
app.use('/api/learning/diagnostic', learningDiagnosticRouter);
app.use('/api/profile', profileRouter);
app.use('/api/gemini', geminiRouter);
app.use('/api/ai', aiRouter);
app.use('/api/flashcards', flashcardsRouter);
app.use('/api/chat-messages', chatMessagesRouter);

app.use('/uploads', express.static(path.resolve(process.cwd(), '..', 'uploads')));

app.get('/health', async (_req, res) => {
  try {
    const db = await healthCheck();
    res.json({ status: 'ok', database: 'connected', dbName: db.database });
  } catch (error) {
    res.status(500).json({ status: 'error', database: 'disconnected', error: error.message });
  }
});

app.get('/', (_req, res) => {
  res.json({ service: 'studyhub-backend', status: 'ok', docs: '/health' });
});

export default app;

if (process.env.NODE_ENV !== 'test') {
  app.listen(env.port, async () => {
    console.log('');
    console.log('╔══════════════════════════════════════════════════╗');
    console.log(`║  🎓 StudyHub Backend  —  http://localhost:${env.port}   ║`);
    console.log('╚══════════════════════════════════════════════════╝');

    try {
      const db = await healthCheck();
      console.log(`✅ Base de données  :  ${db.database}  (PostgreSQL OK)`);
      console.log(`   Version PG       :  ${db.version.split(' ').slice(0, 2).join(' ')}`);
    } catch (err) {
      console.warn(`⚠️  Base de données  :  NON CONNECTÉE — ${err.message}`);
      console.warn('   Vérifiez DATABASE_URL dans votre fichier .env');
    }

    const geminiStatus = env.geminiApiKey ? '✅ Configuré' : '⚠️  Clé manquante (GEMINI_API_KEY)';
    const groqStatus = env.groqApiKey ? '✅ Configuré' : '⚠️  Clé manquante (GROQ_API_KEY)';
    console.log(`🤖 Gemini API       :  ${geminiStatus}`);
    console.log(`🦙 Groq API         :  ${groqStatus}`);
    console.log(`🌐 Frontend autorisé:  ${env.frontendUrl}`);
    console.log('');
  });
}
