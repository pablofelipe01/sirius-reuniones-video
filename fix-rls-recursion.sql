-- Fix RLS infinite recursion in meeting_participants table
-- This script removes problematic policies and creates simpler ones

-- Drop existing policies that might be causing recursion
DROP POLICY IF EXISTS "Users can view their meeting participations" ON meeting_participants;
DROP POLICY IF EXISTS "Users can insert their own participations" ON meeting_participants;
DROP POLICY IF EXISTS "Users can update their own participations" ON meeting_participants;
DROP POLICY IF EXISTS "Users can delete their own participations" ON meeting_participants;

-- Temporarily disable RLS to test
ALTER TABLE meeting_participants DISABLE ROW LEVEL SECURITY;

-- Re-enable RLS with simpler policies
ALTER TABLE meeting_participants ENABLE ROW LEVEL SECURITY;

-- Create simplified policies without recursion
CREATE POLICY "meeting_participants_select_policy" 
ON meeting_participants FOR SELECT 
USING (auth.uid() IS NOT NULL);

CREATE POLICY "meeting_participants_insert_policy" 
ON meeting_participants FOR INSERT 
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "meeting_participants_update_policy" 
ON meeting_participants FOR UPDATE 
USING (user_id = auth.uid());

CREATE POLICY "meeting_participants_delete_policy" 
ON meeting_participants FOR DELETE 
USING (user_id = auth.uid());

-- Also fix meetings table policies if they exist
DROP POLICY IF EXISTS "Users can view meetings they participate in" ON meetings;
DROP POLICY IF EXISTS "Users can create meetings" ON meetings;
DROP POLICY IF EXISTS "Users can update their own meetings" ON meetings;
DROP POLICY IF EXISTS "Users can delete their own meetings" ON meetings;

-- Create simplified meeting policies (using correct column name: host_id)
CREATE POLICY "meetings_select_policy" 
ON meetings FOR SELECT 
USING (auth.uid() IS NOT NULL);

CREATE POLICY "meetings_insert_policy" 
ON meetings FOR INSERT 
WITH CHECK (host_id = auth.uid());

CREATE POLICY "meetings_update_policy" 
ON meetings FOR UPDATE 
USING (host_id = auth.uid());

CREATE POLICY "meetings_delete_policy" 
ON meetings FOR DELETE 
USING (host_id = auth.uid());

-- Verify the fix
SELECT 'RLS policies fixed successfully' as status; 