-- 1. Go to your Supabase Dashboard -> SQL Editor
-- 2. Run the following SQL to fix the foreign key constraint on the 'summaries' table
--    and potentially others that might be incorrectly referencing 'users' instead of 'students'.

-- Add avatar_url to students if it doesn't exist
ALTER TABLE students ADD COLUMN IF NOT EXISTS avatar_url TEXT;

-- Create notifications table if it doesn't exist
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES students(id) ON DELETE CASCADE,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Fix 'summaries' table
ALTER TABLE summaries DROP CONSTRAINT IF EXISTS summaries_user_id_fkey;
ALTER TABLE summaries
ADD CONSTRAINT summaries_user_id_fkey
FOREIGN KEY (user_id)
REFERENCES students(id)
ON DELETE CASCADE;

-- Fix 'notifications' table
ALTER TABLE notifications DROP CONSTRAINT IF EXISTS notifications_user_id_fkey;
ALTER TABLE notifications
ADD CONSTRAINT notifications_user_id_fkey
FOREIGN KEY (user_id)
REFERENCES students(id)
ON DELETE CASCADE;

-- Fix 'streaks' table
ALTER TABLE streaks DROP CONSTRAINT IF EXISTS streaks_user_id_fkey;
ALTER TABLE streaks
ADD CONSTRAINT streaks_user_id_fkey
FOREIGN KEY (user_id)
REFERENCES students(id)
ON DELETE CASCADE;

-- Fix 'student_profiles' table
ALTER TABLE student_profiles DROP CONSTRAINT IF EXISTS student_profiles_user_id_fkey;
ALTER TABLE student_profiles
ADD CONSTRAINT student_profiles_user_id_fkey
FOREIGN KEY (user_id)
REFERENCES students(id)
ON DELETE CASCADE;

-- Fix 'user_weaknesses' table
ALTER TABLE user_weaknesses DROP CONSTRAINT IF EXISTS user_weaknesses_user_id_fkey;
ALTER TABLE user_weaknesses
ADD CONSTRAINT user_weaknesses_user_id_fkey
FOREIGN KEY (user_id)
REFERENCES students(id)
ON DELETE CASCADE;
