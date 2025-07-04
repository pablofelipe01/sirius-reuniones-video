'use client';

import { useState } from 'react';
import { Button3D } from '@/components/ui/Button3D';
import { GlowCard } from '@/components/ui/GlowCard';
import { NeonText } from '@/components/ui/NeonText';

interface TestResults {
  success: boolean;
  logs: string[];
  stats?: {
    users: number;
    meetings: number;
    participants: number;
    messages: number;
  };
}

interface UserSyncData {
  success: boolean;
  data?: {
    authUsers: Array<{
      id: string;
      email: string;
      fullName: string | null;
      createdAt: string;
      lastSignIn: string | null;
    }>;
    customUsers: Array<{
      id: string;
      email: string;
      fullName: string | null;
      role: string;
      status: string;
      createdAt: string;
    }>;
    stats: {
      total: number;
      active: number;
      admins: number;
    };
    sync: {
      authUsersCount: number;
      customUsersCount: number;
      missingSyncCount: number;
      missingSyncUsers: Array<{
        id: string;
        email: string;
        fullName: string | null;
      }>;
    };
  };
  error?: string;
}

export default function TestDbPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [testResults, setTestResults] = useState<TestResults | null>(null);
  const [isUserSyncLoading, setIsUserSyncLoading] = useState(false);
  const [userSyncData, setUserSyncData] = useState<UserSyncData | null>(null);

  const runTests = async () => {
    setIsLoading(true);
    setTestResults(null);

    try {
      const response = await fetch('/api/test-db', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const results = await response.json();
      setTestResults(results);
    } catch (error) {
      console.error('Error testing database:', error);
      setTestResults({
        success: false,
        logs: ['❌ Error connecting to test API: ' + (error as Error).message]
      });
    } finally {
      setIsLoading(false);
    }
  };

  const testUserSync = async () => {
    setIsUserSyncLoading(true);
    setUserSyncData(null);

    try {
      const response = await fetch('/api/test-users', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const results = await response.json();
      setUserSyncData(results);
    } catch (error) {
      console.error('Error testing user sync:', error);
      setUserSyncData({
        success: false,
        error: 'Error testing user sync: ' + (error as Error).message
      });
    } finally {
      setIsUserSyncLoading(false);
    }
  };

  const forceSync = async () => {
    setIsUserSyncLoading(true);

    try {
      const response = await fetch('/api/test-users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action: 'force-sync' })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const results = await response.json();
      console.log('Force sync results:', results);
      
      // Refresh the sync data
      await testUserSync();
    } catch (error) {
      console.error('Error forcing sync:', error);
      setUserSyncData({
        success: false,
        error: 'Error forcing sync: ' + (error as Error).message
      });
    } finally {
      setIsUserSyncLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-sirius-blue/20 via-sirius-dark-blue/20 to-sirius-green/20"></div>
      
      <div className="relative z-10">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-8">
              <NeonText className="text-4xl font-bold mb-4">
                Database Connection Test
              </NeonText>
              <p className="text-gray-400">
                Verifica que Supabase esté configurado correctamente
              </p>
            </div>

            <div className="text-center mb-8">
              <Button3D
                variant="neon"
                size="lg"
                onClick={runTests}
                disabled={isLoading}
                className="min-w-[200px]"
              >
                {isLoading ? 'Testing...' : 'Run Tests'}
              </Button3D>
            </div>

            {testResults && (
              <GlowCard className="p-6 mb-8">
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-semibold">
                      {testResults.success ? '✅ All Tests Passed' : '❌ Tests Failed'}
                    </span>
                  </div>

                  <div className="bg-black/50 rounded-lg p-4 font-mono text-sm">
                    {testResults.logs.map((log, index) => (
                      <div key={index} className="text-gray-300 mb-1">
                        {log}
                      </div>
                    ))}
                  </div>

                  {testResults.stats && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                      <GlowCard className="p-4 text-center glow-sirius-blue">
                        <div className="text-2xl font-bold text-sirius-blue">
                          {testResults.stats.users}
                        </div>
                        <div className="text-sm text-gray-400">Users</div>
                      </GlowCard>
                      <GlowCard className="p-4 text-center glow-sirius-green">
                        <div className="text-2xl font-bold text-sirius-green">
                          {testResults.stats.meetings}
                        </div>
                        <div className="text-sm text-gray-400">Meetings</div>
                      </GlowCard>
                      <GlowCard className="p-4 text-center glow-sirius-light-blue">
                        <div className="text-2xl font-bold text-sirius-light-blue">
                          {testResults.stats.participants}
                        </div>
                        <div className="text-sm text-gray-400">Participants</div>
                      </GlowCard>
                      <GlowCard className="p-4 text-center glow-sirius-accent">
                        <div className="text-2xl font-bold text-sirius-accent">
                          {testResults.stats.messages}
                        </div>
                        <div className="text-sm text-gray-400">Messages</div>
                      </GlowCard>
                    </div>
                  )}
                </div>
              </GlowCard>
            )}

            {/* User Sync Section */}
            <div className="mt-12">
              <div className="text-center mb-8">
                <NeonText className="text-3xl font-bold mb-4">
                  User Sync Test
                </NeonText>
                <p className="text-gray-400">
                  Verifica la sincronización entre auth.users y tabla users
                </p>
              </div>

              <div className="text-center mb-8 space-x-4">
                <Button3D
                  variant="holographic"
                  size="lg"
                  onClick={testUserSync}
                  disabled={isUserSyncLoading}
                  className="min-w-[200px]"
                >
                  {isUserSyncLoading ? 'Testing...' : 'Test User Sync'}
                </Button3D>
                
                <Button3D
                  variant="glitch"
                  size="lg"
                  onClick={forceSync}
                  disabled={isUserSyncLoading}
                  className="min-w-[200px]"
                >
                  {isUserSyncLoading ? 'Syncing...' : 'Force Sync'}
                </Button3D>
              </div>

              {userSyncData && (
                <GlowCard className="p-6 mb-8">
                  <div className="space-y-6">
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-semibold">
                        {userSyncData.success ? '✅ Sync Status' : '❌ Sync Error'}
                      </span>
                    </div>

                    {userSyncData.error && (
                      <div className="bg-red-900/20 border border-red-500/50 rounded-lg p-4">
                        <p className="text-red-400">{userSyncData.error}</p>
                      </div>
                    )}

                    {userSyncData.data && (
                      <>
                        {/* Sync Status */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <GlowCard className="p-4 text-center glow-sirius-blue">
                            <div className="text-2xl font-bold text-sirius-blue">
                              {userSyncData.data.sync.authUsersCount}
                            </div>
                            <div className="text-sm text-gray-400">Auth Users</div>
                          </GlowCard>
                          <GlowCard className="p-4 text-center glow-sirius-green">
                            <div className="text-2xl font-bold text-sirius-green">
                              {userSyncData.data.sync.customUsersCount}
                            </div>
                            <div className="text-sm text-gray-400">Custom Users</div>
                          </GlowCard>
                          <GlowCard className="p-4 text-center glow-red">
                            <div className="text-2xl font-bold text-red-400">
                              {userSyncData.data.sync.missingSyncCount}
                            </div>
                            <div className="text-sm text-gray-400">Missing Sync</div>
                          </GlowCard>
                        </div>

                        {/* Missing Sync Users */}
                        {userSyncData.data.sync.missingSyncUsers.length > 0 && (
                          <div className="bg-yellow-900/20 border border-yellow-500/50 rounded-lg p-4">
                            <h4 className="text-yellow-400 font-semibold mb-2">
                              ⚠️ Users Not Synced:
                            </h4>
                            <ul className="space-y-1">
                              {userSyncData.data.sync.missingSyncUsers.map(user => (
                                <li key={user.id} className="text-sm text-gray-300">
                                  {user.email} ({user.fullName || 'No name'})
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {/* User Lists */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                          {/* Auth Users */}
                          <div>
                            <h4 className="text-sirius-blue font-semibold mb-3">
                              Authentication Users ({userSyncData.data.authUsers.length})
                            </h4>
                            <div className="bg-black/50 rounded-lg p-4 max-h-64 overflow-y-auto">
                              {userSyncData.data.authUsers.map(user => (
                                <div key={user.id} className="text-sm text-gray-300 mb-2 pb-2 border-b border-gray-700">
                                  <div className="font-medium">{user.email}</div>
                                  <div className="text-xs text-gray-400">
                                    {user.fullName || 'No name'} • {new Date(user.createdAt).toLocaleDateString()}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Custom Users */}
                          <div>
                            <h4 className="text-sirius-green font-semibold mb-3">
                              Custom Users ({userSyncData.data.customUsers.length})
                            </h4>
                            <div className="bg-black/50 rounded-lg p-4 max-h-64 overflow-y-auto">
                              {userSyncData.data.customUsers.map(user => (
                                <div key={user.id} className="text-sm text-gray-300 mb-2 pb-2 border-b border-gray-700">
                                  <div className="font-medium">{user.email}</div>
                                  <div className="text-xs text-gray-400">
                                    {user.fullName || 'No name'} • {user.role} • {user.status}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </GlowCard>
              )}
            </div>

            <div className="text-center">
              <Button3D
                variant="holographic"
                onClick={() => window.location.href = '/'}
              >
                Back to Home
              </Button3D>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 