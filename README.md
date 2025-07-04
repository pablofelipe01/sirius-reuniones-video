# sirius-reuniones-video

🚀 **Plataforma de Videoconferencias Futurista con IA para Sirius Regenerative**

Una plataforma de videoconferencias de próxima generación con diseño cyberpunk/futurista, integración de IA y funcionalidades avanzadas de colaboración para equipos de 25 personas.

## ✨ Características Principales

### 🎥 Videoconferencias Avanzadas
- **LiveKit Integration**: Videoconferencias en tiempo real de alta calidad
- **Grabación Automática**: Grabación de reuniones con almacenamiento en la nube
- **Salas Virtuales**: Creación de salas persistentes con códigos únicos

### 🤖 IA Integrada
- **Transcripción Automática**: Transcripción en tiempo real con AssemblyAI
- **Análisis de Sentimientos**: Análisis automático del tono de las reuniones
- **Resúmenes Inteligentes**: Resúmenes automáticos con puntos clave y acciones
- **Procesamiento GPT-4**: Análisis avanzado de contenido con OpenAI

### 🎨 Diseño Futurista
- **Estética Cyberpunk**: Inspirado en synthetic-humans.ai
- **Componentes 3D**: Botones, tarjetas y efectos tridimensionales
- **Partículas Animadas**: Fondo de partículas con Three.js
- **Colores Sirius**: Paleta de azules y verdes corporativos
- **Glassmorphism**: Efectos de cristal y transparencias

### 💬 Colaboración en Tiempo Real
- **Chat en Vivo**: Mensajería durante las reuniones
- **Pizarra Colaborativa**: Whiteboard con snapshots automáticos
- **Gestión de Participantes**: Control de permisos y roles
- **Invitaciones Inteligentes**: Sistema de invitaciones por email

## 🛠️ Stack Tecnológico

### Frontend
- **Next.js 15**: Framework React con App Router
- **TypeScript**: Tipado estático y desarrollo robusto
- **Tailwind CSS**: Utility-first CSS framework
- **Three.js**: Gráficos 3D y animaciones
- **Framer Motion**: Animaciones y transiciones
- **Radix UI**: Componentes accesibles

### Backend & Database
- **Supabase**: Backend-as-a-Service con PostgreSQL
- **Row Level Security**: Seguridad granular de datos
- **Real-time Subscriptions**: Actualizaciones en tiempo real
- **Vector Database**: Almacenamiento de embeddings para IA

### Integraciones
- **LiveKit**: Infraestructura de video/audio en tiempo real
- **AssemblyAI**: Transcripción y análisis de audio
- **OpenAI GPT-4**: Procesamiento de lenguaje natural
- **Vercel**: Deployment y hosting

## 🚀 Instalación y Configuración

### 1. Clonar el Repositorio
```bash
git clone https://github.com/pablofelipe01/sirius-reuniones-video.git
cd sirius-reuniones-video
```

### 2. Instalar Dependencias
```bash
npm install
```

### 3. Configurar Variables de Entorno
```bash
cp env.template .env.local
```

Editar `.env.local` con tus credenciales:
```env
NEXT_PUBLIC_SUPABASE_URL=tu_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_anon_key
SUPABASE_SERVICE_ROLE_KEY=tu_service_role_key
NEXT_PUBLIC_LIVEKIT_WS_URL=tu_livekit_url
LIVEKIT_API_KEY=tu_livekit_api_key
LIVEKIT_API_SECRET=tu_livekit_secret
ASSEMBLYAI_API_KEY=tu_assemblyai_key
OPENAI_API_KEY=tu_openai_key
```

### 4. Configurar Base de Datos
Ejecutar en el SQL Editor de Supabase:
```sql
-- Ver database-setup-simple.sql para el esquema completo
```

### 5. Ejecutar el Servidor de Desarrollo
```bash
npm run dev
```

