'use client';

import { useState } from 'react';
import { Button3D } from '@/components/ui/Button3D';
import { GlowCard } from '@/components/ui/GlowCard';

interface Meeting {
  id: string;
  title: string;
  description: string | null;
  room_name: string;
  host_id: string;
  scheduled_at: string;
  started_at: string | null;
  ended_at: string | null;
  is_recording: boolean;
  room_style: string;
  created_at: string;
}

interface CreateMeetingFormProps {
  onMeetingCreated?: (meeting: Meeting, roomCode: string, joinUrl: string) => void;
  onCancel?: () => void;
}

export function CreateMeetingForm({ onMeetingCreated, onCancel }: CreateMeetingFormProps) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    scheduled_at: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch('/api/meetings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create meeting');
      }

      const { meeting, room_code, join_url } = await response.json();
      onMeetingCreated?.(meeting, room_code, join_url);
      
      // Reset form
      setFormData({
        title: '',
        description: '',
        scheduled_at: ''
      });
    } catch (err) {
      console.error('Error creating meeting:', err);
      setError(err instanceof Error ? err.message : 'Failed to create meeting');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Get minimum date-time (now + 5 minutes) - only on client
  const getMinDateTime = () => {
    // Return empty string during SSR to avoid hydration mismatch
    if (typeof window === 'undefined') {
      return '';
    }
    
    const now = new Date();
    now.setMinutes(now.getMinutes() + 5);
    
    // Convert to local timezone format for datetime-local input
    // This ensures the validation works correctly in the user's timezone
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  return (
    <GlowCard className="p-6 max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold text-sirius-blue mb-6 text-center">
        🚀 Nueva Reunión
      </h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="p-4 bg-red-500/20 border border-red-500/50 rounded-lg text-red-300 text-sm">
            ❌ {error}
          </div>
        )}

        <div>
          <label htmlFor="title" className="block text-sm font-medium text-sirius-light-blue mb-2">
            Título de la Reunión *
          </label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
            className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-sirius-blue focus:border-transparent transition-all"
            placeholder="Ej: Reunión de Equipo Semanal"
            maxLength={100}
          />
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-sirius-light-blue mb-2">
            Descripción
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={4}
            className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-sirius-blue focus:border-transparent transition-all resize-none"
            placeholder="Descripción opcional de la reunión, agenda, objetivos..."
            maxLength={500}
          />
          <div className="text-xs text-gray-500 mt-1">
            {formData.description.length}/500 caracteres
          </div>
        </div>

        <div>
          <label htmlFor="scheduled_at" className="block text-sm font-medium text-sirius-light-blue mb-2">
            Fecha y Hora *
          </label>
          <input
            type="datetime-local"
            id="scheduled_at"
            name="scheduled_at"
            value={formData.scheduled_at}
            onChange={handleChange}
            min={getMinDateTime()}
            required
            className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-sirius-blue focus:border-transparent transition-all"
          />
          <div className="text-xs text-gray-500 mt-1">
            La reunión debe programarse al menos 5 minutos en el futuro (hora local de Colombia)
          </div>
        </div>

        <div className="bg-sirius-blue/10 border border-sirius-blue/20 rounded-lg p-4">
          <h3 className="text-sm font-medium text-sirius-light-blue mb-2">
            ℹ️ Configuración Automática
          </h3>
          <ul className="text-xs text-gray-400 space-y-1">
            <li>• Grabación automática: Habilitada</li>
            <li>• Estilo de sala: Futurista</li>
            <li>• Código de sala: Se generará automáticamente</li>
            <li>• Participantes: Ilimitados</li>
          </ul>
        </div>

        <div className="flex gap-4 pt-4">
          <Button3D
            type="submit"
            variant="neon"
            disabled={isSubmitting}
            className="flex-1"
          >
            {isSubmitting ? '⏳ Creando...' : '🚀 Crear Reunión'}
          </Button3D>
          {onCancel && (
            <Button3D
              variant="glass"
              onClick={onCancel}
              className="flex-1"
            >
              Cancelar
            </Button3D>
          )}
        </div>
      </form>
    </GlowCard>
  );
} 