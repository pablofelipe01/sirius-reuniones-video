'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Tldraw, Editor } from '@tldraw/tldraw';
import '@tldraw/tldraw/tldraw.css';
import { Button3D } from '@/components/ui/Button3D';

interface CollaborativeWhiteboardProps {
  meetingId: string;
  isHost?: boolean;
  onClose: () => void;
}

export function CollaborativeWhiteboard({ 
  meetingId, 
  isHost = false, 
  onClose 
}: CollaborativeWhiteboardProps) {
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);
  const editorRef = useRef<Editor | null>(null);
  const autoSaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Auto-save every 10 seconds
  const autoSave = useCallback(async () => {
    if (!editorRef.current || !meetingId) return;
    
    try {
      setSaving(true);
      setError(null);
      
      const snapshot = editorRef.current.store.getSnapshot();
      
      const response = await fetch(`/api/meetings/${meetingId}/whiteboard`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          data: snapshot,
          isAutoSave: true
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save whiteboard');
      }

      setLastSaved(new Date());
    } catch (err) {
      console.error('Error saving whiteboard:', err);
      setError('Failed to save whiteboard');
    } finally {
      setSaving(false);
    }
  }, [meetingId]);

  // Manual save
  const handleSave = useCallback(async () => {
    if (!editorRef.current || !meetingId) return;
    
    try {
      setSaving(true);
      setError(null);
      
      const snapshot = editorRef.current.store.getSnapshot();
      
      const response = await fetch(`/api/meetings/${meetingId}/whiteboard`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          data: snapshot,
          isManualSave: true
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save whiteboard');
      }

      setLastSaved(new Date());
    } catch (err) {
      console.error('Error saving whiteboard:', err);
      setError('Failed to save whiteboard');
    } finally {
      setSaving(false);
    }
  }, [meetingId]);

  // Load existing whiteboard data
  const loadWhiteboard = useCallback(async () => {
    if (!meetingId || !editorRef.current) {
      console.log('❌ Cannot load whiteboard - missing meetingId or editor');
      return;
    }
    
    try {
      console.log('📥 Loading whiteboard for meeting:', meetingId);
      const response = await fetch(`/api/meetings/${meetingId}/whiteboard`);
      
      if (response.ok) {
        const { data } = await response.json();
        if (data) {
          console.log('✅ Whiteboard data loaded successfully');
          editorRef.current.store.loadSnapshot(data);
        } else {
          console.log('📝 No existing whiteboard data - starting fresh');
        }
      } else {
        console.log('⚠️ Error response loading whiteboard:', response.status);
      }
    } catch (err) {
      console.error('❌ Error loading whiteboard:', err);
    }
  }, [meetingId]);

  // Clear whiteboard (host only)
  const handleClear = useCallback(async () => {
    if (!isHost || !editorRef.current) return;
    
    const confirmed = confirm('¿Estás seguro de que quieres limpiar toda la pizarra?');
    if (!confirmed) return;
    
    try {
      editorRef.current.selectAll();
      editorRef.current.deleteShapes(editorRef.current.getSelectedShapeIds());
      await handleSave();
    } catch (err) {
      console.error('Error clearing whiteboard:', err);
    }
  }, [isHost, handleSave]);

  // Setup auto-save
  useEffect(() => {
    if (autoSaveTimeoutRef.current) {
      clearInterval(autoSaveTimeoutRef.current);
    }
    
    autoSaveTimeoutRef.current = setInterval(autoSave, 10000); // Auto-save every 10 seconds
    
    return () => {
      if (autoSaveTimeoutRef.current) {
        clearInterval(autoSaveTimeoutRef.current);
      }
    };
  }, [autoSave]);

  // Load whiteboard on mount
  useEffect(() => {
    if (editorRef.current) {
      loadWhiteboard();
    }
  }, [loadWhiteboard]);

  // Simplified configuration for Tldraw

  const formatLastSaved = () => {
    if (!lastSaved) return 'Nunca guardado';
    
    const now = new Date();
    const diffMs = now.getTime() - lastSaved.getTime();
    const diffSeconds = Math.floor(diffMs / 1000);
    
    if (diffSeconds < 60) return `Guardado hace ${diffSeconds}s`;
    const diffMinutes = Math.floor(diffSeconds / 60);
    if (diffMinutes < 60) return `Guardado hace ${diffMinutes}m`;
    
    return lastSaved.toLocaleTimeString('es-CO', {
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'America/Bogota'
    });
  };

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
            {error && (
              <span className="text-red-400 text-sm">⚠️ {error}</span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Button3D
              variant="glass"
              size="sm"
              onClick={handleSave}
              disabled={saving}
            >
              💾 Guardar
            </Button3D>
            
            {isHost && (
              <Button3D
                variant="glass"
                size="sm"
                onClick={handleClear}
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

        {/* Whiteboard */}
        <div 
          className="flex-1 relative" 
          style={{ 
            minHeight: '500px',
            height: 'calc(100vh - 200px)',
            width: '100%',
            background: '#1a1a1a'
          }}
        >
          <div style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%'
          }}>
            <Tldraw
              onMount={(editor) => {
                console.log('🎨 Tldraw mounted successfully');
                editorRef.current = editor;
                
                // Listen to shape changes for debugging
                editor.store.listen(() => {
                  console.log('📝 Store changed - drawing activity detected');
                }, {
                  source: 'user',
                  scope: 'document'
                });
                
                // Small delay to ensure editor is ready
                setTimeout(() => {
                  console.log('⏰ Loading whiteboard data after delay');
                  loadWhiteboard();
                }, 200);
              }}
              persistenceKey={`whiteboard-${meetingId}`}
              autoFocus={true}
            />
          </div>
        </div>

        {/* Footer with instructions */}
        <div className="p-3 border-t border-sirius-blue/20 bg-black/20">
          <div className="flex items-center justify-between text-xs text-gray-400">
            <div className="flex items-center gap-4">
              <span>💡 La pizarra se guarda automáticamente cada 10 segundos</span>
              <span>🖱️ Click y arrastra para dibujar</span>
              <span>📝 Presiona T para texto</span>
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