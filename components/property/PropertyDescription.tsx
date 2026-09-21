'use client';

import { useState } from 'react';
import { useLanguage } from '@/lib/i18n/context';

interface PropertyDescriptionProps {
  description?: string;
}

export const PropertyDescription = ({ description }: PropertyDescriptionProps) => {
  const { t } = useLanguage();
  const [isExpanded, setIsExpanded] = useState(false);

  const defaultText = `Experience modern luxury in this architecturally stunning home located in a premier neighborhood. Designed with an emphasis on indoor-outdoor living, the residence features floor-to-ceiling glass walls that flood the interiors with natural light.

The open-concept kitchen is equipped with top-of-the-line appliances and custom cabinetry, perfect for culinary enthusiasts. Retreat to the primary suite, a sanctuary of relaxation with a spa-inspired bath and private balcony.

Every detail has been curated to balance contemporary aesthetics with effortless daily comfort, offering generous ceiling heights, engineered hardwood flooring, and seamless flow into exterior entertaining zones.`;

  const textToRender = description || defaultText;
  const paragraphs = textToRender.split('\n\n').filter(Boolean);

  const visibleParagraphs = isExpanded ? paragraphs : paragraphs.slice(0, 2);

  return (
    <div className="bg-white p-8 rounded-xl shadow-sm border border-[#006655]/5">
      <h2 className="text-lg font-semibold mb-4 text-[#19322F]">{t('propertyDetail.aboutHome')}</h2>
      <div className="text-[#19322F]/70 leading-relaxed space-y-4">
        {visibleParagraphs.map((para, idx) => (
          <p key={idx}>{para}</p>
        ))}
      </div>

      {paragraphs.length > 2 && (
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="mt-4 text-[#006655] font-semibold text-sm flex items-center gap-1 hover:gap-2 transition-all cursor-pointer"
        >
          {isExpanded ? 'Show less' : 'Read more'}
          <span className="material-icons text-sm">
            {isExpanded ? 'arrow_upward' : 'arrow_forward'}
          </span>
        </button>
      )}
    </div>
  );
};

