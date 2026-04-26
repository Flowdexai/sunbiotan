export interface Center {
  id: string;
  name: string;

  // Localização
  address?: string;
  city: string;
  state?: string;
  postal_code?: string;
  country: string;
  lat: number;
  lng: number;

  // Contacto
  phone?: string;
  whatsapp?: string;
  whatsapp_same_as_phone?: boolean;
  instagram?: string;
  email?: string;
  website?: string;
  facebook?: string;

  // Estado
  featured: boolean;
  active?: boolean;

  // Información adicional
  services?: string[];
  description?: string;
  image_url?: string | null;

  // Timestamps
  created_at?: string;
  updated_at?: string;
}