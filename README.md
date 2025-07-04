# Sirius Regenerative - Video Conferencing Platform

A futuristic video conferencing platform with AI-powered transcription, real-time collaboration, and immersive 3D environments.

## ✨ Features

- **🎥 Advanced Video Conferencing** - Powered by LiveKit with real-time video/audio
- **🤖 AI-Powered Transcription** - Real-time transcription with AssemblyAI
- **📝 Smart Summaries** - GPT-4 generated meeting summaries and action items
- **💬 Real-time Chat** - Instant messaging during meetings
- **🎨 Interactive Whiteboard** - Collaborative drawing and annotations
- **🔍 Semantic Search** - Vector-based search through meeting transcripts
- **👥 Role-based Access** - Super Admin, Team, and Guest roles
- **🎮 Futuristic UI** - Cyberpunk-inspired design with 3D effects
- **📱 Responsive Design** - Works on desktop, tablet, and mobile

## 🛠 Tech Stack

- **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS
- **Backend**: Supabase (Auth, Database, Storage, Realtime)
- **Video**: LiveKit (self-hosted or cloud)
- **Transcription**: AssemblyAI (real-time and post-processing)
- **AI**: OpenAI GPT-4 (summaries and embeddings)
- **3D/Animations**: Three.js, React Three Fiber, Framer Motion
- **UI Components**: Radix UI + custom design system
- **Whiteboard**: TLDraw
- **Queue System**: BullMQ with Redis

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm
- Supabase account
- LiveKit account (or self-hosted)
- AssemblyAI API key
- OpenAI API key
- Redis instance (for background processing)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd reuniones-sirius
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp env.template .env.local
   ```
   
   Fill in your environment variables in `.env.local`:
   ```env
   # Supabase Configuration
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

   # LiveKit Configuration
   LIVEKIT_API_KEY=your_livekit_api_key
   LIVEKIT_API_SECRET=your_livekit_api_secret
   NEXT_PUBLIC_LIVEKIT_URL=wss://your-livekit-server.com
   LIVEKIT_WEBHOOK_SECRET=your_livekit_webhook_secret

   # AssemblyAI Configuration
   ASSEMBLYAI_API_KEY=your_assemblyai_api_key

   # OpenAI Configuration
   OPENAI_API_KEY=your_openai_api_key

   # Redis Configuration
   REDIS_URL=redis://localhost:6379

   # Application Configuration
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   NEXT_PUBLIC_SUPER_ADMIN_EMAIL=pablo@siriusregenerative.com
   WEBHOOK_SECRET=your_webhook_secret
   ```

4. **Set up Supabase Database**
   - Go to your Supabase dashboard
   - Open the SQL Editor
   - Run the SQL from `database-setup.sql`

5. **Start the development server**
   ```bash
   npm run dev
   ```

6. **Visit the application**
   Open [http://localhost:3000](http://localhost:3000) in your browser

## 🏗 Project Structure

```
src/
├── app/                     # Next.js 14 App Router
│   ├── (auth)/             # Authentication pages
│   ├── (dashboard)/        # Dashboard pages
│   ├── meeting/            # Meeting room pages
│   └── api/                # API routes
├── components/
│   ├── ui/                 # Reusable UI components
│   ├── meeting/            # Meeting-specific components
│   ├── three/              # 3D components
│   └── layouts/            # Layout components
├── lib/
│   ├── supabase/           # Supabase configuration
│   ├── livekit/            # LiveKit integration
│   ├── assemblyai/         # AssemblyAI integration
│   ├── openai/             # OpenAI integration
│   ├── queue/              # Background job processing
│   └── utils/              # Utility functions
├── hooks/                  # React hooks
├── types/                  # TypeScript type definitions
└── styles/                 # Global styles
```

## 🎨 UI Components

The platform features a custom design system with futuristic components:

- **Button3D** - 3D buttons with neon, holographic, and glass variants
- **GlowCard** - Cards with glassmorphism and customizable glow effects
- **NeonText** - Text with customizable neon glow effects
- **HolographicAvatar** - Avatars with holographic effects and status indicators
- **ParticleField** - 3D particle background effects

## 🔐 Authentication & Roles

### User Roles

1. **Super Admin** (Pablo Acebedo)
   - Approve/reject team member registrations
   - Access all meetings and recordings
   - Manage global settings

2. **Team Members** (@siriusregenerative.com)
   - Register with corporate email
   - Require Super Admin approval
   - Create and host meetings
   - Access all recordings

3. **Guests**
   - Join via direct link
   - No registration required
   - Temporary access to specific meetings

## 🎥 Meeting Features

### Room Styles
- **Cyberpunk Neon** - Purple/blue neons with grid background
- **Space Station** - Space view with holographic panels
- **Digital Garden** - Organic-digital environment
- **Matrix Code** - Green code rain background
- **Synthwave Sunset** - Retro-wave aesthetics

### Meeting Capabilities
- HD video conferencing with LiveKit
- Real-time chat with markdown support
- Collaborative whiteboard
- Screen sharing with annotations
- Automatic recording
- Live transcription with speaker identification
- Post-meeting AI analysis and summaries

## 🤖 AI Features

### Real-time Transcription (AssemblyAI)
- Live transcription during meetings
- Speaker diarization (who said what)
- Automatic punctuation and formatting
- Sentiment analysis
- Entity detection

### Post-meeting Analysis (GPT-4)
- Executive summaries
- Key points extraction
- Action items identification
- Decision tracking
- Meeting sentiment analysis

### Semantic Search
- Vector embeddings for transcript search
- Natural language queries
- Context-aware results
- Timeline navigation

## 🔄 Background Processing

The platform uses BullMQ for asynchronous processing:

1. **Meeting End** → Recording saved to Supabase Storage
2. **Audio Extraction** → Extract audio from video recording
3. **Transcription** → Send to AssemblyAI for processing
4. **AI Analysis** → Generate summaries with GPT-4
5. **Embedding** → Create vector embeddings for search
6. **Notifications** → Notify participants of completed analysis

## 🚀 Deployment

### Environment Setup
1. Set up production databases (Supabase, Redis)
2. Configure LiveKit server
3. Set up domain and SSL certificates
4. Configure environment variables

### Deployment Options
- **Vercel** (Recommended) - Automatic deployments from Git
- **Docker** - Containerized deployment
- **Self-hosted** - Deploy on your own infrastructure

## 🔧 Configuration

### Supabase Setup
1. Create new Supabase project
2. Run database setup SQL
3. Configure authentication providers
4. Set up storage buckets for recordings
5. Enable realtime subscriptions

### LiveKit Setup
1. Create LiveKit project/server
2. Generate API keys
3. Configure webhooks for recording events
4. Set up TURN servers for NAT traversal

### AssemblyAI Setup
1. Create AssemblyAI account
2. Generate API key
3. Configure webhook endpoints
4. Set up real-time streaming

## 📊 Analytics & Monitoring

- User engagement metrics
- Meeting duration and participation
- Transcription accuracy
- System performance monitoring
- Error tracking with Sentry

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is proprietary software for Sirius Regenerative.

## 🆘 Support

For technical support or questions:
- Email: pablo@siriusregenerative.com
- Internal documentation: [Link to internal docs]

---

**Built with ❤️ for the future of video conferencing**
# sirius-reuniones-video
