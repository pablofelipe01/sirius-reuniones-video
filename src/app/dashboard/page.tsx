'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { Button3D } from '@/components/ui/Button3D';
import { GlowCard } from '@/components/ui/GlowCard';
import { NeonText } from '@/components/ui/NeonText';
import { DashboardStats } from '@/components/dashboard/DashboardStats';
import { CreateMeetingForm } from '@/components/dashboard/CreateMeetingForm';
import { MeetingsList } from '@/components/dashboard/MeetingsList';

type ViewMode = 'dashboard' | 'create-meeting' | 'meetings-list';

export default function DashboardPage() {
  const { user, loading, signOut, isAuthenticated } = useAuth();
  const router = useRouter();
  const [currentView, setCurrentView] = useState<ViewMode>('dashboard');

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/auth/login');
    }
  }, [loading, isAuthenticated, router]);

  if (loading) {
    return (
      <div className="min-h-screen text-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Cargando...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  const handleSignOut = async () => {
    await signOut();
    router.push('/');
  };

  const handleMeetingCreated = () => {
    // Meeting created successfully, go back to dashboard
    setCurrentView('dashboard');
    // Could add a toast notification here
  };

  const renderContent = () => {
    switch (currentView) {
      case 'create-meeting':
        return (
          <CreateMeetingForm
            onMeetingCreated={handleMeetingCreated}
            onCancel={() => setCurrentView('dashboard')}
          />
        );
      case 'meetings-list':
        return (
          <div>
            <div className="flex justify-between items-center mb-6">
              <Button3D
                variant="glass"
                onClick={() => setCurrentView('dashboard')}
              >
                ← Volver al Dashboard
              </Button3D>
              <Button3D
                variant="neon"
                onClick={() => setCurrentView('create-meeting')}
              >
                + Nueva Reunión
              </Button3D>
            </div>
            <MeetingsList />
          </div>
        );
      default:
        return (
          <div>
            <div className="text-center mb-12">
              <NeonText className="text-5xl font-bold mb-4">
                Dashboard
              </NeonText>
              <p className="text-gray-400 text-lg">
                Bienvenido al centro de control de Sirius Regenerative
              </p>
            </div>

            {/* Real Dashboard Statistics */}
            <div className="mb-12">
              <DashboardStats />
            </div>

            {/* Action Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <GlowCard className="p-8">
                <h3 className="text-xl font-bold text-blue-400 mb-4">
                  Nueva Reunión
                </h3>
                <p className="text-gray-400 mb-6">
                  Crear una nueva reunión virtual con IA integrada
                </p>
                <Button3D
                  variant="neon"
                  className="w-full"
                  onClick={() => setCurrentView('create-meeting')}
                >
                  Crear Reunión
                </Button3D>
              </GlowCard>

              <GlowCard className="p-8">
                <h3 className="text-xl font-bold text-green-400 mb-4">
                  Mis Reuniones
                </h3>
                <p className="text-gray-400 mb-6">
                  Ver y gestionar todas tus reuniones
                </p>
                <Button3D
                  variant="holographic"
                  className="w-full"
                  onClick={() => setCurrentView('meetings-list')}
                >
                  Ver Reuniones
                </Button3D>
              </GlowCard>

              <GlowCard className="p-8 border-sirius-blue/20 bg-sirius-blue/5">
                <h3 className="text-xl font-bold text-sirius-blue mb-4">
                  🎥 Centro de Reuniones
                </h3>
                <p className="text-gray-400 mb-6">
                  Experiencia completa de gestión de reuniones
                </p>
                <Button3D
                  variant="neon"
                  className="w-full"
                  onClick={() => router.push('/meetings')}
                >
                  Ir al Centro
                </Button3D>
              </GlowCard>

              <GlowCard className="p-8">
                <h3 className="text-xl font-bold text-teal-400 mb-4">
                  Configuración
                </h3>
                <p className="text-gray-400 mb-6">
                  Gestionar tu perfil y preferencias
                </p>
                <Button3D
                  variant="glass"
                  className="w-full"
                  onClick={() => {
                    // TODO: Implement settings
                    alert('Funcionalidad de configuración próximamente');
                  }}
                >
                  Configurar
                </Button3D>
              </GlowCard>
            </div>
            
            {/* Debug/Test Section */}
            <div className="mt-8 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
              <h3 className="text-yellow-400 font-bold mb-2">🔧 Debug & Test</h3>
              <p className="text-yellow-300 mb-4">
                Utiliza esta página para probar las estadísticas con admin privileges (bypassing RLS)
              </p>
              <Button3D 
                variant="glass" 
                onClick={() => router.push('/dashboard/test-admin')}
              >
                Probar Admin Stats
              </Button3D>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen text-white relative overflow-hidden">
      <div className="relative z-10">
        {/* Header */}
        <header className="border-b border-gray-800 bg-black/50 backdrop-blur-sm">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <h1 className="text-xl font-bold text-blue-400">Sirius Regenerative</h1>
                {currentView !== 'dashboard' && (
                  <span className="text-gray-400">
                    {currentView === 'create-meeting' ? 'Nueva Reunión' : 'Mis Reuniones'}
                  </span>
                )}
              </div>
              <div className="flex items-center space-x-4">
                <span className="text-gray-400">
                  Hola, {user?.user_metadata?.full_name || user?.email}
                </span>
                <Button3D
                  variant="glass"
                  onClick={handleSignOut}
                >
                  Cerrar Sesión
                </Button3D>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="container mx-auto px-4 py-8">
          <div className="max-w-6xl mx-auto">
            {renderContent()}
          </div>
        </main>
      </div>
    </div>
  );
} 