Abrir [http://localhost:3000](http://localhost:3000) en el navegador.

## 📊 Estado del Proyecto

### ✅ Completado
- [x] Configuración inicial y estructura del proyecto
- [x] Sistema de autenticación con Supabase
- [x] Dashboard principal con estadísticas
- [x] Componentes UI futuristas (Button3D, GlowCard, NeonText)
- [x] Fondo de partículas 3D con Three.js
- [x] Esquema de base de datos completo
- [x] Integración con Supabase y RLS
- [x] Paleta de colores Sirius (azules y verdes)
- [x] Responsive design y accesibilidad

### 🔄 En Progreso
- [ ] Sistema de creación de reuniones
- [ ] Página para unirse a reuniones
- [ ] Integración con LiveKit
- [ ] Funcionalidades de IA (transcripción, análisis)

### 📋 Próximos Pasos
- [ ] Chat en tiempo real
- [ ] Pizarra colaborativa
- [ ] Notificaciones push
- [ ] Dashboard de administración

## 🎯 Usuarios Objetivo

**Sirius Regenerative** - Organización de 25 personas que requiere:
- Reuniones de equipo regulares
- Colaboración en tiempo real
- Análisis de productividad
- Herramientas de gestión de proyectos

## 🤝 Contribución

1. Fork el proyecto
2. Crear una rama feature (`git checkout -b feature/nueva-funcionalidad`)
3. Commit los cambios (`git commit -m 'Agregar nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Abrir un Pull Request

## 📝 Licencia

Este proyecto está licenciado bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para más detalles.

## 🛡️ Seguridad

- Autenticación JWT con Supabase
- Row Level Security en base de datos
- Validación de entrada en todos los endpoints
- Encriptación de datos sensibles

## 📞 Contacto

**Pablo Felipe** - [@pablofelipe01](https://github.com/pablofelipe01)

**Proyecto:** [https://github.com/pablofelipe01/sirius-reuniones-video](https://github.com/pablofelipe01/sirius-reuniones-video)

---

*Desarrollado con ❤️ para Sirius Regenerative*

🚀 **Plataforma de Videoconferencias Futurista con IA para Sirius Regenerative**

Una plataforma de videoconferencias de próxima generación con diseño cyberpunk/futurista, integración de IA y funcionalidades avanzadas de colaboración para equipos de 25 personas.

## ✨ Características Principales

### 🎥 Videoconferencias Avanzadas
- **LiveKit Integration**: Videoconferencias en tiempo real de alta calidad
- **Grabación Automática**: Grabación de reuniones con almacenamiento en la nube
- **Salas Virtuales**: Creación de salas persistentes con códigos únicos

### 🤖 IA Integrada
- **Transcripción Automática**: Transcripción en tiempo real con AssemblyAI
- **Análisis de Sentimientos**: Análisis automático del tono de las reuniones
- **Resúmenes Inteligentes**: Resúmenes automáticos con puntos clave y acciones
- **Procesamiento GPT-4**: Análisis avanzado de contenido con OpenAI

### 🎨 Diseño Futurista
- **Estética Cyberpunk**: Inspirado en synthetic-humans.ai
- **Componentes 3D**: Botones, tarjetas y efectos tridimensionales
- **Partículas Animadas**: Fondo de partículas con Three.js
- **Colores Sirius**: Paleta de azules y verdes corporativos
- **Glassmorphism**: Efectos de cristal y transparencias

### 💬 Colaboración en Tiempo Real
- **Chat en Vivo**: Mensajería durante las reuniones
- **Pizarra Colaborativa**: Whiteboard con snapshots automáticos
- **Gestión de Participantes**: Control de permisos y roles
- **Invitaciones Inteligentes**: Sistema de invitaciones por email

## 🛠️ Stack Tecnológico

### Frontend
- **Next.js 15**: Framework React con App Router
- **TypeScript**: Tipado estático y desarrollo robusto
- **Tailwind CSS**: Utility-first CSS framework
- **Three.js**: Gráficos 3D y animaciones
- **Framer Motion**: Animaciones y transiciones
- **Radix UI**: Componentes accesibles

### Backend & Database
- **Supabase**: Backend-as-a-Service con PostgreSQL
- **Row Level Security**: Seguridad granular de datos
- **Real-time Subscriptions**: Actualizaciones en tiempo real
- **Vector Database**: Almacenamiento de embeddings para IA

### Integraciones
- **LiveKit**: Infraestructura de video/audio en tiempo real
- **AssemblyAI**: Transcripción y análisis de audio
- **OpenAI GPT-4**: Procesamiento de lenguaje natural
- **Vercel**: Deployment y hosting

## 📁 Estructura del Proyecto

```
src/
├── app/                    # App Router (Next.js 15)
│   ├── api/               # API Routes
│   ├── auth/              # Autenticación
│   ├── dashboard/         # Dashboard principal
│   └── meetings/          # Gestión de reuniones
├── components/            # Componentes reutilizables
│   ├── ui/               # Componentes UI futuristas
│   ├── three/            # Componentes 3D
│   └── dashboard/        # Componentes del dashboard
├── hooks/                # Custom React hooks
├── lib/                  # Utilities y configuraciones
├── styles/               # Estilos globales
└── types/                # Definiciones TypeScript
```

## 🚀 Instalación y Configuración

### 1. Clonar el Repositorio
```bash
git clone https://github.com/pablofelipe01/sirius-reuniones-video.git
cd sirius-reuniones-video
```

### 2. Instalar Dependencias
```bash
npm install
```

### 3. Configurar Variables de Entorno
```bash
cp env.template .env.local
```

Editar `.env.local` con tus credenciales:
```env
NEXT_PUBLIC_SUPABASE_URL=tu_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_anon_key
SUPABASE_SERVICE_ROLE_KEY=tu_service_role_key
NEXT_PUBLIC_LIVEKIT_WS_URL=tu_livekit_url
LIVEKIT_API_KEY=tu_livekit_api_key
LIVEKIT_API_SECRET=tu_livekit_secret
ASSEMBLYAI_API_KEY=tu_assemblyai_key
OPENAI_API_KEY=tu_openai_key
```

### 4. Configurar Base de Datos
Ejecutar en el SQL Editor de Supabase:
```sql
-- Ver database-setup-simple.sql para el esquema completo
```

### 5. Ejecutar el Servidor de Desarrollo
```bash
npm run dev
```

Abrir [http://localhost:3000](http://localhost:3000) en el navegador.

## 📊 Estado del Proyecto

### ✅ Completado
- [x] Configuración inicial y estructura del proyecto
- [x] Sistema de autenticación con Supabase
- [x] Dashboard principal con estadísticas
- [x] Componentes UI futuristas (Button3D, GlowCard, NeonText)
- [x] Fondo de partículas 3D con Three.js
- [x] Esquema de base de datos completo
- [x] Integración con Supabase y RLS
- [x] Paleta de colores Sirius (azules y verdes)
- [x] Responsive design y accesibilidad

### 🔄 En Progreso
- [ ] Sistema de creación de reuniones
- [ ] Página para unirse a reuniones
- [ ] Integración con LiveKit
- [ ] Funcionalidades de IA (transcripción, análisis)

### 📋 Próximos Pasos
- [ ] Chat en tiempo real
- [ ] Pizarra colaborativa
- [ ] Notificaciones push
- [ ] Dashboard de administración

## 🎯 Usuarios Objetivo

**Sirius Regenerative** - Organización de 25 personas que requiere:
- Reuniones de equipo regulares
- Colaboración en tiempo real
- Análisis de productividad
- Herramientas de gestión de proyectos

## 🤝 Contribución

1. Fork el proyecto
2. Crear una rama feature (`git checkout -b feature/nueva-funcionalidad`)
3. Commit los cambios (`git commit -m 'Agregar nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Abrir un Pull Request

## 📝 Licencia

Este proyecto está licenciado bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para más detalles.

## 🛡️ Seguridad

- Autenticación JWT con Supabase
- Row Level Security en base de datos
- Validación de entrada en todos los endpoints
- Encriptación de datos sensibles

## 📞 Contacto

**Pablo Felipe** - [@pablofelipe01](https://github.com/pablofelipe01)

**Proyecto:** [https://github.com/pablofelipe01/sirius-reuniones-video](https://github.com/pablofelipe01/sirius-reuniones-video)

---

*Desarrollado con ❤️ para Sirius Regenerative*
