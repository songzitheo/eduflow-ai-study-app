-- ================================================================
-- AI STUDY ASSISTANT - COMPLETE DATABASE SETUP
-- ================================================================
-- Copy this entire file and paste into Supabase SQL Editor
-- Then click "RUN" to create all tables, indexes, and policies
-- ================================================================

-- ================================================================
-- 1. CREATE TABLES
-- ================================================================

-- Create study_sources table first (base table)
CREATE TABLE IF NOT EXISTS study_sources (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  raw_text text NOT NULL,
  deadline_date date,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS on study_sources
ALTER TABLE study_sources ENABLE ROW LEVEL SECURITY;

-- RLS policies for study_sources
CREATE POLICY "Users can view their own study sources"
ON study_sources FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own study sources"
ON study_sources FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own study sources"
ON study_sources FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own study sources"
ON study_sources FOR DELETE
USING (auth.uid() = user_id);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_study_sources_user_id ON study_sources(user_id);

-- Now create dependent tables
CREATE TABLE diagnostic_questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  study_source_id uuid REFERENCES study_sources(id) ON DELETE CASCADE,
  question text NOT NULL,
  order_index integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE diagnostic_answers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id uuid REFERENCES diagnostic_questions(id) ON DELETE CASCADE,
  user_answer text NOT NULL,
  ai_feedback text NOT NULL,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE study_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  study_source_id uuid REFERENCES study_sources(id) ON DELETE CASCADE,
  plan_json jsonb NOT NULL,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  study_source_id uuid REFERENCES study_sources(id) ON DELETE CASCADE,
  scheduled_at timestamptz NOT NULL,
  completed boolean DEFAULT false,
  completed_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- ================================================================
-- 2. CREATE INDEXES
-- ================================================================

CREATE INDEX idx_diagnostic_questions_study_source_id 
ON diagnostic_questions(study_source_id);

CREATE INDEX idx_diagnostic_answers_question_id 
ON diagnostic_answers(question_id);

CREATE INDEX idx_study_plans_study_source_id 
ON study_plans(study_source_id);

CREATE INDEX idx_reviews_study_source_id 
ON reviews(study_source_id);

CREATE INDEX idx_reviews_scheduled_at 
ON reviews(scheduled_at);

CREATE INDEX idx_reviews_completed 
ON reviews(completed);

-- ================================================================
-- 3. ENABLE ROW LEVEL SECURITY
-- ================================================================

ALTER TABLE diagnostic_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE diagnostic_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE study_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- ================================================================
-- 4. CREATE RLS POLICIES - diagnostic_questions
-- ================================================================

CREATE POLICY "Users can view their own diagnostic questions"
ON diagnostic_questions FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM study_sources 
    WHERE study_sources.id = diagnostic_questions.study_source_id 
    AND study_sources.user_id = auth.uid()
  )
);

CREATE POLICY "Users can insert diagnostic questions for their study sources"
ON diagnostic_questions FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM study_sources 
    WHERE study_sources.id = diagnostic_questions.study_source_id 
    AND study_sources.user_id = auth.uid()
  )
);

-- ================================================================
-- 5. CREATE RLS POLICIES - diagnostic_answers
-- ================================================================

CREATE POLICY "Users can view their own diagnostic answers"
ON diagnostic_answers FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM diagnostic_questions dq
    JOIN study_sources ss ON ss.id = dq.study_source_id
    WHERE dq.id = diagnostic_answers.question_id 
    AND ss.user_id = auth.uid()
  )
);

CREATE POLICY "Users can insert answers to their diagnostic questions"
ON diagnostic_answers FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM diagnostic_questions dq
    JOIN study_sources ss ON ss.id = dq.study_source_id
    WHERE dq.id = diagnostic_answers.question_id 
    AND ss.user_id = auth.uid()
  )
);

-- ================================================================
-- 6. CREATE RLS POLICIES - study_plans
-- ================================================================

CREATE POLICY "Users can view their own study plans"
ON study_plans FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM study_sources 
    WHERE study_sources.id = study_plans.study_source_id 
    AND study_sources.user_id = auth.uid()
  )
);

CREATE POLICY "Users can insert study plans for their study sources"
ON study_plans FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM study_sources 
    WHERE study_sources.id = study_plans.study_source_id 
    AND study_sources.user_id = auth.uid()
  )
);

-- ================================================================
-- 7. CREATE RLS POLICIES - reviews
-- ================================================================

CREATE POLICY "Users can view their own reviews"
ON reviews FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM study_sources 
    WHERE study_sources.id = reviews.study_source_id 
    AND study_sources.user_id = auth.uid()
  )
);

CREATE POLICY "Users can insert reviews for their study sources"
ON reviews FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM study_sources 
    WHERE study_sources.id = reviews.study_source_id 
    AND study_sources.user_id = auth.uid()
  )
);

CREATE POLICY "Users can update their own reviews"
ON reviews FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM study_sources 
    WHERE study_sources.id = reviews.study_source_id 
    AND study_sources.user_id = auth.uid()
  )
);

-- ================================================================
-- SETUP COMPLETE! ✅
-- ================================================================
-- You can now use the AI Study Assistant application.
-- Make sure to add OPENAI_API_KEY to your .env.local file.
-- ================================================================
