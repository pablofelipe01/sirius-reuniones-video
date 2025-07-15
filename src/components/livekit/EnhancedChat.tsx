'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { 
  useChat,
  useMaybeRoomContext,
  ChatMessage as LiveKitChatMessage,
  useRemoteParticipants,
} from '@livekit/components-react';
import { Button3D } from '@/components/ui/Button3D';
import { useAuth } from '@/hooks/useAuth';

interface ChatMessage {
  id: string;
  meeting_id: string;
  user_id: string;
  message: string;
  message_type: 'text' | 'system' | 'emoji';
  created_at: string;
  updated_at: string;
  email: string;
  full_name: string;
  role: string;
}

interface EnhancedChatProps {
  meetingId?: string;
  className?: string;
  maxHeight?: string;
}

export function EnhancedChat({ 
  meetingId, 
  className = "",
  maxHeight = "320px" 
}: EnhancedChatProps) {
  console.log('💬 EnhancedChat mounting with meetingId:', meetingId);
  
  const { user } = useAuth();
  const room = useMaybeRoomContext();
  const remoteParticipants = useRemoteParticipants();
  
  console.log('💬 EnhancedChat context:', { user: user?.id, room: !!room, meetingId });
  
  // LiveKit chat hooks with error handling
  let chatHookError = null;
  let liveKitMessages: LiveKitChatMessage[] = [];
  let sendLiveKitMessage: ((message: string) => Promise<void>) | undefined = undefined;
  
  try {
    const chatHook = useChat();
    liveKitMessages = chatHook.chatMessages || [];
    sendLiveKitMessage = chatHook.send;
    console.log('✅ LiveKit chat hook initialized successfully');
  } catch (error) {
    chatHookError = error;
    console.error('❌ Error initializing LiveKit chat hook:', error);
  }
  
  // State for persistent messages
  const [persistentMessages, setPersistentMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [initializationError, setInitializationError] = useState<string | null>(null);
  
  // Refs
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const hasLoadedRef = useRef(false);

  // Debug component state
  useEffect(() => {
    console.log('💬 Component state update:', {
      meetingId,
      user: user?.id,
      room: !!room,
      hasAuth: !!user,
      persistentMessages: persistentMessages.length,
      liveKitMessages: liveKitMessages.length,
      chatHookError: !!chatHookError,
      loadingHistory,
      error
    });
  }, [meetingId, user, room, persistentMessages.length, liveKitMessages.length, chatHookError, loadingHistory, error]);

  // Validate required dependencies
  useEffect(() => {
    if (chatHookError) {
      setInitializationError('Error inicializando LiveKit chat: ' + chatHookError);
      return;
    }

    if (!meetingId) {
      setInitializationError('ID de reunión no proporcionado');
      return;
    }

    if (!user) {
      setInitializationError('Usuario no autenticado');
      return;
    }

    if (!room) {
      console.warn('⚠️ Room context not available yet');
      // Don't set error, room might not be available initially
    }

    setInitializationError(null);
  }, [chatHookError, meetingId, user, room]);
  
  // Load message history on mount
  const loadMessageHistory = useCallback(async () => {
    if (!meetingId || initializationError) {
      console.log('💬 loadMessageHistory: skipping due to missing requirements');
      setLoadingHistory(false);
      return;
    }
    
    console.log('💬 Loading chat history for meetingId:', meetingId);
    
    try {
      setLoadingHistory(true);
      setError(null);
      
      console.log('💬 Making request to:', `/api/meetings/${meetingId}/messages?limit=100`);
      
      const response = await fetch(`/api/meetings/${meetingId}/messages?limit=100`);
      
      console.log('💬 Response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('💬 Response error:', errorText);
        throw new Error(`Failed to load message history: ${response.status} - ${errorText}`);
      }
      
      const data = await response.json();
      console.log('💬 Messages loaded:', data.messages?.length || 0);
      setPersistentMessages(data.messages || []);
    } catch (err) {
      console.error('💬 Error loading message history:', err);
      setError('Error cargando historial de mensajes: ' + (err instanceof Error ? err.message : 'Error desconocido'));
    } finally {
      setLoadingHistory(false);
      hasLoadedRef.current = true;
    }
  }, [meetingId, initializationError]);

  // Load message history on mount - only once per meetingId
  useEffect(() => {
    console.log('💬 useEffect triggered, meetingId:', meetingId, 'hasLoaded:', hasLoadedRef.current, 'initError:', initializationError);
    
    if (meetingId && !hasLoadedRef.current && !initializationError) {
      console.log('💬 Calling loadMessageHistory...');
      loadMessageHistory();
    }
  }, [meetingId, initializationError, loadMessageHistory]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    scrollToBottom();
  }, [persistentMessages, liveKitMessages]);

  // Listen for new LiveKit messages and save them
  useEffect(() => {
    if (liveKitMessages.length > 0 && meetingId) {
      const latestMessage = liveKitMessages[liveKitMessages.length - 1];
      
      // Check if this message is not from the current user to avoid duplicates
      if (latestMessage.from?.identity !== user?.id) {
        console.log('💬 New LiveKit message received, saving to database:', latestMessage);
        saveLiveKitMessageToDatabase(latestMessage);
      }
    }
  }, [liveKitMessages, meetingId, user?.id]);

  const saveLiveKitMessageToDatabase = async (liveKitMessage: LiveKitChatMessage) => {
    if (!meetingId || !liveKitMessage.message) return;
    
    try {
      console.log('💬 Saving LiveKit message to database:', liveKitMessage.message);
      
      const response = await fetch(`/api/meetings/${meetingId}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: liveKitMessage.message,
          messageType: 'text'
        }),
      });

      if (response.ok) {
        const data = await response.json();
        // Add the new message to our persistent messages
        setPersistentMessages(prev => [...prev, data.message]);
        console.log('✅ LiveKit message saved to database');
      } else {
        console.error('❌ Failed to save LiveKit message:', await response.text());
      }
    } catch (err) {
      console.error('❌ Error saving message to database:', err);
    }
  };

  const saveMessageToDatabase = async (message: string) => {
    if (!meetingId || !message.trim()) return null;
    
    try {
      console.log('💬 Saving message to database:', message);
      
      const response = await fetch(`/api/meetings/${meetingId}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: message.trim(),
          messageType: 'text'
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Failed to save message:', errorText);
        throw new Error(`Failed to save message: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      console.log('✅ Message saved to database');
      return data.message;
    } catch (err) {
      console.error('❌ Error saving message:', err);
      throw err;
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || loading) {
      console.log('💬 Send message blocked: empty message or loading');
      return;
    }
    
    const messageToSend = newMessage.trim();
    setNewMessage('');
    setLoading(true);
    setError(null);
    
    console.log('💬 Sending message:', messageToSend);
    
    try {
      // Send via LiveKit for real-time delivery (if available)
      if (room && sendLiveKitMessage) {
        console.log('💬 Sending via LiveKit...');
        await sendLiveKitMessage(messageToSend);
        console.log('✅ Message sent via LiveKit');
      } else {
        console.warn('⚠️ LiveKit not available, sending only to database');
      }
      
      // Save to database for persistence
      if (meetingId) {
        console.log('💬 Saving to database...');
        const savedMessage = await saveMessageToDatabase(messageToSend);
        if (savedMessage) {
          setPersistentMessages(prev => [...prev, savedMessage]);
          console.log('✅ Message saved to database and added to state');
        }
      }
    } catch (err) {
      console.error('❌ Error sending message:', err);
      setError('Error enviando mensaje: ' + (err instanceof Error ? err.message : 'Error desconocido'));
      setNewMessage(messageToSend); // Restore message on error
    } finally {
      setLoading(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('es-CO', {
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'America/Bogota'
    });
  };

  const getParticipantName = (participantId: string) => {
    if (participantId === user?.id) return 'Tú';
    
    const participant = remoteParticipants.find(p => p.identity === participantId);
    return participant?.name || participant?.identity || 'Participante';
  };

  // Combine and sort all messages
  const allMessages = [
    ...persistentMessages.map(msg => ({
      id: msg.id,
      message: msg.message,
      timestamp: msg.created_at,
      from: {
        identity: msg.user_id,
        name: msg.full_name
      },
      source: 'database' as const
    })),
    ...liveKitMessages.map((msg, index) => ({
      id: `livekit-${index}`,
      message: msg.message,
      timestamp: new Date(msg.timestamp).toISOString(),
      from: msg.from,
      source: 'livekit' as const
    }))
  ].sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

  // Remove duplicates (messages that appear in both sources)
  const uniqueMessages = allMessages.filter((msg, index, arr) => {
    if (msg.source === 'database') return true;
    
    // For LiveKit messages, check if there's a similar database message
    const dbMessage = arr.find(m => 
      m.source === 'database' && 
      m.message === msg.message &&
      m.from?.identity === msg.from?.identity &&
      Math.abs(new Date(m.timestamp).getTime() - new Date(msg.timestamp).getTime()) < 5000 // 5 second tolerance
    );
    
    return !dbMessage;
  });

  // Show initialization error
  if (initializationError) {
    return (
      <div className={`flex flex-col bg-black/80 backdrop-blur-sm ${className}`} style={{ height: maxHeight }}>
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="text-center">
            <div className="text-red-400 text-2xl mb-2">❌</div>
            <p className="text-red-400 text-sm font-medium mb-2">Error en el Chat</p>
            <p className="text-gray-400 text-xs">{initializationError}</p>
          </div>
        </div>
      </div>
    );
  }

  if (loadingHistory) {
    return (
      <div className={`flex flex-col bg-black/80 backdrop-blur-sm ${className}`} style={{ height: maxHeight }}>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
            <p className="text-gray-400 text-sm">Cargando historial...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex flex-col bg-black/80 backdrop-blur-sm border-t border-sirius-blue/20 ${className}`} style={{ height: maxHeight }}>
      {/* Chat Header */}
      <div className="border-b border-gray-700/50 px-4 py-2 bg-gray-900/50">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-white">💬 Chat</h3>
          <div className="flex items-center gap-3 text-xs text-gray-400">
            <span>{uniqueMessages.length} mensaje{uniqueMessages.length !== 1 ? 's' : ''}</span>
            <div className="flex items-center gap-1">
              {room ? (
                <>
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <span>Conectado</span>
                </>
              ) : (
                <>
                  <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                  <span>DB Solo</span>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Messages Container */}
      <div 
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto p-4 space-y-3"
        style={{ maxHeight: `calc(${maxHeight} - 120px)` }}
      >
        {uniqueMessages.length === 0 ? (
          <div className="text-center text-gray-400 text-sm py-4">
            No hay mensajes aún. ¡Inicia la conversación!
          </div>
        ) :
          uniqueMessages.map((msg) => {
            const isOwnMessage = msg.from?.identity === user?.id;
            const senderName = isOwnMessage 
              ? 'Tú' 
              : msg.from?.name || getParticipantName(msg.from?.identity || '');
            
            return (
              <div key={msg.id} className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] ${isOwnMessage ? 'bg-sirius-blue/20 border-sirius-blue/30' : 'bg-gray-800/50 border-gray-600/50'} border rounded-lg p-3`}>
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-xs font-medium ${isOwnMessage ? 'text-sirius-light-blue' : 'text-gray-300'}`}>
                      {senderName}
                    </span>
                    <span className="text-xs text-gray-500">
                      {formatTimestamp(msg.timestamp)}
                    </span>
                    {msg.source === 'livekit' && (
                      <span className="text-xs text-green-400">RT</span>
                    )}
                  </div>
                  <div className="text-sm text-white break-words">
                    {msg.message}
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="border-t border-gray-700/50 p-4 bg-gray-900/50">
        {error && (
          <div className="mb-2 text-red-400 text-xs">
            ❌ {error}
          </div>
        )}
        
        <div className="flex gap-2">
          <input
            ref={inputRef}
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder={room ? "Escribe un mensaje..." : "Chat solo por base de datos..."}
            className="flex-1 bg-gray-800/50 border border-gray-600 rounded px-3 py-2 text-white placeholder-gray-400 text-sm focus:border-sirius-blue focus:outline-none"
            onKeyPress={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
            disabled={loading}
            maxLength={2000}
          />
          <Button3D
            variant="neon"
            size="sm"
            onClick={handleSendMessage}
            disabled={!newMessage.trim() || loading}
          >
            {loading ? '⏳' : '📤'}
          </Button3D>
        </div>
        
        <div className="flex justify-between items-center mt-2 text-xs text-gray-500">
          <span>
            {room ? '🟢 LiveKit + DB' : '🟡 Solo Base de Datos'}
          </span>
          <span>
            {newMessage.length}/2000
          </span>
        </div>
      </div>
    </div>
  );
} 