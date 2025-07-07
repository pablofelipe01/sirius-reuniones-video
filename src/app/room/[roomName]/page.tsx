'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { VideoRoom } from '@/components/livekit/VideoRoom';
import { Button3D } from '@/components/ui/Button3D';
import { GlowCard } from '@/components/ui/GlowCard';

interface Meeting {
  id: string;
  title: string;
  description: string | null;
  room_name: string;
  host_id: string;
  scheduled_at: string;
  started_at: string | null;
  ended_at: string | null;
  is_recording: boolean;
}

export default function RoomPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const roomName = params.roomName as string;
  
  const [meeting, setMeeting] = useState<Meeting | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [joining, setJoining] = useState(false);
  const [inRoom, setInRoom] = useState(false);

  // Redirect to login if not authenticated
  if (!authLoading && !user) {
    router.push('/auth/login');
    return null;
  }

  useEffect(() => {
    if (!roomName || authLoading) return;
    
    fetchMeetingInfo();
  }, [roomName, authLoading]);

  const fetchMeetingInfo = async () => {
    try {
      setLoading(true);
      
      const response = await fetch(`/api/rooms/${roomName}`);
      
      if (!response.ok) {
        throw new Error('Meeting not found');
      }

      const { meeting } = await response.json();
      setMeeting(meeting);
    } catch (err) {
      console.error('Error fetching meeting:', err);
      setError(err instanceof Error ? err.message : 'Failed to load meeting');
    } finally {
      setLoading(false);
    }
  };

  const handleJoinRoom = async () => {
    if (!meeting || !user) return;
    
    try {
      setJoining(true);
      
      // Mark meeting as started if user is host and it hasn't started
      if (meeting.host_id === user.id && !meeting.started_at) {
        await fetch(`/api/meetings/${meeting.id}/start`, {
          method: 'POST',
        });
      }
      
      setInRoom(true);
    } catch (err) {
      console.error('Error joining room:', err);
      setError('Failed to join room');
    } finally {
      setJoining(false);
    }
  };

  const handleLeaveRoom = () => {
    setInRoom(false);
    router.push('/meetings');
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-black to-gray-900">
        <GlowCard className="p-8 text-center">
          <div className="w-12 h-12 border-4 border-sirius-blue border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <h3 className="text-xl font-semibold text-sirius-blue mb-2">
            Cargando reunión...
          </h3>
          <p className="text-gray-400">
            {authLoading ? 'Verificando autenticación' : 'Obteniendo información de la sala'}
          </p>
        </GlowCard>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-black to-gray-900">
        <GlowCard className="p-8 text-center border-red-500/20 bg-red-500/5">
          <div className="text-6xl mb-4">🚫</div>
          <h3 className="text-xl font-semibold text-red-400 mb-2">
            Error de Acceso
          </h3>
          <p className="text-gray-400 mb-6">
            {error}
          </p>
          <div className="flex gap-4 justify-center">
            <Button3D
              variant="glass"
              onClick={() => router.push('/meetings')}
            >
              Volver a Reuniones
            </Button3D>
            <Button3D
              variant="neon"
              onClick={fetchMeetingInfo}
            >
              Reintentar
            </Button3D>
          </div>
        </GlowCard>
      </div>
    );
  }

  if (!meeting) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Meeting not found</p>
      </div>
    );
  }

  // If user is already in the room, show video interface
  if (inRoom) {
    const isHost = meeting.host_id === user?.id;
    return (
      <VideoRoom
        roomName={meeting.room_name}
        participantName={user?.user_metadata?.full_name || user?.email || 'Participante'}
        onDisconnect={handleLeaveRoom}
        meetingId={meeting.id}
        isHost={isHost}
      />
    );
  }

  const isHost = meeting.host_id === user?.id;
  const hasStarted = !!meeting.started_at;
  const hasEnded = !!meeting.ended_at;
  const now = new Date();
  const scheduledTime = new Date(meeting.scheduled_at);
  const canJoin = now >= scheduledTime && !hasEnded;
  const canStart = canJoin && !hasStarted && isHost;

  if (hasEnded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-black to-gray-900">
        <GlowCard className="p-8 text-center border-red-500/20 bg-red-500/5">
          <div className="text-6xl mb-4">📋</div>
          <h3 className="text-xl font-semibold text-red-400 mb-2">
            Reunión Finalizada
          </h3>
          <p className="text-gray-400 mb-6">
            Esta reunión ya ha terminado y no es posible unirse.
          </p>
          <Button3D
            variant="glass"
            onClick={() => router.push('/meetings')}
          >
            Volver a Reuniones
          </Button3D>
        </GlowCard>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 py-12">
      <div className="container mx-auto px-4 max-w-2xl">
        <GlowCard className="p-8">
          {/* Meeting Info */}
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-white mb-2">
              {meeting.title}
            </h1>
            {meeting.description && (
              <p className="text-gray-400 mb-4">
                {meeting.description}
              </p>
            )}
            
            <div className="flex items-center justify-center gap-4 text-sm text-gray-300 mb-4">
              <div className="flex items-center gap-2">
                <span>📅</span>
                <span>{new Date(meeting.scheduled_at).toLocaleString('es-CO', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                  timeZone: 'America/Bogota'
                })}</span>
              </div>
              <div className="flex items-center gap-2">
                <span>🔒</span>
                <span>Sala: {meeting.room_name}</span>
              </div>
            </div>

            <div className="flex items-center justify-center gap-2 mb-6">
              <span className="text-sm text-gray-400">Estado:</span>
              <span className={`text-sm font-medium ${
                hasEnded ? 'text-red-400' : 
                hasStarted ? 'text-sirius-green' : 
                canJoin ? 'text-yellow-400' : 'text-sirius-light-blue'
              }`}>
                {hasEnded ? 'Finalizada' : 
                 hasStarted ? 'En curso' : 
                 canJoin ? 'Lista para iniciar' : 'Programada'}
              </span>
            </div>
          </div>

          {/* User Info */}
          <div className="bg-sirius-blue/10 border border-sirius-blue/20 rounded-lg p-4 mb-6">
            <h3 className="text-lg font-semibold text-sirius-light-blue mb-2">
              Tu Información
            </h3>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-sirius-blue/20 rounded-full flex items-center justify-center">
                {(user?.user_metadata?.full_name || user?.email || 'U').charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="text-white font-medium">
                  {user?.user_metadata?.full_name || user?.email}
                </p>
                <p className="text-sm text-gray-400">
                  {isHost ? '👑 Anfitrión' : '👤 Participante'}
                </p>
              </div>
            </div>
          </div>

          {/* Join Controls */}
          <div className="space-y-4">
            {!canJoin && (
              <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4">
                <p className="text-yellow-400 text-center">
                  ⏳ La reunión aún no ha comenzado. Esperando que el anfitrión inicie la sesión.
                </p>
              </div>
            )}
            
            <div className="flex gap-4">
              <Button3D
                variant="glass"
                onClick={() => router.push('/meetings')}
                className="flex-1"
              >
                ← Volver
              </Button3D>
              <Button3D
                variant="neon"
                onClick={handleJoinRoom}
                disabled={!canJoin || joining}
                className="flex-1"
              >
                {joining ? '⏳ Uniéndose...' : isHost ? '🚀 Iniciar Reunión' : '🚀 Unirse'}
              </Button3D>
            </div>
          </div>
        </GlowCard>
      </div>
    </div>
  );
} 