# AI Study Assistant - Database Schema

This document describes the database tables you need to create in Supabase for the AI study assistant features.

## Required Tables

### 1. study_sources ✅ (Already Created)
```sql
-- Already exists
study_sources (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  raw_text text NOT NULL,
  deadline_date date,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
```

### 2. diagnostic_questions (NEW)
Stores AI-generated diagnostic questions for each study source.

```sql
CREATE TABLE diagnostic_questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  study_source_id uuid REFERENCES study_sources(id) ON DELETE CASCADE,
  question text NOT NULL,
  order_index integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Add index for faster queries
CREATE INDEX idx_diagnostic_questions_study_source_id 
ON diagnostic_questions(study_source_id);
```

### 3. diagnostic_answers (NEW)
Stores user answers and AI-generated feedback.

```sql
CREATE TABLE diagnostic_answers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id uuid REFERENCES diagnostic_questions(id) ON DELETE CASCADE,
  user_answer text NOT NULL,
  ai_feedback text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Add index for faster queries
CREATE INDEX idx_diagnostic_answers_question_id 
ON diagnostic_answers(question_id);
```

### 4. study_plans (NEW)
Stores the macro→meso→micro learning plans as JSON.

```sql
CREATE TABLE study_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  study_source_id uuid REFERENCES study_sources(id) ON DELETE CASCADE,
  plan_json jsonb NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Add index for faster queries
CREATE INDEX idx_study_plans_study_source_id 
ON study_plans(study_source_id);
```

### 5. reviews (NEW)
Stores spaced repetition review schedule (J+2, J+7, J+21).

```sql
CREATE TABLE reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  study_source_id uuid REFERENCES study_sources(id) ON DELETE CASCADE,
  scheduled_at timestamptz NOT NULL,
  completed boolean DEFAULT false,
  completed_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- Add indexes for faster queries
CREATE INDEX idx_reviews_study_source_id 
ON reviews(study_source_id);

CREATE INDEX idx_reviews_scheduled_at 
ON reviews(scheduled_at);

CREATE INDEX idx_reviews_completed 
ON reviews(completed);
```

## Row Level Security (RLS) Policies

For each table, add RLS policies to ensure users can only access their own data:

```sql
-- Enable RLS on all tables
ALTER TABLE diagnostic_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE diagnostic_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE study_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- diagnostic_questions policies
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

-- diagnostic_answers policies
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

-- study_plans policies
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

-- reviews policies
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
```

## Quick Setup Script

You can run this entire script in the Supabase SQL Editor:

```sql
-- Create all tables
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

-- Create indexes
CREATE INDEX idx_diagnostic_questions_study_source_id ON diagnostic_questions(study_source_id);
CREATE INDEX idx_diagnostic_answers_question_id ON diagnostic_answers(question_id);
CREATE INDEX idx_study_plans_study_source_id ON study_plans(study_source_id);
CREATE INDEX idx_reviews_study_source_id ON reviews(study_source_id);
CREATE INDEX idx_reviews_scheduled_at ON reviews(scheduled_at);
CREATE INDEX idx_reviews_completed ON reviews(completed);

-- Enable RLS
ALTER TABLE diagnostic_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE diagnostic_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE study_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- RLS Policies (copy all policies from above)
-- ... (add all the CREATE POLICY statements)
```

## Notes

- All tables use UUID primary keys
- Foreign keys cascade on delete
- Timestamps default to current time
- RLS ensures data isolation between users
- Indexes optimize common query patterns
