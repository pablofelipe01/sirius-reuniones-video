'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  LiveKitRoom,
  ParticipantTile,
  RoomAudioRenderer,
  ControlBar,
  GridLayout,
  useTracks,
  useParticipants,
  useRoomInfo,
  useLocalParticipant,
  ConnectionStateToast,
  Chat,
  ChatEntry,
  ChatToggle,
} from '@livekit/components-react';
import { Track } from 'livekit-client';
import { Button3D } from '@/components/ui/Button3D';
import { GlowCard } from '@/components/ui/GlowCard';

import '@livekit/components-styles';

interface VideoRoomProps {
  roomName: string;
  participantName: string;
  onDisconnect: () => void;
}

function VideoConference() {
  const tracks = useTracks(
    [
      { source: Track.Source.Camera, withPlaceholder: true },
      { source: Track.Source.ScreenShare, withPlaceholder: false },
    ],
    { onlySubscribed: false },
  );
  
  const participants = useParticipants();
  const roomInfo = useRoomInfo();
  const { localParticipant } = useLocalParticipant();

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="bg-black/50 backdrop-blur-sm border-b border-sirius-blue/20 p-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-sirius-blue">
              🎥 {roomInfo.name}
            </h2>
            <p className="text-sm text-gray-400">
              {participants.length} participante{participants.length !== 1 ? 's' : ''}
            </p>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <span className="w-2 h-2 bg-sirius-green rounded-full animate-pulse"></span>
            En vivo
          </div>
        </div>
      </div>

      {/* Video Grid */}
      <div className="flex-1 relative">
        <GridLayout 
          tracks={tracks}
          style={{
            container: {
              backgroundColor: 'transparent',
              height: '100%',
            }
          }}
        >
          <ParticipantTile />
        </GridLayout>
        
        {/* Overlay effects */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-black/20" />
          <div className="absolute inset-0 bg-grid-pattern opacity-5" />
        </div>
      </div>

      {/* Audio Renderer */}
      <RoomAudioRenderer />
      
      {/* Connection Status */}
      <ConnectionStateToast />
    </div>
  );
}

function RoomControls({ onDisconnect }: { onDisconnect: () => void }) {
  const [showChat, setShowChat] = useState(false);

  return (
    <div className="bg-black/80 backdrop-blur-sm border-t border-sirius-blue/20">
      <div className="flex items-center justify-between p-4">
        {/* Left Controls */}
        <div className="flex items-center gap-2">
          <Button3D
            variant="glass"
            size="sm"
            onClick={onDisconnect}
          >
            🚪 Salir
          </Button3D>
        </div>

        {/* Center Controls */}
        <div className="flex-1 flex justify-center">
          <div className="bg-gray-800/30 rounded-xl p-2">
            <ControlBar 
              style={{
                backgroundColor: 'transparent',
                border: 'none',
              }}
            />
          </div>
        </div>

        {/* Right Controls */}
        <div className="flex items-center gap-2">
          <ChatToggle
            onClick={() => setShowChat(!showChat)}
            style={{
              backgroundColor: showChat ? '#1E90FF' : 'transparent',
              color: showChat ? 'white' : '#1E90FF',
              border: '1px solid #1E90FF',
              borderRadius: '8px',
              padding: '8px 12px',
            }}
          >
            💬 Chat
          </ChatToggle>
        </div>
      </div>

      {/* Chat Panel */}
      {showChat && (
        <div className="border-t border-sirius-blue/20 h-80">
          <Chat
            style={{
              backgroundColor: 'rgba(0, 0, 0, 0.8)',
              color: 'white',
              height: '100%',
            }}
            messageFormatter={(message, participant) => (
              <ChatEntry
                key={message.timestamp}
                entry={message}
                showName={true}
                showTimestamp={true}
                style={{
                  backgroundColor: 'rgba(30, 144, 255, 0.1)',
                  margin: '4px 0',
                  borderRadius: '8px',
                  border: '1px solid rgba(30, 144, 255, 0.2)',
                }}
              />
            )}
          />
        </div>
      )}
    </div>
  );
}

export function VideoRoom({ roomName, participantName, onDisconnect }: VideoRoomProps) {
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    async function generateToken() {
      try {
        setLoading(true);
        
        const response = await fetch('/api/livekit/token', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            roomName,
            participantName,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to get access token');
        }

        const data = await response.json();
        setToken(data.token);
      } catch (err) {
        console.error('Error generating token:', err);
        setError(err instanceof Error ? err.message : 'Failed to join room');
      } finally {
        setLoading(false);
      }
    }

    generateToken();
  }, [roomName, participantName]);

  const handleDisconnect = () => {
    setToken(null);
    onDisconnect();
  };

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-black to-gray-900">
        <GlowCard className="p-8 text-center">
          <div className="w-12 h-12 border-4 border-sirius-blue border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <h3 className="text-xl font-semibold text-sirius-blue mb-2">
            Conectando a la reunión...
          </h3>
          <p className="text-gray-400">
            Generando token de acceso seguro
          </p>
        </GlowCard>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-black to-gray-900">
        <GlowCard className="p-8 text-center border-red-500/20 bg-red-500/5">
          <div className="text-6xl mb-4">❌</div>
          <h3 className="text-xl font-semibold text-red-400 mb-2">
            Error de Conexión
          </h3>
          <p className="text-gray-400 mb-6">
            {error}
          </p>
          <div className="flex gap-4">
            <Button3D
              variant="glass"
              onClick={() => router.push('/meetings')}
            >
              Volver a Reuniones
            </Button3D>
            <Button3D
              variant="neon"
              onClick={() => window.location.reload()}
            >
              Reintentar
            </Button3D>
          </div>
        </GlowCard>
      </div>
    );
  }

  if (!token) {
    return (
      <div className="h-screen flex items-center justify-center">
        <p>No se pudo obtener token de acceso</p>
      </div>
    );
  }

  return (
    <div className="h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
      <LiveKitRoom
        video={true}
        audio={true}
        token={token}
        serverUrl={process.env.NEXT_PUBLIC_LIVEKIT_URL!}
        data-lk-theme="default"
        style={{ height: '100vh' }}
        options={{
          publishDefaults: {
            simulcast: true,
            videoCodec: 'vp9',
          },
        }}
      >
        <div className="h-full flex flex-col">
          <div className="flex-1">
            <VideoConference />
          </div>
          <RoomControls onDisconnect={handleDisconnect} />
        </div>
      </LiveKitRoom>
    </div>
  );
} 