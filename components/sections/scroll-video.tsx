'use client';

import { useRef, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, Volume2, VolumeX } from 'lucide-react';

const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];

export function VideoSection() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const sectionRef = useRef<HTMLElement>(null);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(true);
  const [started, setStarted] = useState(false); // user pressed play at least once
  const [showControls, setShowControls] = useState(true);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Autoplay muted when enters viewport
  useEffect(() => {
    const section = sectionRef.current;
    const video = videoRef.current;
    if (!section || !video) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          video.play().then(() => setPlaying(true)).catch(() => {});
        } else {
          video.pause();
          setPlaying(false);
        }
      },
      { threshold: 0.4 }
    );

    observer.observe(section);
    return () => observer.disconnect();
  }, []);

  function handlePlayPause() {
    const video = videoRef.current;
    if (!video) return;

    if (!started) {
      // First click: unmute and play
      video.muted = false;
      setMuted(false);
      setStarted(true);
      video.play().then(() => setPlaying(true)).catch(() => {});
      return;
    }

    if (video.paused) {
      video.play().then(() => setPlaying(true)).catch(() => {});
    } else {
      video.pause();
      setPlaying(false);
    }
  }

  function handleMute() {
    const video = videoRef.current;
    if (!video) return;
    video.muted = !video.muted;
    setMuted(video.muted);
  }

  function handleMouseMove() {
    setShowControls(true);
    if (hideTimer.current) clearTimeout(hideTimer.current);
    if (playing && started) {
      hideTimer.current = setTimeout(() => setShowControls(false), 2500);
    }
  }

  useEffect(() => {
    if (!playing || !started) {
      setShowControls(true);
      if (hideTimer.current) clearTimeout(hideTimer.current);
    }
  }, [playing, started]);

  return (
    <section
      ref={sectionRef}
      className="relative bg-sunbiotan-950 py-16 md:py-24"
    >
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 14, filter: 'blur(3px)' }}
        whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
        viewport={{ once: false, amount: 0.2 }}
        transition={{ duration: 0.7, ease: EASE }}
        className="text-center mb-10 px-6"
      >
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="h-px w-8 bg-sunbiotan-600/50" />
          <p className="text-[10px] tracking-[0.45em] uppercase text-sunbiotan-500 font-medium">
            A Arte da Aplicação
          </p>
          <div className="h-px w-8 bg-sunbiotan-600/50" />
        </div>
        <h2 className="font-display font-light text-5xl md:text-7xl text-sunbiotan-100 leading-[1.05] tracking-tight">
          Aplicação{' '}
          <em className="not-italic italic text-sunbiotan-400">Profissional</em>
        </h2>
      </motion.div>

      {/* Video container */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: false, amount: 0.2 }}
        transition={{ duration: 0.8, delay: 0.15, ease: EASE }}
        className="container mx-auto px-6"
      >
        <div
          className="relative rounded-2xl overflow-hidden aspect-video bg-sunbiotan-900 cursor-pointer group shadow-2xl shadow-sunbiotan-950/80"
          onMouseMove={handleMouseMove}
          onMouseLeave={() => {
            if (playing && started) {
              hideTimer.current = setTimeout(() => setShowControls(false), 1000);
            }
          }}
          onClick={handlePlayPause}
        >
          {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
          <video
            ref={videoRef}
            className="w-full h-full object-cover"
            preload="metadata"
            muted
            playsInline
            loop
            style={{ WebkitTransform: 'translateZ(0)' }}
          >
            <source src="/videos/SUNBIOTAN-musica.mp4" type="video/mp4" />
          </video>

          {/* Vignette */}
          <div className="absolute inset-0 bg-gradient-to-t from-sunbiotan-950/40 via-transparent to-transparent pointer-events-none" />

          {/* Controls overlay */}
          <AnimatePresence>
            {showControls && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="absolute inset-0 flex items-center justify-center pointer-events-none"
              >
                {/* Play/Pause button central */}
                <div className="w-16 h-16 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center pointer-events-auto hover:bg-white/20 transition-all duration-300 hover:scale-110">
                  {playing && started ? (
                    <Pause className="h-6 w-6 text-white" strokeWidth={1.5} />
                  ) : (
                    <Play className="h-6 w-6 text-white ml-0.5" strokeWidth={1.5} />
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* First play hint */}
          <AnimatePresence>
            {!started && (
              <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.4, delay: 0.5 }}
                className="absolute bottom-5 left-1/2 -translate-x-1/2 pointer-events-none"
              >
                <p className="text-[10px] tracking-[0.3em] uppercase text-white/50 font-light">
                  Clique para ativar o som
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Mute button — bottom right */}
          <AnimatePresence>
            {started && showControls && (
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={e => { e.stopPropagation(); handleMute(); }}
                className="absolute bottom-4 right-4 w-9 h-9 rounded-full bg-black/30 backdrop-blur-sm border border-white/10 flex items-center justify-center text-white/70 hover:text-white hover:bg-black/50 transition-all duration-300"
              >
                {muted ? (
                  <VolumeX className="h-4 w-4" strokeWidth={1.5} />
                ) : (
                  <Volume2 className="h-4 w-4" strokeWidth={1.5} />
                )}
              </motion.button>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </section>
  );
}