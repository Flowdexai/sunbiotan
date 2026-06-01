# Sunbiotan Web

Sitio web institucional de **Sunbiotan** — Es una fórmula avanzada, desarrollada con ingredientes de origen natural asociados al bronceado de la piel.

Desarrollado por [Flowdex](https://flowdex.ai).

---

## Stack

- **Framework:** Next.js 16 (App Router)
- **Lenguaje:** TypeScript
- **Estilos:** Tailwind CSS v4
- **Animaciones:** Framer Motion
- **Mapa:** Google Maps (`@vis.gl/react-google-maps`) con Places Autocomplete
- **Base de datos:** Supabase (configurado, pendiente de migración de datos)
- **UI base:** shadcn/ui (Radix UI)
- **Fuentes:** Inter (sans) + Cormorant Garamond (display)
- **Iconos:** Lucide React

---

## Estructura del proyecto

```
sunbiotan-web/
├── app/
│   ├── layout.tsx            # Root layout, fuentes, metadata
│   ├── page.tsx              # Landing principal
│   └── centros/
│       └── page.tsx          # Página del mapa interactivo
├── components/
│   ├── layout/
│   │   ├── navbar.tsx        # Navbar con scroll hide/show y prop forceOpaque
│   │   └── footer.tsx        # Footer institucional
│   ├── sections/             # Secciones de la landing
│   │   ├── hero.tsx          # Hero con video background y parallax
│   │   ├── about.tsx         # Qué es Sunbiotan
│   │   ├── benefits.tsx      # Beneficios del tratamiento
│   │   ├── scroll-video.tsx  # Video con scroll trigger
│   │   ├── how-it-works.tsx  # Proceso del tratamiento
│   │   ├── map-preview.tsx   # Preview del mapa de centros
│   │   └── cta-professionals.tsx
│   ├── map/
│   │   ├── map-view.tsx      # Componente Google Maps con marcadores
│   │   └── sidebar.tsx       # Sidebar con búsqueda, geolocalización y cards
│   └── ui/                   # Componentes base (shadcn/ui)
├── lib/
│   ├── data/
│   │   └── centers-data.ts   # Funciones de acceso a datos de centros
│   ├── supabase/
│   │   ├── client.ts         # Cliente Supabase (browser)
│   │   └── server.ts         # Cliente Supabase (server)
│   └── utils.ts
├── data/
│   └── centers.json          # Datos de centros (fuente actual, migrar a Supabase)
├── types/
│   ├── center.ts             # Interface Center
│   └── database.types.ts     # Tipos generados de Supabase
└── public/
    ├── images/               # Logo, imágenes estáticas
    └── videos/               # Video del hero
```

---

## Variables de entorno

Crear un archivo `.env.local` en la raíz con:

```env
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=tu_api_key_de_google_maps
NEXT_PUBLIC_SUPABASE_URL=tu_url_de_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_anon_key_de_supabase
```

La API key de Google Maps necesita los siguientes servicios habilitados:
- Maps JavaScript API
- Places API

---

## Desarrollo local

```bash
# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm run dev
```

Abrir [http://localhost:3000](http://localhost:3000).

```bash
# Build de producción
npm run build

# Iniciar en producción
npm start

# Lint
npm run lint
```

---

## Páginas

### `/` — Landing principal

Página institucional con las secciones:

| Sección | Descripción |
|---|---|
| `Hero` | Video de fondo, headline animado, parallax, stats |
| `About` | Qué es Sunbiotan, ingredientes, descripción del tratamiento |
| `Benefits` | Beneficios: sin UV, duración, todo tipo de piel |
| `ScrollVideo` | Video que se activa con el scroll |
| `HowItWorks` | Proceso paso a paso del tratamiento |
| `MapPreview` | Preview animado del mapa, CTA a `/centros` |
| `CtaProfessionals` | Llamada a acción para profesionales |

### `/centros` — Mapa interactivo

Página con mapa de Google Maps y sidebar con la lista de centros autorizados.

**Funcionalidades:**
- Búsqueda de ciudad con Google Places Autocomplete
- Geolocalización del usuario y cálculo de distancias (Haversine)
- Centros destacados con badge "Exclusivo"
- Sincronización mapa ↔ sidebar (click en card hace pan/zoom en el mapa)
- Info window en el marcador con dirección y link "Cómo llegar"
- Layout responsive: 2 columnas en desktop (mapa sticky), 1 columna en mobile

---

## Datos de centros

Actualmente los centros se sirven desde `data/centers.json`. La estructura de cada centro es:

```typescript
interface Center {
  id: string;
  name: string;
  address: string;
  city: string;
  country: string;
  lat: number;
  lng: number;
  phone: string;
  instagram: string;       // Username sin @
  email?: string;
  website?: string;
  region?: string;
  featured: boolean;
  services?: string[];
  description?: string;
  image_url?: string;
}
```

**Migración pendiente:** mover los datos a una tabla `centers` en Supabase para poder gestionar los centros desde un panel de administración.

---

## Diseño

El sistema de diseño sigue una estética premium dorada con las siguientes convenciones:

- **Paleta:** escala `sunbiotan` (50–950), de crema a casi negro
- **Tipografía display:** Cormorant Garamond `font-light` con `tracking-tight` para headings
- **Tipografía body:** Inter `font-light` con `tracking-[0.04em]`
- **Etiquetas:** `text-[10px] tracking-[0.4em] uppercase font-medium` en `sunbiotan-600`
- **Botones:** `rounded-full` con gradiente `from-sunbiotan-500 to-sunbiotan-600`
- **Animaciones:** Framer Motion con patrón `fadeUp` (opacity + y + blur), `whileInView` con stagger
- **Decorativos:** grain texture, gradiente radial dorado, letras tipográficas de fondo

---

## Deploy

El proyecto está configurado para Vercel. Asegurarse de añadir las variables de entorno en el panel de Vercel antes de deployar.

```bash
# Deploy manual con Vercel CLI
vercel --prod
```
