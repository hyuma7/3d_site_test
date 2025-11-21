'use client';

import { useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { getSectionProgress, easings, lerp, SECTIONS } from '@/hooks/useScrollProgress';

interface CameraControllerProps {
  progress: number;
}

export default function CameraController({ progress }: CameraControllerProps) {
  const { camera } = useThree();
  const targetRef = useRef(new THREE.Vector3(0, 0, 0));

  useFrame(() => {
    const heroProgress = getSectionProgress(progress, 'hero');
    const detailProgress = getSectionProgress(progress, 'detail');
    const explodeProgress = getSectionProgress(progress, 'explode');
    const materialProgress = getSectionProgress(progress, 'material');
    const endingProgress = getSectionProgress(progress, 'ending');

    const easedHero = easings.easeOutExpo(heroProgress);
    const easedDetail = easings.easeInOutCubic(detailProgress);
    const easedExplode = easings.easeInOutQuart(explodeProgress);
    const easedMaterial = easings.easeInOutSine(materialProgress);
    const easedEnding = easings.easeOutQuint(endingProgress);

    let camPos = new THREE.Vector3();
    let targetPos = new THREE.Vector3(0, 0, 0);

    // Hero: [0, 0, 8] → [0, 0, 5]
    if (progress <= SECTIONS.hero.end) {
      camPos.set(0, 0, lerp(8, 5, easedHero));
      targetPos.set(0, 0, 0);
    }
    // Detail: [0, 0, 5] → [0, 0.5, 2]
    else if (progress <= SECTIONS.detail.end) {
      camPos.set(0, lerp(0, 0.5, easedDetail), lerp(5, 2, easedDetail));
      targetPos.set(0, lerp(0, 0.5, easedDetail), 0);
    }
    // Explode: [0, 0.5, 2] → [2, 1, 4]
    else if (progress <= SECTIONS.explode.end) {
      camPos.set(
        lerp(0, 2, easedExplode),
        lerp(0.5, 1, easedExplode),
        lerp(2, 4, easedExplode)
      );
      targetPos.set(0, 0.5, 0);
    }
    // Material: [2, 1, 4] → [0, 0, 4]
    else if (progress <= SECTIONS.material.end) {
      camPos.set(
        lerp(2, 0, easedMaterial),
        lerp(1, 0, easedMaterial),
        4
      );
      targetPos.set(0, 0, 0);
    }
    // Ending: [0, 0, 4] → [0, 0, 6]
    else {
      camPos.set(0, 0, lerp(4, 6, easedEnding));
      targetPos.set(0, 0, 0);
    }

    // Smooth camera movement
    camera.position.lerp(camPos, 0.1);
    targetRef.current.lerp(targetPos, 0.1);
    camera.lookAt(targetRef.current);
  });

  return null;
}
