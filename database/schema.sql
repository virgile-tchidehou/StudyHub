-- StudyHub business schema (PostgreSQL)
-- Better Auth tables live in backend/src/config/auth-schema.sql
-- Apply with: psql -d studyhub_db -f database/schema.sql

-- 1. Goals Table
CREATE TABLE IF NOT EXISTS goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  description TEXT DEFAULT NULL,
  category VARCHAR(100) DEFAULT 'academic',
  target_date TIMESTAMP DEFAULT NULL,
  progress INTEGER DEFAULT 0,
  completed BOOLEAN DEFAULT FALSE,
  user_id VARCHAR(255) NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 2. Universities Table
CREATE TABLE IF NOT EXISTS universities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  country VARCHAR(255) DEFAULT NULL,
  description TEXT DEFAULT NULL,
  website VARCHAR(255) DEFAULT NULL,
  ranking INTEGER DEFAULT NULL,
  requirements TEXT DEFAULT NULL,
  deadlines TEXT DEFAULT NULL,
  application_status VARCHAR(100) DEFAULT 'researching',
  user_id VARCHAR(255) NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 3. Documents Table
CREATE TABLE IF NOT EXISTS documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  type VARCHAR(255) DEFAULT NULL,
  status VARCHAR(255) DEFAULT 'draft',
  content TEXT DEFAULT NULL,
  file_path VARCHAR(255) DEFAULT NULL,
  expires_at TIMESTAMP DEFAULT NULL,
  user_id VARCHAR(255) NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
  university_id UUID DEFAULT NULL REFERENCES universities(id) ON DELETE SET NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 4. Scholarships Table
CREATE TABLE IF NOT EXISTS scholarships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  organization VARCHAR(255) NOT NULL,
  amount VARCHAR(255) NOT NULL,
  deadline VARCHAR(255) DEFAULT NULL,
  coverage TEXT DEFAULT NULL,
  country VARCHAR(255) DEFAULT NULL,
  field_of_study VARCHAR(255) DEFAULT 'Tous domaines',
  status VARCHAR(100) DEFAULT 'saved',
  link VARCHAR(500) DEFAULT NULL,
  user_id VARCHAR(255) NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 5. Planner Tasks Table
CREATE TABLE IF NOT EXISTS planner_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  category VARCHAR(100) DEFAULT 'english',
  duration_minutes INTEGER DEFAULT 30,
  due_date VARCHAR(100) DEFAULT NULL,
  completed BOOLEAN DEFAULT FALSE,
  user_id VARCHAR(255) NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 6. Resources Table
CREATE TABLE IF NOT EXISTS resources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  category VARCHAR(100) NOT NULL,
  url VARCHAR(500) NOT NULL,
  description TEXT DEFAULT NULL,
  tags TEXT[] DEFAULT '{}',
  user_id VARCHAR(255) DEFAULT NULL REFERENCES "user"(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 7. Flashcards Table
CREATE TABLE IF NOT EXISTS flashcards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id VARCHAR(255) NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
  word VARCHAR(255) NOT NULL,
  phonetic VARCHAR(255) DEFAULT NULL,
  definition TEXT DEFAULT NULL,
  example TEXT DEFAULT NULL,
  category VARCHAR(255) DEFAULT 'IELTS Academic',
  mastered BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 8. Technical Progress Table
CREATE TABLE IF NOT EXISTS technical_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id VARCHAR(255) NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
  track_id VARCHAR(100) NOT NULL,
  node_id VARCHAR(100) NOT NULL,
  status VARCHAR(50) DEFAULT 'completed',
  created_at TIMESTAMP DEFAULT NOW()
);

-- 9. Gemini & Groq Chat Messages Table
CREATE TABLE IF NOT EXISTS gemini_chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id VARCHAR(255) NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
  mode VARCHAR(255) DEFAULT 'english_coach',
  provider VARCHAR(50) DEFAULT 'gemini',
  sender VARCHAR(50) NOT NULL,
  text TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 10. User Study Profile
CREATE TABLE IF NOT EXISTS user_profiles (
  user_id VARCHAR(255) PRIMARY KEY REFERENCES "user"(id) ON DELETE CASCADE,
  target_degree VARCHAR(100) DEFAULT 'Master 2',
  field_of_study VARCHAR(255) DEFAULT 'Informatique / Embedded Systems / AI',
  target_countries TEXT[] DEFAULT '{"France", "Allemagne", "Canada", "Royaume-Uni"}',
  current_gpa VARCHAR(50) DEFAULT '15/20',
  target_ielts VARCHAR(50) DEFAULT '7.5',
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for optimal performance
CREATE INDEX IF NOT EXISTS goals_user_id_idx ON goals(user_id);
CREATE INDEX IF NOT EXISTS universities_user_id_idx ON universities(user_id);
CREATE INDEX IF NOT EXISTS documents_user_id_idx ON documents(user_id);
CREATE INDEX IF NOT EXISTS documents_university_id_idx ON documents(university_id);
CREATE INDEX IF NOT EXISTS scholarships_user_id_idx ON scholarships(user_id);
CREATE INDEX IF NOT EXISTS planner_tasks_user_id_idx ON planner_tasks(user_id);
CREATE INDEX IF NOT EXISTS flashcards_user_id_idx ON flashcards(user_id);
CREATE INDEX IF NOT EXISTS gemini_chat_messages_user_id_idx ON gemini_chat_messages(user_id);
CREATE INDEX IF NOT EXISTS technical_progress_user_id_idx ON technical_progress(user_id);
