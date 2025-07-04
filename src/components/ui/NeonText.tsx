'use client';

import { forwardRef } from 'react';
import { cn } from '@/lib/utils';
import { NeonTextProps } from '@/types';

const NeonText = forwardRef<HTMLSpanElement, NeonTextProps>(
  ({ 
    children, 
    color = '#1E90FF', // Sirius blue instead of cyan
    size = 'md', 
    className, 
    animated = false,
    ...props 
  }, ref) => {
    const baseStyles = 'relative inline-block font-bold tracking-wide transition-all duration-300 transform-gpu';
    
    const sizes = {
      sm: 'text-sm',
      md: 'text-lg',
      lg: 'text-2xl',
      xl: 'text-4xl'
    };
    
    const animatedClass = animated ? 'animate-pulse-glow' : '';
    
    // Convert hex color to RGB for shadow
    const hexToRgb = (hex: string) => {
      const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
      return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
      } : { r: 30, g: 144, b: 255 };
    };
    
    const rgb = hexToRgb(color);
    const shadowColor = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.8)`;
    
    return (
      <span
        ref={ref}
        className={cn(
          baseStyles,
          sizes[size],
          animatedClass,
          className
        )}
        style={{
          color: color,
          textShadow: `0 0 10px ${shadowColor}, 0 0 20px ${shadowColor}, 0 0 30px ${shadowColor}`,
        }}
        {...props}
      >
        {children}
      </span>
    );
  }
);

NeonText.displayName = 'NeonText';

export { NeonText }; 