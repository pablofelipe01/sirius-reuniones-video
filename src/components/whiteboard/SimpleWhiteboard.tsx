'use client';

import { useRef, useEffect, useState, useCallback } from 'react';
import { Button3D } from '@/components/ui/Button3D';

interface SimpleWhiteboardProps {
  meetingId: string;
  isHost?: boolean;
  onClose: () => void;
}

export function SimpleWhiteboard({ meetingId, isHost = false, onClose }: SimpleWhiteboardProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const contextRef = useRef<CanvasRenderingContext2D | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [tool, setTool] = useState<'pen' | 'text'>('pen');
  const [color, setColor] = useState('#1E90FF');
  const [lineWidth] = useState(3);
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  // Initialize canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext('2d');
    if (!context) return;

    // Setup canvas
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    
    context.lineCap = 'round';
    context.strokeStyle = color;
    context.lineWidth = lineWidth;
    contextRef.current = context;

    // Dark background
    context.fillStyle = '#1a1a1a';
    context.fillRect(0, 0, canvas.width, canvas.height);
    
    // Load initial data
    const loadInitial = async () => {
      const response = await fetch(`/api/meetings/${meetingId}/whiteboard`);
      if (response.ok) {
        const { data } = await response.json();
        if (data?.imageData && context) {
          const img = new Image();
          img.onload = () => {
            context.clearRect(0, 0, canvas.width, canvas.height);
            context.drawImage(img, 0, 0);
          };
          img.src = data.imageData;
        }
      }
    };
    loadInitial();
  }, [meetingId]);

  // Update drawing style when color/width changes
  useEffect(() => {
    if (contextRef.current) {
      contextRef.current.strokeStyle = color;
      contextRef.current.lineWidth = lineWidth;
    }
  }, [color, lineWidth]);

  const startDrawing = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (tool !== 'pen') return;
    
    const canvas = canvasRef.current;
    const context = contextRef.current;
    if (!canvas || !context) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setIsDrawing(true);
    context.beginPath();
    context.moveTo(x, y);
  }, [tool]);

  const draw = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || tool !== 'pen') return;
    
    const canvas = canvasRef.current;
    const context = contextRef.current;
    if (!canvas || !context) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    context.lineTo(x, y);
    context.stroke();
  }, [isDrawing, tool]);

  const stopDrawing = useCallback(() => {
    if (isDrawing) {
      setIsDrawing(false);
      // Auto-save after drawing - will be defined later
      setTimeout(() => {
        const canvas = canvasRef.current;
        if (canvas && meetingId) {
          const dataURL = canvas.toDataURL();
          fetch(`/api/meetings/${meetingId}/whiteboard`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ data: { imageData: dataURL }, isAutoSave: true }),
          });
        }
      }, 500);
    }
  }, [isDrawing, meetingId]);

  const addText = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (tool !== 'text') return;
    
    const canvas = canvasRef.current;
    const context = contextRef.current;
    if (!canvas || !context) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const text = prompt('Ingresa el texto:');
    if (text) {
      context.font = '16px Arial';
      context.fillStyle = color;
      context.fillText(text, x, y);
      // Auto-save after adding text
      setTimeout(() => {
        const canvas = canvasRef.current;
        if (canvas && meetingId) {
          const dataURL = canvas.toDataURL();
          fetch(`/api/meetings/${meetingId}/whiteboard`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ data: { imageData: dataURL }, isAutoSave: true }),
          });
        }
      }, 500);
    }
  }, [tool, color, meetingId]);

  const saveWhiteboard = useCallback(async () => {
    const canvas = canvasRef.current;
    if (!canvas || !meetingId) return;

    try {
      setSaving(true);
      const dataURL = canvas.toDataURL();
      
      const response = await fetch(`/api/meetings/${meetingId}/whiteboard`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          data: { imageData: dataURL },
          isAutoSave: true
        }),
      });

      if (response.ok) {
        setLastSaved(new Date());
        console.log('✅ Whiteboard saved successfully');
      } else {
        console.error('❌ Failed to save whiteboard');
      }
    } catch (error) {
      console.error('❌ Error saving whiteboard:', error);
    } finally {
      setSaving(false);
    }
  }, [meetingId]);



  const clearCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const context = contextRef.current;
    if (!canvas || !context || !isHost) return;

    if (confirm('¿Estás seguro de que quieres limpiar toda la pizarra?')) {
      context.fillStyle = '#1a1a1a';
      context.fillRect(0, 0, canvas.width, canvas.height);
      // Save cleared canvas
      const dataURL = canvas.toDataURL();
      fetch(`/api/meetings/${meetingId}/whiteboard`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data: { imageData: dataURL }, isManualSave: true }),
      });
    }
  }, [isHost, meetingId]);

  const formatLastSaved = () => {
    if (!lastSaved) return 'Nunca guardado';
    const now = new Date();
    const diffMs = now.getTime() - lastSaved.getTime();
    const diffSeconds = Math.floor(diffMs / 1000);
    if (diffSeconds < 60) return `Guardado hace ${diffSeconds}s`;
    return lastSaved.toLocaleTimeString('es-CO', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
      <div className="w-full h-full max-w-7xl max-h-[90vh] bg-gray-900 border border-sirius-blue/30 rounded-lg shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-sirius-blue/20 bg-black/20">
          <div className="flex items-center gap-4">
            <h3 className="text-xl font-semibold text-sirius-blue">
              🎨 Pizarra Colaborativa (Simple)
            </h3>
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <div className={`w-2 h-2 rounded-full ${saving ? 'bg-yellow-400 animate-pulse' : 'bg-sirius-green'}`} />
              <span>{saving ? 'Guardando...' : formatLastSaved()}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button3D
              variant={tool === 'pen' ? 'neon' : 'glass'}
              size="sm"
              onClick={() => setTool('pen')}
            >
              ✏️ Dibujar
            </Button3D>
            
            <Button3D
              variant={tool === 'text' ? 'neon' : 'glass'}
              size="sm"
              onClick={() => setTool('text')}
            >
              📝 Texto
            </Button3D>

            <select 
              value={color} 
              onChange={(e) => setColor(e.target.value)}
              className="bg-gray-800 text-white border border-gray-600 rounded px-2 py-1 text-sm"
            >
              <option value="#1E90FF">Azul</option>
              <option value="#00D4AA">Verde</option>
              <option value="#FF6B6B">Rojo</option>
              <option value="#FFD93D">Amarillo</option>
              <option value="#FFFFFF">Blanco</option>
            </select>

            <Button3D
              variant="glass"
              size="sm"
              onClick={saveWhiteboard}
              disabled={saving}
            >
              💾 Guardar
            </Button3D>
            
            {isHost && (
              <Button3D
                variant="glass"
                size="sm"
                onClick={clearCanvas}
                className="bg-red-600/20 hover:bg-red-600/30 border-red-500/50"
              >
                🗑️ Limpiar
              </Button3D>
            )}
            
            <Button3D
              variant="neon"
              size="sm"
              onClick={onClose}
            >
              ✕ Cerrar
            </Button3D>
          </div>
        </div>

        {/* Canvas */}
        <div className="flex-1 p-4">
          <canvas
            ref={canvasRef}
            className="w-full h-full border border-gray-600 rounded-lg cursor-crosshair"
            onMouseDown={tool === 'pen' ? startDrawing : addText}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
            style={{ 
              minHeight: '500px',
              background: '#1a1a1a'
            }}
          />
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-sirius-blue/20 bg-black/20">
          <div className="flex items-center justify-between text-xs text-gray-400">
            <div className="flex items-center gap-4">
              <span>💡 Click y arrastra para dibujar</span>
              <span>📝 Modo texto: click donde quieres escribir</span>
              <span>💾 Se guarda automáticamente al dibujar</span>
            </div>
            {isHost && (
              <span>👑 Como host puedes limpiar la pizarra</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 