'use client';

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { getSectionProgress, easings, lerp, SECTIONS } from '@/hooks/useScrollProgress';
import { fresnelVertexShader, fresnelFragmentShader } from '@/shaders/fresnel.glsl';
import { holographicVertexShader, holographicFragmentShader } from '@/shaders/holographic.glsl';
import { pbrVertexShader, pbrFragmentShader } from '@/shaders/pbr.glsl';
import { displacementVertexShader, displacementFragmentShader } from '@/shaders/displacement.glsl';

interface WatchProps {
  progress: number;
}

// Watch case geometry
function WatchCase({ material }: { material: THREE.ShaderMaterial }) {
  return (
    <mesh>
      <cylinderGeometry args={[1, 1, 0.3, 64]} />
      <primitive object={material} attach="material" />
    </mesh>
  );
}

// Watch dial
function WatchDial({ material }: { material: THREE.ShaderMaterial }) {
  return (
    <mesh position={[0, 0.16, 0]} rotation={[Math.PI / 2, 0, 0]}>
      <circleGeometry args={[0.9, 64]} />
      <primitive object={material} attach="material" />
    </mesh>
  );
}

// Crown
function WatchCrown({ material, explodeProgress }: { material: THREE.ShaderMaterial; explodeProgress: number }) {
  const offset = explodeProgress * 1.5;
  return (
    <mesh position={[1.2 + offset, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
      <cylinderGeometry args={[0.08, 0.08, 0.2, 16]} />
      <primitive object={material} attach="material" />
    </mesh>
  );
}

// Watch crystal (glass)
function WatchCrystal({ material, explodeProgress }: { material: THREE.ShaderMaterial; explodeProgress: number }) {
  const offset = explodeProgress * 0.8;
  return (
    <mesh position={[0, 0.2 + offset, 0]}>
      <cylinderGeometry args={[0.95, 0.95, 0.1, 64]} />
      <primitive object={material} attach="material" />
    </mesh>
  );
}

// Movement (inner mechanism)
function WatchMovement({ material, explodeProgress }: { material: THREE.ShaderMaterial; explodeProgress: number }) {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (groupRef.current && explodeProgress > 0) {
      groupRef.current.rotation.y = state.clock.elapsedTime * 0.5 * explodeProgress;
    }
  });

  const offset = explodeProgress * -1.2;

  return (
    <group ref={groupRef} position={[0, offset, 0]}>
      {/* Main plate */}
      <mesh position={[0, -0.05, 0]}>
        <cylinderGeometry args={[0.7, 0.7, 0.05, 32]} />
        <primitive object={material} attach="material" />
      </mesh>
      {/* Gears */}
      {[0, 0.3, -0.3].map((x, i) => (
        <mesh key={i} position={[x, 0, i * 0.15 - 0.15]}>
          <torusGeometry args={[0.15 - i * 0.03, 0.02, 8, 16]} />
          <primitive object={material} attach="material" />
        </mesh>
      ))}
    </group>
  );
}

