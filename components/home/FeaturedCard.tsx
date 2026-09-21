'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Property } from '@/types/property';
import { useLanguage } from '@/lib/i18n/context';

interface FeaturedCardProps {
  property: Property;
  onSelect?: (property: Property) => void;
}

export const FeaturedCard = ({ property, onSelect }: FeaturedCardProps) => {
  const { t } = useLanguage();
  const [isFavorite, setIsFavorite] = useState(false);

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsFavorite(!isFavorite);
  };

  return (
    <Link
      href={`/properties/${property.slug}`}
      onClick={() => onSelect?.(property)}
      className="block group rounded-xl focus:outline-none focus:ring-2 focus:ring-[#006655]"
    >
      <div className="relative rounded-xl overflow-hidden shadow-soft bg-white cursor-pointer transition-transform duration-300">
      {/* Media container */}
      <div className="aspect-[4/3] w-full overflow-hidden relative">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          alt={property.imageAlt}
          src={property.images[0]}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        />

        {/* Badge */}
        {property.badge && (
          <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider text-[#19322F]">
            {property.badge}
          </div>
        )}

        {/* Favorite button */}
        <button
          onClick={handleFavoriteClick}
          aria-label={isFavorite ? t('propertyCard.removeFromFavorites') : t('propertyCard.addToFavorites')}
          className={`absolute top-4 right-4 w-10 h-10 rounded-full backdrop-blur-sm flex items-center justify-center transition-all cursor-pointer ${
            isFavorite
              ? 'bg-[#006655] text-white shadow-md'
              : 'bg-white/90 text-[#19322F] hover:bg-[#006655] hover:text-white'
          }`}
        >
          <span className="material-icons text-xl">
            {isFavorite ? 'favorite' : 'favorite_border'}
          </span>
        </button>

        {/* Bottom subtle gradient */}
        <div className="absolute bottom-0 inset-x-0 h-1/2 bg-gradient-to-t from-black/60 to-transparent opacity-60 pointer-events-none"></div>
      </div>

      {/* Card Info */}
      <div className="p-6 relative">
        <div className="flex justify-between items-start mb-2">
          <div>
            <h3 className="text-xl font-medium text-[#19322F] group-hover:text-[#006655] transition-colors">
              {property.title}
            </h3>
            <p className="text-[#5C706D] text-sm flex items-center gap-1 mt-1">
              <span className="material-icons text-sm">place</span>{' '}
              {property.location.formatted}
            </p>
          </div>
          <span className="text-xl font-semibold text-[#006655]">
            {property.formattedPrice}
            {property.pricePeriod && (
              <span className="text-sm font-normal text-[#5C706D]">
                {property.pricePeriod}
              </span>
            )}
          </span>
        </div>

        {/* Specs row */}
        <div className="flex items-center gap-6 mt-6 pt-6 border-t border-[#19322F]/5">
          <div className="flex items-center gap-2 text-[#5C706D] text-sm">
            <span className="material-icons text-lg">king_bed</span>{' '}
            {property.beds} {t('propertyCard.beds')}
          </div>
          <div className="flex items-center gap-2 text-[#5C706D] text-sm">
            <span className="material-icons text-lg">bathtub</span>{' '}
            {property.baths} {t('propertyCard.baths')}
          </div>
          <div className="flex items-center gap-2 text-[#5C706D] text-sm">
            <span className="material-icons text-lg">square_foot</span>{' '}
            {property.area.toLocaleString()} {property.areaUnit}
          </div>
        </div>
      </div>
    </div>
  </Link>
  );
};


