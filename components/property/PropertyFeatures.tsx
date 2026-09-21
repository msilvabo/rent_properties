'use client';

import React from 'react';
import { useLanguage } from '@/lib/i18n/context';

interface PropertyFeaturesProps {
  area: number;
  areaUnit: string;
  beds: number;
  baths: number;
  garage?: number;
}

export const PropertyFeatures = ({
  area,
  areaUnit,
  beds,
  baths,
  garage = 2,
}: PropertyFeaturesProps) => {
  const { t } = useLanguage();

  return (
    <div className="bg-white p-8 rounded-xl shadow-sm border border-[#006655]/5">
      <h2 className="text-lg font-semibold mb-6 text-[#19322F]">
        {t('propertyDetail.features')}
      </h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {/* Area */}
        <div className="flex flex-col items-center justify-center p-4 bg-[#006655]/5 rounded-lg border border-[#006655]/10">
          <span className="material-icons text-[#006655] text-2xl mb-2">square_foot</span>
          <span className="text-xl font-bold text-[#19322F]">{area.toLocaleString()}</span>
          <span className="text-xs uppercase tracking-wider text-[#19322F]/50">
            {areaUnit === 'm²' ? 'm²' : 'Sq Ft'}
          </span>
        </div>

        {/* Beds */}
        <div className="flex flex-col items-center justify-center p-4 bg-[#006655]/5 rounded-lg border border-[#006655]/10">
          <span className="material-icons text-[#006655] text-2xl mb-2">bed</span>
          <span className="text-xl font-bold text-[#19322F]">{beds}</span>
          <span className="text-xs uppercase tracking-wider text-[#19322F]/50">
            {t('filterModal.bedrooms')}
          </span>
        </div>

        {/* Baths */}
        <div className="flex flex-col items-center justify-center p-4 bg-[#006655]/5 rounded-lg border border-[#006655]/10">
          <span className="material-icons text-[#006655] text-2xl mb-2">shower</span>
          <span className="text-xl font-bold text-[#19322F]">{baths}</span>
          <span className="text-xs uppercase tracking-wider text-[#19322F]/50">
            {t('filterModal.bathrooms')}
          </span>
        </div>

        {/* Garage */}
        <div className="flex flex-col items-center justify-center p-4 bg-[#006655]/5 rounded-lg border border-[#006655]/10">
          <span className="material-icons text-[#006655] text-2xl mb-2">directions_car</span>
          <span className="text-xl font-bold text-[#19322F]">{garage}</span>
          <span className="text-xs uppercase tracking-wider text-[#19322F]/50">
            {t('propertyDetail.garage')}
          </span>
        </div>
      </div>
    </div>
  );
};

