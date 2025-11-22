'use client';

import { useMemo } from 'react';
import { getSectionProgress, easings, SECTIONS } from '@/hooks/useScrollProgress';

interface SectionOverlayProps {
  progress: number;
}

export default function SectionOverlay({ progress }: SectionOverlayProps) {
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

  const currentSection = useMemo(() => {
    if (progress <= SECTIONS.hero.end) return 'hero';
    if (progress <= SECTIONS.detail.end) return 'detail';
    if (progress <= SECTIONS.explode.end) return 'explode';
    if (progress <= SECTIONS.material.end) return 'material';
    return 'ending';
  }, [progress]);

  const characterAspect = useMemo(() => {
    if (materialProgress < 0.33) return '千年を生きるエルフ';
    if (materialProgress < 0.66) return '勇者ヒンメルの仲間';
    return '葬送のフリーレン';
  }, [materialProgress]);

  return (
    <div className="fixed inset-0 pointer-events-none z-10">
      {/* Hero Section */}
      {currentSection === 'hero' && (
        <div
          className="absolute inset-0 flex items-center justify-center"
          style={{ opacity: easedHero > 0.3 ? Math.min(1, (easedHero - 0.3) * 2) : 0 }}
        >
          <div className="text-center">
            <h1 className="text-6xl md:text-8xl font-thin tracking-[0.3em] text-white mb-4">
              FRIEREN
            </h1>
            <p className="text-sm md:text-base tracking-[0.5em] text-white/60 uppercase">
              葬送のフリーレン
            </p>
          </div>
        </div>
      )}

      {/* Detail Section */}
      {currentSection === 'detail' && (
        <div
          className="absolute right-8 top-1/2 -translate-y-1/2 max-w-xs"
          style={{ opacity: easedDetail }}
        >
          <h2 className="text-2xl font-light tracking-wider text-white mb-4">
            千年の孤独
          </h2>
          <p className="text-sm text-white/70 leading-relaxed">
            魔王を倒した勇者パーティーの魔法使い。
            長命なエルフである彼女は、仲間との別れを経て
            「人を知る」旅に出る。
          </p>
          <div className="mt-6 space-y-2">
            <div className="flex justify-between text-xs text-white/50">
              <span>種族</span>
              <span>エルフ</span>
            </div>
            <div className="flex justify-between text-xs text-white/50">
              <span>年齢</span>
              <span>1000歳以上</span>
            </div>
          </div>
        </div>
      )}

      {/* Explode Section */}
      {currentSection === 'explode' && (
        <div
          className="absolute left-8 top-1/2 -translate-y-1/2 max-w-xs"
          style={{ opacity: easedExplode }}
        >
          <h2 className="text-2xl font-light tracking-wider text-white mb-4">
            魔法の探求者
          </h2>
          <p className="text-sm text-white/70 leading-relaxed">
            民間魔法から古代魔法まで、あらゆる魔法を収集する。
            「花畑を出す魔法」のような日常魔法も大切にする、
            魔法を愛する者。
          </p>
          <div className="mt-6">
            <div className="text-3xl font-thin text-white/90">
              一級魔法使い
            </div>
            <div className="text-xs text-white/50 uppercase tracking-wider">
              大陸魔法協会
            </div>
          </div>
        </div>
      )}

      {/* Material Section */}
      {currentSection === 'material' && (
        <div
          className="absolute bottom-16 left-1/2 -translate-x-1/2 text-center"
          style={{ opacity: easedMaterial }}
        >
          <p className="text-xs text-white/50 uppercase tracking-[0.3em] mb-2">
            Character
          </p>
          <h2 className="text-3xl font-light tracking-wider text-white">
            {characterAspect}
          </h2>
        </div>
      )}

      {/* Ending Section */}
      {currentSection === 'ending' && (
        <div
          className="absolute inset-0 flex items-center justify-center"
          style={{ opacity: easedEnding }}
        >
          <div className="text-center">
            <p className="text-xs text-white/50 uppercase tracking-[0.5em] mb-4">
              TVアニメ好評放送中
            </p>
            <h2 className="text-5xl md:text-7xl font-thin text-white mb-6">
              葬送のフリーレン
            </h2>
            <button className="pointer-events-auto px-8 py-3 border border-white/30 text-sm uppercase tracking-widest text-white hover:bg-white hover:text-black transition-all duration-300">
              Watch Now
            </button>
          </div>
        </div>
      )}

      {/* Progress indicator */}
      <div className="absolute bottom-8 left-8">
        <div className="w-16 h-[2px] bg-white/20">
          <div
            className="h-full bg-white transition-all duration-150"
            style={{ width: `${progress * 100}%` }}
          />
        </div>
      </div>

      {/* Section dots */}
      <div className="absolute right-8 top-1/2 -translate-y-1/2 space-y-3">
        {(['hero', 'detail', 'explode', 'material', 'ending'] as const).map((section) => (
          <div
            key={section}
            className={`w-2 h-2 rounded-full transition-all duration-300 ${
              currentSection === section ? 'bg-white scale-125' : 'bg-white/30'
            }`}
          />
        ))}
      </div>
    </div>
  );
}
