// components/dashboard/file-upload.tsx
'use client';

import { useState, useRef } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { Upload, X, Loader2, ImageIcon, FileText, File } from 'lucide-react';
import Image from 'next/image';

interface FileUploadProps {
  bucket: string;
  folder?: string;
  accept?: string;
  maxSizeMB?: number;
  currentUrl?: string | null;
  imagePreview?: boolean; // true = mostrar preview de imagen, false = mostrar nombre de archivo
  label?: string;
  hint?: string;
  onUpload: (url: string) => void;
  onRemove: () => void;
}

export function FileUpload({
  bucket,
  folder = '',
  accept = '*/*',
  maxSizeMB = 10,
  currentUrl,
  imagePreview = false,
  label,
  hint,
  onUpload,
  onRemove,
}: FileUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > maxSizeMB * 1024 * 1024) {
      setError(`O arquivo não pode ter mais de ${maxSizeMB}MB.`);
      return;
    }

    setUploading(true);
    setError('');

    const fileExt = file.name.split('.').pop();
    const baseName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${fileExt}`;
    const filePath = folder ? `${folder}/${baseName}` : baseName;

    const { error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(filePath, file, { upsert: false });

    if (uploadError) {
      setError('Erro ao fazer upload. Tente novamente.');
      setUploading(false);
      return;
    }

    const { data } = supabase.storage.from(bucket).getPublicUrl(filePath);
    onUpload(data.publicUrl);
    setUploading(false);
  };

  const handleRemove = async () => {
    if (!currentUrl) return;

    // Extrae el path relativo dentro del bucket desde la URL pública
    const urlParts = currentUrl.split(`/storage/v1/object/public/${bucket}/`);
    const filePath = urlParts[1];
    if (filePath) {
      await supabase.storage.from(bucket).remove([filePath]);
    }

    onRemove();
    if (inputRef.current) inputRef.current.value = '';
  };

  const fileName = currentUrl ? currentUrl.split('/').pop() : null;
  const isImage = imagePreview || (currentUrl && /\.(jpg|jpeg|png|webp|gif|svg)$/i.test(currentUrl));

  return (
    <div className="space-y-2">
      {currentUrl ? (
        <div className="relative">
          {isImage ? (
            // Preview imagen
            <div className="relative w-full h-44 rounded-xl overflow-hidden border border-sunbiotan-200">
              <Image
                src={currentUrl}
                alt="Preview"
                fill
                sizes="100vw"
                className="object-cover"
              />
              <button
                type="button"
                onClick={handleRemove}
                className="absolute top-3 right-3 w-8 h-8 bg-black/50 hover:bg-black/70 rounded-full flex items-center justify-center transition-colors"
              >
                <X className="h-4 w-4 text-white" />
              </button>
            </div>
          ) : (
            // Preview archivo genérico
            <div className="flex items-center gap-3 px-4 py-3 rounded-xl border border-sunbiotan-200 bg-sunbiotan-50">
              <div className="w-9 h-9 rounded-lg bg-sunbiotan-100 flex items-center justify-center flex-shrink-0">
                <FileText className="h-4 w-4 text-sunbiotan-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-sunbiotan-800 truncate">{fileName}</p>
                <a
                  href={currentUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-sunbiotan-500 hover:text-sunbiotan-700 transition-colors"
                >
                  Ver arquivo
                </a>
              </div>
              <button
                type="button"
                onClick={handleRemove}
                className="w-8 h-8 rounded-lg hover:bg-sunbiotan-200 flex items-center justify-center transition-colors flex-shrink-0"
              >
                <X className="h-4 w-4 text-sunbiotan-500" />
              </button>
            </div>
          )}
        </div>
      ) : (
        // Área de upload
        <div
          onClick={() => !uploading && inputRef.current?.click()}
          className={`w-full rounded-xl border-2 border-dashed border-sunbiotan-200 hover:border-sunbiotan-400 bg-sunbiotan-50 hover:bg-sunbiotan-100/50 flex flex-col items-center justify-center transition-all ${
            uploading ? 'cursor-not-allowed opacity-70' : 'cursor-pointer'
          } ${imagePreview ? 'h-44' : 'h-28'}`}
        >
          {uploading ? (
            <>
              <Loader2 className="h-7 w-7 text-sunbiotan-400 animate-spin mb-2" />
              <p className="text-sm text-sunbiotan-600">A fazer upload...</p>
            </>
          ) : (
            <>
              <div className="w-10 h-10 rounded-full bg-sunbiotan-100 flex items-center justify-center mb-2">
                {imagePreview ? (
                  <ImageIcon className="h-5 w-5 text-sunbiotan-500" />
                ) : (
                  <Upload className="h-5 w-5 text-sunbiotan-500" />
                )}
              </div>
              <p className="text-sm font-medium text-sunbiotan-700">
                {label || 'Clique para fazer upload'}
              </p>
              {hint && (
                <p className="text-xs text-sunbiotan-400 mt-0.5">{hint}</p>
              )}
            </>
          )}
        </div>
      )}

      {error && <p className="text-red-600 text-xs">{error}</p>}

      <input
        ref={inputRef}
        type="file"
        accept={accept}
        onChange={handleUpload}
        className="hidden"
      />
    </div>
  );
}
