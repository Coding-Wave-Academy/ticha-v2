-- Run this in your Supabase SQL Editor to fix the 500 Error in Chat
-- This fixes the foreign key constraint that is currently pointing to 'users' instead of 'students'

-- 1. Fix chat_sessions table
ALTER TABLE chat_sessions DROP CONSTRAINT IF EXISTS chat_sessions_user_id_fkey;
ALTER TABLE chat_sessions
ADD CONSTRAINT chat_sessions_user_id_fkey
FOREIGN KEY (user_id)
REFERENCES students(id)
ON DELETE CASCADE;

-- 2. Ensure RLS is correctly set up for the students table reference
ALTER TABLE chat_sessions ENABLE ROW LEVEL SECURITY;

-- Drop old policy if exists
DROP POLICY IF EXISTS "Users can manage their own sessions" ON chat_sessions;

-- Create correct policy using auth.uid()
-- Note: This assumes students.id matches auth.uid()
CREATE POLICY "Users can manage their own sessions" ON chat_sessions
    FOR ALL USING (auth.uid() = user_id);

-- 3. Fix tutor_conversations (just in case)
ALTER TABLE tutor_conversations ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can manage their own conversations" ON tutor_conversations;

CREATE POLICY "Users can manage their own conversations" ON tutor_conversations
    USING (
      session_id IN (
        SELECT id FROM chat_sessions WHERE user_id = auth.uid()
      )
    );

-- 4. Verify the tables exist (if they don't, this will create them correctly)
CREATE TABLE IF NOT EXISTS chat_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES students(id) ON DELETE CASCADE,
    title TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS tutor_conversations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID REFERENCES chat_sessions(id) ON DELETE CASCADE,
    role TEXT CHECK (role IN ('student', 'tutor')),
    content TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
