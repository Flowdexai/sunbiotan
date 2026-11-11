// components/dashboard/file-upload.tsx
'use client';

import { useMemo, useRef, useState } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { Upload, X, Loader2, FileText } from 'lucide-react';
import Image from 'next/image';

interface FileUploadProps {
  bucket: string;
  /** Carpeta dentro del bucket (p. ej. la categoría del recurso). */
  folder?: string;
  /** Atributo accept del input (p. ej. ".pdf,.mp4"). */
  accept?: string;
  /** Extensiones permitidas en minúscula, sin punto. Vacío = cualquiera. */
  allowedExtensions?: string[];
  maxSizeMB?: number;
  /**
   * Bucket privado: onUpload recibe el PATH del objeto (no una URL) y no se
   * pide URL pública. Bucket público: recibe la URL pública (comportamiento previo).
   */
  isPrivate?: boolean;
  /** Valor actual: path (privado) o URL pública (público). */
  currentValue?: string | null;
  /**
   * Si es true, al quitar el archivo se borra el objeto del bucket en el momento.
   * En formularios con "Guardar" conviene false y borrar al guardar.
   */
  deleteOnRemove?: boolean;
  imagePreview?: boolean;
  label?: string;
  hint?: string;
  errorSize?: (maxMB: number) => string;
  errorType?: string;
  errorUpload?: string;
  onUpload: (value: string) => void;
  onRemove: () => void;
}

/** "Presentação Sistema (v2).PDF" → "apresentacao-sistema-v2.pdf" */
export function sanitizeFileName(name: string): string {
  const dot = name.lastIndexOf('.');
  const base = dot > 0 ? name.slice(0, dot) : name;
  const ext = dot > 0 ? name.slice(dot + 1).toLowerCase().replace(/[^a-z0-9]/g, '') : '';
  const cleanBase = base
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80) || 'ficheiro';
  return ext ? `${cleanBase}.${ext}` : cleanBase;
}

function newId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return crypto.randomUUID();
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export function FileUpload({
  bucket,
  folder = '',
  accept = '*/*',
  allowedExtensions = [],
  maxSizeMB = 10,
  isPrivate = false,
  currentValue,
  deleteOnRemove = true,
  imagePreview = false,
  label,
  hint,
  errorSize = (mb) => `O ficheiro não pode ter mais de ${mb} MB.`,
  errorType = 'Tipo de ficheiro não permitido.',
  errorUpload = 'Erro ao fazer upload. Tente novamente.',
  onUpload,
  onRemove,
}: FileUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const supabase = useMemo(
    () => createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!),
    []
  );

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const ext = file.name.includes('.') ? file.name.split('.').pop()!.toLowerCase() : '';
    if (allowedExtensions.length > 0 && !allowedExtensions.includes(ext)) {
      setError(errorType);
      if (inputRef.current) inputRef.current.value = '';
      return;
    }
    if (file.size > maxSizeMB * 1024 * 1024) {
      setError(errorSize(maxSizeMB));
      if (inputRef.current) inputRef.current.value = '';
      return;
    }

    setUploading(true);
    setError('');

    const fileName = `${newId()}-${sanitizeFileName(file.name)}`;
    const filePath = folder ? `${folder}/${fileName}` : fileName;

    const { error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(filePath, file, { upsert: false, contentType: file.type || undefined });

    if (uploadError) {
      setError(errorUpload);
      setUploading(false);
      return;
    }

    if (isPrivate) {
      onUpload(filePath);
    } else {
      const { data } = supabase.storage.from(bucket).getPublicUrl(filePath);
      onUpload(data.publicUrl);
    }
    setUploading(false);
  };

  const handleRemove = async () => {
    if (!currentValue) return;

    if (deleteOnRemove) {
      const filePath = isPrivate
        ? currentValue
        : currentValue.split(`/storage/v1/object/public/${bucket}/`)[1];
      if (filePath) await supabase.storage.from(bucket).remove([filePath]);
    }

    onRemove();
    if (inputRef.current) inputRef.current.value = '';
  };

  const fileName = currentValue ? currentValue.split('/').pop() : null;
  const isImage = !isPrivate && (imagePreview || (currentValue && /\.(jpg|jpeg|png|webp|gif|svg)$/i.test(currentValue)));

  return (
    <div className="space-y-2">
      {currentValue ? (
        isImage ? (
          <div className="relative h-44 rounded-xl overflow-hidden border border-sunbiotan-200">
            <Image src={currentValue} alt="Preview" fill sizes="100vw" className="object-cover" />
            <button
              type="button"
              onClick={handleRemove}
              className="absolute top-2 right-2 w-8 h-8 rounded-full bg-white/90 flex items-center justify-center text-red-500 hover:bg-white"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <div className="flex items-center justify-between gap-3 px-4 py-3 rounded-xl border border-sunbiotan-200 bg-sunbiotan-50">
            <div className="flex items-center gap-3 min-w-0">
              <FileText className="h-5 w-5 text-sunbiotan-600 flex-shrink-0" />
              <span className="text-sm text-sunbiotan-800 truncate">{fileName}</span>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              {!isPrivate && (
                <a href={currentValue} target="_blank" rel="noopener noreferrer" className="text-xs text-sunbiotan-600 hover:underline">
                  Ver ficheiro
                </a>
              )}
              <button type="button" onClick={handleRemove} className="w-8 h-8 rounded-lg flex items-center justify-center text-red-500 hover:bg-red-50">
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        )
      ) : (
        <div
          role="button"
          tabIndex={0}
          onClick={() => !uploading && inputRef.current?.click()}
          onKeyDown={(e) => { if ((e.key === 'Enter' || e.key === ' ') && !uploading) inputRef.current?.click(); }}
          className={`flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-sunbiotan-200 hover:border-sunbiotan-400 bg-sunbiotan-50/50 transition-colors ${
            uploading ? 'cursor-not-allowed opacity-70' : 'cursor-pointer'
          } ${imagePreview ? 'h-44' : 'h-28'}`}
        >
          {uploading ? (
            <Loader2 className="h-6 w-6 animate-spin text-sunbiotan-500" />
          ) : (
            <>
              <Upload className="h-5 w-5 text-sunbiotan-500" />
              <p className="text-sm text-sunbiotan-700">{label || 'Clique para fazer upload'}</p>
              {hint && <p className="text-xs text-sunbiotan-500 px-4 text-center">{hint}</p>}
            </>
          )}
        </div>
      )}

      {error && <p className="text-xs text-red-600">{error}</p>}

      <input ref={inputRef} type="file" accept={accept} onChange={handleUpload} className="hidden" />
    </div>
  );
}
