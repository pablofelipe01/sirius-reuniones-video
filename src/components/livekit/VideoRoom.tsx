'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  LiveKitRoom,
  GridLayout,
  ParticipantTile,
  ControlBar,
  useConnectionState,
  useTracks,
  useParticipants,
  RoomAudioRenderer,
  TrackLoop,
  useLocalParticipant,
} from '@livekit/components-react';
import '@livekit/components-styles';
import { Track } from 'livekit-client';
import { Button3D } from '@/components/ui/Button3D';
import { GlowCard } from '@/components/ui/GlowCard';
import { EnhancedChat } from './EnhancedChat';
import { SimpleWhiteboard } from '@/components/whiteboard/SimpleWhiteboard';

interface VideoRoomProps {
  roomName: string;
  participantName: string;
  onDisconnect: () => void;
  meetingId?: string;
  isHost?: boolean;
  isGuest?: boolean; // Para invitados sin autenticación
}

function CustomConnectionStateToast() {
  const connectionState = useConnectionState();
  
  // Only show if not connected
  if (connectionState === 'connected') {
    return null;
  }

  const getConnectionMessage = () => {
    switch (connectionState) {
      case 'connecting':
        return '🔄 Conectando...';
      case 'reconnecting':
        return '🔄 Reconectando...';
      case 'disconnected':
        return '❌ Desconectado';
      default:
        return '⏳ Iniciando...';
    }
  };

  return (
    <div className="fixed top-4 right-4 z-50">
      <div className="bg-gray-900/90 backdrop-blur-sm border border-sirius-blue/30 rounded-lg px-4 py-2 text-sirius-light-blue">
        {getConnectionMessage()}
      </div>
    </div>
  );
}

function OptimizedVideoConference() {
  const tracks = useTracks(
    [
      { source: Track.Source.Camera, withPlaceholder: true },
      { source: Track.Source.ScreenShare, withPlaceholder: false },
    ],
    { onlySubscribed: false },
  );

  const participants = useParticipants();

  return (
    <div className="relative h-full w-full">
      <GridLayout 
        tracks={tracks}
        style={{ 
          height: '100%',
          '--lk-bg': 'transparent',
          '--lk-fg': '#ffffff',
        }}
      >
        <TrackLoop>
          <ParticipantTile />
        </TrackLoop>
      </GridLayout>
      
      {/* Audio rendering for all participants */}
      <RoomAudioRenderer />
      
      {/* Connection status overlay */}
      <CustomConnectionStateToast />
    </div>
  );
}

function RoomControls({ 
  onDisconnect, 
  onEndMeeting, 
  isHost,
  meetingId 
}: { 
  onDisconnect: () => void;
  onEndMeeting?: () => void;
  isHost?: boolean;
  meetingId?: string;
}) {
  const [showChat, setShowChat] = useState(false);
  const [showWhiteboard, setShowWhiteboard] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingLoading, setRecordingLoading] = useState(false);

  const handleStartRecording = async () => {
    if (!meetingId || !isHost) return;
    
    setRecordingLoading(true);
    try {
      const response = await fetch(`/api/meetings/${meetingId}/recording`, {
        method: 'POST',
      });
      
      if (response.ok) {
        setIsRecording(true);
        console.log('✅ Recording started');
      } else {
        const error = await response.json();
        console.error('❌ Failed to start recording:', error);
      }
    } catch (error) {
      console.error('❌ Recording error:', error);
    } finally {
      setRecordingLoading(false);
    }
  };

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
          {isHost && onEndMeeting && (
            <Button3D
              variant="neon"
              size="sm"
              onClick={onEndMeeting}
              className="bg-red-600/20 hover:bg-red-600/30 border-red-500/50"
            >
              🔚 Terminar Reunión
            </Button3D>
          )}
        </div>

        {/* Center Controls - Native LiveKit ControlBar */}
        <div className="flex-1 flex justify-center">
          <div className="bg-gray-800/30 rounded-xl p-2">
            <ControlBar 
              variation="minimal"
              controls={{
                microphone: true,
                camera: true,
                screenShare: true,
                chat: false, // We'll handle chat separately
                leave: false, // We have our own leave button
              }}
              style={{
                backgroundColor: 'transparent',
                border: 'none',
              }}
            />
          </div>
        </div>

        {/* Right Controls */}
        <div className="flex items-center gap-2">
          <Button3D
            variant={showChat ? "neon" : "glass"}
            size="sm"
            onClick={() => setShowChat(!showChat)}
          >
            💬 Chat {showChat && "✓"}
          </Button3D>
          
          <Button3D
            variant={showWhiteboard ? "neon" : "glass"}
            size="sm"
            onClick={() => setShowWhiteboard(!showWhiteboard)}
            className={showWhiteboard ? "ring-2 ring-sirius-blue" : ""}
          >
            🎨 Pizarra {showWhiteboard && "✓"}
          </Button3D>

          {isHost && (
            <Button3D
              variant={isRecording ? "neon" : "glass"}
              size="sm"
              onClick={handleStartRecording}
              disabled={recordingLoading || isRecording}
              className={isRecording ? "ring-2 ring-red-500" : ""}
            >
              {recordingLoading ? '⏳' : isRecording ? '🔴 Grabando' : '📹 Grabar'}
            </Button3D>
          )}
        </div>
      </div>

      {/* Enhanced Chat Panel */}
      {showChat && (
        <EnhancedChat
          meetingId={meetingId}
          maxHeight="400px"
          className="border-t border-sirius-blue/20"
        />
      )}

      {/* Collaborative Whiteboard */}
      {showWhiteboard && meetingId && (
        <SimpleWhiteboard 
          meetingId={meetingId}
          isHost={isHost}
          onClose={() => setShowWhiteboard(false)}
        />
      )}

    </div>
  );
}

