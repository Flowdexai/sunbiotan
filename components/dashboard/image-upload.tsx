// components/dashboard/image-upload.tsx
'use client';

import { useState, useRef } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { Upload, X, Loader2, ImageIcon } from 'lucide-react';
import Image from 'next/image';

interface ImageUploadProps {
  currentImageUrl?: string | null;
  onUpload: (url: string) => void;
  onRemove: () => void;
}

export function ImageUpload({ currentImageUrl, onUpload, onRemove }: ImageUploadProps) {
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

    // Validar tipo
    if (!file.type.startsWith('image/')) {
      setError('Apenas imagens são permitidas.');
      return;
    }

    // Validar tamaño (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('A imagem não pode ter mais de 5MB.');
      return;
    }

    setUploading(true);
    setError('');

    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from('centers')
      .upload(fileName, file, { upsert: false });

    if (uploadError) {
      setError('Erro ao fazer upload. Tente novamente.');
      setUploading(false);
      return;
    }

    const { data } = supabase.storage
      .from('centers')
      .getPublicUrl(fileName);

    onUpload(data.publicUrl);
    setUploading(false);
  };

  const handleRemove = async () => {
    if (!currentImageUrl) return;

    // Extraer nombre del archivo de la URL
    const fileName = currentImageUrl.split('/').pop();
    if (fileName) {
      await supabase.storage.from('centers').remove([fileName]);
    }

    onRemove();
    if (inputRef.current) inputRef.current.value = '';
  };

  return (
    <div className="space-y-3">
      {currentImageUrl ? (
        // Preview de imagen actual
        <div className="relative w-full h-48 rounded-xl overflow-hidden border border-sunbiotan-200">
          <Image
            src={currentImageUrl}
            alt="Imagem do centro"
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
        // Área de upload
        <div
          onClick={() => inputRef.current?.click()}
          className="w-full h-48 rounded-xl border-2 border-dashed border-sunbiotan-200 hover:border-sunbiotan-400 bg-sunbiotan-50 hover:bg-sunbiotan-100/50 flex flex-col items-center justify-center cursor-pointer transition-all"
        >
          {uploading ? (
            <>
              <Loader2 className="h-8 w-8 text-sunbiotan-400 animate-spin mb-2" />
              <p className="text-sm text-sunbiotan-600">A fazer upload...</p>
            </>
          ) : (
            <>
              <div className="w-12 h-12 rounded-full bg-sunbiotan-100 flex items-center justify-center mb-3">
                <ImageIcon className="h-6 w-6 text-sunbiotan-500" />
              </div>
              <p className="text-sm font-medium text-sunbiotan-700 mb-1">
                Clique para adicionar foto
              </p>
              <p className="text-xs text-sunbiotan-500">
                JPG, PNG ou WEBP · Máx 5MB
              </p>
            </>
          )}
        </div>
      )}

      {error && (
        <p className="text-red-600 text-xs">{error}</p>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={handleUpload}
        className="hidden"
      />
    </div>
  );
}