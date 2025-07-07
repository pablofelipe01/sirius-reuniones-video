'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { Button3D } from '@/components/ui/Button3D';
import { GlowCard } from '@/components/ui/GlowCard';
import { CreateMeetingForm } from '@/components/dashboard/CreateMeetingForm';
import { MeetingsList } from '@/components/dashboard/MeetingsList';
import { MeetingSuccessModal } from '@/components/dashboard/MeetingSuccessModal';

interface Meeting {
  id: string;
  title: string;
  description: string | null;
  room_name: string;
  host_id: string;
  scheduled_at: string;
  created_at: string;
}

export default function MeetingsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'list' | 'create'>('list');
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successData, setSuccessData] = useState<{
    meeting: Meeting;
    roomCode: string;
    joinUrl: string;
  } | null>(null);

  // Redirect to login if not authenticated
  if (!loading && !user) {
    router.push('/auth/login');
    return null;
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-sirius-blue border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-sirius-light-blue text-lg">Cargando sistema de reuniones...</p>
        </div>
      </div>
    );
  }

  const handleMeetingCreated = (meeting: Meeting, roomCode: string, joinUrl: string) => {
    setSuccessData({ meeting, roomCode, joinUrl });
    setShowSuccessModal(true);
  };

  const handleSuccessModalClose = () => {
    setShowSuccessModal(false);
    setSuccessData(null);
    setActiveTab('create'); // Allow creating another meeting
  };

  const handleViewMeetings = () => {
    setShowSuccessModal(false);
    setSuccessData(null);
    setActiveTab('list');
  };

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-sirius-blue mb-2">
            🎥 Sistema de Reuniones
          </h1>
          <p className="text-sirius-light-blue text-lg">
            Crea y gestiona tus reuniones virtuales con IA integrada
          </p>
          <div className="mt-4 text-sm text-gray-400">
            Bienvenido, <span className="text-sirius-green font-medium">{user?.email}</span>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex justify-center mb-8">
          <div className="flex bg-gray-800/30 rounded-xl p-1">
            <button
              onClick={() => setActiveTab('list')}
              className={`px-6 py-3 rounded-lg font-medium transition-all ${
                activeTab === 'list'
                  ? 'bg-sirius-blue text-white shadow-lg'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              📋 Mis Reuniones
            </button>
            <button
              onClick={() => setActiveTab('create')}
              className={`px-6 py-3 rounded-lg font-medium transition-all ${
                activeTab === 'create'
                  ? 'bg-sirius-green text-white shadow-lg'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              ➕ Nueva Reunión
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="mb-8">
          {activeTab === 'list' && (
            <div>
              {/* Quick Actions */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                <GlowCard className="p-6 text-center hover:scale-105 transition-transform">
                  <div className="text-3xl mb-2">🚀</div>
                  <h3 className="text-lg font-semibold text-white mb-2">Reunión Rápida</h3>
                  <p className="text-sm text-gray-400 mb-4">Inicia una reunión inmediata</p>
                  <Button3D variant="neon" size="sm">
                    Próximamente
                  </Button3D>
                </GlowCard>

                <GlowCard className="p-6 text-center hover:scale-105 transition-transform">
                  <div className="text-3xl mb-2">🔗</div>
                  <h3 className="text-lg font-semibold text-white mb-2">Unirse por Código</h3>
                  <p className="text-sm text-gray-400 mb-4">Únete con un código de sala</p>
                  <Button3D variant="holographic" size="sm">
                    Próximamente
                  </Button3D>
                </GlowCard>

                <GlowCard className="p-6 text-center hover:scale-105 transition-transform">
                  <div className="text-3xl mb-2">📊</div>
                  <h3 className="text-lg font-semibold text-white mb-2">Estadísticas</h3>
                  <p className="text-sm text-gray-400 mb-4">Analiza tus reuniones</p>
                  <Button3D variant="glass" size="sm">
                    Próximamente
                  </Button3D>
                </GlowCard>
              </div>

              {/* Meetings List */}
              <MeetingsList />
            </div>
          )}

          {activeTab === 'create' && (
            <div>
              {/* Feature Highlights */}
              <div className="mb-8">
                <GlowCard className="p-6">
                  <h3 className="text-xl font-semibold text-sirius-light-blue mb-4">
                    ✨ Características Incluidas
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">🤖</span>
                      <div>
                        <p className="text-white font-medium">IA Integrada</p>
                        <p className="text-xs text-gray-400">Transcripción automática</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">🎬</span>
                      <div>
                        <p className="text-white font-medium">Grabación HD</p>
                        <p className="text-xs text-gray-400">Calidad profesional</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">🌐</span>
                      <div>
                        <p className="text-white font-medium">Multiplataforma</p>
                        <p className="text-xs text-gray-400">Web, móvil, desktop</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">🔒</span>
                      <div>
                        <p className="text-white font-medium">Seguridad</p>
                        <p className="text-xs text-gray-400">Encriptación E2E</p>
                      </div>
                    </div>
                  </div>
                </GlowCard>
              </div>

              {/* Create Form */}
              <CreateMeetingForm
                onMeetingCreated={handleMeetingCreated}
                onCancel={() => setActiveTab('list')}
              />
            </div>
          )}
        </div>

        {/* Footer Info */}
        <div className="text-center text-sm text-gray-500">
          <p className="mb-2">
            Powered by <span className="text-sirius-blue font-medium">Sirius Regenerative</span> - 
            Next Generation Video Conferencing
          </p>
          <div className="flex justify-center gap-6 text-xs">
            <span>🔒 Seguro</span>
            <span>⚡ Rápido</span>
            <span>🌟 Futurista</span>
            <span>🤖 Inteligente</span>
          </div>
        </div>
      </div>

      {/* Success Modal */}
      {showSuccessModal && successData && (
        <MeetingSuccessModal
          meeting={successData.meeting}
          roomCode={successData.roomCode}
          joinUrl={successData.joinUrl}
          onClose={handleSuccessModalClose}
          onViewMeetings={handleViewMeetings}
        />
      )}
    </div>
  );
} 