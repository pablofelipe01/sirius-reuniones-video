'use client';

import { useState, useEffect } from 'react';
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
  room_style: string;
  created_at: string;
  participants: Array<{
    user_id: string;
    guest_name: string | null;
    joined_at: string;
    left_at: string | null;
    speaking_duration_seconds: number;
    users: {
      full_name: string | null;
      email: string;
      avatar_url: string | null;
    };
  }>;
}

export function MeetingsList() {
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    fetchMeetings();
  }, []);

  const fetchMeetings = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/meetings');
      
      if (!response.ok) {
        throw new Error('Failed to fetch meetings');
      }

      const { meetings } = await response.json();
      setMeetings(meetings);
    } catch (err) {
      console.error('Error fetching meetings:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch meetings');
    } finally {
      setLoading(false);
    }
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getMeetingStatus = (meeting: Meeting): { status: string; color: string } => {
    // Only calculate time-dependent status on client side
    if (!isClient) {
      return { status: 'Cargando...', color: 'text-gray-400' };
    }

    const now = new Date();
    const scheduledTime = new Date(meeting.scheduled_at);
    
    if (meeting.ended_at) {
      return { status: 'Completada', color: 'text-gray-400' };
    } else if (meeting.started_at) {
      return { status: 'En Curso', color: 'text-sirius-green' };
    } else if (now >= scheduledTime) {
      return { status: 'Lista para iniciar', color: 'text-sirius-blue' };
    } else {
      return { status: 'Programada', color: 'text-sirius-light-blue' };
    }
  };

  const canJoinMeeting = (meeting: Meeting) => {
    if (!isClient) return false;
    
    const now = new Date();
    const scheduledTime = new Date(meeting.scheduled_at);
    
    // Can join if it's scheduled time or later, and hasn't ended
    return now >= scheduledTime && !meeting.ended_at;
  };

  const canStartMeeting = (meeting: Meeting) => {
    if (!isClient) return false;
    
    const now = new Date();
    const scheduledTime = new Date(meeting.scheduled_at);
    
    // Can start if it's scheduled time, hasn't started, and hasn't ended
    return now >= scheduledTime && !meeting.started_at && !meeting.ended_at;
  };

  const copyRoomCode = (roomName: string) => {
    navigator.clipboard.writeText(roomName);
    // TODO: Add toast notification
    alert(`Código copiado: ${roomName}`);
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="w-8 h-8 border-4 border-sirius-blue border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-sirius-light-blue">Cargando reuniones...</p>
      </div>
    );
  }

  if (error) {
    return (
      <GlowCard className="p-6 text-center border-red-500/20 bg-red-500/5">
        <p className="text-red-400 mb-4">❌ {error}</p>
        <Button3D variant="glass" onClick={fetchMeetings}>
          🔄 Reintentar
        </Button3D>
      </GlowCard>
    );
  }

  if (meetings.length === 0) {
    return (
      <GlowCard className="p-8 text-center">
        <div className="text-6xl mb-4">📅</div>
        <h3 className="text-xl font-semibold text-white mb-2">
          No tienes reuniones programadas
        </h3>
        <p className="text-gray-400 mb-6">
          Crea tu primera reunión para comenzar a colaborar con tu equipo
        </p>
      </GlowCard>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold text-sirius-blue">
          🎥 Mis Reuniones
        </h2>
        <Button3D variant="glass" onClick={fetchMeetings} size="sm">
          🔄 Actualizar
        </Button3D>
      </div>
      
      {meetings.map((meeting) => {
        const { status, color } = getMeetingStatus(meeting);
        
        return (
          <GlowCard key={meeting.id} className="p-6 hover:scale-[1.02] transition-transform">
            <div className="flex justify-between items-start mb-4">
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-white mb-2">
                  {meeting.title}
                </h3>
                {meeting.description && (
                  <p className="text-gray-400 mb-3 leading-relaxed">
                    {meeting.description}
                  </p>
                )}
                <div className="flex items-center gap-6 text-sm text-gray-500">
                  <span className="flex items-center gap-1">
                    📅 {formatDateTime(meeting.scheduled_at)}
                  </span>
                  <span className="flex items-center gap-1">
                    👥 {meeting.participants.length} participantes
                  </span>
                  <span className="flex items-center gap-1">
                    🎬 {meeting.is_recording ? 'Con grabación' : 'Sin grabación'}
                  </span>
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-xs bg-gray-800/50 px-2 py-1 rounded">
                    Código: {meeting.room_name}
                  </span>
                  <Button3D
                    variant="glass"
                    size="sm"
                    onClick={() => copyRoomCode(meeting.room_name)}
                    className="text-xs"
                  >
                    📋 Copiar
                  </Button3D>
                </div>
              </div>
              
              <div className="flex items-center gap-3 ml-4">
                <span className={`text-sm font-medium ${color}`}>
                  {status}
                </span>
                <div className="flex gap-2">
                  {canStartMeeting(meeting) && (
                    <Button3D
                      variant="neon"
                      size="sm"
                      onClick={() => {
                        window.open(`/room/${meeting.room_name}`, '_blank');
                      }}
                    >
                      ▶️ Iniciar
                    </Button3D>
                  )}
                  {canJoinMeeting(meeting) && !canStartMeeting(meeting) && (
                    <Button3D
                      variant="holographic"
                      size="sm"
                      onClick={() => {
                        window.open(`/room/${meeting.room_name}`, '_blank');
                      }}
                    >
                      🚀 Unirse
                    </Button3D>
                  )}
                  {!meeting.started_at && !meeting.ended_at && (
                    <Button3D
                      variant="glass"
                      size="sm"
                      onClick={() => {
                        // TODO: Implement edit meeting
                        alert('Funcionalidad de editar reunión próximamente');
                      }}
                    >
                      ✏️ Editar
                    </Button3D>
                  )}
                </div>
              </div>
            </div>
            
            {meeting.participants.length > 0 && (
              <div className="border-t border-gray-700/50 pt-4">
                <h4 className="text-sm font-medium text-sirius-light-blue mb-3">
                  👥 Participantes ({meeting.participants.length}):
                </h4>
                <div className="flex flex-wrap gap-2">
                  {meeting.participants.map((participant, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-2 px-3 py-2 bg-gray-800/30 rounded-lg text-sm"
                    >
                      <div className="w-6 h-6 bg-sirius-blue/20 rounded-full flex items-center justify-center text-xs">
                        {(participant.users.full_name || participant.users.email).charAt(0).toUpperCase()}
                      </div>
                      <span className="text-gray-300">
                        {participant.users.full_name || participant.users.email}
                      </span>
                      {participant.joined_at && (
                        <span className="text-xs text-sirius-green">✓</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </GlowCard>
        );
      })}
    </div>
  );
} 