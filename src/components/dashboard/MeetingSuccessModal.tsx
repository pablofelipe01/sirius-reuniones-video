'use client';

import { Button3D } from '@/components/ui/Button3D';
import { GlowCard } from '@/components/ui/GlowCard';

interface Meeting {
  id: string;
  title: string;
  description: string | null;
  room_name: string;
  scheduled_at: string;
}

interface MeetingSuccessModalProps {
  meeting: Meeting;
  roomCode: string;
  joinUrl: string;
  onClose: () => void;
  onViewMeetings: () => void;
}

export function MeetingSuccessModal({ 
  meeting, 
  roomCode, 
  joinUrl, 
  onClose, 
  onViewMeetings 
}: MeetingSuccessModalProps) {
  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    // TODO: Add toast notification system
    alert(`${label} copiado al portapapeles`);
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <GlowCard className="max-w-2xl w-full p-8 border-sirius-green/50 bg-gradient-to-br from-sirius-green/10 via-transparent to-sirius-blue/10">
        <div className="text-center mb-6">
          <div className="text-6xl mb-4">🎉</div>
          <h2 className="text-3xl font-bold text-sirius-green mb-2">
            ¡Reunión Creada!
          </h2>
          <p className="text-sirius-light-blue">
            Tu reunión ha sido configurada exitosamente
          </p>
        </div>

        <div className="space-y-6">
          {/* Meeting Details */}
          <div className="bg-gray-800/30 rounded-lg p-4">
            <h3 className="text-xl font-semibold text-white mb-3">
              📋 Detalles de la Reunión
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Título:</span>
                <span className="text-white font-medium">{meeting.title}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Fecha y Hora:</span>
                <span className="text-white font-medium">{formatDateTime(meeting.scheduled_at)}</span>
              </div>
              {meeting.description && (
                <div className="pt-2">
                  <span className="text-gray-400">Descripción:</span>
                  <p className="text-white mt-1 leading-relaxed">{meeting.description}</p>
                </div>
              )}
            </div>
          </div>

          {/* Room Code */}
          <div className="bg-sirius-blue/10 border border-sirius-blue/20 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-sirius-light-blue mb-3">
              🔑 Código de Sala
            </h3>
            <div className="flex items-center gap-3">
              <code className="flex-1 bg-gray-800/50 px-4 py-3 rounded text-sirius-blue font-mono text-lg">
                {roomCode}
              </code>
              <Button3D
                variant="glass"
                size="sm"
                onClick={() => copyToClipboard(roomCode, 'Código de sala')}
              >
                📋 Copiar
              </Button3D>
            </div>
            <p className="text-xs text-gray-400 mt-2">
              Comparte este código con los participantes para que puedan unirse
            </p>
          </div>

          {/* Join URL */}
          <div className="bg-sirius-green/10 border border-sirius-green/20 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-sirius-light-blue mb-3">
              🔗 Enlace de Invitación
            </h3>
            <div className="flex items-center gap-3">
              <input
                readOnly
                value={joinUrl}
                className="flex-1 bg-gray-800/50 px-4 py-3 rounded text-sirius-light-blue text-sm truncate"
              />
              <Button3D
                variant="glass"
                size="sm"
                onClick={() => copyToClipboard(joinUrl, 'Enlace de invitación')}
              >
                📋 Copiar
              </Button3D>
            </div>
            <p className="text-xs text-gray-400 mt-2">
              Enlace directo para unirse a la reunión
            </p>
          </div>

          {/* Quick Actions */}
          <div className="bg-gray-800/20 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-sirius-light-blue mb-3">
              ⚡ Próximos Pasos
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="flex items-center gap-3 text-sm">
                <span className="text-2xl">📧</span>
                <div>
                  <p className="text-white font-medium">Invitar Participantes</p>
                  <p className="text-gray-400 text-xs">Comparte el código o enlace</p>
                </div>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <span className="text-2xl">📱</span>
                <div>
                  <p className="text-white font-medium">Acceso Móvil</p>
                  <p className="text-gray-400 text-xs">Compatible con dispositivos móviles</p>
                </div>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <span className="text-2xl">🎬</span>
                <div>
                  <p className="text-white font-medium">Grabación Automática</p>
                  <p className="text-gray-400 text-xs">Se activará al iniciar</p>
                </div>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <span className="text-2xl">🤖</span>
                <div>
                  <p className="text-white font-medium">IA Integrada</p>
                  <p className="text-gray-400 text-xs">Transcripción y análisis</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 mt-8">
          <Button3D
            variant="neon"
            onClick={onViewMeetings}
            className="flex-1"
          >
            👁️ Ver Mis Reuniones
          </Button3D>
          <Button3D
            variant="glass"
            onClick={onClose}
            className="flex-1"
          >
            ✨ Crear Otra Reunión
          </Button3D>
        </div>
      </GlowCard>
    </div>
  );
} 