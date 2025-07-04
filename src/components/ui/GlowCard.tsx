'use client';

import { forwardRef } from 'react';
import { cn } from '@/lib/utils';
import { GlowCardProps } from '@/types';

const GlowCard = forwardRef<HTMLDivElement, GlowCardProps>(
  ({ 
    children, 
    className, 
    glowColor = '#00F5FF', 
    intensity = 'medium', 
    animated = false,
    ...props 
  }, ref) => {
    const baseStyles = 'relative backdrop-blur-md border border-white/10 rounded-xl p-6 transition-all duration-300 transform-gpu overflow-hidden group';
    
    const intensityStyles = {
      low: 'bg-white/5 shadow-lg',
      medium: 'bg-white/10 shadow-xl',
      high: 'bg-white/15 shadow-2xl'
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
    const shadowColor = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.3)`;
    
    return (
      <div
        ref={ref}
        className={cn(
          baseStyles,
          intensityStyles[intensity],
          animatedClass,
          className
        )}
        style={{
          boxShadow: `0 0 30px ${shadowColor}, 0 0 60px ${shadowColor}40`,
          borderColor: `${glowColor}40`
        }}
        {...props}
      >
        {/* Animated background gradient */}
        <div 
          className="absolute inset-0 opacity-10 group-hover:opacity-20 transition-opacity duration-500"
          style={{
            background: `linear-gradient(45deg, transparent 30%, ${glowColor}20 50%, transparent 70%)`,
            backgroundSize: '200% 200%',
            animation: animated ? 'holographic-shift 3s ease-in-out infinite' : undefined
          }}
        />
        
        {/* Scanline effect */}
        <div className="absolute inset-0 opacity-20 group-hover:opacity-30 transition-opacity duration-300 pointer-events-none">
          <div 
            className="absolute inset-0 bg-repeat-y animate-scanlines"
            style={{
              backgroundImage: `linear-gradient(transparent 50%, ${glowColor}10 50%)`,
              backgroundSize: '100% 4px'
            }}
          />
        </div>
        
        {/* Glow border effect */}
        <div 
          className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
          style={{
            background: `linear-gradient(90deg, transparent, ${glowColor}60, transparent)`,
            padding: '1px',
            maskImage: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
            maskClip: 'content-box, border-box',
            maskComposite: 'xor'
          }}
        />
        
        {/* Content */}
        <div className="relative z-10">
          {children}
        </div>
        
        {/* Corner accents */}
        <div className="absolute top-0 left-0 w-6 h-6 border-l-2 border-t-2 opacity-60 group-hover:opacity-100 transition-opacity duration-300" 
             style={{ borderColor: glowColor }} />
        <div className="absolute top-0 right-0 w-6 h-6 border-r-2 border-t-2 opacity-60 group-hover:opacity-100 transition-opacity duration-300" 
             style={{ borderColor: glowColor }} />
        <div className="absolute bottom-0 left-0 w-6 h-6 border-l-2 border-b-2 opacity-60 group-hover:opacity-100 transition-opacity duration-300" 
             style={{ borderColor: glowColor }} />
        <div className="absolute bottom-0 right-0 w-6 h-6 border-r-2 border-b-2 opacity-60 group-hover:opacity-100 transition-opacity duration-300" 
             style={{ borderColor: glowColor }} />
      </div>
    );
  }
);

GlowCard.displayName = 'GlowCard';

export { GlowCard }; 