'use client';

import { useRef, useEffect, useState } from 'react';
import { motion, useMotionValue, useTransform } from 'framer-motion';
import { useScrollProgress } from '@/hooks/use-scroll-progress';

const FRAMES = [
  '/images/aplicacao/frame-1.png',
  '/images/aplicacao/frame-2.png',
  '/images/aplicacao/frame-3.png',
  '/images/aplicacao/frame-4.png',
  '/images/aplicacao/frame-5.png',
  '/images/aplicacao/frame-6.png',
];

const N = FRAMES.length;
const OVERLAP = 0.08; // crossfade overlap between frames

function frameKeyframes(i: number): { input: number[]; opacity: number[]; scale: number[] } {
  if (i === 0) {
    // First frame: fully visible from the start, fades out as second arrives
    const fadeEnd = 1 / N + OVERLAP;
    return {
      input:   [0,    1 / N - OVERLAP, fadeEnd],
      opacity: [1,    1,               0],
      scale:   [1.0,  1.0,             1.03],
    };
  }
  if (i === N - 1) {
    // Last frame: fades in, stays visible until the very end
    const fadeStart = (N - 1) / N - OVERLAP;
    return {
      input:   [fadeStart,             (N - 1) / N + OVERLAP, 1],
      opacity: [0,                     1,                     1],
      scale:   [1.06,                  1.0,                   1.0],
    };
  }
  // Middle frames: fade in and out
  return {
    input:   [i / N - OVERLAP, i / N + OVERLAP, (i + 1) / N - OVERLAP, (i + 1) / N + OVERLAP],
    opacity: [0,               1,               1,                      0],
    scale:   [1.06,            1.0,             1.0,                    1.03],
  };
}

function MobileFrame({ src, i, progress }: { src: string; i: number; progress: ReturnType<typeof useMotionValue<number>> }) {
  const kf      = frameKeyframes(i);
  const opacity = useTransform(progress, kf.input, kf.opacity);
  const scale   = useTransform(progress, kf.input, kf.scale);

  return (
    <motion.div
      className="absolute inset-0"
      style={{ opacity, scale }}
    >
      {/* Blurred background fill */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt=""
        aria-hidden="true"
        className="absolute inset-0 w-full h-full object-cover scale-110"
        style={{ filter: 'blur(24px)', transform: 'scale(1.15)' }}
      />
      {/* Dark overlay on the blur */}
      <div className="absolute inset-0 bg-sunbiotan-950/40" />
      {/* Main image — full 16:9, centered */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={`Aplicação passo ${i + 1}`}
        className="absolute inset-0 w-full h-full object-contain"
      />
    </motion.div>
  );
}

export function ScrollVideo() {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const progress = useScrollProgress(containerRef);
  const motionProgress = useMotionValue(0);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  // Keep motionValue in sync with scroll progress
  useEffect(() => {
    motionProgress.set(progress);
  }, [progress, motionProgress]);

  // Desktop: scrub video with scroll
  useEffect(() => {
    if (isMobile) return;
    const video = videoRef.current;
    if (!video) return;
    const scrub = () => {
      if (video.readyState >= 2 && video.duration && !isNaN(video.duration)) {
        video.currentTime = video.duration * progress;
      }
    };
    if (video.readyState >= 2) scrub();
    else video.addEventListener('loadeddata', scrub, { once: true });
  }, [progress, isMobile]);

  const textOpacity = progress > 0.05 && progress < 0.92 ? 1 : 0;

  return (
    <section
      ref={containerRef}
      className="relative h-[250vh] bg-sunbiotan-950"
    >
      <div className="sticky top-0 h-screen overflow-hidden">

        {/* Golden progress bar */}
        <div className="absolute top-0 left-0 right-0 z-20 h-[1.5px] bg-sunbiotan-900/40">
          <div
            className="h-full bg-gradient-to-r from-sunbiotan-600 via-sunbiotan-400 to-sunbiotan-300 transition-none"
            style={{ width: `${progress * 100}%` }}
          />
        </div>

        {/* Mobile: image sequence */}
        {isMobile && FRAMES.map((src, i) => (
          <MobileFrame key={src} src={src} i={i} progress={motionProgress} />
        ))}

        {/* Desktop: scroll-scrubbed video */}
        {!isMobile && (
          // eslint-disable-next-line jsx-a11y/media-has-caption
          <video
            ref={videoRef}
            className="w-full h-full object-cover"
            preload="auto"
            muted
            playsInline
            style={{ WebkitTransform: 'translateZ(0)' }}
          >
            <source src="/videos/aplicacao.mp4" type="video/mp4" />
          </video>
        )}

        {/* Dark vignette */}
        <div className="absolute inset-0 bg-gradient-to-t from-sunbiotan-950/65 via-transparent to-sunbiotan-950/25 pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-b from-sunbiotan-950/30 via-transparent to-transparent pointer-events-none" />

        {/* Text overlay */}
        <div
          className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none transition-opacity duration-700 z-10"
          style={{ opacity: textOpacity }}
        >
          <motion.div className="text-center px-6">
            <p className="text-[10px] tracking-[0.45em] uppercase text-sunbiotan-300/60 font-light mb-4">
              A Arte da Aplicação
            </p>
            <h2 className="font-display font-light text-4xl md:text-6xl text-sunbiotan-100/90 leading-tight">
              Aplicação
              <br />
              <em className="not-italic italic text-sunbiotan-400">Profissional</em>
            </h2>
          </motion.div>
        </div>

        {/* Bottom progress indicator line */}
        <div
          className="absolute bottom-10 left-1/2 -translate-x-1/2 w-px transition-opacity duration-500"
          style={{
            height: '56px',
            background: 'linear-gradient(to bottom, rgba(193,154,91,0.5), transparent)',
            opacity: progress < 0.9 ? 0.7 - progress * 0.5 : 0,
          }}
        />
      </div>
    </section>
  );
}
