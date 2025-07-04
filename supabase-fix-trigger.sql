-- ============================================
-- SOLUCIÓN TEMPORAL - DESHABILITAR TRIGGER
-- ============================================
-- Deshabilitar el trigger problemático para permitir creación de usuarios

-- 1. Deshabilitar el trigger temporalmente
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- 2. Verificar que se eliminó
SELECT trigger_name FROM information_schema.triggers 
WHERE trigger_name = 'on_auth_user_created';

-- 3. Mensaje de confirmación
DO $$
BEGIN
  RAISE NOTICE 'TRIGGER DISABLED: Users can now be created normally';
  RAISE NOTICE 'NOTE: You will need to sync users manually until the trigger is fixed';
END $$;

-- ============================================
-- SCRIPT PARA SINCRONIZAR USUARIOS MANUALMENTE
-- ============================================

-- Sincronizar todos los usuarios de auth.users a la tabla personalizada
INSERT INTO public.users (
  id,
  email,
  full_name,
  role,
  status,
  created_at,
  updated_at
)
SELECT 
  au.id,
  au.email,
  COALESCE(au.raw_user_meta_data->>'full_name', split_part(au.email, '@', 1)) as full_name,
  (CASE 
    WHEN au.email = 'pablo@siriusregenerative.com' THEN 'super_admin'
    ELSE 'team'
  END)::user_role as role,
  'approved'::user_status as status,
  au.created_at,
  au.updated_at
FROM auth.users au
LEFT JOIN public.users pu ON au.id = pu.id
WHERE pu.id IS NULL
ON CONFLICT (email) DO UPDATE SET
  full_name = EXCLUDED.full_name,
  updated_at = EXCLUDED.updated_at;

-- Verificar sincronización
SELECT 
  'Auth Users' as source,
  count(*) as total
FROM auth.users
UNION ALL
SELECT 
  'Custom Users' as source,
  count(*) as total
FROM public.users;

NOTIFY pgrst, 'reload schema'; 