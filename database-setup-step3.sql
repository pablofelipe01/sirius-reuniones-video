-- Supabase Database Setup - STEP 3: Security and Performance
-- Run this after Step 2

-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE meetings ENABLE ROW LEVEL SECURITY;
ALTER TABLE meeting_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE meeting_recordings ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE whiteboard_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE processing_queue ENABLE ROW LEVEL SECURITY;

-- RLS Policies for users
CREATE POLICY "Users can view their own profile" ON users
  FOR SELECT USING (auth.uid()::TEXT = id::TEXT);

CREATE POLICY "Super admins can manage all users" ON users
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id::TEXT = auth.uid()::TEXT 
      AND role = 'super_admin'
    )
  );

-- RLS Policies for meetings
CREATE POLICY "Users can view meetings they participate in" ON meetings
  FOR SELECT USING (
    host_id::TEXT = auth.uid()::TEXT OR
    EXISTS (
      SELECT 1 FROM meeting_participants 
      WHERE meeting_id = meetings.id 
      AND user_id::TEXT = auth.uid()::TEXT
    )
  );

CREATE POLICY "Team members can create meetings" ON meetings
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id::TEXT = auth.uid()::TEXT 
      AND role IN ('team', 'super_admin')
      AND status = 'approved'
    )
  );

-- RLS Policies for meeting participants
CREATE POLICY "Users can view participants in their meetings" ON meeting_participants
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM meetings 
      WHERE id = meeting_participants.meeting_id 
      AND (
        host_id::TEXT = auth.uid()::TEXT OR
        EXISTS (
          SELECT 1 FROM meeting_participants mp2 
          WHERE mp2.meeting_id = meetings.id 
          AND mp2.user_id::TEXT = auth.uid()::TEXT
        )
      )
    )
  );

-- RLS Policies for chat messages
CREATE POLICY "Users can view chat in their meetings" ON chat_messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM meetings 
      WHERE id = chat_messages.meeting_id 
      AND (
        host_id::TEXT = auth.uid()::TEXT OR
        EXISTS (
          SELECT 1 FROM meeting_participants 
          WHERE meeting_id = meetings.id 
          AND user_id::TEXT = auth.uid()::TEXT
        )
      )
    )
  );

CREATE POLICY "Users can send messages in their meetings" ON chat_messages
  FOR INSERT WITH CHECK (
    user_id::TEXT = auth.uid()::TEXT AND
    EXISTS (
      SELECT 1 FROM meeting_participants 
      WHERE meeting_id = chat_messages.meeting_id 
      AND user_id::TEXT = auth.uid()::TEXT
    )
  );

-- Create indexes for better performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_meetings_host_id ON meetings(host_id);
CREATE INDEX idx_meetings_room_name ON meetings(room_name);
CREATE INDEX idx_meeting_participants_meeting_id ON meeting_participants(meeting_id);
CREATE INDEX idx_meeting_participants_user_id ON meeting_participants(user_id);
CREATE INDEX idx_chat_messages_meeting_id ON chat_messages(meeting_id);
CREATE INDEX idx_meeting_recordings_meeting_id ON meeting_recordings(meeting_id);

-- Create updated_at triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at 
  BEFORE UPDATE ON users 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_processing_queue_updated_at 
  BEFORE UPDATE ON processing_queue 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column(); 