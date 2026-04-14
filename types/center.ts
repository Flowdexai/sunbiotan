export interface Center {
  // Identificación
  id: string;
  name: string;
  
  // Ubicación (obligatorios)
  address: string;
  city: string;
  country: string;
  lat: number;
  lng: number;
  
  // Contacto (obligatorios)
  phone: string;
  instagram: string; // Username sin @
  
  // Opcionales
  email?: string;
  website?: string;
  region?: string;
  
  // Destacados
  featured: boolean;
  
  // Información adicional
  services?: string[];
  description?: string;
  image_url?: string;
  
  // Timestamps
  created_at?: string;
  updated_at?: string;
}