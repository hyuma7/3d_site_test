'use client';

import dynamic from 'next/dynamic';
import { useScrollProgress } from '@/hooks/useScrollProgress';
import SectionOverlay from '@/components/ui/SectionOverlay';

// Dynamic import to avoid SSR issues with Three.js
const Scene = dynamic(() => import('@/components/3d/Scene'), {
  ssr: false,
  loading: () => (
    <div className="fixed inset-0 bg-[#050508] flex items-center justify-center">
      <div className="text-white/50 text-sm tracking-widest uppercase">Loading...</div>
    </div>
  ),
});

export default function Home() {
  const { progress } = useScrollProgress();

  return (
    <main>
      {/* Scroll container - total 1000vh for all sections */}
      <div className="h-[1000vh]">
        {/* Video background */}
        <div className="fixed inset-0 z-0">
          <video
            autoPlay
            loop
            muted
            playsInline
            className="absolute inset-0 w-full h-full object-cover"
          >
            <source src="/background.mp4" type="video/mp4" />
          </video>
          {/* Dark overlay for better contrast - makes 3D model stand out */}
          <div className="absolute inset-0 bg-black/70" />
        </div>

        {/* Fixed 3D scene */}
        <div className="fixed inset-0 z-10">
          <Scene progress={progress} />
        </div>

        {/* UI Overlay */}
        <SectionOverlay progress={progress} />

        {/* Scroll hint */}
        {progress < 0.05 && (
          <div className="fixed bottom-16 left-1/2 -translate-x-1/2 text-white/40 text-xs tracking-widest uppercase animate-bounce z-20">
            Scroll to explore
          </div>
        )}
      </div>
    </main>
  );
}
