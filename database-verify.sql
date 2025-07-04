-- Verificar que la base de datos se configuró correctamente
-- Ejecuta este script para ver qué se creó

-- 1. Verificar extensiones
SELECT * FROM pg_extension WHERE extname IN ('uuid-ossp', 'vector');

-- 2. Verificar tipos personalizados
SELECT typname FROM pg_type WHERE typname IN ('user_role', 'user_status', 'processing_status');

-- 3. Verificar tablas creadas
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN (
  'users', 'meetings', 'meeting_participants', 
  'meeting_recordings', 'chat_messages', 
  'whiteboard_snapshots', 'processing_queue'
);

-- 4. Verificar usuario super admin
SELECT email, full_name, role, status FROM users WHERE email = 'pablo@siriusregenerative.com';

-- 5. Verificar índices
SELECT indexname FROM pg_indexes WHERE schemaname = 'public' AND indexname LIKE 'idx_%';

-- 6. Contar registros en cada tabla
SELECT 
  'users' as table_name, COUNT(*) as row_count FROM users
UNION ALL
SELECT 
  'meetings' as table_name, COUNT(*) as row_count FROM meetings
UNION ALL
SELECT 
  'meeting_participants' as table_name, COUNT(*) as row_count FROM meeting_participants
UNION ALL
SELECT 
  'meeting_recordings' as table_name, COUNT(*) as row_count FROM meeting_recordings
UNION ALL
SELECT 
  'chat_messages' as table_name, COUNT(*) as row_count FROM chat_messages
UNION ALL
SELECT 
  'whiteboard_snapshots' as table_name, COUNT(*) as row_count FROM whiteboard_snapshots
UNION ALL
SELECT 
  'processing_queue' as table_name, COUNT(*) as row_count FROM processing_queue; 