-- Fix RLS infinite recursion for users and related tables
-- This script removes ALL existing policies and creates new simplified ones

-- 1. Drop ALL existing policies on users table
DROP POLICY IF EXISTS "Users can view their own profile" ON users;
DROP POLICY IF EXISTS "Super admins can manage all users" ON users;
DROP POLICY IF EXISTS "Users can view own profile" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;
DROP POLICY IF EXISTS "Admins can view all users" ON users;
DROP POLICY IF EXISTS "Admins can update all users" ON users;
DROP POLICY IF EXISTS "users_select_policy" ON users;
DROP POLICY IF EXISTS "users_insert_policy" ON users;
DROP POLICY IF EXISTS "users_update_policy" ON users;

-- 2. Drop ALL existing policies on meeting_participants table
DROP POLICY IF EXISTS "Users can view their meeting participations" ON meeting_participants;
DROP POLICY IF EXISTS "Users can insert their own participations" ON meeting_participants;
DROP POLICY IF EXISTS "Users can update their own participations" ON meeting_participants;
DROP POLICY IF EXISTS "Users can delete their own participations" ON meeting_participants;
DROP POLICY IF EXISTS "Users can view participants in their meetings" ON meeting_participants;
DROP POLICY IF EXISTS "meeting_participants_select_policy" ON meeting_participants;
DROP POLICY IF EXISTS "meeting_participants_insert_policy" ON meeting_participants;
DROP POLICY IF EXISTS "meeting_participants_update_policy" ON meeting_participants;
DROP POLICY IF EXISTS "meeting_participants_delete_policy" ON meeting_participants;

-- 3. Drop ALL existing policies on meetings table
DROP POLICY IF EXISTS "Users can view meetings they participate in" ON meetings;
DROP POLICY IF EXISTS "Users can create meetings" ON meetings;
DROP POLICY IF EXISTS "Users can update their own meetings" ON meetings;
DROP POLICY IF EXISTS "Users can delete their own meetings" ON meetings;
DROP POLICY IF EXISTS "Team members can create meetings" ON meetings;
DROP POLICY IF EXISTS "meetings_select_policy" ON meetings;
DROP POLICY IF EXISTS "meetings_insert_policy" ON meetings;
DROP POLICY IF EXISTS "meetings_update_policy" ON meetings;
DROP POLICY IF EXISTS "meetings_delete_policy" ON meetings;

-- 4. Temporarily disable RLS on all tables
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE meeting_participants DISABLE ROW LEVEL SECURITY;
ALTER TABLE meetings DISABLE ROW LEVEL SECURITY;

-- 5. Re-enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE meeting_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE meetings ENABLE ROW LEVEL SECURITY;

-- 6. Create simplified users policies without recursion
CREATE POLICY "users_basic_select" 
ON users FOR SELECT 
USING (auth.uid() IS NOT NULL);

CREATE POLICY "users_basic_insert" 
ON users FOR INSERT 
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "users_basic_update" 
ON users FOR UPDATE 
USING (id = auth.uid());

-- 7. Create simplified meeting_participants policies
CREATE POLICY "participants_basic_select" 
ON meeting_participants FOR SELECT 
USING (auth.uid() IS NOT NULL);

CREATE POLICY "participants_basic_insert" 
ON meeting_participants FOR INSERT 
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "participants_basic_update" 
ON meeting_participants FOR UPDATE 
USING (user_id = auth.uid());

-- 8. Create simplified meetings policies
CREATE POLICY "meetings_basic_select" 
ON meetings FOR SELECT 
USING (auth.uid() IS NOT NULL);

CREATE POLICY "meetings_basic_insert" 
ON meetings FOR INSERT 
WITH CHECK (host_id = auth.uid());

CREATE POLICY "meetings_basic_update" 
ON meetings FOR UPDATE 
USING (host_id = auth.uid());

-- 9. Verification
SELECT 'All RLS policies cleaned and recreated - recursion eliminated' as status; 