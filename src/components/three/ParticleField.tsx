'use client';

import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Points, PointMaterial } from '@react-three/drei';
import * as THREE from 'three';

interface ParticleFieldProps {
  count?: number;
  size?: number;
  color?: string;
  opacity?: number;
  speed?: number;
  className?: string;
}

// Seeded random function to ensure consistent results
function seededRandom(seed: number) {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

function Particles({ count = 5000, size = 0.02, color = '#00F5FF', opacity = 0.6, speed = 0.5 }) {
  const ref = useRef<THREE.Points>(null);
  
  // Generate consistent positions using seeded random
  const positions = useMemo(() => {
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      // Use seeded random for consistent hydration
      positions[i * 3] = (seededRandom(i * 3) - 0.5) * 10;
      positions[i * 3 + 1] = (seededRandom(i * 3 + 1) - 0.5) * 10;
      positions[i * 3 + 2] = (seededRandom(i * 3 + 2) - 0.5) * 10;
    }
    return positions;
  }, [count]);
  
  // Animation loop
  useFrame((state, delta) => {
    if (ref.current) {
      ref.current.rotation.x -= delta * speed * 0.1;
      ref.current.rotation.y -= delta * speed * 0.15;
    }
  });
  
  return (
    <group rotation={[0, 0, Math.PI / 4]}>
      <Points ref={ref} positions={positions} stride={3} frustumCulled={false}>
        <PointMaterial
          transparent
          color={color}
          size={size}
          sizeAttenuation={true}
          depthWrite={false}
          opacity={opacity}
        />
      </Points>
    </group>
  );
}

function ParticleField({ 
  count = 5000, 
  size = 0.02, 
  color = '#00F5FF', 
  opacity = 0.6, 
  speed = 0.5,
  className = ''
}: ParticleFieldProps) {
  return (
    <div className={`w-full h-full ${className}`}>
      <Canvas
        camera={{ position: [0, 0, 1] }}
        style={{ background: 'transparent' }}
      >
        <Particles 
          count={count} 
          size={size} 
          color={color} 
          opacity={opacity} 
          speed={speed} 
        />
      </Canvas>
    </div>
  );
}

export { ParticleField }; 