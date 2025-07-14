'use client';

import { useEffect, useState } from 'react';
import { Button3D } from '@/components/ui/Button3D';
import { GlowCard } from '@/components/ui/GlowCard';
import { NeonText } from '@/components/ui/NeonText';

interface Meeting {
  id: string;
  title: string;
  description: string | null;
  room_name: string;
  host_id: string;
  scheduled_at: string;
  created_at: string;
}

interface MeetingSuccessModalProps {
  meeting: Meeting;
  roomCode: string;
  joinUrl: string;
  onClose: () => void;
  onViewMeetings: () => void;
}

interface Participant {
  id: string;
  user_id: string | null;
  guest_name: string | null;
  joined_at: string;
  users?: {
    full_name: string | null;
    email: string;
    avatar_url: string | null;
  };
}

export function MeetingSuccessModal({ 
  meeting, 
  roomCode, 
  joinUrl, 
  onClose, 
  onViewMeetings 
}: MeetingSuccessModalProps) {
  const [activeTab, setActiveTab] = useState<'details' | 'invite'>('details');
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [loadingParticipants, setLoadingParticipants] = useState(false);
  const [emailInvite, setEmailInvite] = useState('');
  const [inviteError, setInviteError] = useState<string | null>(null);
  const [inviteSuccess, setInviteSuccess] = useState<string | null>(null);
  const [sendingInvite, setSendingInvite] = useState(false);

  useEffect(() => {
    // Block scroll when modal is open
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  useEffect(() => {
    if (activeTab === 'invite') {
      fetchParticipants();
    }
  }, [activeTab]);

  const fetchParticipants = async () => {
    try {
      setLoadingParticipants(true);
      const response = await fetch(`/api/meetings/${meeting.id}/participants`);
      
      if (response.ok) {
        const { participants } = await response.json();
        setParticipants(participants || []);
      }
    } catch (error) {
      console.error('Error fetching participants:', error);
    } finally {
      setLoadingParticipants(false);
    }
  };

  const formatDateTime = (dateTime: string) => {
    try {
      return new Date(dateTime).toLocaleString('es-CO', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        timeZone: 'America/Bogota'
      });
    } catch {
      return dateTime;
    }
  };

  const copyToClipboard = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      alert(`${label} copiado al portapapeles`);
    } catch (error) {
      console.error('Error copying to clipboard:', error);
      alert(`Error al copiar ${label.toLowerCase()}`);
    }
  };

  const sendEmailInvite = async () => {
    if (!emailInvite.trim()) {
      setInviteError('Por favor ingresa un email válido');
      return;
    }

    try {
      setSendingInvite(true);
      setInviteError(null);
      setInviteSuccess(null);

      // First, check if user exists in the system
      const checkUserResponse = await fetch('/api/users/check', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: emailInvite.trim() }),
      });

      if (checkUserResponse.ok) {
        const { user } = await checkUserResponse.json();
        
        if (user) {
          // Add user as participant
          const addParticipantResponse = await fetch(`/api/meetings/${meeting.id}/participants`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ user_id: user.id }),
          });

          if (addParticipantResponse.ok) {
            setInviteSuccess(`Usuario ${emailInvite} agregado exitosamente`);
            setEmailInvite('');
            fetchParticipants(); // Refresh participant list
          } else {
            const errorData = await addParticipantResponse.json();
            setInviteError(errorData.error || 'Error al agregar participante');
          }
        } else {
          setInviteError('Usuario no encontrado en el sistema. Deben registrarse primero.');
        }
      } else {
        setInviteError('Error al verificar el usuario');
      }
    } catch (error) {
      console.error('Error sending invite:', error);
      setInviteError('Error al enviar la invitación');
    } finally {
      setSendingInvite(false);
    }
  };

  const shareViaWhatsApp = () => {
    const message = `🚀 Te invito a la reunión "${meeting.title}"

📅 Fecha: ${formatDateTime(meeting.scheduled_at)}
🔑 Código: ${roomCode}
🔗 Enlace: ${joinUrl}

¡Nos vemos ahí!`;
    
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  const shareViaEmail = () => {
    const subject = `Invitación a reunión: ${meeting.title}`;
    const body = `Hola,

Te invito a la reunión "${meeting.title}"

📅 Fecha y hora: ${formatDateTime(meeting.scheduled_at)}
🔑 Código de sala: ${roomCode}
🔗 Enlace directo: ${joinUrl}

${meeting.description ? `\nDescripción: ${meeting.description}` : ''}

Para unirte:
1. Haz clic en el enlace directo
2. O ve a la plataforma y usa el código: ${roomCode}

¡Nos vemos en la reunión!

Saludos`;
    
    const mailtoUrl = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.open(mailtoUrl);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-gray-900/95 border border-sirius-blue/30 rounded-lg p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="text-center mb-6">
          <div className="text-6xl mb-4">🎉</div>
          <NeonText color="#00D4AA" className="text-2xl font-bold">
            ¡Reunión Creada Exitosamente!
          </NeonText>
        </div>

        {/* Tabs */}
        <div className="flex mb-6 border-b border-gray-700">
          <button
            onClick={() => setActiveTab('details')}
            className={`px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === 'details'
                ? 'text-sirius-blue border-b-2 border-sirius-blue'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            📋 Detalles
          </button>
          <button
            onClick={() => setActiveTab('invite')}
            className={`px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === 'invite'
                ? 'text-sirius-blue border-b-2 border-sirius-blue'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            👥 Invitar Participantes
          </button>
        </div>

        {activeTab === 'details' && (
          <div className="space-y-6">
            {/* Meeting Details */}
            <GlowCard className="p-6">
              <h3 className="text-xl font-semibold text-white mb-4">{meeting.title}</h3>
              {meeting.description && (
                <p className="text-gray-400 mb-4">{meeting.description}</p>
              )}
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-400">📅 Fecha:</span>
                  <p className="text-white font-medium">{formatDateTime(meeting.scheduled_at)}</p>
                </div>
                <div>
                  <span className="text-gray-400">🔑 Código de sala:</span>
                  <div className="flex items-center gap-2">
                    <p className="text-sirius-green font-mono font-bold">{roomCode}</p>
                    <Button3D
                      variant="glass"
                      size="sm"
                      onClick={() => copyToClipboard(roomCode, 'Código')}
                    >
                      📋
                    </Button3D>
                  </div>
                </div>
              </div>
            </GlowCard>

            {/* Join URL */}
            <GlowCard className="p-6">
              <h4 className="text-lg font-semibold text-sirius-light-blue mb-3">
                🔗 Enlace de Invitación
              </h4>
              <div className="bg-gray-800/50 p-3 rounded border border-gray-700 mb-4">
                <p className="text-sm text-gray-300 break-all font-mono">{joinUrl}</p>
              </div>
              <div className="flex gap-2 flex-wrap">
                <Button3D
                  variant="neon"
                  size="sm"
                  onClick={() => copyToClipboard(joinUrl, 'Enlace')}
                >
                  📋 Copiar enlace
                </Button3D>
                <Button3D
                  variant="holographic"
                  size="sm"
                  onClick={shareViaWhatsApp}
                >
                  📱 WhatsApp
                </Button3D>
                <Button3D
                  variant="glass"
                  size="sm"
                  onClick={shareViaEmail}
                >
                  📧 Email
                </Button3D>
              </div>
            </GlowCard>

            {/* Actions */}
            <div className="flex gap-4">
              <Button3D
                variant="glass"
                onClick={onViewMeetings}
                className="flex-1"
              >
                📅 Ver Reuniones
              </Button3D>
              <Button3D
                variant="neon"
                onClick={() => window.open(`/room/${roomCode}`, '_blank')}
                className="flex-1"
              >
                🚀 Ir a la Reunión
              </Button3D>
            </div>
          </div>
        )}

        {activeTab === 'invite' && (
          <div className="space-y-6">
            {/* Add Participant by Email */}
            <GlowCard className="p-6">
              <h4 className="text-lg font-semibold text-sirius-light-blue mb-3">
                ➕ Agregar Participante
              </h4>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-2">
                    Email del usuario:
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="email"
                      value={emailInvite}
                      onChange={(e) => setEmailInvite(e.target.value)}
                      placeholder="usuario@ejemplo.com"
                      className="flex-1 bg-gray-800/50 border border-gray-600 rounded px-3 py-2 text-white placeholder-gray-400 focus:border-sirius-blue focus:outline-none"
                      onKeyPress={(e) => e.key === 'Enter' && sendEmailInvite()}
                    />
                    <Button3D
                      variant="neon"
                      onClick={sendEmailInvite}
                      disabled={sendingInvite}
                    >
                      {sendingInvite ? '⏳' : '➕ Agregar'}
                    </Button3D>
                  </div>
                </div>

                {inviteError && (
                  <div className="bg-red-500/10 border border-red-500/20 rounded p-3">
                    <p className="text-red-400 text-sm">{inviteError}</p>
                  </div>
                )}

                {inviteSuccess && (
                  <div className="bg-green-500/10 border border-green-500/20 rounded p-3">
                    <p className="text-green-400 text-sm">{inviteSuccess}</p>
                  </div>
                )}

                <p className="text-xs text-gray-500">
                  Los usuarios deben estar registrados en la plataforma para poder ser agregados.
                </p>
              </div>
            </GlowCard>

            {/* Current Participants */}
            <GlowCard className="p-6">
              <h4 className="text-lg font-semibold text-sirius-light-blue mb-3">
                👥 Participantes ({participants.length})
              </h4>
              
              {loadingParticipants ? (
                <div className="text-center py-4">
                  <div className="w-6 h-6 border-2 border-sirius-blue border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                  <p className="text-gray-400 text-sm">Cargando participantes...</p>
                </div>
              ) : participants.length === 0 ? (
                <div className="text-center py-4">
                  <p className="text-gray-400 text-sm">Solo tú estás en esta reunión por ahora.</p>
                  <p className="text-gray-500 text-xs mt-1">¡Invita a otros para colaborar!</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {participants.map((participant) => (
                    <div
                      key={participant.id}
                      className="flex items-center gap-3 p-3 bg-gray-800/30 rounded-lg"
                    >
                      <div className="w-8 h-8 bg-sirius-blue/20 rounded-full flex items-center justify-center text-sm">
                        {participant.users?.full_name?.charAt(0)?.toUpperCase() || 
                         participant.users?.email?.charAt(0)?.toUpperCase() || 
                         participant.guest_name?.charAt(0)?.toUpperCase() || 
                         'U'}
                      </div>
                      <div className="flex-1">
                        <p className="text-white text-sm font-medium">
                          {participant.users?.full_name || 
                           participant.users?.email || 
                           participant.guest_name || 
                           'Usuario Anónimo'}
                        </p>
                        <p className="text-gray-400 text-xs">
                          Agregado: {new Date(participant.joined_at).toLocaleDateString('es-CO')}
                        </p>
                      </div>
                      <span className="text-sirius-green text-sm">✓</span>
                    </div>
                  ))}
                </div>
              )}
            </GlowCard>
          </div>
        )}

        {/* Close Button */}
        <div className="mt-6 text-center">
          <Button3D
            variant="glass"
            onClick={onClose}
          >
            ✕ Cerrar
          </Button3D>
        </div>
      </div>
    </div>
  );
} 