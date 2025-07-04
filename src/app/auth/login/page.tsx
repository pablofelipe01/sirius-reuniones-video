'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase/client';
import { Button3D } from '@/components/ui/Button3D';
import { GlowCard } from '@/components/ui/GlowCard';
import { NeonText } from '@/components/ui/NeonText';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setError(error.message);
        return;
      }

      router.push('/dashboard');
    } catch {
      setError('Error inesperado durante el login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen text-white relative overflow-hidden">
      <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <NeonText className="text-4xl font-bold mb-2">
              Iniciar Sesión
            </NeonText>
            <p className="text-gray-400">
              Accede a tu cuenta de Sirius Regenerative
            </p>
          </div>

          <GlowCard className="p-8">
            <form onSubmit={handleLogin} className="space-y-6">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-4 py-3 bg-black/50 border border-blue-500/30 rounded-lg text-white placeholder-gray-400 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-400/20 transition-all duration-200"
                  placeholder="tu@email.com"
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
                  Contraseña
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full px-4 py-3 bg-black/50 border border-blue-500/30 rounded-lg text-white placeholder-gray-400 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-400/20 transition-all duration-200"
                  placeholder="••••••••"
                />
              </div>

              {error && (
                <div className="p-4 bg-red-900/30 border border-red-500/50 rounded-lg text-red-300 text-sm">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full px-6 py-3 bg-gradient-to-r from-blue-500 to-green-500 text-white font-semibold rounded-lg shadow-lg hover:from-blue-600 hover:to-green-600 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 focus:ring-offset-gray-900 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              >
                {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
              </button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-gray-400">
                ¿No tienes cuenta?{' '}
                <Link href="/auth/signup" className="text-blue-400 hover:text-blue-300 transition-colors">
                  Regístrate aquí
                </Link>
              </p>
            </div>
          </GlowCard>

          <div className="mt-8 text-center">
            <Button3D
              variant="glass"
              onClick={() => router.push('/')}
            >
              Volver al inicio
            </Button3D>
          </div>
        </div>
      </div>
    </div>
  );
} 