'use client';

// Campos compartidos por alta y edición de recursos: origen (archivo privado o
// enlace externo), destacado e idioma.
import { useTranslations } from 'next-intl';
import { FileUpload } from '@/components/dashboard/file-upload';
import {
  PORTAL_RESOURCES_ACCEPT,
  PORTAL_RESOURCES_BUCKET,
  PORTAL_RESOURCES_EXTENSIONS,
  PORTAL_RESOURCES_MAX_MB,
  RESOURCE_LOCALES,
} from '@/lib/resources/config';

export type SourceMode = 'upload' | 'link';

interface Props {
  mode: SourceMode;
  onModeChange: (mode: SourceMode) => void;
  category: string;
  storagePath: string;
  onStoragePathChange: (path: string) => void;
  url: string;
  onUrlChange: (url: string) => void;
  featured: boolean;
  onFeaturedChange: (v: boolean) => void;
  locale: string; // '' = todos
  onLocaleChange: (v: string) => void;
  labelClass: string;
  inputClass: string;
}

export function ResourceSourceFields(p: Props) {
  const t = useTranslations('DashboardRecursoForm');

  return (
    <div className="space-y-5">
      <div>
        <span className={p.labelClass}>{t('labelSource')}</span>
        <div className="flex gap-2">
          {(['upload', 'link'] as const).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => p.onModeChange(m)}
              className={`px-4 py-2 rounded-lg text-sm border transition-colors ${p.mode === m ? 'bg-sunbiotan-500 border-sunbiotan-500 text-white' : 'bg-white border-sunbiotan-200 text-sunbiotan-700 hover:bg-sunbiotan-50'}`}
            >
              {m === 'upload' ? t('sourceUpload') : t('sourceLink')}
            </button>
          ))}
        </div>
      </div>

      {p.mode === 'upload' ? (
        <div>
          <span className={p.labelClass}>{t('labelFile')}</span>
          <FileUpload
            bucket={PORTAL_RESOURCES_BUCKET}
            folder={p.category}
            isPrivate
            deleteOnRemove={false}
            accept={PORTAL_RESOURCES_ACCEPT}
            allowedExtensions={PORTAL_RESOURCES_EXTENSIONS}
            maxSizeMB={PORTAL_RESOURCES_MAX_MB}
            currentValue={p.storagePath || null}
            label={t('uploadCta')}
            hint={t('fileHint', { max: PORTAL_RESOURCES_MAX_MB })}
            errorSize={(mb) => t('errorFileSize', { max: mb })}
            errorType={t('errorFileType')}
            errorUpload={t('errorFileUpload')}
            onUpload={p.onStoragePathChange}
            onRemove={() => p.onStoragePathChange('')}
          />
          <p className="text-xs text-sunbiotan-500 mt-1">{t('filePrivateHint')}</p>
        </div>
      ) : (
        <div>
          <label className={p.labelClass} htmlFor="resource-url">{t('labelUrl')}</label>
          <input
            id="resource-url"
            type="url"
            value={p.url}
            onChange={(e) => p.onUrlChange(e.target.value)}
            placeholder="https://..."
            className={p.inputClass}
          />
          <p className="text-xs text-sunbiotan-500 mt-1">{t('urlHint')}</p>
        </div>
      )}

      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className={p.labelClass} htmlFor="resource-locale">{t('labelLocale')}</label>
          <select
            id="resource-locale"
            value={p.locale}
            onChange={(e) => p.onLocaleChange(e.target.value)}
            className={p.inputClass}
          >
            <option value="">{t('localeAll')}</option>
            {RESOURCE_LOCALES.map((l) => (
              <option key={l} value={l}>{l.toUpperCase()}</option>
            ))}
          </select>
        </div>
        <div className="flex items-start gap-3 pt-7">
          <input
            type="checkbox"
            id="resource-featured"
            checked={p.featured}
            onChange={(e) => p.onFeaturedChange(e.target.checked)}
            className="w-4 h-4 mt-0.5 accent-sunbiotan-500"
          />
          <label htmlFor="resource-featured" className="text-sm text-sunbiotan-800 cursor-pointer">
            {t('featuredLabel')}
            <span className="block text-xs text-sunbiotan-500">{t('featuredDesc')}</span>
          </label>
        </div>
      </div>
    </div>
  );
}
