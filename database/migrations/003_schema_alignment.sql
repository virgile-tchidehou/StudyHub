-- Align existing StudyHub databases created before schema v0.2
-- Safe to run multiple times (IF NOT EXISTS)

-- goals: category column used by Learning Engine
ALTER TABLE goals ADD COLUMN IF NOT EXISTS category VARCHAR(100) DEFAULT 'academic';

-- universities: tracking application pipeline
ALTER TABLE universities ADD COLUMN IF NOT EXISTS application_status VARCHAR(100) DEFAULT 'researching';
ALTER TABLE universities ADD COLUMN IF NOT EXISTS description TEXT DEFAULT NULL;
ALTER TABLE universities ADD COLUMN IF NOT EXISTS website VARCHAR(255) DEFAULT NULL;
ALTER TABLE universities ADD COLUMN IF NOT EXISTS requirements TEXT DEFAULT NULL;
ALTER TABLE universities ADD COLUMN IF NOT EXISTS deadlines TEXT DEFAULT NULL;

-- gemini_chat_messages: provider column for multi-AI
ALTER TABLE gemini_chat_messages ADD COLUMN IF NOT EXISTS provider VARCHAR(50) DEFAULT 'gemini';

-- Adaptive Learning Engine
CREATE TABLE IF NOT EXISTS learning_assessments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id VARCHAR(255) NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
  assessment_type VARCHAR(50) NOT NULL,
  score INTEGER NOT NULL CHECK (score >= 0 AND score <= 100),
  level VARCHAR(20) DEFAULT NULL,
  result JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMP DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS learning_assessments_user_id_idx ON learning_assessments(user_id);
CREATE INDEX IF NOT EXISTS learning_assessments_type_created_idx ON learning_assessments(assessment_type, created_at DESC);

-- AI daily plan tracking (may be missing on older installs)
CREATE TABLE IF NOT EXISTS ai_action_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id VARCHAR(255) NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
  plan_date DATE NOT NULL DEFAULT CURRENT_DATE,
  action_key VARCHAR(120) NOT NULL,
  action_title VARCHAR(255) NOT NULL,
  category VARCHAR(100) DEFAULT 'general',
  status VARCHAR(20) NOT NULL CHECK (status IN ('completed', 'dismissed')),
  source VARCHAR(50) NOT NULL DEFAULT 'daily_plan',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE (user_id, plan_date, action_key)
);
CREATE INDEX IF NOT EXISTS ai_action_events_user_id_idx ON ai_action_events(user_id);
CREATE INDEX IF NOT EXISTS ai_action_events_plan_date_idx ON ai_action_events(plan_date);

-- Adaptive curriculum exercises
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
