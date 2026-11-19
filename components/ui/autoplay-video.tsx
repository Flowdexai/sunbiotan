'use client';

import { useCallback, useEffect, useRef, useState, type RefObject } from 'react';
import { m, AnimatePresence } from 'framer-motion';
import { Play, Pause, Volume2, VolumeX } from 'lucide-react';

interface AutoplayVideoProps {
  src: string;
  /** Texto de la pastilla "clic para activar el sonido". */
  clickHint: string;
  /** Etiquetas accesibles del botón de sonido (opcionales). */
  labels?: { mute?: string; unmute?: string };
  /**
   * Elemento cuya visibilidad (≥ 40 %) dispara la reproducción en silencio.
   * Por defecto, el propio reproductor. La home pasa su sección completa.
   */
  observeRef?: RefObject<HTMLElement | null>;
  className?: string;
}

/**
 * Reproductor del vídeo corto: arranca en silencio y en loop al entrar en
 * pantalla, se pausa al salir, y el primer clic activa el sonido. Extraído de
 * components/sections/scroll-video.tsx sin cambiar su comportamiento.
 */
export function AutoplayVideo({ src, clickHint, labels = {}, observeRef, className = '' }: AutoplayVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const boxRef = useRef<HTMLDivElement>(null);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(true);
  const [started, setStarted] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Cuando el vídeo deja de reproducirse, los controles vuelven a verse y se
  // cancela el temporizador que los ocultaba.
  const stopped = useCallback(() => {
    setPlaying(false);
    setShowControls(true);
    if (hideTimer.current) clearTimeout(hideTimer.current);
  }, []);

  useEffect(() => {
    const target = observeRef?.current ?? boxRef.current;
    const video = videoRef.current;
    if (!target || !video) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          video.play().then(() => setPlaying(true)).catch(() => {});
        } else {
          video.pause();
          stopped();
        }
      },
      { threshold: 0.4 }
    );

    observer.observe(target);
    return () => observer.disconnect();
  }, [observeRef, stopped]);

  useEffect(() => () => {
    if (hideTimer.current) clearTimeout(hideTimer.current);
  }, []);

  function handlePlayPause() {
    const video = videoRef.current;
    if (!video) return;

    if (!started) {
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
      stopped();
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

  // Mientras no esté reproduciendo con sonido activado, los controles se ven siempre.
  const controlsVisible = showControls || !playing || !started;

  return (
    <div
      ref={boxRef}
      className={`relative rounded-2xl overflow-hidden aspect-video bg-sunbiotan-900 cursor-pointer group shadow-2xl shadow-sunbiotan-950/80 ${className}`}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => {
        if (playing && started) {
          hideTimer.current = setTimeout(() => setShowControls(false), 1000);
        }
      }}
      onClick={handlePlayPause}
    >
      <video
        ref={videoRef}
        className="w-full h-full object-cover"
        preload="metadata"
        muted
        playsInline
        loop
        style={{ WebkitTransform: 'translateZ(0)' }}
      >
        <source src={src} type="video/mp4" />
      </video>

      <div className="absolute inset-0 bg-gradient-to-t from-sunbiotan-950/40 via-transparent to-transparent pointer-events-none" />

      <AnimatePresence>
        {controlsVisible && (
          <m.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="absolute inset-0 flex items-center justify-center pointer-events-none"
          >
            <div
              className="w-16 h-16 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center pointer-events-auto hover:bg-white/20 transition-all duration-300 hover:scale-110"
            >
              {playing && started ? (
                <Pause className="h-6 w-6 text-white" strokeWidth={1.5} />
              ) : (
                <Play className="h-6 w-6 text-white ml-0.5" strokeWidth={1.5} />
              )}
            </div>
          </m.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {!started && (
          <m.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.4, delay: 0.5 }}
            className="absolute bottom-5 left-1/2 -translate-x-1/2 pointer-events-none"
          >
            <p className="px-3 py-1 rounded-full bg-black/60 text-[11px] tracking-[0.3em] uppercase text-white font-medium">
              {clickHint}
            </p>
          </m.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {started && controlsVisible && (
          <m.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={e => { e.stopPropagation(); handleMute(); }}
            aria-label={muted ? labels.unmute : labels.mute}
            className="absolute bottom-4 right-4 w-9 h-9 rounded-full bg-black/30 backdrop-blur-sm border border-white/10 flex items-center justify-center text-white/70 hover:text-white hover:bg-black/50 transition-all duration-300"
          >
            {muted ? (
              <VolumeX className="h-4 w-4" strokeWidth={1.5} />
            ) : (
              <Volume2 className="h-4 w-4" strokeWidth={1.5} />
            )}
          </m.button>
        )}
      </AnimatePresence>
    </div>
  );
}
