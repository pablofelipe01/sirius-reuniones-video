'use client';

import { forwardRef } from 'react';
import { cn } from '@/lib/utils';
import { Button3DProps } from '@/types';

const Button3D = forwardRef<HTMLButtonElement, Button3DProps>(
  ({ 
    variant = 'neon', 
    size = 'md', 
    children, 
    className, 
    disabled, 
    pulse = false,
    glow = false,
    onClick,
    ...props 
  }, ref) => {
    const baseStyles = 'relative inline-flex items-center justify-center font-semibold transition-all duration-300 transform-gpu overflow-hidden group focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed';
    
    const variants = {
      neon: 'bg-transparent border-2 border-cyan-400 text-cyan-400 hover:bg-cyan-400 hover:text-black hover:shadow-[0_0_20px_rgba(0,245,255,0.6)] active:scale-95',
      holographic: 'bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/50 text-white hover:from-purple-500/30 hover:to-pink-500/30 hover:border-purple-400 hover:shadow-[0_0_25px_rgba(147,51,234,0.5)] active:scale-95',
      glitch: 'bg-gradient-to-r from-green-500/20 to-cyan-500/20 border border-green-500/50 text-green-400 hover:from-green-500/30 hover:to-cyan-500/30 hover:text-green-300 hover:shadow-[0_0_25px_rgba(34,197,94,0.5)] active:scale-95',
      glass: 'bg-white/5 backdrop-blur-md border border-white/10 text-white hover:bg-white/10 hover:border-white/20 hover:shadow-[0_0_25px_rgba(255,255,255,0.1)] active:scale-95'
    };
    
    const sizes = {
      sm: 'px-4 py-2 text-sm rounded-md',
      md: 'px-6 py-3 text-base rounded-lg',
      lg: 'px-8 py-4 text-lg rounded-xl'
    };
    
    const pulseClass = pulse ? 'animate-pulse-glow' : '';
    const glowClass = glow ? 'shadow-[0_0_30px_rgba(0,245,255,0.8)]' : '';
    
    return (
      <button
        ref={ref}
        className={cn(
          baseStyles,
          variants[variant],
          sizes[size],
          pulseClass,
          glowClass,
          className
        )}
        disabled={disabled}
        onClick={onClick}
        {...props}
      >
        {/* Background effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
        
        {/* Content */}
        <span className="relative z-10 flex items-center gap-2">
          {children}
        </span>
        
        {/* Glow effect overlay */}
        {glow && (
          <div className="absolute inset-0 bg-cyan-400/20 blur-xl scale-150 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        )}
      </button>
    );
  }
);

Button3D.displayName = 'Button3D';

export { Button3D }; 