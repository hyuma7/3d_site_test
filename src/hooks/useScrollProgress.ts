'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import Lenis from 'lenis';

export function useScrollProgress() {
  const [progress, setProgress] = useState(0);
  const [lenis, setLenis] = useState<Lenis | null>(null);
  const progressRef = useRef(0);
  const rafId = useRef<number>(0);

  const updateProgress = useCallback(() => {
    const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
    if (scrollHeight <= 0) return;

    const currentProgress = Math.min(1, Math.max(0, window.scrollY / scrollHeight));

    // Only update state if change is significant (reduces re-renders)
    if (Math.abs(currentProgress - progressRef.current) > 0.001) {
      progressRef.current = currentProgress;
      setProgress(currentProgress);
    }
  }, []);

  useEffect(() => {
    const lenisInstance = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      syncTouch: true,
    });

    setLenis(lenisInstance);

    // Use Lenis scroll callback for smoother updates
    lenisInstance.on('scroll', updateProgress);

    function raf(time: number) {
      lenisInstance.raf(time);
      rafId.current = requestAnimationFrame(raf);
    }

    rafId.current = requestAnimationFrame(raf);
    updateProgress();

    return () => {
      cancelAnimationFrame(rafId.current);
      lenisInstance.destroy();
    };
  }, [updateProgress]);

  return { progress, lenis };
}

// Section ranges (normalized 0-1)
export const SECTIONS = {
  hero: { start: 0, end: 0.2 },
  detail: { start: 0.2, end: 0.4 },
  explode: { start: 0.4, end: 0.65 },
  material: { start: 0.65, end: 0.85 },
  ending: { start: 0.85, end: 1 },
};

// Get section progress (0-1 within section)
export function getSectionProgress(progress: number, section: keyof typeof SECTIONS): number {
  const { start, end } = SECTIONS[section];
  if (progress < start) return 0;
  if (progress > end) return 1;
  return (progress - start) / (end - start);
}

// Easing functions
export const easings = {
  easeOutExpo: (t: number) => (t === 1 ? 1 : 1 - Math.pow(2, -10 * t)),
  easeInOutCubic: (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2),
  easeInOutQuart: (t: number) => (t < 0.5 ? 8 * t * t * t * t : 1 - Math.pow(-2 * t + 2, 4) / 2),
  easeInOutSine: (t: number) => -(Math.cos(Math.PI * t) - 1) / 2,
  easeOutQuint: (t: number) => 1 - Math.pow(1 - t, 5),
};

// Interpolation helper
export function lerp(start: number, end: number, t: number): number {
  return start + (end - start) * t;
}