export function VideoRoom({ roomName, participantName, onDisconnect, meetingId, isHost, isGuest = false }: VideoRoomProps) {
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [endingMeeting, setEndingMeeting] = useState(false);
  const isGeneratingToken = useRef(false);
  const router = useRouter();

  // TODO: Usar isGuest para permisos diferenciados
  console.log('VideoRoom isGuest:', isGuest);

  useEffect(() => {
    // Prevent multiple token generation requests
    if (!roomName || !participantName || isGeneratingToken.current || token) {
      return;
    }

    async function generateToken() {
      if (isGeneratingToken.current) {
        console.log('🚫 Token generation already in progress, skipping...');
        return;
      }

      try {
        isGeneratingToken.current = true;
        setLoading(true);
        setError(null);
        
        console.log('🎫 Generating token for room:', roomName, 'participant:', participantName, 'isGuest:', isGuest);
        
        // Use different API endpoint for guests
        const tokenEndpoint = isGuest ? '/api/livekit/guest-token' : '/api/livekit/token';
        
        const response = await fetch(tokenEndpoint, {
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
        console.log('✅ Token generated successfully');
        setToken(data.token);
      } catch (err) {
        console.error('❌ Error generating token:', err);
        setError(err instanceof Error ? err.message : 'Failed to join room');
      } finally {
        setLoading(false);
        isGeneratingToken.current = false;
      }
    }

    generateToken();
  }, [roomName, participantName, token]);

  const handleDisconnect = () => {
    console.log('🚪 Disconnecting from room...');
    setToken(null);
    isGeneratingToken.current = false;
    onDisconnect();
  };

  const handleEndMeeting = async () => {
    if (!meetingId) {
      console.error('No meeting ID provided');
      return;
    }

    const confirmEnd = window.confirm('¿Estás seguro de que quieres terminar esta reunión? Todos los participantes serán desconectados.');
    
    if (!confirmEnd) return;

    try {
      setEndingMeeting(true);
      
      const response = await fetch(`/api/meetings/${meetingId}/end`, {
        method: 'POST',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to end meeting');
      }

      console.log('✅ Meeting ended successfully');
      
      // Disconnect and redirect
      handleDisconnect();
    } catch (err) {
      console.error('Error ending meeting:', err);
      alert('Error al terminar la reunión: ' + (err instanceof Error ? err.message : 'Error desconocido'));
    } finally {
      setEndingMeeting(false);
    }
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
          <div className="mt-4 text-xs text-gray-500">
            Sala: {roomName} | Participante: {participantName}
          </div>
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
              onClick={() => {
                // Reset states and try again
                setError(null);
                setToken(null);
                isGeneratingToken.current = false;
              }}
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
      <div className="h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-black to-gray-900">
        <GlowCard className="p-8 text-center">
          <div className="text-6xl mb-4">⏳</div>
          <h3 className="text-xl font-semibold text-yellow-400 mb-2">
            Token no disponible
          </h3>
          <p className="text-gray-400 mb-6">
            No se pudo obtener token de acceso
          </p>
          <Button3D
            variant="neon"
            onClick={() => {
              setError(null);
              setToken(null);
              isGeneratingToken.current = false;
            }}
          >
            Reintentar
          </Button3D>
        </GlowCard>
      </div>
    );
  }

  if (endingMeeting) {
    return (
      <div className="h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-black to-gray-900">
        <GlowCard className="p-8 text-center">
          <div className="w-12 h-12 border-4 border-red-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <h3 className="text-xl font-semibold text-red-400 mb-2">
            Terminando reunión...
          </h3>
          <p className="text-gray-400">
            Desconectando a todos los participantes
          </p>
        </GlowCard>
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
          // Optimize for multiple participants
          adaptiveStream: true,
          dynacast: true,
          publishDefaults: {
            simulcast: true,
            videoCodec: 'vp9',
            videoEncoding: {
              maxBitrate: 1_500_000,
              maxFramerate: 30,
            },
            videoSimulcastLayers: [
              {
                width: 1280,
                height: 720,
                encoding: {
                  maxBitrate: 1_200_000,
                  maxFramerate: 30,
                },
              },
              {
                width: 640,
                height: 360,
                encoding: {
                  maxBitrate: 500_000,
                  maxFramerate: 20,
                },
              },
              {
                width: 320,
                height: 180,
                encoding: {
                  maxBitrate: 150_000,
                  maxFramerate: 15,
                },
              },
            ],
          },
          // Optimize video capture for conferences
          videoCaptureDefaults: {
            resolution: {
              width: 1280,
              height: 720,
              frameRate: 30,
            },
          },
        }}
        onDisconnected={() => {
          console.log('Disconnected from room');
          handleDisconnect();
        }}
      >
        {/* Main room content with optimized layout */}
        <div className="h-full flex flex-col">
          <div className="flex-1 overflow-hidden">
            <OptimizedVideoConference />
          </div>
          <RoomControls 
            onDisconnect={handleDisconnect} 
            onEndMeeting={isHost ? handleEndMeeting : undefined}
            isHost={isHost}
            meetingId={meetingId}
          />
        </div>
      </LiveKitRoom>
    </div>
  );
} 