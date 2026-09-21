'use client';

import { Property } from '@/types/property';
import { FeaturedCard } from './FeaturedCard';
import { useLanguage } from '@/lib/i18n/context';

interface FeaturedSectionProps {
  properties: Property[];
}

export const FeaturedSection = ({
  properties,
}: FeaturedSectionProps) => {
  const { t } = useLanguage();

  return (
    <section className="mb-16">
      <div className="flex items-end justify-between mb-8">
        <div>
          <h2 className="text-2xl font-light text-[#19322F]">
            {t('featured.title')}
          </h2>
          <p className="text-[#5C706D] mt-1 text-sm">
            {t('featured.subtitle')}
          </p>
        </div>

        <button
          className="hidden sm:flex items-center gap-1 text-sm font-medium text-[#006655] hover:opacity-70 transition-opacity cursor-pointer"
        >
          {t('featured.viewAll')} <span className="material-icons text-sm">arrow_forward</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {properties.map((property) => (
          <FeaturedCard
            key={property.id}
            property={property}
          />
        ))}
      </div>
    </section>
  );
};

