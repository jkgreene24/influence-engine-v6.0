-- Simple Quiz Selections Table
-- Stores user quiz answer selections for future analytics

CREATE TABLE IF NOT EXISTS quiz_selections (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES influence_users(id) ON DELETE CASCADE,
    question_id VARCHAR(20) NOT NULL, -- e.g., "Q1", "Q1-Alt", "Q10"
    answer_id VARCHAR(10) NOT NULL, -- e.g., "A", "B", "C", "D", "E"
    analytics_tag VARCHAR(50) NOT NULL, -- e.g., "Q1_A", "Q1_MIX", "Q1_NONE"
    answered_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Prevent duplicate answers per user per question
    CONSTRAINT unique_user_question_answer UNIQUE(user_id, question_id)
);

-- Basic index for performance
CREATE INDEX IF NOT EXISTS idx_quiz_selections_user_id ON quiz_selections(user_id);
CREATE INDEX IF NOT EXISTS idx_quiz_selections_analytics_tag ON quiz_selections(analytics_tag);

-- Enable Row Level Security
ALTER TABLE quiz_selections ENABLE ROW LEVEL SECURITY;

-- Simple RLS policy - users can only see their own data
-- Note: This policy assumes you have a way to identify the current user's influence_users.id
-- You may need to adjust this based on your authentication setup
CREATE POLICY "Users can view their own quiz selections" ON quiz_selections
    FOR ALL USING (user_id = (SELECT id FROM influence_users WHERE email = auth.jwt() ->> 'email'));
