-- ============================================
-- SIRIUS REGENERATIVE - AUTH SYNC TRIGGER
-- ============================================
-- Este script sincroniza automáticamente los usuarios
-- desde auth.users a nuestra tabla personalizada users

-- 1. Función que maneja la inserción de usuarios
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
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
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    'team'::user_role,
    'approved'::user_status,
    new.created_at,
    new.updated_at
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Trigger que ejecuta la función cuando se crea un usuario
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 3. Sincronizar usuarios existentes (si los hay)
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
ON CONFLICT (email) DO NOTHING;

-- 4. Crear política RLS para que los usuarios puedan ver su propio perfil
DROP POLICY IF EXISTS "Users can view own profile" ON public.users;
CREATE POLICY "Users can view own profile" ON public.users
  FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
CREATE POLICY "Users can update own profile" ON public.users
  FOR UPDATE USING (auth.uid() = id);

-- 5. Política para admins
DROP POLICY IF EXISTS "Admins can view all users" ON public.users;
CREATE POLICY "Admins can view all users" ON public.users
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() 
      AND role = 'super_admin'
    )
  );

DROP POLICY IF EXISTS "Admins can update all users" ON public.users;
CREATE POLICY "Admins can update all users" ON public.users
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() 
      AND role = 'super_admin'
    )
  );

-- ============================================
-- VERIFICACIÓN
-- ============================================

-- Verificar que la función existe
SELECT proname FROM pg_proc WHERE proname = 'handle_new_user';

-- Verificar que el trigger existe
SELECT trigger_name FROM information_schema.triggers 
WHERE trigger_name = 'on_auth_user_created';

-- Verificar usuarios sincronizados
SELECT 
  u.id,
  u.email,
  u.full_name,
  u.role,
  u.status
FROM public.users u;

-- Verificar usuarios en auth
SELECT 
  id,
  email,
  raw_user_meta_data->>'full_name' as full_name,
  created_at
FROM auth.users;

NOTIFY pgrst, 'reload schema'; 