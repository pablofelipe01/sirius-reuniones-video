'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import { Button3D } from '@/components/ui/Button3D';
import { GlowCard } from '@/components/ui/GlowCard';
import { NeonText } from '@/components/ui/NeonText';

export default function DebugSignupPage() {
  const [email, setEmail] = useState('debug@siriusregenerative.com');
  const [password, setPassword] = useState('123456');
  const [fullName, setFullName] = useState('Debug User');
  const [loading, setLoading] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = (message: string) => {
    setLogs(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const clearLogs = () => {
    setLogs([]);
  };

  const testSignup = async () => {
    setLoading(true);
    clearLogs();

    try {
      addLog('🔄 Iniciando proceso de signup...');
      addLog(`📧 Email: ${email}`);
      addLog(`👤 Nombre: ${fullName}`);
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
        },
      });

      if (error) {
        addLog(`❌ Error en signup: ${error.message}`);
        addLog(`🔍 Error details: ${JSON.stringify(error, null, 2)}`);
        setLoading(false);
        return;
      }

      addLog('✅ Usuario creado en auth.users');
      addLog(`🆔 Auth User ID: ${data.user?.id}`);
      addLog(`📧 Auth User Email: ${data.user?.email}`);

      // Wait a bit and then check if user was created in custom table
      addLog('⏳ Esperando sincronización con tabla personalizada...');
      
      setTimeout(async () => {
        try {
          const { data: userData, error: userError } = await supabase
            .from('users')
            .select('*')
            .eq('email', email)
            .single();

          if (userError) {
            addLog(`❌ Error obteniendo usuario de tabla personalizada: ${userError.message}`);
            addLog(`🔍 Error details: ${JSON.stringify(userError, null, 2)}`);
          } else {
            addLog('✅ Usuario encontrado en tabla personalizada');
            addLog(`🆔 Custom User ID: ${userData.id}`);
            addLog(`📧 Custom User Email: ${userData.email}`);
            addLog(`👤 Custom User Name: ${userData.full_name}`);
            addLog(`🔑 Custom User Role: ${userData.role}`);
            addLog(`📊 Custom User Status: ${userData.status}`);
          }
        } catch (checkError) {
          addLog(`❌ Error inesperado verificando usuario: ${checkError}`);
        }
        setLoading(false);
      }, 3000);

    } catch (error) {
      addLog(`❌ Error inesperado: ${error}`);
      setLoading(false);
    }
  };

  const checkDatabaseTrigger = async () => {
    setLoading(true);
    clearLogs();

    try {
      addLog('🔍 Verificando trigger de base de datos...');
      
      const response = await fetch('/api/test-users', {
        method: 'GET',
      });

      const result = await response.json();
      
      addLog('📊 Resultado de verificación:');
      addLog(`Auth users: ${result.data?.sync?.authUsersCount || 0}`);
      addLog(`Custom users: ${result.data?.sync?.customUsersCount || 0}`);
      addLog(`Missing sync: ${result.data?.sync?.missingSyncCount || 0}`);
      
      if (result.data?.sync?.missingSyncUsers?.length > 0) {
        addLog('⚠️ Usuarios no sincronizados encontrados:');
                 // eslint-disable-next-line @typescript-eslint/no-explicit-any
         result.data.sync.missingSyncUsers.forEach((user: any, index: number) => {
          addLog(`${index + 1}. ${user.email} (${user.fullName || 'Sin nombre'})`);
        });
      }
      
    } catch (error) {
      addLog(`❌ Error verificando trigger: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen text-white relative overflow-hidden">
      <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-4xl">
          <div className="text-center mb-8">
            <NeonText className="text-4xl font-bold mb-2">
              Debug Signup
            </NeonText>
            <p className="text-gray-400">
              Diagnosticar problemas de creación de usuarios
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Panel - Controls */}
            <GlowCard className="p-6">
              <h3 className="text-xl font-semibold mb-4 text-sirius-blue">
                Controles de Prueba
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3 py-2 bg-black/50 border border-sirius-blue/30 rounded text-white focus:border-sirius-blue focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Nombre
                  </label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full px-3 py-2 bg-black/50 border border-sirius-blue/30 rounded text-white focus:border-sirius-blue focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Contraseña
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-3 py-2 bg-black/50 border border-sirius-blue/30 rounded text-white focus:border-sirius-blue focus:outline-none"
                  />
                </div>

                <div className="space-y-2">
                  <Button3D
                    variant="neon"
                    onClick={testSignup}
                    disabled={loading}
                    className="w-full"
                  >
                    {loading ? 'Probando...' : 'Probar Signup'}
                  </Button3D>
                  
                  <Button3D
                    variant="holographic"
                    onClick={checkDatabaseTrigger}
                    disabled={loading}
                    className="w-full"
                  >
                    {loading ? 'Verificando...' : 'Verificar Trigger'}
                  </Button3D>
                  
                  <Button3D
                    variant="glass"
                    onClick={clearLogs}
                    disabled={loading}
                    className="w-full"
                  >
                    Limpiar Logs
                  </Button3D>
                </div>
              </div>
            </GlowCard>

            {/* Right Panel - Logs */}
            <GlowCard className="p-6">
              <h3 className="text-xl font-semibold mb-4 text-sirius-green">
                Logs de Debug ({logs.length})
              </h3>
              
              <div className="bg-black/50 rounded-lg p-4 h-96 overflow-y-auto">
                {logs.length === 0 ? (
                  <div className="text-gray-400 text-center py-8">
                    No hay logs aún. Ejecuta una prueba para ver los resultados.
                  </div>
                ) : (
                  <div className="space-y-1">
                    {logs.map((log, index) => (
                      <div key={index} className="text-sm font-mono text-gray-300">
                        {log}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </GlowCard>
          </div>

          <div className="text-center mt-6">
            <Button3D
              variant="glass"
              onClick={() => window.location.href = '/'}
            >
              Volver al Inicio
            </Button3D>
          </div>
        </div>
      </div>
    </div>
  );
} 