'use client';

import React from 'react';
import { useLanguage } from '@/lib/i18n/context';

interface PropertyAmenitiesProps {
  amenities?: string[];
}

export const PropertyAmenities = ({ amenities }: PropertyAmenitiesProps) => {
  const { t } = useLanguage();
  const defaultAmenities = [
    'Smart Home',
    'Swimming Pool',
    'Air Conditioning',
    'Parking',
    'Gym',
    'Wine Cellar',
  ];

  const list = amenities && amenities.length > 0 ? amenities : defaultAmenities;

  return (
    <div className="bg-white p-8 rounded-xl shadow-sm border border-[#006655]/5">
      <h2 className="text-lg font-semibold mb-6 text-[#19322F]">
        {t('propertyDetail.amenitiesFeatures')}
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-8">
        {list.map((item, idx) => {
          const translatedItem = t(`amenities.${item}`) !== `amenities.${item}` ? t(`amenities.${item}`) : item;
          return (
            <div key={idx} className="flex items-center gap-3 text-[#19322F]/70">
              <span className="material-icons text-[#006655]/70 text-sm">check_circle</span>
              <span>{translatedItem}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

