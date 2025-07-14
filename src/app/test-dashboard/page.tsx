'use client';

import { useState } from 'react';
import { Button3D } from '@/components/ui/Button3D';
import { GlowCard } from '@/components/ui/GlowCard';
import { useAuth } from '@/hooks/useAuth';

export default function TestDashboardPage() {
  const { user, isAuthenticated } = useAuth();
  const [testResults, setTestResults] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(false);

  const testAuth = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/test-auth');
      const data = await response.json();
      setTestResults(prev => ({ ...prev, auth: data }));
    } catch (error) {
      setTestResults(prev => ({ ...prev, auth: { error: error instanceof Error ? error.message : 'Unknown error' } }));
    }
    setLoading(false);
  };

  const testStats = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/dashboard/stats');
      const data = await response.json();
      setTestResults(prev => ({ ...prev, stats: { status: response.status, data } }));
    } catch (error) {
      setTestResults(prev => ({ ...prev, stats: { error: error instanceof Error ? error.message : 'Unknown error' } }));
    }
    setLoading(false);
  };

  const testMeetings = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/meetings');
      const data = await response.json();
      setTestResults(prev => ({ ...prev, meetings: { status: response.status, data } }));
    } catch (error) {
      setTestResults(prev => ({ ...prev, meetings: { error: error instanceof Error ? error.message : 'Unknown error' } }));
    }
    setLoading(false);
  };

  const clearResults = () => {
    setTestResults(null);
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen text-white flex items-center justify-center">
        <GlowCard className="p-8 text-center">
          <p className="text-gray-400 mb-4">Necesitas estar autenticado para usar esta página</p>
          <Button3D variant="neon" onClick={() => window.location.href = '/auth/login'}>
            Iniciar Sesión
          </Button3D>
        </GlowCard>
      </div>
    );
  }

  return (
    <div className="min-h-screen text-white relative overflow-hidden">
      <div className="relative z-10">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold text-blue-400 mb-8 text-center">
              Test Dashboard APIs
            </h1>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <GlowCard className="p-6">
                <h3 className="text-lg font-semibold text-white mb-4">
                  Información del Usuario
                </h3>
                <div className="text-sm text-gray-400 space-y-2">
                  <p><strong>Email:</strong> {user?.email}</p>
                  <p><strong>ID:</strong> {user?.id}</p>
                  <p><strong>Autenticado:</strong> {isAuthenticated ? 'Sí' : 'No'}</p>
                </div>
              </GlowCard>

              <GlowCard className="p-6">
                <h3 className="text-lg font-semibold text-white mb-4">
                  Acciones de Prueba
                </h3>
                <div className="space-y-3">
                  <Button3D
                    variant="neon"
                    onClick={testAuth}
                    disabled={loading}
                    className="w-full"
                  >
                    Test Auth
                  </Button3D>
                  <Button3D
                    variant="holographic"
                    onClick={testStats}
                    disabled={loading}
                    className="w-full"
                  >
                    Test Stats
                  </Button3D>
                  <Button3D
                    variant="glitch"
                    onClick={testMeetings}
                    disabled={loading}
                    className="w-full"
                  >
                    Test Meetings
                  </Button3D>
                  <Button3D
                    variant="glass"
                    onClick={clearResults}
                    className="w-full"
                  >
                    Clear Results
                  </Button3D>
                </div>
              </GlowCard>
            </div>

            {testResults && (
              <GlowCard className="p-6">
                <h3 className="text-lg font-semibold text-white mb-4">
                  Resultados de las Pruebas
                </h3>
                <div className="bg-gray-900 p-4 rounded-lg overflow-auto">
                  <pre className="text-xs text-gray-300 whitespace-pre-wrap">
                    {JSON.stringify(testResults, null, 2)}
                  </pre>
                </div>
              </GlowCard>
            )}

            <div className="text-center mt-8">
              <Button3D
                variant="glass"
                onClick={() => window.location.href = '/dashboard'}
              >
                ← Volver al Dashboard
              </Button3D>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 