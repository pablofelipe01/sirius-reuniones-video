'use client';

import { useState, useEffect } from 'react';
import { GlowCard } from '@/components/ui/GlowCard';
import { Button3D } from '@/components/ui/Button3D';

interface DashboardStats {
  activeMeetings: number;
  completedMeetings: number;
  upcomingMeetings: number;
  totalParticipants: number;
}

interface RecentMeeting {
  id: string;
  title: string;
  room_name: string;
  scheduled_at: string;
  ended_at: string | null;
  started_at: string | null;
  host_id: string;
}

const calculateMeetingStatus = (meeting: RecentMeeting): string => {
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

const getStatusColor = (status: string): string => {
  switch (status) {
    case 'completed':
      return 'text-green-400';
    case 'in_progress':
      return 'text-blue-400';
    case 'scheduled':
      return 'text-yellow-400';
    case 'missed':
      return 'text-gray-400';
    default:
      return 'text-gray-400';
  }
};

export function DashboardStats() {
  const [stats, setStats] = useState<DashboardStats>({
    activeMeetings: 0,
    completedMeetings: 0,
    upcomingMeetings: 0,
    totalParticipants: 0
  });
  const [recentMeetings, setRecentMeetings] = useState<RecentMeeting[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    fetchStats();
    
    // Refresh stats every 60 seconds instead of 30 to reduce load
    const interval = setInterval(fetchStats, 60000);
    return () => clearInterval(interval);
  }, []);

  const fetchStats = async () => {
    try {
      console.log('📊 Fetching dashboard stats...');
      const response = await fetch('/api/dashboard/stats');
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Stats API error:', response.status, errorText);
        
        // If it's an auth error, use mock data instead of failing
        if (response.status === 401) {
          console.log('🔄 Using mock data due to auth error');
          setMockData();
          return;
        }
        
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
      }

      const { stats, recentMeetings } = await response.json();
      console.log('✅ Stats fetched successfully:', stats);
      setStats(stats);
      setRecentMeetings(recentMeetings);
      setError(null);
      setRetryCount(0);
    } catch (err) {
      console.error('❌ Error fetching stats:', err);
      setRetryCount(prev => prev + 1);
      
      // After 3 failed attempts, use mock data
      if (retryCount >= 2) {
        console.log('🔄 Using mock data after multiple failures');
        setMockData();
      } else {
        setError(err instanceof Error ? err.message : 'Failed to fetch statistics');
      }
    } finally {
      setLoading(false);
    }
  };

  const setMockData = () => {
    const mockStats = {
      activeMeetings: 0,
      completedMeetings: 0,
      upcomingMeetings: 0,
      totalParticipants: 0
    };
    
    const mockRecentMeetings: RecentMeeting[] = [];
    
    setStats(mockStats);
    setRecentMeetings(mockRecentMeetings);
    setError(null);
    setLoading(false);
  };

  const handleRetry = () => {
    setRetryCount(0);
    setError(null);
    setLoading(true);
    fetchStats();
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('es-ES', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        {[...Array(4)].map((_, i) => (
          <GlowCard key={i} className="p-6 text-center">
            <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-2"></div>
            <div className="text-gray-400">Cargando...</div>
          </GlowCard>
        ))}
      </div>
    );
  }

  if (error && retryCount < 3) {
    return (
      <div className="space-y-6 mb-12">
        <GlowCard className="p-6 text-center">
          <p className="text-red-400 mb-2">Error cargando estadísticas</p>
          <p className="text-sm text-gray-500 mb-4">{error}</p>
          <div className="flex gap-2 justify-center">
            <Button3D variant="glass" onClick={handleRetry} size="sm">
              Reintentar ({retryCount + 1}/3)
            </Button3D>
            <Button3D variant="glass" onClick={setMockData} size="sm">
              Usar datos básicos
            </Button3D>
          </div>
        </GlowCard>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <GlowCard className="p-6 text-center">
          <div className="text-3xl font-bold text-green-400 mb-2">
            {stats.activeMeetings}
          </div>
          <div className="text-gray-400">Reuniones Activas</div>
        </GlowCard>
        
        <GlowCard className="p-6 text-center">
          <div className="text-3xl font-bold text-blue-400 mb-2">
            {stats.upcomingMeetings}
          </div>
          <div className="text-gray-400">Próximas Reuniones</div>
        </GlowCard>
        
        <GlowCard className="p-6 text-center">
          <div className="text-3xl font-bold text-teal-400 mb-2">
            {stats.completedMeetings}
          </div>
          <div className="text-gray-400">Reuniones Completadas</div>
        </GlowCard>
        
        <GlowCard className="p-6 text-center">
          <div className="text-3xl font-bold text-cyan-400 mb-2">
            {stats.totalParticipants}
          </div>
          <div className="text-gray-400">Total Participantes</div>
        </GlowCard>
      </div>

      {/* Recent Activity */}
      {recentMeetings.length > 0 && (
        <GlowCard className="p-6">
          <h3 className="text-lg font-semibold text-blue-400 mb-4">
            Actividad Reciente
          </h3>
          <div className="space-y-3">
            {recentMeetings.slice(0, 3).map((meeting) => {
              const status = calculateMeetingStatus(meeting);
              const statusColor = getStatusColor(status);
              return (
                <div
                  key={meeting.id}
                  className="flex items-center justify-between p-3 bg-gray-800/30 rounded-lg"
                >
                  <div className="flex-1">
                    <div className="font-medium text-white">
                      {meeting.title || `Reunión ${meeting.room_name}`}
                    </div>
                    <div className="text-sm text-gray-400">
                      {formatDateTime(meeting.scheduled_at)}
                    </div>
                  </div>
                  <div className={`text-sm ${statusColor}`}>
                    {status}
                  </div>
                </div>
              );
            })}
          </div>
        </GlowCard>
      )}

      {/* Show info about mock data if being used */}
      {retryCount >= 3 && (
        <GlowCard className="p-4 bg-blue-500/10 border border-blue-500/20">
          <p className="text-sm text-blue-400">
            ℹ️ Mostrando datos básicos. Las estadísticas se actualizarán cuando la conexión mejore.
          </p>
        </GlowCard>
      )}
    </div>
  );
} 