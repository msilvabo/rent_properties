'use client';

import Link from 'next/link';
import { Property } from '@/types/property';
import { PaginationMeta } from '@/types/pagination';
import { PropertyCard } from './PropertyCard';
import { Pagination } from './Pagination';
import { MarketFilterTabs } from './MarketFilterTabs';
import { useLanguage } from '@/lib/i18n/context';

interface NewInMarketSectionProps {
  properties: Property[];
  meta: PaginationMeta;
  activeListingType: 'all' | 'sale' | 'rent';
  onSelectProperty?: (property: Property) => void;
  hasActiveFilters?: boolean;
}

export function NewInMarketSection({
  properties,
  meta,
  activeListingType,
  onSelectProperty,
  hasActiveFilters = false,
}: NewInMarketSectionProps) {
  const { t } = useLanguage();
  const { page, totalCount, totalPages } = meta;

  const startItem = (page - 1) * meta.pageSize + 1;
  const endItem = Math.min(page * meta.pageSize, totalCount);

  return (
    <section>
      {/* Header with Segmented Filter */}
      <div className="flex items-end justify-between mb-8">
        <div>
          <h2 className="text-2xl font-light text-[#19322F]">{t('market.title')}</h2>
          <p className="text-[#5C706D] mt-1 text-sm">
            {t('market.subtitle')}
            {totalCount > 0 && (
              <span className="ml-2 text-xs text-[#5C706D]/60">
                {t('market.showing')} {startItem}–{endItem} {t('market.of')} {totalCount}
              </span>
            )}
          </p>
        </div>

        {/* Server-driven filter tabs (links, not buttons) */}
        <MarketFilterTabs activeListingType={activeListingType} />
      </div>

      {/* Property Cards Grid */}
      {properties.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {properties.map((property) => (
            <PropertyCard
              key={property.id}
              property={property}
              onSelect={onSelectProperty}
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-center bg-white rounded-2xl border border-[#19322F]/5 p-8 shadow-soft">
          <span className="material-icons text-5xl text-[#5C706D]/30 mb-4">
            search_off
          </span>
          <p className="text-[#19322F] text-lg font-medium">{t('market.noPropertiesFound')}</p>
          <p className="text-[#5C706D] text-sm mt-1 max-w-sm">
            {t('market.noPropertiesDesc')}
          </p>
          {hasActiveFilters && (
            <Link
              href="/"
              className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 bg-[#006655] hover:bg-[#006655]/90 text-white text-sm font-medium rounded-xl shadow-md shadow-[#006655]/20 transition-all cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
            >
              <span className="material-icons text-base">restart_alt</span>
              {t('market.clearFiltersBtn')}
            </Link>
          )}
        </div>
      )}

      {/* Server-side Pagination */}
      <Pagination currentPage={page} totalPages={totalPages} />
    </section>
  );
}

