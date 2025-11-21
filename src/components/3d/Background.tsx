'use client';

import { useRef, useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { backgroundVertexShader, backgroundFragmentShader } from '@/shaders/background.glsl';

interface BackgroundProps {
  progress: number;
}

export default function Background({ progress }: BackgroundProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const { viewport } = useThree();

  const material = useMemo(() => {
    return new THREE.ShaderMaterial({
      vertexShader: backgroundVertexShader,
      fragmentShader: backgroundFragmentShader,
      uniforms: {
        uTime: { value: 0 },
        uNoiseScale: { value: 2.5 },
        uNoiseSpeed: { value: 0.3 },
        uColorA: { value: new THREE.Vector3(0.05, 0.05, 0.1) },
        uColorB: { value: new THREE.Vector3(0.1, 0.05, 0.15) },
        uColorC: { value: new THREE.Vector3(0.0, 0.1, 0.2) },
        uResolution: { value: new THREE.Vector2(1, 1) },
      },
      depthWrite: false,
    });
  }, []);

  useFrame((state) => {
    material.uniforms.uTime.value = state.clock.elapsedTime;

    // Shift colors based on progress
    const colorShift = progress * 0.5;
    material.uniforms.uColorA.value.set(
      0.05 + colorShift * 0.1,
      0.05,
      0.1 + colorShift * 0.1
    );
    material.uniforms.uColorB.value.set(
      0.1 + colorShift * 0.05,
      0.05 + colorShift * 0.05,
      0.15
    );
  });

  return (
    <mesh ref={meshRef} position={[0, 0, -10]}>
      <planeGeometry args={[viewport.width * 2, viewport.height * 2]} />
      <primitive object={material} attach="material" />
    </mesh>
  );
}
