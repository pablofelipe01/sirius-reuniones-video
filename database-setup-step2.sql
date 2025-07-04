-- Supabase Database Setup - STEP 2: Create Tables
-- Run this after Step 1

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