'use client';

import { useState, useTransition, useEffect, useMemo } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { PropertyCategory } from '@/types/property';
import { FilterModal, FilterValues } from './FilterModal';
import { useLanguage } from '@/lib/i18n/context';

interface HeroSearchProps {
  selectedCategory?: PropertyCategory;
  defaultSearch?: string;
  currentFilters?: {
    location?: string;
    minPrice?: number;
    maxPrice?: number;
    beds?: number;
    baths?: number;
    amenities?: string[];
    listingType?: string;
  };
  totalHomesCount?: number;
}

const CATEGORY_VALUES: PropertyCategory[] = [
  'all',
  'house',
  'apartment',
  'condo',
  'townhouse',
  'villa',
  'penthouse',
];

function formatPriceShort(val: number): string {
  if (val >= 1000000) {
    const m = val / 1000000;
    return `$${m % 1 === 0 ? m : m.toFixed(1)}M`;
  }
  if (val >= 1000) {
    return `$${(val / 1000).toFixed(0)}k`;
  }
  return `$${val}`;
}

export const HeroSearch = ({
  selectedCategory = 'all',
  defaultSearch = '',
  currentFilters,
  totalHomesCount,
}: HeroSearchProps) => {
  const { t } = useLanguage();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const categories = useMemo(() => {
    return CATEGORY_VALUES.map((val) => ({
      value: val,
      label: t(`categories.${val}`),
    }));
  }, [t]);

  const [searchTerm, setSearchTerm] = useState(defaultSearch);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  useEffect(() => {
    setSearchTerm(defaultSearch);
  }, [defaultSearch]);

  const buildHref = (overrides: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams.toString());
    // Always reset page on filter/search change
    params.delete('page');
    for (const [key, value] of Object.entries(overrides)) {
      if (value === null || value === '' || value === 'all') {
        params.delete(key);
      } else {
        params.set(key, value);
      }
    }
    const qs = params.toString();
    return qs ? `${pathname}?${qs}` : pathname;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(() => {
      router.push(buildHref({ q: searchTerm.trim() || null }));
    });
  };

  const handleCategoryChange = (category: PropertyCategory) => {
    startTransition(() => {
      // Toggle off to 'all' if user clicks the currently selected category
      const nextCategory = selectedCategory === category ? 'all' : category;
      router.push(buildHref({ category: nextCategory === 'all' ? null : nextCategory }));
    });
  };

  const handleClearAllFilters = () => {
    setSearchTerm('');
    startTransition(() => {
      router.push(pathname);
    });
  };

  const handleRemoveFilter = (filterKey: string, specificValue?: string) => {
    if (filterKey === 'category') {
      startTransition(() => {
        router.push(buildHref({ category: null }));
      });
    } else if (filterKey === 'search') {
      setSearchTerm('');
      startTransition(() => {
        router.push(buildHref({ q: null, location: null }));
      });
    } else if (filterKey === 'listingType') {
      startTransition(() => {
        router.push(buildHref({ listingType: null }));
      });
    } else if (filterKey === 'price') {
      startTransition(() => {
        router.push(buildHref({ minPrice: null, maxPrice: null }));
      });
    } else if (filterKey === 'beds') {
      startTransition(() => {
        router.push(buildHref({ beds: null }));
      });
    } else if (filterKey === 'baths') {
      startTransition(() => {
        router.push(buildHref({ baths: null }));
      });
    } else if (filterKey === 'amenity' && specificValue && currentFilters?.amenities) {
      const remaining = currentFilters.amenities.filter((a) => a !== specificValue);
      startTransition(() => {
        router.push(buildHref({ amenities: remaining.length > 0 ? remaining.join(',') : null }));
      });
    }
  };

  const handleApplyFilters = (filters: FilterValues) => {
    startTransition(() => {
      router.push(
        buildHref({
          q: filters.location || null,
          category: filters.category === 'all' ? null : filters.category,
          minPrice: filters.minPrice > 0 ? filters.minPrice.toString() : null,
          maxPrice: filters.maxPrice < 15000000 ? filters.maxPrice.toString() : null,
          beds: filters.beds > 0 ? filters.beds.toString() : null,
          baths: filters.baths > 0 ? filters.baths.toString() : null,
          amenities: filters.amenities.length > 0 ? filters.amenities.join(',') : null,
        })
      );
    });
  };

  // Build active filter tags
  const activeTags: { id: string; label: string; onRemove: () => void }[] = [];

  if (selectedCategory && selectedCategory !== 'all') {
    const catLabel = categories.find((c) => c.value === selectedCategory)?.label || selectedCategory;
    activeTags.push({
      id: 'category',
      label: `${t('filterModal.propertyType')}: ${catLabel}`,
      onRemove: () => handleRemoveFilter('category'),
    });
  }

  if (defaultSearch && defaultSearch.trim()) {
    activeTags.push({
      id: 'search',
      label: `"${defaultSearch.trim()}"`,
      onRemove: () => handleRemoveFilter('search'),
    });
  }

  if (currentFilters?.listingType && currentFilters.listingType !== 'all') {
    const typeLabel = currentFilters.listingType === 'sale' ? t('market.tabBuy') : t('market.tabRent');
    activeTags.push({
      id: 'listingType',
      label: typeLabel,
      onRemove: () => handleRemoveFilter('listingType'),
    });
  }

  if (
    (currentFilters?.minPrice && currentFilters.minPrice > 0) ||
    (currentFilters?.maxPrice && currentFilters.maxPrice < 15000000)
  ) {
    const min = currentFilters?.minPrice ? formatPriceShort(currentFilters.minPrice) : '$0';
    const max = currentFilters?.maxPrice ? formatPriceShort(currentFilters.maxPrice) : '$15M';
    activeTags.push({
      id: 'price',
      label: `${t('filterModal.priceRange')}: ${min} - ${max}`,
      onRemove: () => handleRemoveFilter('price'),
    });
  }

  if (currentFilters?.beds && currentFilters.beds > 0) {
    activeTags.push({
      id: 'beds',
      label: `${currentFilters.beds}+ ${t('propertyCard.beds')}`,
      onRemove: () => handleRemoveFilter('beds'),
    });
  }

  if (currentFilters?.baths && currentFilters.baths > 0) {
    activeTags.push({
      id: 'baths',
      label: `${currentFilters.baths}+ ${t('propertyCard.baths')}`,
      onRemove: () => handleRemoveFilter('baths'),
    });
  }

  if (currentFilters?.amenities && currentFilters.amenities.length > 0) {
    for (const am of currentFilters.amenities) {
      const translatedAmenity = t(`amenities.${am}`) !== `amenities.${am}` ? t(`amenities.${am}`) : am;
      activeTags.push({
        id: `amenity-${am}`,
        label: translatedAmenity,
        onRemove: () => handleRemoveFilter('amenity', am),
      });
    }
  }

  const hasAnyFilter = activeTags.length > 0;

  // Count active advanced modal filters
  let activeModalFilterCount = 0;
  if (currentFilters?.minPrice && currentFilters.minPrice > 0) activeModalFilterCount++;
  if (currentFilters?.maxPrice && currentFilters.maxPrice < 15000000) activeModalFilterCount++;
  if (currentFilters?.beds && currentFilters.beds > 0) activeModalFilterCount++;
  if (currentFilters?.baths && currentFilters.baths > 0) activeModalFilterCount++;
  if (currentFilters?.amenities && currentFilters.amenities.length > 0) activeModalFilterCount++;

  return (
    <section className="py-12 md:py-16">
      <div className="max-w-5xl mx-auto text-center space-y-8">
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-light text-[#19322F] leading-tight">
          {t('hero.titleLine1')}{' '}
          <span className="relative inline-block">
            <span className="relative z-10 font-medium">{t('hero.sanctuary')}</span>
            <span className="absolute bottom-2 left-0 w-full h-3 bg-[#006655]/20 -rotate-1 z-0"></span>
          </span>
          .
        </h1>

        {/* Search Input Bar */}
        <form onSubmit={handleSubmit} className="relative group max-w-2xl mx-auto">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <span
              className={`material-icons text-2xl transition-colors ${
                isPending ? 'text-[#006655] animate-pulse' : 'text-[#5C706D] group-focus-within:text-[#006655]'
              }`}
            >
              search
            </span>
          </div>

          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={t('hero.searchPlaceholder')}
            className="block w-full pl-12 pr-32 py-4 rounded-xl border-none bg-white text-[#19322F] shadow-soft placeholder-[#5C706D]/60 focus:ring-2 focus:ring-[#006655] focus:bg-white transition-all text-lg outline-none"
          />

          {searchTerm && (
            <button
              type="button"
              onClick={() => {
                setSearchTerm('');
                if (defaultSearch) {
                  startTransition(() => {
                    router.push(buildHref({ q: null, location: null }));
                  });
                }
              }}
              className="absolute inset-y-0 right-28 flex items-center pr-2 text-[#5C706D] hover:text-[#19322F] cursor-pointer"
              title={t('hero.clearSearchAria')}
            >
              <span className="material-icons text-xl">cancel</span>
            </button>
          )}

          <button
            type="submit"
            disabled={isPending}
            className="absolute inset-y-2 right-2 px-6 bg-[#006655] hover:bg-[#006655]/90 disabled:opacity-70 text-white font-medium rounded-lg transition-colors flex items-center justify-center shadow-lg shadow-[#006655]/20 cursor-pointer"
          >
            {isPending ? t('hero.searching') : t('hero.searchBtn')}
          </button>
        </form>

        {/* Category Filter Pills & Filters Modal Button */}
        <div className="flex flex-wrap items-center justify-center gap-2.5 sm:gap-3 py-1 px-4">
          {categories.map((cat) => {
            const isActive = selectedCategory === cat.value;
            return (
              <button
                key={cat.value}
                onClick={() => handleCategoryChange(cat.value)}
                disabled={isPending}
                className={`whitespace-nowrap px-5 py-2 rounded-full text-sm font-medium transition-all cursor-pointer ${
                  isActive
                    ? 'bg-[#19322F] text-white shadow-lg shadow-[#19322F]/10 hover:-translate-y-0.5 ring-2 ring-[#006655]'
                    : 'bg-white border border-[#19322F]/5 text-[#5C706D] hover:text-[#19322F] hover:border-[#006655]/50 hover:bg-[#006655]/5'
                }`}
              >
                {cat.label}
              </button>
            );
          })}

          <div className="w-px h-6 bg-[#19322F]/10 mx-2"></div>

          <button
            onClick={() => setIsFilterOpen(true)}
            type="button"
            className={`whitespace-nowrap flex items-center gap-1.5 px-4 py-2 rounded-full font-medium text-sm transition-all cursor-pointer ${
              activeModalFilterCount > 0
                ? 'bg-[#006611] text-white shadow-md shadow-[#006611]/20 hover:bg-[#006611]/90'
                : 'text-[#19322F] bg-white border border-[#19322F]/5 hover:bg-black/5'
            }`}
          >
            <span className="material-icons text-base">tune</span>
            <span>{t('hero.filterBtn')}</span>
            {activeModalFilterCount > 0 && (
              <span className="ml-1 px-1.5 py-0.5 text-xs font-bold bg-white text-[#006611] rounded-full">
                {activeModalFilterCount}
              </span>
            )}
          </button>
        </div>

        {/* Active Filters Bar & Clear All Option */}
        {hasAnyFilter && (
          <div className="flex flex-wrap items-center justify-center gap-2 pt-2 px-4 animate-fadeIn">
            <div className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider bg-[#006655]/10 text-[#006655]">
              <span className="material-icons text-sm">filter_alt</span>
              <span>{activeTags.length} {activeTags.length === 1 ? t('hero.filterActive') : t('hero.filtersApplied')}</span>
            </div>

            {activeTags.map((tag) => (
              <span
                key={tag.id}
                className="inline-flex items-center gap-1.5 pl-3 pr-1.5 py-1 rounded-full text-xs font-medium bg-white text-[#19322F] border border-[#19322F]/10 shadow-sm hover:border-[#006655]/40 transition-all"
              >
                <span>{tag.label}</span>
                <button
                  type="button"
                  onClick={tag.onRemove}
                  disabled={isPending}
                  aria-label={`Remove filter ${tag.label}`}
                  className="w-4 h-4 rounded-full flex items-center justify-center text-[#5C706D] hover:bg-[#19322F]/10 hover:text-[#19322F] cursor-pointer transition-colors"
                >
                  <span className="material-icons text-[13px]">close</span>
                </button>
              </span>
            ))}

            <button
              type="button"
              onClick={handleClearAllFilters}
              disabled={isPending}
              className="inline-flex items-center gap-1 px-3.5 py-1 rounded-full text-xs font-semibold text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100/90 border border-rose-200 shadow-sm transition-all cursor-pointer hover:scale-105 active:scale-95"
            >
              <span className="material-icons text-sm">restart_alt</span>
              <span>{t('hero.clearAllFilters')}</span>
            </button>
          </div>
        )}
      </div>


      {/* Filter Modal */}
      <FilterModal
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        initialValues={{
          location: currentFilters?.location ?? searchTerm,
          minPrice: currentFilters?.minPrice,
          maxPrice: currentFilters?.maxPrice,
          category: selectedCategory,
          beds: currentFilters?.beds,
          baths: currentFilters?.baths,
          amenities: currentFilters?.amenities,
        }}
        onApply={handleApplyFilters}
        totalHomesCount={totalHomesCount}
      />
    </section>
  );
};
