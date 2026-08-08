-- Adaptive curriculum exercises table (for existing databases)
CREATE TABLE IF NOT EXISTS learning_exercises (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id VARCHAR(255) NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
  domain VARCHAR(50) NOT NULL,
  skill VARCHAR(100) NOT NULL,
  title VARCHAR(255) NOT NULL,
  exercise_type VARCHAR(50) DEFAULT 'practice',
  prompt TEXT NOT NULL,
  content JSONB NOT NULL DEFAULT '{}'::jsonb,
  duration_minutes INTEGER DEFAULT 20,
  source VARCHAR(50) DEFAULT 'template',
  status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'skipped')),
  created_at TIMESTAMP DEFAULT NOW(),
  completed_at TIMESTAMP DEFAULT NULL
);
CREATE INDEX IF NOT EXISTS learning_exercises_user_status_idx ON learning_exercises(user_id, status);
