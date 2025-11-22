'use client';

import { useRef, useMemo, Suspense } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import { getSectionProgress, easings, lerp, SECTIONS } from '@/hooks/useScrollProgress';

interface WatchProps {
  progress: number;
}

// Model path - replace sample.glb with your own model
const MODEL_PATH = '/models/sample.glb';

// Fallback geometry when no model is loaded
function FallbackGeometry() {
  return (
    <mesh>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color="#333" />
    </mesh>
  );
}

// Loaded 3D model component
function Model({ progress }: { progress: number }) {
  const groupRef = useRef<THREE.Group>(null);
  const timeRef = useRef(0);

  // Load GLB model
  const { scene } = useGLTF(MODEL_PATH);

  // Clone scene to avoid mutations
  const clonedScene = useMemo(() => {
    const clone = scene.clone();

    // Apply standard PBR material enhancements
    clone.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.castShadow = true;
        child.receiveShadow = true;

        // Enhance materials
        if (child.material instanceof THREE.MeshStandardMaterial) {
          child.material.envMapIntensity = 1.5;
          child.material.needsUpdate = true;
        }
      }
    });

    return clone;
  }, [scene]);

  // Calculate section progresses
  const heroProgress = getSectionProgress(progress, 'hero');
  const detailProgress = getSectionProgress(progress, 'detail');
  const explodeProgress = getSectionProgress(progress, 'explode');
  const materialProgress = getSectionProgress(progress, 'material');
  const endingProgress = getSectionProgress(progress, 'ending');

  // Apply easings
  const easedHero = easings.easeOutExpo(heroProgress);
  const easedDetail = easings.easeInOutCubic(detailProgress);
  const easedEnding = easings.easeOutQuint(endingProgress);

  // Animation loop
  useFrame((state, delta) => {
    timeRef.current += delta;

    if (!groupRef.current) return;

    const time = timeRef.current;

    // Hero section: emerge from darkness
    if (progress <= SECTIONS.hero.end) {
      const scale = lerp(0.3, 1.0, easedHero);
      groupRef.current.scale.setScalar(scale);
      groupRef.current.rotation.y = lerp(-Math.PI, 0, easedHero);
      groupRef.current.position.y = lerp(-2, 0, easedHero);
    }
    // Detail section: zoom in
    else if (progress <= SECTIONS.detail.end) {
      const scale = lerp(1.0, 1.8, easedDetail);
      groupRef.current.scale.setScalar(scale);
      groupRef.current.rotation.y = lerp(0, Math.PI / 6, easedDetail);
      groupRef.current.position.y = lerp(0, 0.3, easedDetail);
    }
    // Explode section
    else if (progress <= SECTIONS.explode.end) {
      groupRef.current.scale.setScalar(1.8);
      groupRef.current.rotation.y = time * 0.3;
    }
    // Material section: rotate continuously
    else if (progress <= SECTIONS.material.end) {
      const baseScale = lerp(1.8, 1.0, easedEnding > 0 ? easedEnding : 0);
      groupRef.current.scale.setScalar(baseScale);
      groupRef.current.rotation.y = time * 0.5;
    }
    // Ending section
    else {
      const scale = lerp(1.0, 0.9, easedEnding);
      groupRef.current.scale.setScalar(scale);
    }
  });

  return (
    <group ref={groupRef}>
      <primitive object={clonedScene} />
    </group>
  );
}

// Main watch component with error boundary
export default function Watch({ progress }: WatchProps) {
  return (
    <Suspense fallback={<FallbackGeometry />}>
      <Model progress={progress} />
    </Suspense>
  );
}

// Preload the model
useGLTF.preload(MODEL_PATH);
