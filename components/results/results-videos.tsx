'use client';

/*
 * Vídeos: UN solo <video> y 6 miniaturas. Sin carrusel ni avance automático.
 *   · Portada con botón de play grande; el sonido arranca solo por gesto del usuario.
 *   · Miniatura → carga ese vídeo y lo reproduce; si play() falla, vuelve la portada.
 *   · Al terminar queda en pausa con "Repetir". Un único elemento = un solo audio a la vez.
 *
 * El src se cambia de forma imperativa en el handler del clic (dentro del gesto,
 * así iOS/Safari permiten el play con sonido). React solo pone el src inicial, que
 * es una constante y nunca cambia entre renders: no vuelve a escribir el atributo
 * (re-escribir el src de un <video> reinicia la carga y cortaría la reproducción).
 */

import { useRef, useState } from 'react';
import { Play } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { SectionEyebrow } from '@/components/ui/section-eyebrow';
import { SectionHeading } from '@/components/ui/section-heading';
import { BG, CARD_HOVER, Reveal } from '@/components/pro/ui';
import { RESULT_VIDEOS, formatDuration, pad2, resultsMediaUrl } from '@/lib/results/config';

type Phase = 'cover' | 'playing' | 'ended';

const INITIAL_SRC = RESULT_VIDEOS.length ? resultsMediaUrl(RESULT_VIDEOS[0].file) : undefined;

