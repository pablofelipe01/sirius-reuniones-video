-- ============================================
-- DEBUG TRIGGER - SIRIUS REGENERATIVE
-- ============================================
-- Script para diagnosticar problemas con el trigger

-- 1. Verificar si la función existe y su definición
SELECT 
  proname as function_name,
  prosrc as function_source
FROM pg_proc 
WHERE proname = 'handle_new_user';

-- 2. Verificar si el trigger existe
SELECT 
  trigger_name,
  event_manipulation,
  action_statement,
  action_timing
FROM information_schema.triggers 
WHERE trigger_name = 'on_auth_user_created';

-- 3. Verificar la estructura de la tabla users
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'users' 
  AND table_schema = 'public'
ORDER BY ordinal_position;

-- 4. Verificar los tipos personalizados (enums)
SELECT 
  t.typname as enum_name,
  e.enumlabel as enum_value
FROM pg_type t 
JOIN pg_enum e ON t.oid = e.enumtypid 
WHERE t.typname IN ('user_role', 'user_status')
ORDER BY t.typname, e.enumsortorder;

-- 5. Verificar usuarios en auth.users
SELECT 
  id,
  email,
  raw_user_meta_data->>'full_name' as full_name_metadata,
  created_at,
  updated_at
FROM auth.users
ORDER BY created_at DESC;

-- 6. Verificar usuarios en tabla personalizada
SELECT 
  id,
  email,
  full_name,
  role,
  status,
  created_at,
  updated_at
FROM public.users
ORDER BY created_at DESC;

-- 7. Intentar ejecutar la función manualmente para un usuario de prueba
-- (Esto nos ayudará a ver si hay errores específicos)
DO $$
DECLARE
  test_user_id uuid;
  test_email text := 'manual_test@siriusregenerative.com';
BEGIN
  -- Generar un UUID de prueba
  test_user_id := gen_random_uuid();
  
  -- Intentar insertar directamente como lo haría el trigger
  BEGIN
    INSERT INTO public.users (
      id,
      email,
      full_name,
      role,
      status,
      created_at,
      updated_at
    ) VALUES (
      test_user_id,
      test_email,
      COALESCE(null, split_part(test_email, '@', 1)),
      'team'::user_role,
      'approved'::user_status,
      now(),
      now()
    );
    
    RAISE NOTICE 'SUCCESS: Test insert completed successfully for %', test_email;
    
    -- Limpiar después de la prueba
    DELETE FROM public.users WHERE id = test_user_id;
    RAISE NOTICE 'CLEANUP: Test user deleted successfully';
    
  EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'ERROR: Failed to insert test user: %', SQLERRM;
  END;
END $$;

-- 8. Verificar permisos en la tabla users
SELECT 
  grantee,
  privilege_type,
  is_grantable
FROM information_schema.role_table_grants 
WHERE table_name = 'users' 
  AND table_schema = 'public';

-- 9. Verificar si RLS está habilitado y las políticas
SELECT 
  tablename,
  rowsecurity,
  relowner::regrole as owner
FROM pg_tables t
JOIN pg_class c ON c.relname = t.tablename
WHERE t.tablename = 'users' 
  AND t.schemaname = 'public';

-- 10. Ver las políticas RLS existentes
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'users';

NOTIFY pgrst, 'reload schema'; 