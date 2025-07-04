'use client';

import { useEffect, useState } from 'react';
import { GlowCard } from '@/components/ui/GlowCard';
import { Button3D } from '@/components/ui/Button3D';
import { useRouter } from 'next/navigation';

interface AdminStats {
  activeMeetings: number;
  completedMeetings: number;
  upcomingMeetings: number;
  totalParticipants: number;
}

interface Meeting {
  id: string;
  title: string;
  room_name: string;
  scheduled_at: string;
  ended_at: string | null;
  started_at: string | null;
  host_id: string;
}

const calculateMeetingStatus = (meeting: Meeting): string => {
  const now = new Date();
  if (meeting.ended_at) {
    return 'completed';
  } else if (meeting.started_at) {
    return 'in_progress';
  } else if (new Date(meeting.scheduled_at) > now) {
    return 'scheduled';
  } else {
    return 'missed';
  }
};

export default function TestAdminPage() {
  const router = useRouter();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [recentMeetings, setRecentMeetings] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAdminStats = async () => {
      try {
        const response = await fetch('/api/dashboard/stats-admin');
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        setStats(data.stats);
        setRecentMeetings(data.recentMeetings || []);
        setError(null);
      } catch (err) {
        console.error('Error fetching admin stats:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchAdminStats();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-black p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <Button3D
            variant="glass"
            onClick={() => router.push('/dashboard')}
            className="mb-6"
          >
            ← Volver al Dashboard
          </Button3D>
          
          <h1 className="text-4xl font-bold text-white mb-2">
            Admin Stats Test
          </h1>
          <p className="text-sirius-light-blue">
            Prueba de estadísticas usando service role key (bypassing RLS)
          </p>
        </div>

        {loading && (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sirius-blue mx-auto mb-4"></div>
            <p className="text-sirius-light-blue">Cargando estadísticas admin...</p>
          </div>
        )}

        {error && (
          <GlowCard className="mb-8 border-red-500 bg-red-500/10">
            <div className="p-6">
              <h3 className="text-xl font-bold text-red-400 mb-2">Error</h3>
              <p className="text-red-300">{error}</p>
            </div>
          </GlowCard>
        )}

        {stats && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <GlowCard className="border-sirius-blue bg-sirius-blue/10">
                <div className="p-6">
                  <h3 className="text-2xl font-bold text-white mb-2">
                    {stats.activeMeetings}
                  </h3>
                  <p className="text-sirius-light-blue">Reuniones Activas</p>
                </div>
              </GlowCard>

              <GlowCard className="border-sirius-green bg-sirius-green/10">
                <div className="p-6">
                  <h3 className="text-2xl font-bold text-white mb-2">
                    {stats.completedMeetings}
                  </h3>
                  <p className="text-sirius-light-blue">Reuniones Completadas</p>
                </div>
              </GlowCard>

              <GlowCard className="border-sirius-accent bg-sirius-accent/10">
                <div className="p-6">
                  <h3 className="text-2xl font-bold text-white mb-2">
                    {stats.upcomingMeetings}
                  </h3>
                  <p className="text-sirius-light-blue">Próximas Reuniones</p>
                </div>
              </GlowCard>

              <GlowCard className="border-sirius-dark-blue bg-sirius-dark-blue/10">
                <div className="p-6">
                  <h3 className="text-2xl font-bold text-white mb-2">
                    {stats.totalParticipants}
                  </h3>
                  <p className="text-sirius-light-blue">Total Participantes</p>
                </div>
              </GlowCard>
            </div>

            <GlowCard className="border-sirius-light-blue bg-sirius-light-blue/5">
              <div className="p-6">
                <h3 className="text-xl font-bold text-white mb-4">
                  Reuniones Recientes
                </h3>
                {recentMeetings.length === 0 ? (
                  <p className="text-sirius-light-blue">
                    No hay reuniones registradas aún
                  </p>
                ) : (
                  <div className="space-y-3">
                    {recentMeetings.map((meeting) => {
                      const status = calculateMeetingStatus(meeting);
                      return (
                        <div
                          key={meeting.id}
                          className="flex justify-between items-center p-3 bg-white/5 rounded-lg"
                        >
                          <div>
                            <h4 className="font-semibold text-white">
                              {meeting.title || `Reunión ${meeting.room_name}`}
                            </h4>
                            <p className="text-sm text-sirius-light-blue">
                              {new Date(meeting.scheduled_at).toLocaleDateString()}
                            </p>
                          </div>
                          <span className={`px-2 py-1 rounded text-xs ${
                            status === 'completed'
                              ? 'bg-green-500/20 text-green-400'
                              : status === 'in_progress'
                              ? 'bg-blue-500/20 text-blue-400'
                              : status === 'scheduled'
                              ? 'bg-yellow-500/20 text-yellow-400'
                              : 'bg-gray-500/20 text-gray-400'
                          }`}>
                            {status}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </GlowCard>

            <div className="mt-8 p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
              <h3 className="text-green-400 font-bold mb-2">✅ Éxito</h3>
              <p className="text-green-300">
                Las estadísticas se cargan correctamente usando el service role key.
                Esto confirma que el problema era con las políticas RLS.
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
} 