export function ResultsVideos() {
  const t = useTranslations('ResultsPage');
  const videoRef = useRef<HTMLVideoElement>(null);
  // Cada pedido de play tiene un número: si un play viejo falla tarde (p. ej. AbortError
  // por cambiar de vídeo), no pisa el estado del vídeo nuevo.
  const requestRef = useRef(0);
  const [active, setActive] = useState(0);
  const [phase, setPhase] = useState<Phase>('cover');

  const total = RESULT_VIDEOS.length;
  if (!total) return null;
  const current = RESULT_VIDEOS[active];
  const n = active + 1;

  function play(index: number) {
    const video = videoRef.current;
    if (!video) return;
    if (index !== active) {
      video.pause();
      video.src = resultsMediaUrl(RESULT_VIDEOS[index].file);
      setActive(index);
    }
    setPhase('playing');
    const request = ++requestRef.current;
    const promise = video.play();
    promise?.catch(() => {
      if (request === requestRef.current) setPhase('cover');
    });
  }

  const focusRing = 'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sunbiotan-700';

  return (
    <section className={`py-16 md:py-24 ${BG.cream}`}>
      <div className="container mx-auto px-4 sm:px-6">
        <div className="grid gap-8 md:gap-10 lg:grid-cols-[minmax(0,22.5rem)_minmax(0,1fr)] lg:gap-x-16 lg:gap-y-8 max-w-6xl mx-auto">
          {/* Texto: arriba en móvil; columna derecha en lg+. */}
          <Reveal className="lg:col-start-2 lg:row-start-1 lg:self-end">
            <SectionEyebrow tone="light" align="start" className="mb-4">
              {t('videosEyebrow')}
            </SectionEyebrow>
            <SectionHeading tone="light" lead={t('videosLead')} accent={t('videosAccent')} className="text-[clamp(2.1rem,5vw,3.6rem)]" />
            <p className="mt-5 max-w-xl text-base md:text-lg leading-relaxed text-sunbiotan-800">{t('videosText')}</p>
          </Reveal>

          {/* Marco vertical 9:16: bisel oscuro, anillo dorado de 1 px y sombra suave. */}
          <Reveal className="lg:col-start-1 lg:row-start-1 lg:row-span-2 lg:self-center">
            <div
              role="group"
              aria-label={t('videoFrame', { n, total })}
              className="mx-auto w-full max-w-[22.5rem] rounded-[2rem] bg-sunbiotan-950 p-2 ring-1 ring-sunbiotan-500 shadow-xl shadow-sunbiotan-950/20"
            >
              <div className="relative aspect-[9/16] overflow-hidden rounded-[1.5rem] bg-sunbiotan-900">
                <video
                  ref={videoRef}
                  src={INITIAL_SRC}
                  poster={resultsMediaUrl(current.poster)}
                  width={current.width}
                  height={current.height}
                  preload="none"
                  playsInline
                  controls={phase === 'playing'}
                  onEnded={() => setPhase('ended')}
                  className="absolute inset-0 h-full w-full object-contain"
                />

                {phase === 'cover' && (
                  <button
                    type="button"
                    onClick={() => play(active)}
                    aria-label={t('videoPlay', { n, total })}
                    className="absolute inset-0 flex cursor-pointer items-center justify-center focus-visible:outline-2 focus-visible:-outline-offset-4 focus-visible:outline-sunbiotan-300"
                  >
                    <span className="flex h-18 w-18 items-center justify-center rounded-full bg-sunbiotan-50 text-sunbiotan-950 shadow-xl shadow-sunbiotan-950/30">
                      <Play className="ml-1 h-8 w-8" fill="currentColor" strokeWidth={1.5} aria-hidden="true" />
                    </span>
                  </button>
                )}

                {phase === 'ended' && (
                  <button
                    type="button"
                    onClick={() => play(active)}
                    aria-label={t('videoReplayLabel', { n, total })}
                    className="absolute inset-0 flex cursor-pointer flex-col items-center justify-center gap-3 focus-visible:outline-2 focus-visible:-outline-offset-4 focus-visible:outline-sunbiotan-300"
                  >
                    <span className="flex h-16 w-16 items-center justify-center rounded-full bg-sunbiotan-50 text-sunbiotan-950 shadow-xl shadow-sunbiotan-950/30">
                      <Play className="ml-1 h-7 w-7" fill="currentColor" strokeWidth={1.5} aria-hidden="true" />
                    </span>
                    <span className="rounded-full bg-sunbiotan-950 px-4 py-1.5 text-xs tracking-[0.14em] uppercase font-semibold text-sunbiotan-50">
                      {t('videoReplay')}
                    </span>
                  </button>
                )}
              </div>
            </div>
          </Reveal>

          {/* Contador y miniaturas: fila con scroll y snap en móvil; grilla de 6 en lg+. */}
          <Reveal className="min-w-0 lg:col-start-2 lg:row-start-2 lg:self-start">
            <p className="mb-3 font-display text-xl tabular-nums text-sunbiotan-900" aria-hidden="true">
              {pad2(n)} <span className="text-sunbiotan-700">/ {pad2(total)}</span>
            </p>
            <ul
              aria-label={t('thumbsLabel')}
              className="-mx-4 flex snap-x snap-mandatory scroll-px-4 gap-3 overflow-x-auto px-4 pt-1 pb-3 sm:-mx-6 sm:scroll-px-6 sm:px-6 lg:mx-0 lg:grid lg:grid-cols-6 lg:overflow-visible lg:px-0 lg:pb-0"
            >
              {RESULT_VIDEOS.map((v, i) => {
                const selected = i === active;
                return (
                  <li key={v.file} className="w-24 shrink-0 snap-start sm:w-28 lg:w-auto">
                    <button
                      type="button"
                      onClick={() => play(i)}
                      aria-pressed={selected}
                      aria-label={t('videoThumb', { n: i + 1, total })}
                      className={`relative block w-full cursor-pointer overflow-hidden rounded-xl border bg-sunbiotan-950 ${
                        selected ? 'border-sunbiotan-700 ring-2 ring-sunbiotan-700' : 'border-sunbiotan-200'
                      } ${CARD_HOVER} ${focusRing}`}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element -- images.unoptimized: <img> con tamaño explícito */}
                      <img
                        src={resultsMediaUrl(v.poster)}
                        alt=""
                        width={v.width}
                        height={v.height}
                        loading="lazy"
                        decoding="async"
                        className="block aspect-[9/16] h-auto w-full object-cover"
                      />
                      <span aria-hidden="true" className="absolute left-1.5 top-1.5 rounded-md bg-sunbiotan-950 px-1.5 py-0.5 font-display text-sm leading-none text-sunbiotan-50">
                        {pad2(i + 1)}
                      </span>
                      <span aria-hidden="true" className="absolute bottom-1.5 right-1.5 rounded-md bg-sunbiotan-950 px-1.5 py-0.5 text-[11px] leading-none tabular-nums text-sunbiotan-50">
                        {formatDuration(v.duration)}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
