'use client';

import { useState, useEffect } from 'react';
import { PropertyCategory } from '@/types/property';
import { useLanguage } from '@/lib/i18n/context';

export interface FilterValues {
  location: string;
  minPrice: number;
  maxPrice: number;
  category: PropertyCategory;
  beds: number;
  baths: number;
  amenities: string[];
}

interface FilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialValues: Partial<FilterValues>;
  onApply: (values: FilterValues) => void;
  totalHomesCount?: number;
}

const DEFAULT_MIN_PRICE = 0;
const DEFAULT_MAX_PRICE = 15000000;

const AMENITY_OPTIONS = [
  { id: 'Swimming Pool', icon: 'pool' },
  { id: 'Gym', icon: 'fitness_center' },
  { id: 'Parking', icon: 'local_parking' },
  { id: 'Air Conditioning', icon: 'ac_unit' },
  { id: 'High-speed Wifi', icon: 'wifi' },
  { id: 'Patio / Terrace', icon: 'deck' },
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

function formatNumberWithCommas(val: number): string {
  return val ? val.toLocaleString('en-US') : '0';
}

function parseFormattedNumber(val: string): number {
  const clean = val.replace(/[^0-9]/g, '');
  return clean ? parseInt(clean, 10) : 0;
}

export function FilterModal({
  isOpen,
  onClose,
  initialValues,
  onApply,
  totalHomesCount,
}: FilterModalProps) {
  const { t } = useLanguage();
  const [location, setLocation] = useState(initialValues.location ?? '');
  const [minPrice, setMinPrice] = useState(initialValues.minPrice ?? 500000);
  const [maxPrice, setMaxPrice] = useState(initialValues.maxPrice ?? 6500000);
  const [category, setCategory] = useState<PropertyCategory>(initialValues.category ?? 'all');
  const [beds, setBeds] = useState(initialValues.beds ?? 0);
  const [baths, setBaths] = useState(initialValues.baths ?? 0);
  const [amenities, setAmenities] = useState<string[]>(
    initialValues.amenities ?? ['Swimming Pool', 'High-speed Wifi']
  );

  // Sync state when modal opens
  useEffect(() => {
    if (isOpen) {
      setLocation(initialValues.location ?? '');
      setMinPrice(initialValues.minPrice ?? 500000);
      setMaxPrice(initialValues.maxPrice ?? 6500000);
      setCategory(initialValues.category ?? 'all');
      setBeds(initialValues.beds ?? 0);
      setBaths(initialValues.baths ?? 0);
      setAmenities(initialValues.amenities ?? ['Swimming Pool', 'High-speed Wifi']);
    }
  }, [isOpen, initialValues]);

  // Lock body scroll when open and handle ESC key
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    document.addEventListener('keydown', handleKeyDown);
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = originalOverflow;
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const toggleAmenity = (amenityId: string) => {
    setAmenities((prev) =>
      prev.includes(amenityId) ? prev.filter((a) => a !== amenityId) : [...prev, amenityId]
    );
  };

  const handleClearAll = () => {
    setLocation('');
    setMinPrice(0);
    setMaxPrice(DEFAULT_MAX_PRICE);
    setCategory('all');
    setBeds(0);
    setBaths(0);
    setAmenities([]);
  };

  const handleApply = () => {
    onApply({
      location: location.trim(),
      minPrice,
      maxPrice,
      category,
      beds,
      baths,
      amenities,
    });
    onClose();
  };

  // Calculate percentage for slider range visual
  const minPercent = Math.max(0, Math.min(100, (minPrice / DEFAULT_MAX_PRICE) * 100));
  const maxPercent = Math.max(0, Math.min(100, (maxPrice / DEFAULT_MAX_PRICE) * 100));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      {/* Modal Overlay */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm transition-opacity"
        aria-hidden="true"
      />

      {/* Main Modal Container */}
      <main
        role="dialog"
        aria-modal="true"
        aria-labelledby="filter-modal-title"
        className="relative z-20 w-full max-w-2xl bg-white dark:bg-gray-900 rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] text-gray-800 dark:text-gray-100 font-sans"
      >
        {/* Header */}
        <header className="px-8 py-6 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-white dark:bg-gray-900 sticky top-0 z-30">
          <h1
            id="filter-modal-title"
            className="text-2xl font-semibold tracking-tight text-gray-900 dark:text-white"
          >
            {t('filterModal.title')}
          </h1>
          <button
            onClick={onClose}
            aria-label={t('filterModal.closeAria')}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-500 dark:text-gray-400 cursor-pointer"
          >
            <span className="material-icons">close</span>
          </button>
        </header>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto hide-scroll p-8 space-y-10">
          {/* Section 1: Location */}
          <section>
            <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
              {t('hero.searchPlaceholder').split('...')[0]}
            </label>
            <div className="relative group">
              <span className="material-icons absolute left-4 top-3.5 text-gray-400 group-focus-within:text-[#006611] transition-colors">
                location_on
              </span>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder={t('hero.searchPlaceholder')}
                className="w-full pl-12 pr-4 py-3 bg-[#f5f8f6] dark:bg-gray-800 border-0 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-[#006611] focus:bg-white dark:focus:bg-gray-800 transition-all shadow-sm outline-none"
              />
            </div>
          </section>

          {/* Section 2: Price Range */}
          <section>
            <div className="flex justify-between items-end mb-4">
              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                {t('filterModal.priceRange')}
              </label>
              <span className="text-sm font-medium text-[#006611]">
                {formatPriceShort(minPrice)} – {formatPriceShort(maxPrice)}
              </span>
            </div>

            {/* Slider Visual & Controls */}
            <div className="relative h-12 flex items-center mb-6 px-2">
              {/* Background Track */}
              <div className="absolute w-full h-1 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#006611] transition-all"
                  style={{
                    marginLeft: `${minPercent}%`,
                    width: `${Math.max(0, maxPercent - minPercent)}%`,
                  }}
                />
              </div>

              {/* Dual Range Sliders */}
              <input
                type="range"
                min={0}
                max={DEFAULT_MAX_PRICE}
                step={50000}
                value={minPrice}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  if (val <= maxPrice) setMinPrice(val);
                }}
                className="absolute w-full h-1 appearance-none bg-transparent pointer-events-none z-20 [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#006611] [&::-webkit-slider-thumb]:border-4 [&::-webkit-slider-thumb]:border-white [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:cursor-pointer [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-[#006611] [&::-moz-range-thumb]:border-4 [&::-moz-range-thumb]:border-white [&::-moz-range-thumb]:shadow-md"
              />

              <input
                type="range"
                min={0}
                max={DEFAULT_MAX_PRICE}
                step={50000}
                value={maxPrice}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  if (val >= minPrice) setMaxPrice(val);
                }}
                className="absolute w-full h-1 appearance-none bg-transparent pointer-events-none z-20 [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#006611] [&::-webkit-slider-thumb]:border-4 [&::-webkit-slider-thumb]:border-white [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:cursor-pointer [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-[#006611] [&::-moz-range-thumb]:border-4 [&::-moz-range-thumb]:border-white [&::-moz-range-thumb]:shadow-md"
              />
            </div>

            {/* Min and Max Price Inputs */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-[#f5f8f6] dark:bg-gray-800 p-3 rounded-lg border border-transparent focus-within:border-[#006611]/30 transition-colors">
                <label className="block text-[10px] text-gray-500 uppercase font-medium mb-1">
                  {t('filterModal.minPrice')}
                </label>
                <div className="flex items-center">
                  <span className="text-gray-400 mr-1">$</span>
                  <input
                    type="text"
                    value={formatNumberWithCommas(minPrice)}
                    onChange={(e) => setMinPrice(parseFormattedNumber(e.target.value))}
                    className="w-full bg-transparent border-0 p-0 text-gray-900 dark:text-white font-medium focus:ring-0 text-sm outline-none"
                  />
                </div>
              </div>

              <div className="bg-[#f5f8f6] dark:bg-gray-800 p-3 rounded-lg border border-transparent focus-within:border-[#006611]/30 transition-colors">
                <label className="block text-[10px] text-gray-500 uppercase font-medium mb-1">
                  {t('filterModal.maxPrice')}
                </label>
                <div className="flex items-center">
                  <span className="text-gray-400 mr-1">$</span>
                  <input
                    type="text"
                    value={formatNumberWithCommas(maxPrice)}
                    onChange={(e) => setMaxPrice(parseFormattedNumber(e.target.value))}
                    className="w-full bg-transparent border-0 p-0 text-gray-900 dark:text-white font-medium focus:ring-0 text-sm outline-none"
                  />
                </div>
              </div>
            </div>
          </section>

          {/* Section 3: Property Details */}
          <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Property Type */}
            <div className="space-y-3">
              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                {t('filterModal.propertyType')}
              </label>
              <div className="relative">
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as PropertyCategory)}
                  className="w-full bg-[#f5f8f6] dark:bg-gray-800 border-0 rounded-lg py-3 pl-4 pr-10 text-gray-900 dark:text-white appearance-none focus:ring-2 focus:ring-[#006611] cursor-pointer outline-none"
                >
                  <option value="all">{t('categories.all')}</option>
                  <option value="house">{t('categories.house')}</option>
                  <option value="apartment">{t('categories.apartment')}</option>
                  <option value="condo">{t('categories.condo')}</option>
                  <option value="townhouse">{t('categories.townhouse')}</option>
                  <option value="villa">{t('categories.villa')}</option>
                  <option value="penthouse">{t('categories.penthouse')}</option>
                </select>
                <span className="material-icons absolute right-3 top-3 text-gray-400 pointer-events-none">
                  expand_more
                </span>
              </div>
            </div>

            {/* Rooms: Beds and Baths */}
            <div className="space-y-4">
              {/* Beds */}
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  {t('filterModal.bedrooms')}
                </span>
                <div className="flex items-center space-x-3 bg-[#f5f8f6] dark:bg-gray-800 rounded-full p-1">
                  <button
                    type="button"
                    onClick={() => setBeds((b) => Math.max(0, b - 1))}
                    disabled={beds === 0}
                    className="w-8 h-8 rounded-full bg-white dark:bg-gray-700 shadow-sm flex items-center justify-center text-gray-500 hover:text-[#006611] disabled:opacity-40 transition-colors cursor-pointer"
                  >
                    <span className="material-icons text-base">remove</span>
                  </button>
                  <span className="text-sm font-semibold w-6 text-center">
                    {beds === 0 ? t('filterModal.any') : `${beds}+`}
                  </span>
                  <button
                    type="button"
                    onClick={() => setBeds((b) => Math.min(8, b + 1))}
                    className="w-8 h-8 rounded-full bg-white dark:bg-gray-700 shadow-sm flex items-center justify-center text-[#006611] hover:bg-[#006611] hover:text-white transition-colors cursor-pointer"
                  >
                    <span className="material-icons text-base">add</span>
                  </button>
                </div>
              </div>

              {/* Baths */}
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  {t('filterModal.bathrooms')}
                </span>
                <div className="flex items-center space-x-3 bg-[#f5f8f6] dark:bg-gray-800 rounded-full p-1">
                  <button
                    type="button"
                    onClick={() => setBaths((b) => Math.max(0, b - 1))}
                    disabled={baths === 0}
                    className="w-8 h-8 rounded-full bg-white dark:bg-gray-700 shadow-sm flex items-center justify-center text-gray-500 hover:text-[#006611] disabled:opacity-40 transition-colors cursor-pointer"
                  >
                    <span className="material-icons text-base">remove</span>
                  </button>
                  <span className="text-sm font-semibold w-6 text-center">
                    {baths === 0 ? t('filterModal.any') : `${baths}+`}
                  </span>
                  <button
                    type="button"
                    onClick={() => setBaths((b) => Math.min(8, b + 1))}
                    className="w-8 h-8 rounded-full bg-white dark:bg-gray-700 shadow-sm flex items-center justify-center text-[#006611] hover:bg-[#006611] hover:text-white transition-colors cursor-pointer"
                  >
                    <span className="material-icons text-base">add</span>
                  </button>
                </div>
              </div>
            </div>
          </section>

          {/* Section 4: Amenities */}
          <section>
            <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4">
              {t('filterModal.amenities')}
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {AMENITY_OPTIONS.map((opt) => {
                const isActive = amenities.includes(opt.id);
                const label = t(`amenities.${opt.id}`) !== `amenities.${opt.id}` ? t(`amenities.${opt.id}`) : opt.id;
                return (
                  <label
                    key={opt.id}
                    onClick={() => toggleAmenity(opt.id)}
                    className="cursor-pointer group relative select-none"
                  >
                    <div
                      className={`h-full px-4 py-3 rounded-lg border text-sm font-medium flex items-center justify-center gap-2 transition-all cursor-pointer ${
                        isActive
                          ? 'border-[#006611] bg-[#006611]/10 text-[#006611] dark:bg-[#006611]/20 dark:text-emerald-400'
                          : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
                      }`}
                    >
                      <span
                        className={`material-icons text-lg transition-colors ${
                          isActive
                            ? 'text-[#006611] dark:text-emerald-400'
                            : 'text-gray-400 group-hover:text-gray-500'
                        }`}
                      >
                        {opt.icon}
                      </span>
                      <span>{label}</span>
                    </div>
                    {isActive && (
                      <div className="absolute top-2 right-2 w-2 h-2 bg-[#006611] rounded-full opacity-100 transition-opacity" />
                    )}
                  </label>
                );
              })}
            </div>
          </section>
        </div>

        {/* Footer */}
        <footer className="bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 px-8 py-6 sticky bottom-0 z-30 flex items-center justify-between">
          <button
            type="button"
            onClick={handleClearAll}
            className="text-sm font-medium text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors underline decoration-gray-300 underline-offset-4 cursor-pointer"
          >
            {t('hero.clearAllFilters')}
          </button>
          <button
            type="button"
            onClick={handleApply}
            className="bg-[#006611] hover:bg-[#006611]/90 text-white px-8 py-3 rounded-lg font-medium shadow-lg shadow-[#006611]/30 transition-all hover:shadow-[#006611]/40 flex items-center gap-2 transform active:scale-95 cursor-pointer"
          >
            <span>
              {totalHomesCount !== undefined
                ? t('filterModal.showResults', { count: totalHomesCount })
                : t('filterModal.apply')}
            </span>
            <span className="material-icons text-sm">arrow_forward</span>
          </button>
        </footer>
      </main>
    </div>
  );
}

