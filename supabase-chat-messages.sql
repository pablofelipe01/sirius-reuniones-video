-- ============================================
-- SIRIUS REGENERATIVE - CHAT MESSAGES TABLE
-- ============================================
-- Este script crea la tabla para mensajes de chat persistentes

-- 1. Crear tabla meeting_messages
CREATE TABLE IF NOT EXISTS public.meeting_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  meeting_id UUID NOT NULL REFERENCES public.meetings(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  message_type VARCHAR(20) DEFAULT 'text' CHECK (message_type IN ('text', 'system', 'emoji')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  
  -- Índices para mejorar rendimiento
  CONSTRAINT meeting_messages_message_check CHECK (length(message) > 0 AND length(message) <= 2000)
);

-- 2. Crear índices para optimizar consultas
CREATE INDEX IF NOT EXISTS idx_meeting_messages_meeting_id ON public.meeting_messages(meeting_id);
CREATE INDEX IF NOT EXISTS idx_meeting_messages_created_at ON public.meeting_messages(created_at);
CREATE INDEX IF NOT EXISTS idx_meeting_messages_user_id ON public.meeting_messages(user_id);

-- 3. Crear trigger para updated_at
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS meeting_messages_updated_at ON public.meeting_messages;
CREATE TRIGGER meeting_messages_updated_at
  BEFORE UPDATE ON public.meeting_messages
  FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

-- 4. Habilitar RLS (Row Level Security)
ALTER TABLE public.meeting_messages ENABLE ROW LEVEL SECURITY;

-- 5. Políticas RLS para meeting_messages
-- Los usuarios solo pueden ver mensajes de reuniones donde son participantes o hosts
DROP POLICY IF EXISTS "Users can view messages from their meetings" ON public.meeting_messages;
CREATE POLICY "Users can view messages from their meetings" ON public.meeting_messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.meetings m
      WHERE m.id = meeting_id 
      AND (
        m.host_id = auth.uid() 
        OR EXISTS (
          SELECT 1 FROM public.meeting_participants mp 
          WHERE mp.meeting_id = m.id AND mp.user_id = auth.uid()
        )
      )
    )
  );

-- Los usuarios solo pueden insertar mensajes en reuniones donde participan
DROP POLICY IF EXISTS "Users can send messages in their meetings" ON public.meeting_messages;
CREATE POLICY "Users can send messages in their meetings" ON public.meeting_messages
  FOR INSERT WITH CHECK (
    user_id = auth.uid() 
    AND EXISTS (
      SELECT 1 FROM public.meetings m
      WHERE m.id = meeting_id 
      AND (
        m.host_id = auth.uid() 
        OR EXISTS (
          SELECT 1 FROM public.meeting_participants mp 
          WHERE mp.meeting_id = m.id AND mp.user_id = auth.uid()
        )
      )
    )
  );

-- Los usuarios solo pueden actualizar sus propios mensajes
DROP POLICY IF EXISTS "Users can update own messages" ON public.meeting_messages;
CREATE POLICY "Users can update own messages" ON public.meeting_messages
  FOR UPDATE USING (user_id = auth.uid());

-- Los usuarios solo pueden eliminar sus propios mensajes
DROP POLICY IF EXISTS "Users can delete own messages" ON public.meeting_messages;
CREATE POLICY "Users can delete own messages" ON public.meeting_messages
  FOR DELETE USING (user_id = auth.uid());

-- 6. Crear vista para mensajes con información de usuario
CREATE OR REPLACE VIEW public.meeting_messages_with_user AS
SELECT 
  mm.id,
  mm.meeting_id,
  mm.user_id,
  mm.message,
  mm.message_type,
  mm.created_at,
  mm.updated_at,
  u.email,
  u.full_name,
  u.role
FROM public.meeting_messages mm
JOIN public.users u ON mm.user_id = u.id
ORDER BY mm.created_at ASC;

-- 7. Aplicar RLS a la vista
ALTER VIEW public.meeting_messages_with_user SET (security_barrier = true);

-- ============================================
-- VERIFICACIÓN Y DATOS DE PRUEBA
-- ============================================

-- Verificar que la tabla se creó correctamente
SELECT table_name, column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'meeting_messages' 
ORDER BY ordinal_position;

-- Verificar índices
SELECT indexname FROM pg_indexes WHERE tablename = 'meeting_messages';

-- Verificar políticas RLS
SELECT policyname, permissive, roles, cmd, qual, with_check 
FROM pg_policies 
WHERE tablename = 'meeting_messages';

NOTIFY pgrst, 'reload schema'; 