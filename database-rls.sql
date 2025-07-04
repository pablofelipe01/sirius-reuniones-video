-- Configurar Row Level Security (RLS)
-- Ejecuta este script después de verificar que las tablas existen

-- Enable RLS en todas las tablas
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE meetings ENABLE ROW LEVEL SECURITY;
ALTER TABLE meeting_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE meeting_recordings ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE whiteboard_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE processing_queue ENABLE ROW LEVEL SECURITY;

-- RLS Policies for users
DROP POLICY IF EXISTS "Users can view their own profile" ON users;
CREATE POLICY "Users can view their own profile" ON users
  FOR SELECT USING (auth.uid()::TEXT = id::TEXT);

DROP POLICY IF EXISTS "Super admins can manage all users" ON users;
CREATE POLICY "Super admins can manage all users" ON users
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id::TEXT = auth.uid()::TEXT 
      AND role = 'super_admin'
    )
  );

-- RLS Policies for meetings
DROP POLICY IF EXISTS "Users can view meetings they participate in" ON meetings;
CREATE POLICY "Users can view meetings they participate in" ON meetings
  FOR SELECT USING (
    host_id::TEXT = auth.uid()::TEXT OR
    EXISTS (
      SELECT 1 FROM meeting_participants 
      WHERE meeting_id = meetings.id 
      AND user_id::TEXT = auth.uid()::TEXT
    )
  );

DROP POLICY IF EXISTS "Team members can create meetings" ON meetings;
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
DROP POLICY IF EXISTS "Users can view participants in their meetings" ON meeting_participants;
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
DROP POLICY IF EXISTS "Users can view chat in their meetings" ON chat_messages;
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

DROP POLICY IF EXISTS "Users can send messages in their meetings" ON chat_messages;
CREATE POLICY "Users can send messages in their meetings" ON chat_messages
  FOR INSERT WITH CHECK (
    user_id::TEXT = auth.uid()::TEXT AND
    EXISTS (
      SELECT 1 FROM meeting_participants 
      WHERE meeting_id = chat_messages.meeting_id 
      AND user_id::TEXT = auth.uid()::TEXT
    )
  );

-- Políticas básicas para el resto de tablas
DROP POLICY IF EXISTS "Users can access their meeting recordings" ON meeting_recordings;
CREATE POLICY "Users can access their meeting recordings" ON meeting_recordings
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM meetings 
      WHERE id = meeting_recordings.meeting_id 
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

DROP POLICY IF EXISTS "Users can access whiteboard in their meetings" ON whiteboard_snapshots;
CREATE POLICY "Users can access whiteboard in their meetings" ON whiteboard_snapshots
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM meetings 
      WHERE id = whiteboard_snapshots.meeting_id 
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

-- Crear función trigger para updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Crear triggers
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at 
  BEFORE UPDATE ON users 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_processing_queue_updated_at ON processing_queue;
CREATE TRIGGER update_processing_queue_updated_at 
  BEFORE UPDATE ON processing_queue 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column(); 