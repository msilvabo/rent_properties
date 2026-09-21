export type PropertyCategory =
  | 'all'
  | 'house'
  | 'apartment'
  | 'condo'
  | 'townhouse'
  | 'villa'
  | 'penthouse';

export type ListingType = 'sale' | 'rent';

export interface PropertyLocation {
  address?: string;
  city: string;
  region: string;
  formatted: string;
}

export interface PropertyAgent {
  name: string;
  role: string;
  avatar: string;
  phone?: string;
  email?: string;
  rating?: number;
}

export interface Property {
  id: string;
  slug: string;
  title: string;
  price: number;
  formattedPrice: string;
  pricePeriod?: string; // e.g. '/mo' for rent
  category: Exclude<PropertyCategory, 'all'>;
  listingType: ListingType;
  badge?: 'Exclusive' | 'New Arrival' | 'Premium' | 'New';
  location: PropertyLocation;
  beds: number;
  baths: number;
  area: number;
  areaUnit: string;
  imageAlt: string;
  images: string[];
  isFeatured?: boolean;
  isEnabled?: boolean; // When false, property is hidden from public portal. Defaults to true.
  description?: string;
  amenities?: string[];
  garage?: number;
  latitude?: number;
  longitude?: number;
  agent?: PropertyAgent;
}

