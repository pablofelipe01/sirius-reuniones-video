# Fixes Aplicados - Sirius Regenerative Platform

## 2025-07-14: Fix de Sincronización de Usuarios

### Problema
Error al crear reuniones: `"insert or update on table 'meetings' violates foreign key constraint 'meetings_host_id_fkey'"`

### Causa Raíz
Desajuste de sincronización entre `auth.users` y tabla personalizada `users` para el usuario `pablo@siriusregenerative.com`:
- **Auth users ID**: `d7ccba88-b9f7-4231-914e-a733a374afe4` ← Correcto
- **Custom users ID**: `6fa49f1a-ed4c-4c9d-9d90-ef475642b510` ← Incorrecto (duplicado)

### Solución Aplicada
```sql
-- 1. Eliminar entrada incorrecta
DELETE FROM public.users 
WHERE email = 'pablo@siriusregenerative.com' 
AND id != 'd7ccba88-b9f7-4231-914e-a733a374afe4';

-- 2. Insertar entrada correcta con ID de auth.users
INSERT INTO public.users (
  id, email, full_name, role, status, created_at, updated_at
) VALUES (
  'd7ccba88-b9f7-4231-914e-a733a374afe4',
  'pablo@siriusregenerative.com',
  'Pablo Acebedo',
  'super_admin',
  'approved',
  '2025-07-04T21:39:49.952778Z',
  NOW()
) ON CONFLICT (email) DO UPDATE SET
  id = EXCLUDED.id,
  updated_at = EXCLUDED.updated_at;
```

### Resultado
✅ Usuario puede crear reuniones exitosamente  
✅ IDs sincronizados entre auth.users y tabla personalizada  
✅ Sin impacto en otros usuarios del sistema

### Próximos Pasos
- Verificar que el trigger de sincronización automática funcione correctamente para nuevos usuarios
- Monitorear la sincronización en registros futuros

### Fecha de Aplicación
2025-07-14T19:57:00Z

### Testing
```bash
# Verificar sincronización
curl -X GET http://localhost:3000/api/test-users

# Probar creación de reunión
# Dashboard → Nueva Reunión → ✅ Funciona correctamente
``` 