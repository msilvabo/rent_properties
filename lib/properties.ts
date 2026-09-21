import { cache } from 'react';
import { supabase } from './supabase';
import { Property, PropertyCategory, ListingType } from '@/types/property';
import { PaginatedResponse } from '@/types/pagination';
import { FEATURED_PROPERTIES, MARKET_PROPERTIES } from '@/data/mock-properties';

const ALL_MOCK_PROPERTIES = [...FEATURED_PROPERTIES, ...MARKET_PROPERTIES];

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface GetMarketPropertiesParams {
  page?: number;
  pageSize?: number;
  category?: PropertyCategory;
  listingType?: ListingType | 'all';
  search?: string;
  location?: string;
  minPrice?: number;
  maxPrice?: number;
  beds?: number;
  baths?: number;
  amenities?: string[];
}

// ---------------------------------------------------------------------------
// Row → Property mapper
// Converts snake_case DB columns back to the app's camelCase Property type.
// ---------------------------------------------------------------------------

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function rowToProperty(row: any): Property {
  const images: string[] = Array.isArray(row.images) && row.images.length > 0
    ? row.images
    : [];

  return {
    id: row.id,
    slug: row.slug || row.id,
    title: row.title,
    price: Number(row.price),
    formattedPrice: row.formatted_price,
    pricePeriod: row.price_period ?? undefined,
    category: row.category,
    listingType: row.listing_type,
    badge: row.badge ?? undefined,
    location: {
      address: row.location_address ?? undefined,
      city: row.location_city,
      region: row.location_region,
      formatted: row.location_formatted,
    },
    beds: row.beds,
    baths: Number(row.baths),
    area: Number(row.area),
    areaUnit: row.area_unit,
    imageAlt: row.image_alt,
    images,
    isFeatured: row.is_featured,
    isEnabled: row.is_enabled !== false, // default true if null/undefined
    description: row.description ?? undefined,
    amenities: Array.isArray(row.amenities) && row.amenities.length > 0 ? row.amenities : undefined,
    garage: row.garage ? Number(row.garage) : 2,
    latitude: row.latitude ? Number(row.latitude) : undefined,
    longitude: row.longitude ? Number(row.longitude) : undefined,
    agent: row.agent ?? undefined,
  };
}

// ---------------------------------------------------------------------------
// getFeaturedProperties — used in the Featured section (not paginated)
// ---------------------------------------------------------------------------

export const getFeaturedProperties = cache(async (): Promise<Property[]> => {
  try {
    console.time("⏱️ Supabase: getFeaturedProperties");
    const { data, error } = await supabase
      .from('properties')
      .select('*')
      .eq('is_featured', true)
      .eq('is_enabled', true)
      .order('created_at', { ascending: true })
      .limit(2);
    console.timeEnd("⏱️ Supabase: getFeaturedProperties");
    if (error || !data || data.length === 0) {
      if (error) console.error('[getFeaturedProperties] Supabase error:', error.message);
      return FEATURED_PROPERTIES.slice(0, 2);
    }

    return data.slice(0, 2).map(rowToProperty);
  } catch (err) {
    console.error('[getFeaturedProperties] Unexpected error:', err);
    return FEATURED_PROPERTIES.slice(0, 2);
  }
});

// ---------------------------------------------------------------------------
// getMarketProperties — paginated, filterable
// ---------------------------------------------------------------------------

