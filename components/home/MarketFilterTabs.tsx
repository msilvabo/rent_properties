'use client';

import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { useLanguage } from '@/lib/i18n/context';

interface MarketFilterTabsProps {
  activeListingType: 'all' | 'sale' | 'rent';
}

export function MarketFilterTabs({ activeListingType }: MarketFilterTabsProps) {
  const { t } = useLanguage();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const buildHref = (listingType: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (listingType === 'all') {
      params.delete('listingType');
    } else {
      params.set('listingType', listingType);
    }
    // Reset to page 1 when changing filter
    params.delete('page');
    return `${pathname}?${params.toString()}`;
  };

  const tabs: { label: string; value: 'all' | 'sale' | 'rent' }[] = [
    { label: t('market.tabAll'), value: 'all' },
    { label: t('market.tabBuy'), value: 'sale' },
    { label: t('market.tabRent'), value: 'rent' },
  ];


  return (
    <div className="hidden md:flex bg-white p-1 rounded-lg border border-[#19322F]/5">
      {tabs.map(({ label, value }) => {
        const isActive = activeListingType === value;
        return (
          <Link
            key={value}
            href={buildHref(value)}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
              isActive
                ? 'bg-[#19322F] text-white shadow-sm'
                : 'text-[#5C706D] hover:text-[#19322F]'
            }`}
            aria-current={isActive ? 'page' : undefined}
          >
            {label}
          </Link>
        );
      })}
    </div>
  );
}
