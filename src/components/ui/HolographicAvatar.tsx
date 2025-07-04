'use client';

import { forwardRef } from 'react';
import { cn, getInitials } from '@/lib/utils';

interface HolographicAvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  src?: string;
  name: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  status?: 'online' | 'offline' | 'away' | 'busy';
  glowColor?: string;
  animated?: boolean;
  showStatus?: boolean;
}

const HolographicAvatar = forwardRef<HTMLDivElement, HolographicAvatarProps>(
  ({ 
    src, 
    name, 
    size = 'md', 
    status = 'offline',
    glowColor = '#00F5FF',
    animated = false,
    showStatus = true,
    className,
    ...props 
  }, ref) => {
    const baseStyles = 'relative inline-block rounded-full overflow-hidden border-2 transition-all duration-300 transform-gpu group';
    
    const sizes = {
      sm: 'w-8 h-8',
      md: 'w-12 h-12',
      lg: 'w-16 h-16',
      xl: 'w-24 h-24'
    };
    
    const statusColors = {
      online: '#39FF14',
      offline: '#666666',
      away: '#FFA500',
      busy: '#FF0000'
    };
    
    const statusSizes = {
      sm: 'w-2 h-2',
      md: 'w-3 h-3',
      lg: 'w-4 h-4',
      xl: 'w-5 h-5'
    };
    
    const animatedClass = animated ? 'animate-float' : '';
    
    // Convert hex color to RGB for shadow
    const hexToRgb = (hex: string) => {
      const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
      return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
      } : { r: 0, g: 245, b: 255 };
    };
    
    const rgb = hexToRgb(glowColor);
    const shadowColor = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.6)`;
    
    return (
      <div
        ref={ref}
        className={cn(
          baseStyles,
          sizes[size],
          animatedClass,
          className
        )}
        style={{
          borderColor: glowColor,
          boxShadow: `0 0 20px ${shadowColor}, 0 0 40px ${shadowColor}40`,
        }}
        {...props}
      >
        {/* Holographic background effect */}
        <div 
          className="absolute inset-0 bg-gradient-to-br from-transparent via-white/10 to-transparent opacity-20 group-hover:opacity-40 transition-opacity duration-300"
          style={{
            backgroundSize: '200% 200%',
            animation: animated ? 'holographic-shift 3s ease-in-out infinite' : undefined
          }}
        />
        
        {/* Scanline effect */}
        <div className="absolute inset-0 opacity-30 group-hover:opacity-50 transition-opacity duration-300 pointer-events-none">
          <div 
            className="absolute inset-0 bg-repeat-y animate-scanlines"
            style={{
              backgroundImage: `linear-gradient(transparent 50%, ${glowColor}20 50%)`,
              backgroundSize: '100% 4px'
            }}
          />
        </div>
        
        {/* Avatar content */}
        <div className="relative z-10 w-full h-full">
          {src ? (
            <img
              src={src}
              alt={name}
              className="w-full h-full object-cover filter brightness-110 contrast-110 saturate-110"
            />
          ) : (
            <div 
              className="w-full h-full flex items-center justify-center text-white font-bold"
              style={{
                backgroundColor: glowColor + '20',
                color: glowColor
              }}
            >
              {getInitials(name)}
            </div>
          )}
        </div>
        
        {/* Glitch effect overlay */}
        <div 
          className="absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity duration-300 pointer-events-none"
          style={{
            background: `linear-gradient(45deg, transparent 30%, ${glowColor}60 40%, transparent 50%, ${glowColor}60 60%, transparent 70%)`,
            backgroundSize: '200% 200%',
            animation: 'glitch 0.3s ease-in-out infinite'
          }}
        />
        
        {/* Status indicator */}
        {showStatus && (
          <div 
            className={cn(
              'absolute bottom-0 right-0 rounded-full border-2 border-white/20 shadow-lg',
              statusSizes[size]
            )}
            style={{
              backgroundColor: statusColors[status],
              boxShadow: `0 0 10px ${statusColors[status]}80`
            }}
          />
        )}
        
        {/* Glow ring */}
        <div 
          className="absolute inset-[-2px] rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
          style={{
            background: `conic-gradient(from 0deg, ${glowColor}80, transparent 30%, ${glowColor}80 70%, transparent 100%)`,
            padding: '2px',
            maskImage: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
            maskClip: 'content-box, border-box',
            maskComposite: 'xor'
          }}
        />
      </div>
    );
  }
);

HolographicAvatar.displayName = 'HolographicAvatar';

export { HolographicAvatar }; 