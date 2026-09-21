import { notFound } from 'next/navigation';
import Link from 'next/link';
import type { Metadata } from 'next';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { PropertyGallery } from '@/components/property/PropertyGallery';
import { PropertyFeatures } from '@/components/property/PropertyFeatures';
import { PropertyDescription } from '@/components/property/PropertyDescription';
import { PropertyAmenities } from '@/components/property/PropertyAmenities';
import { PropertyContactSection } from '@/components/property/PropertyContactSection';
import { MortgageCalculator } from '@/components/property/MortgageCalculator';
import { PropertyMap } from '@/components/property/PropertyMap';
import { getPropertyBySlug, getAllPropertySlugs } from '@/lib/properties';
import { getServerTranslations } from '@/lib/i18n/server';

// ISR (Incremental Static Regeneration) — revalidate every hour
export const revalidate = 3600;

interface PropertyPageProps {
  params: Promise<{
    slug: string;
  }>;
}

// ---------------------------------------------------------------------------
// generateStaticParams — pre-render static paths at build time
// ---------------------------------------------------------------------------
export async function generateStaticParams() {
  const slugs = await getAllPropertySlugs();
  return slugs.map((slug) => ({ slug }));
}

// ---------------------------------------------------------------------------
// generateMetadata — dynamic SEO and OpenGraph tags
// ---------------------------------------------------------------------------
export async function generateMetadata({
  params,
}: PropertyPageProps): Promise<Metadata> {
  const { slug } = await params;
  const property = await getPropertyBySlug(slug);

  if (!property) {
    return {
      title: 'Property Not Found | LuxeEstate',
    };
  }

  const title = `${property.title} in ${property.location.city} | ${property.formattedPrice} - LuxeEstate`;
  const description =
    property.description?.slice(0, 160) ||
    `Discover ${property.title} in ${property.location.formatted}. ${property.beds} beds, ${property.baths} baths luxury real estate sanctuary.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: [
        {
          url: property.images[0],
          width: 1200,
          height: 800,
          alt: property.imageAlt,
        },
      ],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [property.images[0]],
    },
  };
}

// ---------------------------------------------------------------------------
// Page Component (RSC)
// ---------------------------------------------------------------------------
export default async function PropertyDetailPage({ params }: PropertyPageProps) {
  const { slug } = await params;
  const [{ t }, property] = await Promise.all([
    getServerTranslations(),
    getPropertyBySlug(slug),
  ]);

  if (!property) {
    notFound();
  }


  // Schema.org Structured Data (RealEstateListing / SingleFamilyResidence)
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'RealEstateListing',
    name: property.title,
    description: property.description,
    image: property.images,
    price: property.price,
    priceCurrency: 'USD',
    address: {
      '@type': 'PostalAddress',
      streetAddress: property.location.address || '',
      addressLocality: property.location.city,
      addressRegion: property.location.region,
      addressCountry: 'US',
    },
    geo: property.latitude && property.longitude ? {
      '@type': 'GeoCoordinates',
      latitude: property.latitude,
      longitude: property.longitude,
    } : undefined,
    offers: {
      '@type': 'Offer',
      price: property.price,
      priceCurrency: 'USD',
      availability: 'https://schema.org/InStock',
    },
  };

  return (
    <div className="min-h-screen bg-[#EEF6F6] text-[#19322F]">
      {/* JSON-LD for Search Engines */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Global Navbar with back-to-home brand logo */}
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Link Breadcrumb */}
        <div className="mb-6">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-medium text-[#19322F]/70 hover:text-[#006655] transition-colors"
          >
            <span className="material-icons text-base">arrow_back</span>
            {t('propertyDetail.backToHomes')}
          </Link>
        </div>


        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-8">
          {/* Main Column (8 cols): Gallery + Property Info */}
          <div className="lg:col-span-8 space-y-8">
            {/* Image Gallery */}
            <PropertyGallery
              title={property.title}
              badge={property.badge}
              images={property.images}
            />

            {/* Property Features */}
            <PropertyFeatures
              area={property.area}
              areaUnit={property.areaUnit}
              beds={property.beds}
              baths={property.baths}
              garage={property.garage}
            />

            {/* About this home */}
            <PropertyDescription description={property.description} />

            {/* Amenities */}
            <PropertyAmenities amenities={property.amenities} />

            {/* Mortgage Calculator */}
            <MortgageCalculator price={property.price} />
          </div>

          {/* Sticky Sidebar (4 cols): Price, Agent, CTAs, Map */}
          <div className="lg:col-span-4 relative">
            <div className="sticky top-28 space-y-6">
              {/* Pricing & Inquiry Card */}
              <div className="bg-white p-6 rounded-xl shadow-sm border border-[#006655]/5">
                <div className="mb-4">
                  <h1 className="text-4xl font-light text-[#19322F] mb-2 tracking-tight">
                    {property.formattedPrice}
                    {property.pricePeriod && (
                      <span className="text-lg font-normal text-[#5C706D] ml-1">
                        {property.pricePeriod}
                      </span>
                    )}
                  </h1>
                  <p className="text-[#19322F]/60 font-medium flex items-center gap-1 text-sm">
                    <span className="material-icons text-[#006655] text-base">location_on</span>
                    {property.location.formatted}
                  </p>
                </div>

                <div className="h-px bg-slate-100 my-6"></div>

                {/* Agent & CTAs */}
                <PropertyContactSection
                  propertyTitle={property.title}
                  propertyPrice={property.formattedPrice}
                  agent={property.agent}
                />
              </div>

              {/* Interactive Leaflet Map Card */}
              <PropertyMap
                latitude={property.latitude}
                longitude={property.longitude}
                title={property.title}
                formattedAddress={property.location.formatted}
              />
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
