'use client';

import { ParticleField } from '@/components/three/ParticleField';

export function ClientBackground() {
  return (
    <>
      {/* Starry night background with particles */}
      <div className="fixed inset-0 z-0">
        <ParticleField count={2500} size={0.012} color="#1E90FF" opacity={0.6} speed={0.2} />
      </div>
      
      {/* Background effects */}
      <div className="fixed inset-0 bg-black/40 z-0" />
      <div className="fixed inset-0 bg-gradient-to-br from-blue-600/6 via-transparent to-green-500/4 z-0" />
      
      {/* Grid pattern overlay */}
      <div className="fixed inset-0 bg-[url('/grid.svg')] opacity-10 z-0" />
    </>
  );
} 