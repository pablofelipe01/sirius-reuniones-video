'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button3D } from '@/components/ui/Button3D';
import { GlowCard } from '@/components/ui/GlowCard';
import { NeonText } from '@/components/ui/NeonText';
import { VideoRoom } from '@/components/livekit/VideoRoom';

export default function JoinMeetingPage() {
  const params = useParams();
  const router = useRouter();
  const roomCode = params.roomCode as string;

  const [participantName, setParticipantName] = useState('');
  const [isJoining, setIsJoining] = useState(false);
  const [hasJoined, setHasJoined] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isHost, setIsHost] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [meetingInfo, setMeetingInfo] = useState<{
    id?: string;
    title: string;
    room_name: string;
    scheduled_at?: string;
    started_at?: string;
    ended_at?: string;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Verificar que la reunión existe y si el usuario está autenticado
    checkAuthentication();
    fetchMeetingInfo();
  }, [roomCode]);

  const checkAuthentication = async () => {
    try {
      // Intentar verificar si el usuario está autenticado
      const response = await fetch('/api/test-auth');
      
      if (response.ok) {
        const data = await response.json();
        setIsAuthenticated(true);
        setParticipantName(data.user?.metadata?.full_name || data.user?.email?.split('@')[0] || '');
        
        // Verificar si es el host REAL de esta reunión específica
        const meetingResponse = await fetch(`/api/meetings/info/${roomCode}`);
        if (meetingResponse.ok) {
          const meetingData = await meetingResponse.json();
          // Solo es host si su user.id coincide con el host_id de la reunión
          setIsHost(meetingData.meeting?.host_id === data.user?.id);
        }
      }
    } catch {
      console.log('User not authenticated, treating as guest');
    } finally {
      setCheckingAuth(false);
    }
  };

  const fetchMeetingInfo = async () => {
    try {
      const response = await fetch(`/api/meetings/public-info/${roomCode}`);
      
      if (response.ok) {
        const data = await response.json();
        setMeetingInfo(data.meeting);
      } else {
        setError('Reunión no encontrada o inválida');
      }
    } catch (err) {
      console.error('Error fetching meeting info:', err);
      setError('Error al verificar la reunión');
    } finally {
      setLoading(false);
    }
  };

  const handleJoinMeeting = async () => {
    if (!participantName.trim()) {
      alert('Por favor ingresa tu nombre');
      return;
    }

    setIsJoining(true);
    setHasJoined(true);
  };

  const handleDisconnect = () => {
    setHasJoined(false);
    setIsJoining(false);
    setParticipantName('');
  };

  if (loading || checkingAuth) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center">
        <GlowCard className="p-8 text-center">
          <div className="w-12 h-12 border-4 border-sirius-blue border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">
            {checkingAuth ? 'Verificando acceso...' : 'Verificando reunión...'}
          </p>
        </GlowCard>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center">
        <GlowCard className="p-8 text-center max-w-md">
          <div className="text-6xl mb-4">❌</div>
          <NeonText className="text-xl font-bold mb-4">
            Reunión No Encontrada
          </NeonText>
          <p className="text-gray-400 mb-6">{error}</p>
          <div className="flex gap-4 justify-center">
            <Button3D
              variant="glass"
              onClick={() => router.push('/')}
            >
              🏠 Ir al Inicio
            </Button3D>
            {isAuthenticated && (
              <Button3D
                variant="neon"
                onClick={() => router.push('/meetings')}
              >
                📊 Ir al Dashboard
              </Button3D>
            )}
          </div>
        </GlowCard>
      </div>
    );
  }

  if (hasJoined) {
    return (
      <VideoRoom
        roomName={roomCode}
        participantName={participantName}
        onDisconnect={handleDisconnect}
        meetingId={meetingInfo?.id}
        isHost={isHost} // Detectado automáticamente
        isGuest={!isAuthenticated} // Es invitado si no está autenticado
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center p-4">
      <GlowCard className="p-8 max-w-md w-full text-center">
        <div className="text-6xl mb-6">🚀</div>
        
        <NeonText className="text-2xl font-bold mb-2">
          Únete a la Reunión
        </NeonText>
        
        {meetingInfo?.title && (
          <h2 className="text-xl text-sirius-light-blue mb-4">
            {meetingInfo.title}
          </h2>
        )}
        
        <p className="text-gray-400 mb-6">
          Código: <span className="text-sirius-blue font-mono">{roomCode}</span>
        </p>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Tu nombre
            </label>
            <input
              type="text"
              value={participantName}
              onChange={(e) => setParticipantName(e.target.value)}
              placeholder="Ingresa tu nombre completo"
              className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-sirius-blue focus:border-transparent"
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handleJoinMeeting();
                }
              }}
              autoFocus
            />
          </div>

          <Button3D
            variant="neon"
            onClick={handleJoinMeeting}
            disabled={isJoining || !participantName.trim()}
            className="w-full"
          >
            {isJoining ? '🔄 Entrando...' : '🎥 Entrar a la Reunión'}
          </Button3D>
        </div>

        {/* Navigation buttons for authenticated users */}
        {isAuthenticated && (
          <div className="mt-6 pt-4 border-t border-gray-700">
            <div className="flex gap-3 justify-center">
              <Button3D
                variant="glass"
                size="sm"
                onClick={() => router.push('/')}
              >
                🏠 Inicio
              </Button3D>
              <Button3D
                variant="holographic"
                size="sm"
                onClick={() => router.push('/meetings')}
              >
                📊 Dashboard
              </Button3D>
            </div>
          </div>
        )}

        <div className="mt-6 pt-6 border-t border-gray-700">
          <p className="text-xs text-gray-500">
            🔒 Reunión segura de Sirius Regenerative
          </p>
        </div>
      </GlowCard>
    </div>
  );
} 