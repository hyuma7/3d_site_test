'use client';

import { Canvas } from '@react-three/fiber';
import { EffectComposer, Bloom, ChromaticAberration, DepthOfField, Vignette } from '@react-three/postprocessing';
import { BlendFunction } from 'postprocessing';
import Watch from './Watch';
import Background from './Background';
import Lights from './Lights';
import CameraController from './CameraController';
import { getSectionProgress, easings } from '@/hooks/useScrollProgress';

interface SceneProps {
  progress: number;
}

export default function Scene({ progress }: SceneProps) {
  const endingProgress = getSectionProgress(progress, 'ending');
  const easedEnding = easings.easeOutQuint(endingProgress);

  // Bloom intensity increases at ending
  const bloomIntensity = 1.2 + easedEnding * 0.8;

  return (
    <Canvas
      camera={{ fov: 45, position: [0, 0, 8], near: 0.1, far: 100 }}
      gl={{ antialias: true, alpha: false }}
      dpr={[1, 2]}
    >
      <color attach="background" args={['#050508']} />

      <Background progress={progress} />
      <Lights progress={progress} />
      <Watch progress={progress} />
      <CameraController progress={progress} />

      <EffectComposer>
        <Bloom
          intensity={bloomIntensity}
          luminanceThreshold={0.6}
          luminanceSmoothing={0.9}
          radius={0.8}
        />
        <ChromaticAberration
          blendFunction={BlendFunction.NORMAL}
          offset={[0.002, 0.002]}
        />
        <DepthOfField
          focusDistance={0.02}
          focalLength={0.05}
          bokehScale={3}
        />
        <Vignette
          offset={0.3}
          darkness={0.8}
          blendFunction={BlendFunction.NORMAL}
        />
      </EffectComposer>
    </Canvas>
  );
}
