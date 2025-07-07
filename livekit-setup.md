# 🎥 Configuración LiveKit para Sirius Reuniones

## Opción 1: LiveKit Cloud (Recomendado)

### 1. Crear cuenta en LiveKit Cloud
- Ve a [https://cloud.livekit.io/](https://cloud.livekit.io/)
- Crea una cuenta gratuita
- Crea un nuevo proyecto

### 2. Obtener credenciales
En el dashboard de tu proyecto, encontrarás:
- **LiveKit URL**: `wss://your-project.livekit.cloud`
- **API Key**: `APIxxxxxxxxx` 
- **API Secret**: `xxxxxxxxxxxxxxxxxxxxx`

### 3. Configurar variables de entorno
Agregar a tu `.env.local`:

```env
# LiveKit Configuration
NEXT_PUBLIC_LIVEKIT_URL=wss://your-project.livekit.cloud
LIVEKIT_API_KEY=APIxxxxxxxxx
LIVEKIT_API_SECRET=xxxxxxxxxxxxxxxxxxxxx
```

## Opción 2: LiveKit Local (Para desarrollo)

### 1. Instalar LiveKit Server
```bash
# macOS
brew install livekit

# O descargar desde GitHub
curl -sSL https://get.livekit.io | bash
```

### 2. Crear archivo de configuración
Crear `livekit.yaml`:

```yaml
port: 7880
bind_addresses:
  - ""
rtc:
  tcp_port: 7881
  port_range_start: 50000
  port_range_end: 60000
redis:
  address: localhost:6379
development: true
keys:
  APIxxxxxx: your-secret-key
```

### 3. Ejecutar LiveKit
```bash
livekit-server --config livekit.yaml
```

### 4. Variables de entorno para local
```env
# LiveKit Local Configuration  
NEXT_PUBLIC_LIVEKIT_URL=ws://localhost:7880
LIVEKIT_API_KEY=APIxxxxxx
LIVEKIT_API_SECRET=your-secret-key
```

## 🧪 Probar la configuración

1. Reinicia el servidor de desarrollo:
```bash
npm run dev
```

2. Ve a `/meetings` y crea una nueva reunión

3. Haz clic en "Unirse" para probar la videoconferencia

## ✅ Funcionalidades que ya están implementadas

- 🎥 **Video/Audio**: Cámara y micrófono
- 🎛️ **Controles**: Mute, video on/off, salir
- 💬 **Chat**: Chat en tiempo real durante la reunión
- 🖥️ **Screen Share**: Compartir pantalla (disponible en LiveKit)
- 🎨 **UI Futurista**: Diseño Sirius con efectos de neón
- 🔒 **Seguridad**: Tokens JWT seguros con autorización
- 👥 **Participantes**: Vista de grid con múltiples participantes

## 🚀 Siguiente: Funcionalidades Avanzadas

Una vez que LiveKit funcione, podemos implementar:
- 📹 **Grabación automática**
- 🤖 **Transcripción con IA**
- 📊 **Análisis de sentimientos**
- 📝 **Resúmenes automáticos**
- 🎨 **Pizarra colaborativa** 