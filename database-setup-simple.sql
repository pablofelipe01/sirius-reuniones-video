-- Supabase Database Setup - SIMPLE VERSION
-- Copy and paste this entire script into Supabase SQL Editor

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "vector";

-- Create custom types
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('super_admin', 'team', 'guest');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE user_status AS ENUM ('pending', 'approved', 'blocked');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE processing_status AS ENUM ('pending', 'processing', 'completed', 'failed');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Users table
CREATE TABLE IF NOT EXISTS users (
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
CREATE TABLE IF NOT EXISTS meetings (
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
CREATE TABLE IF NOT EXISTS meeting_participants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  meeting_id UUID REFERENCES meetings(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  guest_name TEXT,
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  left_at TIMESTAMPTZ,
  speaking_duration_seconds INTEGER DEFAULT 0
);

-- Meeting recordings table
CREATE TABLE IF NOT EXISTS meeting_recordings (
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
CREATE TABLE IF NOT EXISTS chat_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  meeting_id UUID REFERENCES meetings(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  guest_name TEXT,
  message TEXT NOT NULL,
  is_system_message BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Whiteboard snapshots table
CREATE TABLE IF NOT EXISTS whiteboard_snapshots (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  meeting_id UUID REFERENCES meetings(id) ON DELETE CASCADE,
  data JSONB NOT NULL,
  preview_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Processing queue table
CREATE TABLE IF NOT EXISTS processing_queue (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  meeting_id UUID REFERENCES meetings(id) ON DELETE CASCADE,
  job_type TEXT NOT NULL,
  status processing_status DEFAULT 'pending',
  attempts INTEGER DEFAULT 0,
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert super admin (only if doesn't exist)
INSERT INTO users (email, full_name, role, status)
VALUES ('pablo@siriusregenerative.com', 'Pablo Acebedo', 'super_admin', 'approved')
ON CONFLICT (email) DO NOTHING;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_meetings_host_id ON meetings(host_id);
CREATE INDEX IF NOT EXISTS idx_meetings_room_name ON meetings(room_name);
CREATE INDEX IF NOT EXISTS idx_meeting_participants_meeting_id ON meeting_participants(meeting_id);
CREATE INDEX IF NOT EXISTS idx_meeting_participants_user_id ON meeting_participants(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_meeting_id ON chat_messages(meeting_id);
CREATE INDEX IF NOT EXISTS idx_meeting_recordings_meeting_id ON meeting_recordings(meeting_id); 