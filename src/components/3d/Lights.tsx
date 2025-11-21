'use client';

import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { getSectionProgress, easings } from '@/hooks/useScrollProgress';

interface LightsProps {
  progress: number;
}

export default function Lights({ progress }: LightsProps) {
  const keyLightRef = useRef<THREE.DirectionalLight>(null);
  const rimLightRef = useRef<THREE.PointLight>(null);

  const heroProgress = getSectionProgress(progress, 'hero');
  const easedHero = easings.easeOutExpo(heroProgress);

  useFrame(() => {
    if (keyLightRef.current) {
      // Increase light intensity during hero reveal
      keyLightRef.current.intensity = 0.5 + easedHero * 2.0;
    }

    if (rimLightRef.current) {
      // Golden rim light fades in
      rimLightRef.current.intensity = easedHero * 1.5;
    }
  });

  return (
    <>
      {/* Ambient light - base illumination */}
      <ambientLight intensity={0.3} color="#1a1a2e" />

      {/* Key light - main illumination */}
      <directionalLight
        ref={keyLightRef}
        position={[5, 5, 5]}
        intensity={2.5}
        color="#ffffff"
        castShadow
        shadow-mapSize={[2048, 2048]}
      />

      {/* Fill light - soften shadows */}
      <pointLight
        position={[-3, 2, 4]}
        intensity={0.8}
        color="#e8f4ff"
      />

      {/* Rim light - highlight edges */}
      <pointLight
        ref={rimLightRef}
        position={[0, 3, -5]}
        intensity={1.5}
        color="#ffd700"
      />

      {/* Bottom fill - subtle uplighting */}
      <pointLight
        position={[0, -3, 2]}
        intensity={0.3}
        color="#4a90e2"
      />
    </>
  );
}
