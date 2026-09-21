import { Suspense } from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { HeroSearch } from '@/components/home/HeroSearch';
import { FeaturedSection } from '@/components/home/FeaturedSection';
import { NewInMarketSection } from '@/components/home/NewInMarketSection';
import { getFeaturedProperties, getMarketProperties } from '@/lib/properties';
import { PropertyCategory, ListingType } from '@/types/property';

const PAGE_SIZE = 6;

interface HomePageProps {
  searchParams: Promise<{
    page?: string;
    category?: string;
    listingType?: string;
    q?: string;
    location?: string;
    minPrice?: string;
    maxPrice?: string;
    beds?: string;
    baths?: string;
    amenities?: string;
  }>;
}

export default async function Home({ searchParams }: HomePageProps) {
  const params = await searchParams;

  // Parse and validate query params
  const page = Math.max(1, parseInt(params.page ?? '1', 10) || 1);

  const category = (
    ['house', 'apartment', 'condo', 'townhouse', 'villa', 'penthouse'].includes(
      params.category ?? ''
    )
      ? params.category
      : 'all'
  ) as PropertyCategory;

  const listingType = (
    ['sale', 'rent'].includes(params.listingType ?? '')
      ? params.listingType
      : 'all'
  ) as ListingType | 'all';

  const search = params.q ?? params.location ?? '';
  const minPrice = params.minPrice ? parseInt(params.minPrice, 10) : undefined;
  const maxPrice = params.maxPrice ? parseInt(params.maxPrice, 10) : undefined;
  const beds = params.beds ? parseInt(params.beds, 10) : undefined;
  const baths = params.baths ? parseFloat(params.baths) : undefined;
  const amenities = params.amenities
    ? params.amenities.split(',').map((s) => s.trim()).filter(Boolean)
    : undefined;

  // Fetch data in parallel from Supabase (server-side)
  const [featuredProperties, marketResult] = await Promise.all([
    getFeaturedProperties(),
    getMarketProperties({
      page,
      pageSize: PAGE_SIZE,
      category,
      listingType: listingType === 'all' ? undefined : listingType,
      search,
      minPrice,
      maxPrice,
      beds,
      baths,
      amenities,
    }),
  ]);

  const hasActiveFilters = Boolean(
    category !== 'all' ||
    listingType !== 'all' ||
    Boolean(search) ||
    minPrice !== undefined ||
    maxPrice !== undefined ||
    beds !== undefined ||
    baths !== undefined ||
    (amenities && amenities.length > 0)
  );

  return (
    <div className="min-h-screen bg-[#EEF6F6] text-[#19322F]">
      {/* Top Navigation */}
      <Navbar />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        {/* Hero & Search section */}
        <HeroSearch
          selectedCategory={category}
          defaultSearch={search}
          currentFilters={{
            location: search,
            minPrice,
            maxPrice,
            beds,
            baths,
            amenities,
            listingType,
          }}
          totalHomesCount={marketResult.meta.totalCount}
        />

        {/* Featured Collections: Only show when no filters or search are active */}
        {!hasActiveFilters && (
          <FeaturedSection properties={featuredProperties.slice(0, 2)} />
        )}

        {/* New in Market — server-paginated */}
        <Suspense fallback={<div className="h-64 flex items-center justify-center text-[#5C706D]">Loading properties…</div>}>
          <NewInMarketSection
            properties={marketResult.data}
            meta={marketResult.meta}
            activeListingType={listingType}
            hasActiveFilters={hasActiveFilters}
          />
        </Suspense>
      </main>
    </div>
  );
}
