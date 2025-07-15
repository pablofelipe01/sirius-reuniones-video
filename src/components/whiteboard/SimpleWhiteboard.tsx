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
  const [canvasInitialized, setCanvasInitialized] = useState(false);

  // Initialize canvas with proper dimensions and retina support
  const initializeCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext('2d');
    if (!context) return;

    // Get container dimensions
    const container = canvas.parentElement;
    if (!container) return;

    const containerWidth = container.clientWidth;
    const containerHeight = container.clientHeight;

    // Set actual size in memory (scaled to account for extra pixel density)
    const dpr = window.devicePixelRatio || 1;
    canvas.width = containerWidth * dpr;
    canvas.height = containerHeight * dpr;

    // Scale the canvas back down using CSS
    canvas.style.width = containerWidth + 'px';
    canvas.style.height = containerHeight + 'px';

    // Scale the drawing context so everything draws at the correct size
    context.scale(dpr, dpr);

    // Setup drawing properties
    context.lineCap = 'round';
    context.lineJoin = 'round';
    context.strokeStyle = color;
    context.lineWidth = lineWidth;
    context.imageSmoothingEnabled = true;
    
    contextRef.current = context;

    // Dark background
    context.fillStyle = '#1a1a1a';
    context.fillRect(0, 0, containerWidth, containerHeight);
    
    setCanvasInitialized(true);
    console.log('✅ Canvas initialized:', { width: containerWidth, height: containerHeight, dpr });
  }, [color, lineWidth]);

  // Load whiteboard data
  const loadWhiteboardData = useCallback(async () => {
    if (!canvasInitialized || !contextRef.current) return;

    try {
      const response = await fetch(`/api/meetings/${meetingId}/whiteboard`);
      if (response.ok) {
        const { data } = await response.json();
        if (data?.imageData && contextRef.current) {
          const img = new Image();
          img.onload = () => {
            const canvas = canvasRef.current;
            const context = contextRef.current;
            if (!canvas || !context) return;

            // Clear and redraw
            context.clearRect(0, 0, canvas.width, canvas.height);
            context.fillStyle = '#1a1a1a';
            context.fillRect(0, 0, canvas.width, canvas.height);
            context.drawImage(img, 0, 0, canvas.width / (window.devicePixelRatio || 1), canvas.height / (window.devicePixelRatio || 1));
            console.log('✅ Whiteboard data loaded');
          };
          img.src = data.imageData;
        }
      }
    } catch (error) {
      console.error('❌ Error loading whiteboard:', error);
    }
  }, [meetingId, canvasInitialized]);

  // Initialize canvas when component mounts
  useEffect(() => {
    // Small delay to ensure the DOM is ready
    const timer = setTimeout(() => {
      initializeCanvas();
    }, 100);

    return () => clearTimeout(timer);
  }, [initializeCanvas]);

  // Load data after canvas is initialized
  useEffect(() => {
    if (canvasInitialized) {
      loadWhiteboardData();
    }
  }, [canvasInitialized, loadWhiteboardData]);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      console.log('🔄 Resizing canvas...');
      initializeCanvas();
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [initializeCanvas]);

  // Update drawing style when color/width changes
  useEffect(() => {
    if (contextRef.current) {
      contextRef.current.strokeStyle = color;
      contextRef.current.lineWidth = lineWidth;
    }
  }, [color, lineWidth]);

  // Get mouse position relative to canvas
  const getMousePos = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };
  }, []);

  const startDrawing = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (tool !== 'pen' || !contextRef.current) return;
    
    const { x, y } = getMousePos(e);
    const context = contextRef.current;

    setIsDrawing(true);
    context.beginPath();
    context.moveTo(x, y);
    
    console.log('🎨 Started drawing at:', { x, y });
  }, [tool, getMousePos]);

  const draw = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || tool !== 'pen' || !contextRef.current) return;
    
    const { x, y } = getMousePos(e);
    const context = contextRef.current;

    context.lineTo(x, y);
    context.stroke();
  }, [isDrawing, tool, getMousePos]);

  const stopDrawing = useCallback(() => {
    if (isDrawing && contextRef.current) {
      setIsDrawing(false);
      contextRef.current.closePath();
      
      console.log('🎨 Stopped drawing, auto-saving...');
      
      // Auto-save after drawing
      setTimeout(() => {
        const canvas = canvasRef.current;
        if (canvas && meetingId) {
          const dataURL = canvas.toDataURL('image/png', 0.8);
          fetch(`/api/meetings/${meetingId}/whiteboard`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
              data: { imageData: dataURL }, 
              isAutoSave: true 
            }),
          }).then(() => {
            setLastSaved(new Date());
            console.log('✅ Auto-saved whiteboard');
          }).catch(error => {
            console.error('❌ Auto-save failed:', error);
          });
        }
      }, 500);
    }
  }, [isDrawing, meetingId]);

  const addText = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (tool !== 'text' || !contextRef.current) return;
    
    const { x, y } = getMousePos(e);
    const context = contextRef.current;

    const text = prompt('Ingresa el texto:');
    if (text) {
      context.font = '16px Arial';
      context.fillStyle = color;
      context.fillText(text, x, y);
      
      console.log('📝 Added text:', text, 'at:', { x, y });
      
      // Auto-save after adding text
      setTimeout(() => {
        const canvas = canvasRef.current;
        if (canvas && meetingId) {
          const dataURL = canvas.toDataURL('image/png', 0.8);
          fetch(`/api/meetings/${meetingId}/whiteboard`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
              data: { imageData: dataURL }, 
              isAutoSave: true 
            }),
          }).then(() => {
            setLastSaved(new Date());
            console.log('✅ Auto-saved whiteboard after text');
          });
        }
      }, 500);
    }
  }, [tool, color, meetingId, getMousePos]);

  const saveWhiteboard = useCallback(async () => {
    const canvas = canvasRef.current;
    if (!canvas || !meetingId || saving) return;

    try {
      setSaving(true);
      const dataURL = canvas.toDataURL('image/png', 0.8);
      
      console.log('💾 Manually saving whiteboard...');
      
      const response = await fetch(`/api/meetings/${meetingId}/whiteboard`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          data: { imageData: dataURL },
          isAutoSave: false
        }),
      });

      if (response.ok) {
        setLastSaved(new Date());
        console.log('✅ Whiteboard saved successfully');
      } else {
        console.error('❌ Failed to save whiteboard');
        alert('Error al guardar la pizarra');
      }
    } catch (error) {
      console.error('❌ Error saving whiteboard:', error);
      alert('Error al guardar la pizarra');
    } finally {
      setSaving(false);
    }
  }, [meetingId, saving]);

  const clearCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const context = contextRef.current;
    if (!canvas || !context || !isHost) return;

    if (confirm('¿Estás seguro de que quieres limpiar toda la pizarra?')) {
      const container = canvas.parentElement;
      if (!container) return;

      context.fillStyle = '#1a1a1a';
      context.fillRect(0, 0, container.clientWidth, container.clientHeight);
      
      console.log('🗑️ Canvas cleared');
      
      // Save cleared canvas
      const dataURL = canvas.toDataURL('image/png', 0.8);
      fetch(`/api/meetings/${meetingId}/whiteboard`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          data: { imageData: dataURL }, 
          isManualSave: true 
        }),
      }).then(() => {
        setLastSaved(new Date());
        console.log('✅ Cleared canvas saved');
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

  if (!canvasInitialized) {
    return (
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[9999] flex items-center justify-center">
        <div className="bg-gray-900 border border-sirius-blue/30 rounded-lg p-8 text-center">
          <div className="w-12 h-12 border-4 border-sirius-blue border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-sirius-blue">Inicializando pizarra...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
      <div className="w-full h-full max-w-7xl max-h-[90vh] bg-gray-900 border border-sirius-blue/30 rounded-lg shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-sirius-blue/20 bg-black/20">
          <div className="flex items-center gap-4">
            <h3 className="text-xl font-semibold text-sirius-blue">
              🎨 Pizarra Colaborativa
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
              <option value="#1E90FF">🔵 Azul</option>
              <option value="#00D4AA">🟢 Verde</option>
              <option value="#FF6B6B">🔴 Rojo</option>
              <option value="#FFD93D">🟡 Amarillo</option>
              <option value="#FFFFFF">⚪ Blanco</option>
              <option value="#8B5CF6">🟣 Violeta</option>
            </select>

            <Button3D
              variant="glass"
              size="sm"
              onClick={saveWhiteboard}
              disabled={saving}
            >
              {saving ? '⏳ Guardando...' : '💾 Guardar'}
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

        {/* Canvas Container */}
        <div className="flex-1 p-4 min-h-0">
          <div className="w-full h-full border border-gray-600 rounded-lg bg-gray-800 overflow-hidden relative">
            <canvas
              ref={canvasRef}
              className="block cursor-crosshair"
              onMouseDown={tool === 'pen' ? startDrawing : addText}
              onMouseMove={draw}
              onMouseUp={stopDrawing}
              onMouseLeave={stopDrawing}
              style={{
                width: '100%',
                height: '100%',
                display: 'block'
              }}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-sirius-blue/20 bg-black/20">
          <div className="flex items-center justify-between text-xs text-gray-400">
            <div className="flex items-center gap-4">
              <span>🎨 Herramienta: {tool === 'pen' ? 'Dibujar' : 'Texto'}</span>
              <span>🎯 Color: {color}</span>
              <span>💾 Se guarda automáticamente</span>
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