// Main watch component
export default function Watch({ progress }: WatchProps) {
  const groupRef = useRef<THREE.Group>(null);
  const timeRef = useRef(0);

  // Calculate section progresses
  const heroProgress = getSectionProgress(progress, 'hero');
  const detailProgress = getSectionProgress(progress, 'detail');
  const explodeProgress = getSectionProgress(progress, 'explode');
  const materialProgress = getSectionProgress(progress, 'material');
  const endingProgress = getSectionProgress(progress, 'ending');

  // Apply easings
  const easedHero = easings.easeOutExpo(heroProgress);
  const easedDetail = easings.easeInOutCubic(detailProgress);
  const easedExplode = easings.easeInOutQuart(explodeProgress);
  const easedEnding = easings.easeOutQuint(endingProgress);

  // Materials
  const fresnelMaterial = useMemo(() => {
    return new THREE.ShaderMaterial({
      vertexShader: fresnelVertexShader,
      fragmentShader: fresnelFragmentShader,
      uniforms: {
        uFresnelPower: { value: 3.0 },
        uFresnelScale: { value: 1.5 },
        uFresnelColor: { value: new THREE.Vector3(0.9, 0.95, 1.0) },
        uBaseColor: { value: new THREE.Vector3(0.15, 0.15, 0.18) },
        uTime: { value: 0 },
        uOpacity: { value: 1 },
      },
      transparent: true,
    });
  }, []);

  const holographicMaterial = useMemo(() => {
    return new THREE.ShaderMaterial({
      vertexShader: holographicVertexShader,
      fragmentShader: holographicFragmentShader,
      uniforms: {
        uTime: { value: 0 },
        uHoloIntensity: { value: 0 },
        uScanlineSpeed: { value: 2.0 },
        uRainbowSpread: { value: 0.5 },
        uBaseColor: { value: new THREE.Vector3(0.1, 0.1, 0.15) },
        uOpacity: { value: 1 },
      },
      transparent: true,
    });
  }, []);

  const glassMaterial = useMemo(() => {
    return new THREE.ShaderMaterial({
      vertexShader: pbrVertexShader,
      fragmentShader: pbrFragmentShader,
      uniforms: {
        uRoughness: { value: 0.05 },
        uMetalness: { value: 0.0 },
        uAoIntensity: { value: 1.0 },
        uEnvMapIntensity: { value: 2.0 },
        uAlbedo: { value: new THREE.Vector3(0.9, 0.9, 0.95) },
        uLightPosition: { value: new THREE.Vector3(5, 5, 5) },
        uLightColor: { value: new THREE.Vector3(1, 1, 1) },
        uLightIntensity: { value: 2.5 },
        uOpacity: { value: 0.3 },
      },
      transparent: true,
      side: THREE.DoubleSide,
    });
  }, []);

  const movementMaterial = useMemo(() => {
    return new THREE.ShaderMaterial({
      vertexShader: displacementVertexShader,
      fragmentShader: displacementFragmentShader,
      uniforms: {
        uDisplacement: { value: 0 },
        uFrequency: { value: 3.0 },
        uAmplitude: { value: 0.5 },
        uTime: { value: 0 },
        uColor: { value: new THREE.Vector3(0.8, 0.7, 0.5) },
        uGlowColor: { value: new THREE.Vector3(1.0, 0.8, 0.3) },
        uGlowIntensity: { value: 1.5 },
        uOpacity: { value: 1 },
      },
      transparent: true,
    });
  }, []);

  // PBR materials for different finishes
  const materials = useMemo(() => ({
    steel: new THREE.ShaderMaterial({
      vertexShader: pbrVertexShader,
      fragmentShader: pbrFragmentShader,
      uniforms: {
        uRoughness: { value: 0.2 },
        uMetalness: { value: 1.0 },
        uAoIntensity: { value: 1.0 },
        uEnvMapIntensity: { value: 1.5 },
        uAlbedo: { value: new THREE.Vector3(0.8, 0.8, 0.85) },
        uLightPosition: { value: new THREE.Vector3(5, 5, 5) },
        uLightColor: { value: new THREE.Vector3(1, 1, 1) },
        uLightIntensity: { value: 2.5 },
        uOpacity: { value: 1 },
      },
      transparent: true,
    }),
    gold: new THREE.ShaderMaterial({
      vertexShader: pbrVertexShader,
      fragmentShader: pbrFragmentShader,
      uniforms: {
        uRoughness: { value: 0.15 },
        uMetalness: { value: 1.0 },
        uAoIntensity: { value: 1.0 },
        uEnvMapIntensity: { value: 1.8 },
        uAlbedo: { value: new THREE.Vector3(1.0, 0.85, 0.55) },
        uLightPosition: { value: new THREE.Vector3(5, 5, 5) },
        uLightColor: { value: new THREE.Vector3(1, 1, 1) },
        uLightIntensity: { value: 2.5 },
        uOpacity: { value: 1 },
      },
      transparent: true,
    }),
    titanium: new THREE.ShaderMaterial({
      vertexShader: pbrVertexShader,
      fragmentShader: pbrFragmentShader,
      uniforms: {
        uRoughness: { value: 0.6 },
        uMetalness: { value: 0.9 },
        uAoIntensity: { value: 1.0 },
        uEnvMapIntensity: { value: 1.2 },
        uAlbedo: { value: new THREE.Vector3(0.5, 0.5, 0.55) },
        uLightPosition: { value: new THREE.Vector3(5, 5, 5) },
        uLightColor: { value: new THREE.Vector3(1, 1, 1) },
        uLightIntensity: { value: 2.5 },
        uOpacity: { value: 1 },
      },
      transparent: true,
    }),
  }), []);

  // Select material based on progress
  const currentMaterial = useMemo(() => {
    if (materialProgress < 0.33) return materials.steel;
    if (materialProgress < 0.66) return materials.gold;
    return materials.titanium;
  }, [materialProgress, materials]);

  // Animation loop
  useFrame((state, delta) => {
    timeRef.current += delta;

    if (!groupRef.current) return;

    const time = timeRef.current;

    // Update shader uniforms
    fresnelMaterial.uniforms.uTime.value = time;
    holographicMaterial.uniforms.uTime.value = time;
    holographicMaterial.uniforms.uHoloIntensity.value = easedHero * 0.8;
    movementMaterial.uniforms.uTime.value = time;
    movementMaterial.uniforms.uDisplacement.value = easedExplode * 0.3;

    // Hero section: emerge from darkness
    if (progress <= SECTIONS.hero.end) {
      const scale = lerp(0.3, 1.0, easedHero);
      groupRef.current.scale.setScalar(scale);
      groupRef.current.rotation.y = lerp(-Math.PI, 0, easedHero);
      groupRef.current.position.y = lerp(-2, 0, easedHero);
      fresnelMaterial.uniforms.uOpacity.value = easedHero;
    }
    // Detail section: zoom in on dial
    else if (progress <= SECTIONS.detail.end) {
      const scale = lerp(1.0, 1.8, easedDetail);
      groupRef.current.scale.setScalar(scale);
      groupRef.current.rotation.y = lerp(0, Math.PI / 6, easedDetail);
      groupRef.current.position.y = lerp(0, 0.3, easedDetail);
    }
    // Explode section: show mechanism
    else if (progress <= SECTIONS.explode.end) {
      groupRef.current.scale.setScalar(1.8);
      // Rotation handled by explode progress in children
    }
    // Material section: rotate continuously
    else if (progress <= SECTIONS.material.end) {
      const baseScale = lerp(1.8, 1.0, easedEnding > 0 ? easedEnding : 0);
      groupRef.current.scale.setScalar(baseScale);
      groupRef.current.rotation.y = time * 0.5;
    }
    // Ending section: reassemble
    else {
      const scale = lerp(1.0, 0.9, easedEnding);
      groupRef.current.scale.setScalar(scale);
    }
  });

  return (
    <group ref={groupRef}>
      <WatchCase material={progress > SECTIONS.material.start ? currentMaterial : fresnelMaterial} />
      <WatchDial material={holographicMaterial} />
      <WatchCrown material={progress > SECTIONS.material.start ? currentMaterial : fresnelMaterial} explodeProgress={easedExplode} />
      <WatchCrystal material={glassMaterial} explodeProgress={easedExplode} />
      <WatchMovement material={movementMaterial} explodeProgress={easedExplode} />
    </group>
  );
}
