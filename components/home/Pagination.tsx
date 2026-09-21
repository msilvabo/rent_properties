'use client';

import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { useLanguage } from '@/lib/i18n/context';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
}

export function Pagination({ currentPage, totalPages }: PaginationProps) {
  const { t } = useLanguage();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  if (totalPages <= 1) return null;

  // Build a URL preserving existing query params except 'page'
  const buildHref = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', String(page));
    return `${pathname}?${params.toString()}`;
  };

  // Determine page numbers to show (window of up to 5 pages)
  const getPageNumbers = () => {
    const delta = 2;
    const range: number[] = [];
    const left = Math.max(1, currentPage - delta);
    const right = Math.min(totalPages, currentPage + delta);

    for (let i = left; i <= right; i++) {
      range.push(i);
    }

    // Add first page with ellipsis
    if (left > 2) {
      range.unshift(-1); // -1 = ellipsis
      range.unshift(1);
    } else if (left === 2) {
      range.unshift(1);
    }

    // Add last page with ellipsis
    if (right < totalPages - 1) {
      range.push(-2); // -2 = ellipsis
      range.push(totalPages);
    } else if (right === totalPages - 1) {
      range.push(totalPages);
    }

    return range;
  };

  const pageNumbers = getPageNumbers();
  const hasPrev = currentPage > 1;
  const hasNext = currentPage < totalPages;

  return (
    <nav
      aria-label={t('pagination.ariaNav')}
      className="flex items-center justify-center gap-1 mt-10"
    >
      {/* Previous */}
      {hasPrev ? (
        <Link
          href={buildHref(currentPage - 1)}
          className="flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium text-[#19322F] bg-white border border-[#19322F]/10 hover:border-[#19322F]/30 hover:bg-[#19322F]/5 transition-all duration-200 shadow-sm cursor-pointer"
          aria-label={t('pagination.ariaPrev')}
        >
          <span className="material-icons text-base">chevron_left</span>
          <span className="hidden sm:inline">{t('pagination.previous')}</span>
        </Link>
      ) : (
        <span className="flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium text-[#5C706D]/40 bg-white border border-[#19322F]/5 cursor-not-allowed select-none">
          <span className="material-icons text-base">chevron_left</span>
          <span className="hidden sm:inline">{t('pagination.previous')}</span>
        </span>
      )}

      {/* Page numbers */}
      <div className="flex items-center gap-1">
        {pageNumbers.map((num, idx) => {
          if (num < 0) {
            return (
              <span
                key={`ellipsis-${idx}`}
                className="w-9 h-9 flex items-center justify-center text-[#5C706D] text-sm select-none"
              >
                …
              </span>
            );
          }

          const isActive = num === currentPage;
          return (
            <Link
              key={num}
              href={buildHref(num)}
              aria-current={isActive ? 'page' : undefined}
              aria-label={t('pagination.ariaPage', { page: num })}
              className={`w-9 h-9 flex items-center justify-center rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer ${
                isActive
                  ? 'bg-[#19322F] text-white shadow-sm'
                  : 'text-[#19322F] bg-white border border-[#19322F]/10 hover:border-[#19322F]/30 hover:bg-[#19322F]/5'
              }`}
            >
              {num}
            </Link>
          );
        })}
      </div>

      {/* Next */}
      {hasNext ? (
        <Link
          href={buildHref(currentPage + 1)}
          className="flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium text-[#19322F] bg-white border border-[#19322F]/10 hover:border-[#19322F]/30 hover:bg-[#19322F]/5 transition-all duration-200 shadow-sm cursor-pointer"
          aria-label={t('pagination.ariaNext')}
        >
          <span className="hidden sm:inline">{t('pagination.next')}</span>
          <span className="material-icons text-base">chevron_right</span>
        </Link>
      ) : (
        <span className="flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium text-[#5C706D]/40 bg-white border border-[#19322F]/5 cursor-not-allowed select-none">
          <span className="hidden sm:inline">{t('pagination.next')}</span>
          <span className="material-icons text-base">chevron_right</span>
        </span>
      )}
    </nav>
  );
}

