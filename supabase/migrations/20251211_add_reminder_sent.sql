-- Add reminder_sent column to reviews table to track if email reminder was sent
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS reminder_sent BOOLEAN DEFAULT FALSE;

-- Add index for faster queries on scheduled reviews
CREATE INDEX IF NOT EXISTS idx_reviews_scheduled_reminder 
ON reviews (scheduled_at, completed, reminder_sent) 
WHERE completed = FALSE AND reminder_sent = FALSE;
