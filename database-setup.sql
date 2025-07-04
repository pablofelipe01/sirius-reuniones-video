-- Supabase Database Setup for Sirius Regenerative Video Conferencing Platform
-- Run this SQL in your Supabase SQL Editor

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "vector";

-- Create custom types
CREATE TYPE user_role AS ENUM ('super_admin', 'team', 'guest');
CREATE TYPE user_status AS ENUM ('pending', 'approved', 'blocked');
CREATE TYPE processing_status AS ENUM ('pending', 'processing', 'completed', 'failed');

-- Users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  role user_role DEFAULT 'guest',
  status user_status DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Meetings table
CREATE TABLE meetings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  room_name TEXT UNIQUE NOT NULL,
  host_id UUID REFERENCES users(id) ON DELETE CASCADE,
  scheduled_at TIMESTAMPTZ,
  started_at TIMESTAMPTZ,
  ended_at TIMESTAMPTZ,
  is_recording BOOLEAN DEFAULT true,
  room_style TEXT DEFAULT 'futuristic',
  livekit_room_sid TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Meeting participants table
CREATE TABLE meeting_participants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  meeting_id UUID REFERENCES meetings(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  guest_name TEXT,
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  left_at TIMESTAMPTZ,
  speaking_duration_seconds INTEGER DEFAULT 0
);

-- Meeting recordings table
CREATE TABLE meeting_recordings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  meeting_id UUID REFERENCES meetings(id) ON DELETE CASCADE,
  recording_url TEXT,
  audio_url TEXT,
  duration_seconds INTEGER,
  file_size_mb DECIMAL(10,2),
  assemblyai_transcript_id TEXT,
  transcription_status processing_status DEFAULT 'pending',
  transcription TEXT,
  speakers JSONB,
  chapters JSONB,
  highlights JSONB,
  sentiment_analysis JSONB,
  summary TEXT,
  key_points JSONB,
  action_items JSONB,
  embedding vector(1536),
  processed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Chat messages table
CREATE TABLE chat_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  meeting_id UUID REFERENCES meetings(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  guest_name TEXT,
  message TEXT NOT NULL,
  is_system_message BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Whiteboard snapshots table
CREATE TABLE whiteboard_snapshots (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  meeting_id UUID REFERENCES meetings(id) ON DELETE CASCADE,
  data JSONB NOT NULL,
  preview_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Processing queue table
CREATE TABLE processing_queue (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  meeting_id UUID REFERENCES meetings(id) ON DELETE CASCADE,
  job_type TEXT NOT NULL,
  status processing_status DEFAULT 'pending',
  attempts INTEGER DEFAULT 0,
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert super admin
INSERT INTO users (email, full_name, role, status)
VALUES ('pablo@siriusregenerative.com', 'Pablo Acebedo', 'super_admin', 'approved');

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