export async function getMarketProperties(
  params: GetMarketPropertiesParams = {}
): Promise<PaginatedResponse<Property>> {
  const {
    page = 1,
    pageSize = 6,
    category = 'all',
    listingType = 'all',
    search = '',
    location = '',
    minPrice,
    maxPrice,
    beds,
    baths,
    amenities = [],
  } = params;

  try {
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    // Build base query (non-featured properties, only enabled)
    let query = supabase
      .from('properties')
      .select('*', { count: 'exact' })
      .eq('is_featured', false)
      .eq('is_enabled', true);

    // Apply category filter
    if (category && category !== 'all') {
      query = query.eq('category', category);
    }

    // Apply listing type filter
    if (listingType && listingType !== 'all') {
      query = query.eq('listing_type', listingType);
    }

    // Apply location / text search
    const searchStr = (search || location || '').trim();
    if (searchStr) {
      query = query.or(
        `title.ilike.%${searchStr}%,location_city.ilike.%${searchStr}%,location_formatted.ilike.%${searchStr}%,location_address.ilike.%${searchStr}%,location_region.ilike.%${searchStr}%`
      );
    }

    // Apply price range
    if (minPrice !== undefined && minPrice > 0) {
      query = query.gte('price', minPrice);
    }
    if (maxPrice !== undefined && maxPrice > 0) {
      query = query.lte('price', maxPrice);
    }

    // Apply bedrooms & bathrooms
    if (beds !== undefined && beds > 0) {
      query = query.gte('beds', beds);
    }
    if (baths !== undefined && baths > 0) {
      query = query.gte('baths', baths);
    }

    // Apply amenities
    if (amenities && amenities.length > 0) {
      query = query.contains('amenities', amenities);
    }

    // Apply ordering and pagination
    const { data, error, count } = await query
      .order('created_at', { ascending: false })
      .range(from, to);

    if (error) {
      console.error('[getMarketProperties] Supabase error:', error.message);
      return getFallbackMarketProperties(params);
    }

    const totalCount = count ?? 0;
    const totalPages = Math.ceil(totalCount / pageSize);

    return {
      data: (data ?? []).map(rowToProperty),
      meta: {
        page,
        pageSize,
        totalCount,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    };
  } catch (err) {
    console.error('[getMarketProperties] Unexpected error:', err);
    return getFallbackMarketProperties(params);
  }
}

function getFallbackMarketProperties(
  params: GetMarketPropertiesParams
): PaginatedResponse<Property> {
  const {
    page = 1,
    pageSize = 6,
    category = 'all',
    listingType = 'all',
    search = '',
    location = '',
    minPrice,
    maxPrice,
    beds,
    baths,
    amenities = [],
  } = params;

  let filtered = MARKET_PROPERTIES;
  if (category !== 'all') {
    filtered = filtered.filter((p) => p.category === category);
  }
  if (listingType !== 'all') {
    filtered = filtered.filter((p) => p.listingType === listingType);
  }

  const searchStr = (search || location || '').trim().toLowerCase();
  if (searchStr) {
    filtered = filtered.filter(
      (p) =>
        p.title.toLowerCase().includes(searchStr) ||
        p.location.formatted.toLowerCase().includes(searchStr) ||
        p.location.city.toLowerCase().includes(searchStr) ||
        (p.location.address && p.location.address.toLowerCase().includes(searchStr)) ||
        p.location.region.toLowerCase().includes(searchStr)
    );
  }

  if (minPrice !== undefined && minPrice > 0) {
    filtered = filtered.filter((p) => p.price >= minPrice);
  }
  if (maxPrice !== undefined && maxPrice > 0) {
    filtered = filtered.filter((p) => p.price <= maxPrice);
  }
  if (beds !== undefined && beds > 0) {
    filtered = filtered.filter((p) => p.beds >= beds);
  }
  if (baths !== undefined && baths > 0) {
    filtered = filtered.filter((p) => p.baths >= baths);
  }
  if (amenities && amenities.length > 0) {
    filtered = filtered.filter((p) =>
      amenities.every((a) =>
        (p.amenities ?? []).some((item) => item.toLowerCase().includes(a.toLowerCase()))
      )
    );
  }

  const totalCount = filtered.length;
  const totalPages = Math.ceil(totalCount / pageSize);
  const from = (page - 1) * pageSize;
  const data = filtered.slice(from, from + pageSize);

  return {
    data,
    meta: {
      page,
      pageSize,
      totalCount,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    },
  };
}

// ---------------------------------------------------------------------------
// getPropertyBySlug — for individual property details page
// ---------------------------------------------------------------------------

export const getPropertyBySlug = cache(async (slug: string): Promise<Property | null> => {
  try {
    console.time("⏱️ Supabase: getPropertyBySlug");
    const { data, error } = await supabase
      .from('properties')
      .select('*')
      .or(`slug.eq.${slug},id.eq.${slug}`)
      .limit(1)
      .maybeSingle();
    console.timeEnd("⏱️ Supabase: getPropertyBySlug");
    if (error) {
      console.error('[getPropertyBySlug] Supabase error:', error.message);
    }

    if (data) {
      return rowToProperty(data);
    }
  } catch (err) {
    console.error('[getPropertyBySlug] Unexpected error:', err);
  }

  // Fallback to mock data by slug or id
  const found = ALL_MOCK_PROPERTIES.find((p) => p.slug === slug || p.id === slug);
  return found ?? null;
});

// ---------------------------------------------------------------------------
// getAllPropertySlugs — used in generateStaticParams
// ---------------------------------------------------------------------------

export const getAllPropertySlugs = cache(async (): Promise<string[]> => {
  try {
    console.time("⏱️ Supabase: getAllPropertySlugs");
    const { data, error } = await supabase.from('properties').select('slug, id');
    console.timeEnd("⏱️ Supabase: getAllPropertySlugs");
    if (!error && data && data.length > 0) {
      return data.map((item) => item.slug || item.id);
    }
  } catch (err) {
    console.error('[getAllPropertySlugs] error:', err);
  }

  return ALL_MOCK_PROPERTIES.map((p) => p.slug);
});

// ---------------------------------------------------------------------------
// getAllAdminProperties — fetches all properties for the admin dashboard
// ---------------------------------------------------------------------------
export async function getAllAdminProperties(): Promise<Property[]> {
  try {
    const { data, error } = await supabase
      .from('properties')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('[getAllAdminProperties] Supabase error:', error.message);
      return ALL_MOCK_PROPERTIES;
    }

    if (data && data.length > 0) {
      return data.map(rowToProperty);
    }
  } catch (err) {
    console.error('[getAllAdminProperties] Unexpected error:', err);
  }

  return ALL_MOCK_PROPERTIES;
}

