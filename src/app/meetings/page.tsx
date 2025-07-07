'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { Button3D } from '@/components/ui/Button3D';
import { GlowCard } from '@/components/ui/GlowCard';
import { NeonText } from '@/components/ui/NeonText';
import { CreateMeetingForm } from '@/components/dashboard/CreateMeetingForm';
import { MeetingsList } from '@/components/dashboard/MeetingsList';
import { MeetingSuccessModal } from '@/components/dashboard/MeetingSuccessModal';

type TabType = 'list' | 'create';

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
  const [activeTab, setActiveTab] = useState<TabType>('list');
  const [createdMeeting, setCreatedMeeting] = useState<{
    meeting: Meeting;
    roomCode: string;
    joinUrl: string;
  } | null>(null);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [joinCode, setJoinCode] = useState('');
  const [joiningMeeting, setJoiningMeeting] = useState(false);
  const [joinError, setJoinError] = useState<string | null>(null);

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
    setCreatedMeeting({ meeting, roomCode, joinUrl });
  };

  const handleCloseSuccessModal = () => {
    setCreatedMeeting(null);
  };

  const handleViewMeetings = () => {
    setCreatedMeeting(null);
    setActiveTab('list');
  };

  const handleJoinByCode = async () => {
    if (!joinCode.trim()) {
      setJoinError('Por favor, ingresa un código de reunión');
      return;
    }

    try {
      setJoiningMeeting(true);
      setJoinError(null);
      
      // Validate the room code format (could be more sophisticated)
      if (joinCode.length < 5) {
        throw new Error('El código de reunión debe tener al menos 5 caracteres');
      }
      
      // Redirect to the join page
      router.push(`/meetings/join/${joinCode.trim()}`);
    } catch (err) {
      console.error('Error joining meeting:', err);
      setJoinError(err instanceof Error ? err.message : 'Error al unirse a la reunión');
    } finally {
      setJoiningMeeting(false);
    }
  };

  const handleQuickMeeting = () => {
    // TODO: Implement quick meeting (instant meeting creation)
    alert('Funcionalidad de reunión rápida próximamente');
  };

  const handleStats = () => {
    // TODO: Implement statistics page
    router.push('/dashboard');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 py-12">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header */}
        <div className="text-center mb-12">
          <NeonText className="text-5xl font-bold mb-4">
            Centro de Reuniones
          </NeonText>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Gestiona todas tus videoconferencias desde un solo lugar. Crea, únete y administra reuniones con tecnología de vanguardia.
          </p>
        </div>

        {/* Tabs Navigation */}
        <div className="flex justify-center mb-8">
          <div className="flex bg-gray-800/30 rounded-lg p-1 border border-gray-700">
            <button
              onClick={() => setActiveTab('list')}
              className={`px-6 py-2 rounded-md transition-all ${
                activeTab === 'list'
                  ? 'bg-sirius-blue text-white shadow-lg'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              📅 Mis Reuniones
            </button>
            <button
              onClick={() => setActiveTab('create')}
              className={`px-6 py-2 rounded-md transition-all ${
                activeTab === 'create'
                  ? 'bg-sirius-blue text-white shadow-lg'
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
                  <Button3D variant="neon" size="sm" onClick={handleQuickMeeting}>
                    Próximamente
                  </Button3D>
                </GlowCard>

                <GlowCard className="p-6 text-center hover:scale-105 transition-transform">
                  <div className="text-3xl mb-2">🔗</div>
                  <h3 className="text-lg font-semibold text-white mb-2">Unirse por Código</h3>
                  <p className="text-sm text-gray-400 mb-4">Únete con un código de sala</p>
                  <Button3D variant="holographic" size="sm" onClick={() => setShowJoinModal(true)}>
                    Ingresar Código
                  </Button3D>
                </GlowCard>

                <GlowCard className="p-6 text-center hover:scale-105 transition-transform">
                  <div className="text-3xl mb-2">📊</div>
                  <h3 className="text-lg font-semibold text-white mb-2">Estadísticas</h3>
                  <p className="text-sm text-gray-400 mb-4">Analiza tus reuniones</p>
                  <Button3D variant="glass" size="sm" onClick={handleStats}>
                    Ver Dashboard
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

              {/* Create Meeting Form */}
              <CreateMeetingForm
                onMeetingCreated={handleMeetingCreated}
                onCancel={() => setActiveTab('list')}
              />
            </div>
          )}
        </div>

        {/* Success Modal */}
        {createdMeeting && (
          <MeetingSuccessModal
            meeting={createdMeeting.meeting}
            roomCode={createdMeeting.roomCode}
            joinUrl={createdMeeting.joinUrl}
            onClose={handleCloseSuccessModal}
            onViewMeetings={handleViewMeetings}
          />
        )}

        {/* Join by Code Modal */}
        {showJoinModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-gray-900/95 border border-sirius-blue/30 rounded-lg p-8 max-w-md w-full">
              <div className="text-center mb-6">
                <div className="text-6xl mb-4">🔗</div>
                <NeonText className="text-2xl font-bold">
                  Unirse por Código
                </NeonText>
                <p className="text-gray-400 mt-2">
                  Ingresa el código de la reunión
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-2">
                    Código de reunión:
                  </label>
                  <input
                    type="text"
                    value={joinCode}
                    onChange={(e) => setJoinCode(e.target.value)}
                    placeholder="ej: cosmic-nexus-123"
                    className="w-full bg-gray-800/50 border border-gray-600 rounded px-4 py-3 text-white placeholder-gray-400 focus:border-sirius-blue focus:outline-none"
                    onKeyPress={(e) => e.key === 'Enter' && handleJoinByCode()}
                    autoFocus
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    El código fue proporcionado por el organizador de la reunión
                  </p>
                </div>

                {joinError && (
                  <div className="bg-red-500/10 border border-red-500/20 rounded p-3">
                    <p className="text-red-400 text-sm">{joinError}</p>
                  </div>
                )}

                <div className="flex gap-3">
                  <Button3D
                    variant="glass"
                    onClick={() => {
                      setShowJoinModal(false);
                      setJoinCode('');
                      setJoinError(null);
                    }}
                    className="flex-1"
                  >
                    Cancelar
                  </Button3D>
                  <Button3D
                    variant="neon"
                    onClick={handleJoinByCode}
                    disabled={joiningMeeting || !joinCode.trim()}
                    className="flex-1"
                  >
                    {joiningMeeting ? '⏳ Uniéndose...' : '🚀 Unirse'}
                  </Button3D>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 