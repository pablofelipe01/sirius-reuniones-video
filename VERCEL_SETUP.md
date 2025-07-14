# 🚀 Configuración Vercel - Sirius Reuniones

## Variables de Entorno Críticas para Producción

### 1. URL de la Aplicación
**CRÍTICO**: Esta variable controla los links de invitación a reuniones.

```bash
NEXT_PUBLIC_APP_URL=https://sirius-reuniones-video.vercel.app
```

**⚠️ Sin esta variable, los links de invitación apuntarán a localhost:3000**

### 2. Configuración Completa en Vercel

Ir a: `Vercel Dashboard → sirius-reuniones-video → Settings → Environment Variables`

#### Variables Next.js
```bash
NEXT_PUBLIC_APP_URL=https://sirius-reuniones-video.vercel.app
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_LIVEKIT_URL=wss://your-livekit-server.com
NEXT_PUBLIC_SUPER_ADMIN_EMAIL=pablo@siriusregenerative.com
```

#### Variables Privadas
```bash
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
LIVEKIT_API_KEY=your_livekit_api_key
LIVEKIT_API_SECRET=your_livekit_api_secret
LIVEKIT_WEBHOOK_SECRET=your_livekit_webhook_secret
ASSEMBLYAI_API_KEY=your_assemblyai_api_key
OPENAI_API_KEY=your_openai_api_key
REDIS_URL=your_redis_url
WEBHOOK_SECRET=your_webhook_secret
RESEND_API_KEY=your_resend_api_key
NODE_ENV=production
```

### 3. Verificar Configuración

Después de configurar en Vercel:

1. **Hacer redeploy** de la aplicación
2. **Crear una reunión de prueba**
3. **Verificar que el link de invitación use** `https://sirius-reuniones-video.vercel.app`

### 4. Ejemplo de Link Correcto

❌ **Incorrecto**: `http://localhost:3000/meetings/join/cosmic-nexus-456`
✅ **Correcto**: `https://sirius-reuniones-video.vercel.app/meetings/join/cosmic-nexus-456`

### 5. URLs que se Verán Afectadas

- 🔗 **Links de invitación** en reuniones
- 📧 **Emails de invitación** 
- 📱 **Mensajes de WhatsApp**
- 🎯 **Redirects** después de autenticación

### 6. Comandos CLI Vercel (Opcional)

```bash
# Configurar variable específica
vercel env add NEXT_PUBLIC_APP_URL

# Listar variables
vercel env ls

# Redeploy después de cambios
vercel --prod
```

### 7. Verificación Post-Despliegue

```bash
# Test en producción
curl https://sirius-reuniones-video.vercel.app/api/meetings \
  -H "Authorization: Bearer YOUR_TOKEN"
  
# Verificar que responda con URLs de producción
```

## 🔥 Acción Inmediata Requerida

1. **Ir a Vercel Dashboard**
2. **Agregar: `NEXT_PUBLIC_APP_URL=https://sirius-reuniones-video.vercel.app`**
3. **Hacer redeploy**
4. **Probar creando una reunión**

---
*Documentación actualizada: 2025-07-14* 