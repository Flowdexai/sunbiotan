'use client';

/*
 * Fotos: galería editorial en columnas CSS (respeta la proporción de cada foto,
 * sin recortar), cada una en un passe-partout crema con línea dorada interior.
 * Al tocar se abre un visor accesible (role="dialog", aria-modal, Esc, foco
 * atrapado y devuelto, flechas por botón y teclado, scroll del body bloqueado)
 * con la imagen a su tamaño natural como máximo.
 */

import { useEffect, useRef, useState, type KeyboardEvent } from 'react';
import { ArrowLeft, ArrowRight, X } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { BG, CARD_HOVER, Reveal, SectionHeader } from '@/components/pro/ui';
import { RESULT_PHOTOS, pad2, resultsMediaUrl } from '@/lib/results/config';

const FOCUS_RING = 'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sunbiotan-700';

export function ResultsPhotos() {
  const t = useTranslations('ResultsPage');
  const [open, setOpen] = useState<number | null>(null);
  const total = RESULT_PHOTOS.length;
  if (!total) return null;

  return (
    <section className={`py-16 md:py-24 ${BG.sandDeep}`}>
      <div className="container mx-auto px-4 sm:px-6">
        <SectionHeader tone="light" eyebrow={t('photosEyebrow')} lead={t('photosLead')} accent={t('photosAccent')} />
        <ul className="columns-2 gap-4 md:columns-3 md:gap-6 max-w-6xl mx-auto">
          {RESULT_PHOTOS.map((photo, i) => (
            <Reveal as="li" key={photo.file} delay={(i % 3) * 0.05} className="mb-4 md:mb-6 break-inside-avoid">
              <button
                type="button"
                onClick={() => setOpen(i)}
                aria-label={t('photoOpen', { n: i + 1, total })}
                className={`block w-full cursor-pointer rounded-sm border border-sunbiotan-300 bg-sunbiotan-50 p-3 md:p-4 shadow-md shadow-sunbiotan-950/10 ${CARD_HOVER} ${FOCUS_RING}`}
              >
                {/* Línea dorada fina por dentro del passe-partout. */}
                <span className="block border border-sunbiotan-400 p-1.5">
                  {/* eslint-disable-next-line @next/next/no-img-element -- images.unoptimized: <img> con tamaño explícito */}
                  <img
                    src={resultsMediaUrl(photo.file)}
                    alt={t('photoAlt', { n: i + 1, total })}
                    width={photo.width}
                    height={photo.height}
                    loading="lazy"
                    decoding="async"
                    className="block h-auto w-full"
                  />
                </span>
                <span aria-hidden="true" className="mt-3 block text-center text-[11px] leading-none tracking-[0.3em] uppercase font-medium text-sunbiotan-700">
                  {t('photoNumber', { n: pad2(i + 1) })}
                </span>
              </button>
            </Reveal>
          ))}
        </ul>
      </div>

      {open !== null && (
        <PhotoViewer
          index={open}
          onChange={(next) => setOpen(((next % total) + total) % total)}
          onClose={() => setOpen(null)}
        />
      )}
    </section>
  );
}

const FOCUSABLE = 'button:not([disabled]), [href], [tabindex]:not([tabindex="-1"])';

function PhotoViewer({ index, onChange, onClose }: { index: number; onChange: (next: number) => void; onClose: () => void }) {
  const t = useTranslations('ResultsPage');
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const total = RESULT_PHOTOS.length;
  const photo = RESULT_PHOTOS[index];

  // Al abrir: guarda quién tenía el foco, bloquea el scroll del body (compensando la
  // barra de scroll para que no salte el layout) y enfoca "Cerrar". Al cerrar: lo revierte
  // y devuelve el foco a la foto que abrió el visor.
  useEffect(() => {
    const opener = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const { body, documentElement } = document;
    const prevOverflow = body.style.overflow;
    const prevPadding = body.style.paddingRight;
    const scrollbar = window.innerWidth - documentElement.clientWidth;
    body.style.overflow = 'hidden';
    if (scrollbar > 0) body.style.paddingRight = `${scrollbar}px`;
    closeRef.current?.focus();
    return () => {
      body.style.overflow = prevOverflow;
      body.style.paddingRight = prevPadding;
      opener?.focus();
    };
  }, []);

  function onKeyDown(e: KeyboardEvent<HTMLDivElement>) {
    if (e.key === 'Escape') {
      e.preventDefault();
      onClose();
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      onChange(index - 1);
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      onChange(index + 1);
    } else if (e.key === 'Tab') {
      // Foco atrapado: del último vuelve al primero y viceversa.
      const items = Array.from(dialogRef.current?.querySelectorAll<HTMLElement>(FOCUSABLE) ?? []);
      if (!items.length) return;
      const first = items[0];
      const last = items[items.length - 1];
      const activeEl = document.activeElement;
      if (e.shiftKey && (activeEl === first || activeEl === dialogRef.current)) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && (activeEl === last || activeEl === dialogRef.current)) {
        e.preventDefault();
        first.focus();
      }
    }
  }

  const control =
    'inline-flex h-11 w-11 shrink-0 cursor-pointer items-center justify-center rounded-full border border-sunbiotan-700 text-sunbiotan-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sunbiotan-300';

  return (
    <div
      ref={dialogRef}
      role="dialog"
      aria-modal="true"
      aria-label={t('viewerLabel')}
      tabIndex={-1}
      onKeyDown={onKeyDown}
      className={`fixed inset-0 z-[60] flex flex-col ${BG.dark} outline-none`}
    >
      <div className="flex h-16 shrink-0 items-center justify-end px-3 sm:px-5">
        <button ref={closeRef} type="button" onClick={onClose} aria-label={t('viewerClose')} className={control}>
          <X className="h-5 w-5" strokeWidth={1.75} aria-hidden="true" />
        </button>
      </div>

      {/* Tocar fuera de la foto también cierra. */}
      <div
        className="flex min-h-0 flex-1 items-center justify-center px-4"
        onClick={(e) => {
          if (e.target === e.currentTarget) onClose();
        }}
      >
        {/* Tamaño natural como máximo (max-width = ancho real): las fotos chicas no se estiran ni pixelan. */}
        {/* eslint-disable-next-line @next/next/no-img-element -- images.unoptimized: <img> con tamaño explícito */}
        <img
          key={photo.file}
          src={resultsMediaUrl(photo.file)}
          alt={t('photoAlt', { n: index + 1, total })}
          width={photo.width}
          height={photo.height}
          decoding="async"
          className="block h-auto w-auto max-h-[calc(100svh-9rem)] object-contain"
          style={{ maxWidth: `min(100%, ${photo.width}px)` }}
        />
      </div>

      <div className="flex h-20 shrink-0 items-center justify-center gap-6 px-4">
        <button type="button" onClick={() => onChange(index - 1)} aria-label={t('viewerPrev')} className={control}>
          <ArrowLeft className="h-5 w-5" strokeWidth={1.75} aria-hidden="true" />
        </button>
        <p aria-live="polite" className="min-w-16 text-center font-display text-lg tabular-nums text-sunbiotan-100">
          {pad2(index + 1)} / {pad2(total)}
        </p>
        <button type="button" onClick={() => onChange(index + 1)} aria-label={t('viewerNext')} className={control}>
          <ArrowRight className="h-5 w-5" strokeWidth={1.75} aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}
