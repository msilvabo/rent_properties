'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Property } from '@/types/property';
import { useLanguage } from '@/lib/i18n/context';

interface PropertyCardProps {
  property: Property;
  onSelect?: (property: Property) => void;
  className?: string;
}

export const PropertyCard = ({
  property,
  onSelect,
  className = '',
}: PropertyCardProps) => {
  const { t } = useLanguage();
  const [isFavorite, setIsFavorite] = useState(false);

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsFavorite(!isFavorite);
  };

  const isRent = property.listingType === 'rent';

  return (
    <Link
      href={`/properties/${property.slug}`}
      onClick={() => onSelect?.(property)}
      className="block h-full focus:outline-none focus:ring-2 focus:ring-[#006655] rounded-xl"
    >
      <article
        className={`bg-white rounded-xl overflow-hidden shadow-card hover:shadow-soft transition-all duration-300 group cursor-pointer h-full flex flex-col ${className}`}
      >
      {/* Media */}
      <div className="relative aspect-[4/3] overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          alt={property.imageAlt}
          src={property.images[0]}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />

        {/* Favorite button */}
        <button
          onClick={handleFavoriteClick}
          aria-label={isFavorite ? t('propertyCard.removeFromFavorites') : t('propertyCard.addToFavorites')}
          className={`absolute top-3 right-3 p-2 rounded-full transition-colors cursor-pointer ${
            isFavorite
              ? 'bg-[#006655] text-white shadow-sm'
              : 'bg-white/90 text-[#19322F] hover:bg-[#006655] hover:text-white'
          }`}
        >
          <span className="material-icons text-lg">
            {isFavorite ? 'favorite' : 'favorite_border'}
          </span>
        </button>

        {/* Listing Type Tag */}
        <div
          className={`absolute bottom-3 left-3 text-white text-xs font-bold px-2 py-1 rounded tracking-wide ${
            isRent ? 'bg-[#006655]/90' : 'bg-[#19322F]/90'
          }`}
        >
          {isRent ? t('propertyCard.forRent') : t('propertyCard.forSale')}
        </div>
      </div>


      {/* Details */}
      <div className="p-4 flex flex-col flex-grow">
        <div className="flex justify-between items-baseline mb-2">
          <h3 className="font-bold text-lg text-[#19322F]">
            {property.formattedPrice}
            {property.pricePeriod && (
              <span className="text-sm font-normal text-[#5C706D]">
                {property.pricePeriod}
              </span>
            )}
          </h3>
        </div>

        <h4 className="text-[#19322F] font-medium truncate mb-1">
          {property.title}
        </h4>
        <p className="text-[#5C706D] text-xs mb-4">
          {property.location.formatted}
        </p>

        {/* Specs */}
        <div className="mt-auto flex items-center justify-between pt-3 border-t border-gray-100">
          <div className="flex items-center gap-1 text-[#5C706D] text-xs">
            <span className="material-icons text-sm text-[#006655]/80">
              king_bed
            </span>{' '}
            {property.beds}
          </div>
          <div className="flex items-center gap-1 text-[#5C706D] text-xs">
            <span className="material-icons text-sm text-[#006655]/80">
              bathtub
            </span>{' '}
            {property.baths}
          </div>
          <div className="flex items-center gap-1 text-[#5C706D] text-xs">
            <span className="material-icons text-sm text-[#006655]/80">
              square_foot
            </span>{' '}
            {property.area}
            {property.areaUnit}
          </div>
        </div>
      </div>
    </article>
  </Link>
  );
};

