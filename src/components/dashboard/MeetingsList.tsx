'use client';

import { useState, useEffect } from 'react';
import { Button3D } from '@/components/ui/Button3D';
import { GlowCard } from '@/components/ui/GlowCard';

interface Meeting {
  id: string;
  title: string;
  description: string;
  scheduled_at: string;
  duration_minutes: number;
  max_participants: number;
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  meeting_participants: Array<{
    user_id: string;
    joined_at: string;
    left_at: string;
    users: {
      full_name: string;
      email: string;
    };
  }>;
}

export function MeetingsList() {
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
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

  const getStatusColor = (status: Meeting['status']) => {
    switch (status) {
      case 'scheduled': return 'text-blue-400';
      case 'in_progress': return 'text-green-400';
      case 'completed': return 'text-gray-400';
      case 'cancelled': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  const getStatusText = (status: Meeting['status']) => {
    switch (status) {
      case 'scheduled': return 'Programada';
      case 'in_progress': return 'En Curso';
      case 'completed': return 'Completada';
      case 'cancelled': return 'Cancelada';
      default: return 'Desconocido';
    }
  };

  const canJoinMeeting = (meeting: Meeting) => {
    const now = new Date();
    const scheduledTime = new Date(meeting.scheduled_at);
    const endTime = new Date(scheduledTime.getTime() + meeting.duration_minutes * 60000);
    
    return meeting.status === 'scheduled' && now >= scheduledTime && now <= endTime;
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-400">Cargando reuniones...</p>
      </div>
    );
  }

  if (error) {
    return (
      <GlowCard className="p-6 text-center">
        <p className="text-red-400 mb-4">{error}</p>
        <Button3D variant="glass" onClick={fetchMeetings}>
          Reintentar
        </Button3D>
      </GlowCard>
    );
  }

  if (meetings.length === 0) {
    return (
      <GlowCard className="p-8 text-center">
        <p className="text-gray-400 mb-4">No tienes reuniones programadas</p>
        <p className="text-sm text-gray-500">Crea tu primera reunión para comenzar</p>
      </GlowCard>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-blue-400 mb-6">
        Mis Reuniones
      </h2>
      
      {meetings.map((meeting) => (
        <GlowCard key={meeting.id} className="p-6">
          <div className="flex justify-between items-start mb-4">
            <div className="flex-1">
              <h3 className="text-xl font-semibold text-white mb-2">
                {meeting.title}
              </h3>
              {meeting.description && (
                <p className="text-gray-400 mb-2">{meeting.description}</p>
              )}
              <div className="flex items-center gap-4 text-sm text-gray-500">
                <span>{formatDateTime(meeting.scheduled_at)}</span>
                <span>•</span>
                <span>{meeting.duration_minutes} min</span>
                <span>•</span>
                <span>{meeting.meeting_participants.length} participantes</span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className={`text-sm font-medium ${getStatusColor(meeting.status)}`}>
                {getStatusText(meeting.status)}
              </span>
              {canJoinMeeting(meeting) && (
                <Button3D
                  variant="neon"
                  size="sm"
                  onClick={() => {
                    // TODO: Implement join meeting
                    alert('Funcionalidad de unirse a reunión próximamente');
                  }}
                >
                  Unirse
                </Button3D>
              )}
              {meeting.status === 'scheduled' && (
                <Button3D
                  variant="glass"
                  size="sm"
                  onClick={() => {
                    // TODO: Implement edit meeting
                    alert('Funcionalidad de editar reunión próximamente');
                  }}
                >
                  Editar
                </Button3D>
              )}
            </div>
          </div>
          
          {meeting.meeting_participants.length > 0 && (
            <div className="border-t border-gray-700 pt-4">
              <h4 className="text-sm font-medium text-gray-400 mb-2">
                Participantes:
              </h4>
              <div className="flex flex-wrap gap-2">
                {meeting.meeting_participants.map((participant, index) => (
                  <div
                    key={index}
                    className="px-3 py-1 bg-gray-800/50 rounded-full text-sm text-gray-300"
                  >
                    {participant.users.full_name || participant.users.email}
                  </div>
                ))}
              </div>
            </div>
          )}
        </GlowCard>
      ))}
    </div>
  );
} 