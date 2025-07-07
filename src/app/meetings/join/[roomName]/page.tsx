'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { Button3D } from '@/components/ui/Button3D';
import { GlowCard } from '@/components/ui/GlowCard';
import { NeonText } from '@/components/ui/NeonText';

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

export default function JoinMeetingPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const roomName = params.roomName as string;
  
  const [meeting, setMeeting] = useState<Meeting | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [joining, setJoining] = useState(false);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

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
      setError(null);
      
      // First try to get meeting info without checking permissions
      const response = await fetch(`/api/meetings/info/${roomName}`);
      
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Esta reunión no existe o el código es incorrecto');
        }
        throw new Error('Error al cargar la información de la reunión');
      }

      const { meeting } = await response.json();
      setMeeting(meeting);
    } catch (err) {
      console.error('Error fetching meeting:', err);
      setError(err instanceof Error ? err.message : 'Error al cargar la reunión');
    } finally {
      setLoading(false);
    }
  };

  const handleJoinMeeting = async () => {
    if (!meeting || !user) return;
    
    try {
      setJoining(true);
      setError(null);
      
      // Add user as participant
      const response = await fetch(`/api/meetings/${meeting.id}/participants`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: user.id
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al unirse a la reunión');
      }

      // Redirect to the room
      router.push(`/room/${meeting.room_name}`);
    } catch (err) {
      console.error('Error joining meeting:', err);
      setError(err instanceof Error ? err.message : 'Error al unirse a la reunión');
    } finally {
      setJoining(false);
    }
  };

  const formatDateTime = (dateTime: string) => {
    if (!isClient) return '';
    
    try {
      return new Date(dateTime).toLocaleString('es-CO', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        timeZone: 'America/Bogota'
      });
    } catch {
      return dateTime;
    }
  };

  const getMeetingStatus = () => {
    if (!meeting || !isClient) return { status: 'Cargando...', color: 'text-gray-400', canJoin: false };
    
    const now = new Date();
    const scheduledTime = new Date(meeting.scheduled_at);
    
    if (meeting.ended_at) {
      return { status: 'Finalizada', color: 'text-red-400', canJoin: false };
    }
    
    if (meeting.started_at) {
      return { status: 'En curso', color: 'text-sirius-green', canJoin: true };
    }
    
    if (now >= scheduledTime) {
      return { status: 'Lista para iniciar', color: 'text-yellow-400', canJoin: true };
    }
    
    return { status: 'Programada', color: 'text-sirius-light-blue', canJoin: false };
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-black to-gray-800">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-sirius-blue border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-sirius-light-blue text-lg">Cargando información de la reunión...</p>
        </div>
      </div>
    );
  }

  if (error || !meeting) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 py-12">
        <div className="container mx-auto px-4 max-w-2xl">
          <div className="text-center mb-8">
            <NeonText variant="sirius-blue" className="text-4xl font-bold">
              Unirse a Reunión
            </NeonText>
          </div>

          <GlowCard className="p-8 text-center border-red-500/20 bg-red-500/5">
            <div className="text-6xl mb-4">❌</div>
            <h2 className="text-xl font-semibold text-red-400 mb-4">
              Error al cargar la reunión
            </h2>
            <p className="text-gray-400 mb-6">
              {error}
            </p>
            <div className="flex gap-4 justify-center">
              <Button3D variant="glass" onClick={() => router.push('/meetings')}>
                ← Volver a Reuniones
              </Button3D>
              <Button3D variant="holographic" onClick={fetchMeetingInfo}>
                🔄 Reintentar
              </Button3D>
            </div>
          </GlowCard>
        </div>
      </div>
    );
  }

  const { status, color, canJoin } = getMeetingStatus();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 py-12">
      <div className="container mx-auto px-4 max-w-2xl">
        <div className="text-center mb-8">
          <NeonText variant="sirius-blue" className="text-4xl font-bold">
            Unirse a Reunión
          </NeonText>
          <p className="text-gray-400 mt-2">
            Has sido invitado a una reunión de video
          </p>
        </div>

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
                <span>{formatDateTime(meeting.scheduled_at)}</span>
              </div>
              <div className="flex items-center gap-2">
                <span>🔒</span>
                <span>Código: {meeting.room_name}</span>
              </div>
            </div>

            <div className="flex items-center justify-center gap-2 mb-6">
              <span className="text-sm text-gray-400">Estado:</span>
              <span className={`text-sm font-medium ${color}`}>
                {status}
              </span>
            </div>
          </div>

          {/* User Info */}
          <div className="bg-sirius-blue/10 border border-sirius-blue/20 rounded-lg p-4 mb-6">
            <h3 className="text-lg font-semibold text-sirius-light-blue mb-2">
              Te unirás como:
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
                  👤 Participante
                </p>
              </div>
            </div>
          </div>

          {/* Join Controls */}
          <div className="space-y-4">
            {!canJoin && !meeting.ended_at && (
              <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4">
                <p className="text-yellow-400 text-center">
                  ⏳ La reunión aún no ha comenzado. Podrás unirte cuando esté programada o el anfitrión la inicie.
                </p>
              </div>
            )}

            {meeting.ended_at && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
                <p className="text-red-400 text-center">
                  ❌ Esta reunión ya ha finalizado y no es posible unirse.
                </p>
              </div>
            )}

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
                <p className="text-red-400 text-center">
                  ❌ {error}
                </p>
              </div>
            )}
            
            <div className="flex gap-4">
              <Button3D
                variant="glass"
                onClick={() => router.push('/meetings')}
                className="flex-1"
              >
                ← Ir a Mis Reuniones
              </Button3D>
              <Button3D
                variant="neon"
                onClick={handleJoinMeeting}
                disabled={!canJoin || joining}
                className="flex-1"
              >
                {joining ? '⏳ Uniéndose...' : '🚀 Unirse a la Reunión'}
              </Button3D>
            </div>
          </div>
        </GlowCard>
      </div>
    </div>
  );
} 