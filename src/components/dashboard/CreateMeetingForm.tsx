'use client';

import { useState } from 'react';
import { Button3D } from '@/components/ui/Button3D';
import { GlowCard } from '@/components/ui/GlowCard';

interface Meeting {
  id: string;
  title: string;
  description: string;
  scheduled_at: string;
  duration_minutes: number;
  max_participants: number;
  status: string;
  creator_id: string;
}

interface CreateMeetingFormProps {
  onMeetingCreated?: (meeting: Meeting) => void;
  onCancel?: () => void;
}

export function CreateMeetingForm({ onMeetingCreated, onCancel }: CreateMeetingFormProps) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    scheduled_at: '',
    duration_minutes: 60,
    max_participants: 10
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

      const { meeting } = await response.json();
      onMeetingCreated?.(meeting);
      
      // Reset form
      setFormData({
        title: '',
        description: '',
        scheduled_at: '',
        duration_minutes: 60,
        max_participants: 10
      });
    } catch (err) {
      console.error('Error creating meeting:', err);
      setError(err instanceof Error ? err.message : 'Failed to create meeting');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'duration_minutes' || name === 'max_participants' ? parseInt(value) : value
    }));
  };

  // Get minimum date-time (now + 5 minutes)
  const getMinDateTime = () => {
    const now = new Date();
    now.setMinutes(now.getMinutes() + 5);
    return now.toISOString().slice(0, 16);
  };

  return (
    <GlowCard className="p-6 max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold text-blue-400 mb-6 text-center">
        Nueva Reunión
      </h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 bg-red-500/20 border border-red-500 rounded text-red-300 text-sm">
            {error}
          </div>
        )}

        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-300 mb-2">
            Título de la Reunión *
          </label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 bg-gray-800/50 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Ej: Reunión de Equipo Semanal"
          />
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-300 mb-2">
            Descripción
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={3}
            className="w-full px-3 py-2 bg-gray-800/50 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Descripción opcional de la reunión..."
          />
        </div>

        <div>
          <label htmlFor="scheduled_at" className="block text-sm font-medium text-gray-300 mb-2">
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
            className="w-full px-3 py-2 bg-gray-800/50 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="duration_minutes" className="block text-sm font-medium text-gray-300 mb-2">
              Duración (minutos)
            </label>
            <select
              id="duration_minutes"
              name="duration_minutes"
              value={formData.duration_minutes}
              onChange={handleChange}
              className="w-full px-3 py-2 bg-gray-800/50 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value={15}>15 minutos</option>
              <option value={30}>30 minutos</option>
              <option value={60}>1 hora</option>
              <option value={90}>1.5 horas</option>
              <option value={120}>2 horas</option>
            </select>
          </div>

          <div>
            <label htmlFor="max_participants" className="block text-sm font-medium text-gray-300 mb-2">
              Máx. Participantes
            </label>
            <select
              id="max_participants"
              name="max_participants"
              value={formData.max_participants}
              onChange={handleChange}
              className="w-full px-3 py-2 bg-gray-800/50 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value={5}>5 personas</option>
              <option value={10}>10 personas</option>
              <option value={25}>25 personas</option>
              <option value={50}>50 personas</option>
              <option value={100}>100 personas</option>
            </select>
          </div>
        </div>

        <div className="flex gap-4 pt-4">
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex-1"
          >
            <Button3D
              variant="neon"
              disabled={isSubmitting}
              className="w-full"
            >
              {isSubmitting ? 'Creando...' : 'Crear Reunión'}
            </Button3D>
          </button>
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