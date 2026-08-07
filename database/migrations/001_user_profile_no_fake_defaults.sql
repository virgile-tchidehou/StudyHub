-- StudyHub migration 001
-- Removes prototype-only invented defaults from user_profiles.
-- Run this once on an existing database before production.

ALTER TABLE user_profiles
  ALTER COLUMN target_degree DROP DEFAULT,
  ALTER COLUMN field_of_study DROP DEFAULT,
  ALTER COLUMN target_countries SET DEFAULT '{}',
  ALTER COLUMN current_gpa DROP DEFAULT,
  ALTER COLUMN target_ielts DROP DEFAULT;

-- Existing accounts created with the old prototype defaults should be reviewed
-- in the onboarding/profile UI instead of silently being treated as real data.
