'use client';

import { Button3D, GlowCard, HolographicAvatar } from '@/components/ui';

export default function HomePage() {
  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Main content */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen p-8">
        <div className="max-w-6xl mx-auto text-center space-y-12">
          {/* Hero section */}
          <div className="space-y-8">
            {/* Company logo/title */}
            <div className="flex flex-col items-center justify-center space-y-6 mb-8 group">
              <div className="w-20 h-20 flex items-center justify-center relative">
                <div className="absolute inset-0 bg-blue-400/20 rounded-full blur-xl group-hover:blur-2xl transition-all duration-300"></div>
                <img src="/logo.png" alt="Sirius Regenerative Logo" className="w-full h-full object-contain relative z-10 group-hover:scale-110 transition-transform duration-300" />
              </div>
              <div className="text-center">
                <h2 className="text-3xl font-bold text-white tracking-wide group-hover:text-blue-300 transition-colors duration-300">
                  SIRIUS <span className="text-blue-400 group-hover:text-blue-300">REGENERATIVE</span>
                </h2>
                <div className="flex items-center justify-center space-x-2 mt-2">
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                  <p className="text-sm text-gray-400 tracking-wider uppercase">Advanced Video Solutions</p>
                </div>
              </div>
            </div>
            
            {/* Elegant divider */}
            <div className="flex items-center justify-center space-x-4 mb-8">
              <div className="w-16 h-px bg-gradient-to-r from-transparent via-blue-400 to-transparent"></div>
              <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
              <div className="w-16 h-px bg-gradient-to-r from-transparent via-blue-400 to-transparent"></div>
            </div>
            
            {/* Main title */}
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
              Next-Gen Video
              <br />
              <span className="gradient-text">Conferencing</span>
            </h1>
            
            {/* Subtitle */}
            <p className="text-xl text-gray-300 max-w-2xl mx-auto leading-relaxed">
              Experience the future of video conferencing with AI-powered transcription, 
              real-time collaboration, and immersive 3D environments.
            </p>
          </div>
          
          {/* Feature cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
            <GlowCard intensity="medium" animated glowColor="#1E90FF">
              <div className="text-center space-y-4">
                <div className="w-12 h-12 mx-auto bg-blue-500/20 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-white">AI-Powered Video</h3>
                <p className="text-gray-400">
                  Advanced video conferencing with real-time transcription and AI analysis
                </p>
              </div>
            </GlowCard>
            
            <GlowCard intensity="medium" animated glowColor="#00E676">
              <div className="text-center space-y-4">
                <div className="w-12 h-12 mx-auto bg-green-500/20 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-white">Smart Transcription</h3>
                <p className="text-gray-400">
                  Real-time transcription with speaker identification and sentiment analysis
                </p>
              </div>
            </GlowCard>
            
            <GlowCard intensity="medium" animated glowColor="#4FC3F7">
              <div className="text-center space-y-4">
                <div className="w-12 h-12 mx-auto bg-teal-500/20 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-white">Team Collaboration</h3>
                <p className="text-gray-400">
                  Seamless collaboration with whiteboard, chat, and file sharing
                </p>
              </div>
            </GlowCard>
          </div>
          
          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mt-16">
            <Button3D variant="neon" size="lg" glow onClick={() => window.location.href = '/auth/login'}>
              Iniciar Sesión
            </Button3D>
            <Button3D variant="holographic" size="lg" onClick={() => window.location.href = '/auth/signup'}>
              Crear Cuenta
            </Button3D>
            <Button3D variant="glass" size="lg" onClick={() => window.location.href = '/dashboard'}>
              Dashboard
            </Button3D>
          </div>
          
          {/* Team avatars */}
          <div className="flex justify-center items-center space-x-4 mt-16 mb-24">
            <div className="text-center">
              <p className="text-gray-400 mb-4">Team Members Online</p>
              <div className="flex justify-center space-x-3">
                <HolographicAvatar
                  name="Pablo Acebedo"
                  status="online"
                  size="lg"
                  animated
                  glowColor="#1E90FF"
                />
                <HolographicAvatar
                  name="Maria Silva"
                  status="online"
                  size="lg"
                  animated
                  glowColor="#00E676"
                />
                <HolographicAvatar
                  name="Alex Johnson"
                  status="away"
                  size="lg"
                  animated
                  glowColor="#4FC3F7"
                />
                <HolographicAvatar
                  name="Sarah Chen"
                  status="busy"
                  size="lg"
                  animated
                  glowColor="#00C853"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Footer */}
      <div className="relative z-10 mt-16 py-8 border-t border-gray-800/50">
        <div className="max-w-6xl mx-auto text-center px-8">
          <p className="text-gray-400 text-sm">
            © 2024 Sirius Regenerative. Powered by AI and built for the future.
          </p>
        </div>
      </div>
    </div>
  );
}
