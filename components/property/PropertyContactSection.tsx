'use client';

import { useState } from 'react';
import Image from 'next/image';
import { PropertyAgent } from '@/types/property';
import { useLanguage } from '@/lib/i18n/context';

interface PropertyContactSectionProps {
  propertyTitle: string;
  propertyPrice: string;
  agent?: PropertyAgent;
}

export const PropertyContactSection = ({
  propertyTitle,
  propertyPrice,
  agent,
}: PropertyContactSectionProps) => {
  const { t } = useLanguage();
  const currentAgent = agent || {
    name: 'Sarah Jenkins',
    role: t('propertyDetail.topRatedAgent'),
    avatar:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuD4TxUmdQRb2VMjuaNxLEwLorv_dgHzoET2_wL5toSvew6nhtziaR3DX-U69DBN7J74yO6oKokpw8tqEFutJf13MeXghCy7FwZuAxnoJel6FYcKeCRUVinpZtrNnkZvXd-MY5_2MAtRD7JP5BieHixfCaeAPW04jm-y-nvF3HIrwcZ_HRDk_MrNP5WiPV3u9zNrEgM-SQoWGh4xLVSV444aZAbVl03mjjsW5WBpIeodCyqJxprTDp6Q157D06VxcdUSCf-l9UKQT-w',
    phone: '+1 (555) 234-5678',
    email: 'sarah.jenkins@luxeestate.com',
  };

  const [modalType, setModalType] = useState<'schedule' | 'contact' | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    date: '',
    notes: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setModalType(null);
    }, 2000);
  };

  // WhatsApp prefilled message
  const whatsappText = encodeURIComponent(
    `Hello ${currentAgent.name}, I am interested in "${propertyTitle}" (${propertyPrice}). Could you please share more details?`
  );

  return (
    <>
      <div className="flex items-center gap-4 mb-6">
        <div className="relative w-14 h-14 rounded-full overflow-hidden border-2 border-white shadow-sm flex-shrink-0">
          <Image
            src={currentAgent.avatar}
            alt={currentAgent.name}
            fill
            className="object-cover"
          />
        </div>
        <div>
          <h3 className="font-semibold text-[#19322F]">{currentAgent.name}</h3>
          <div className="flex items-center gap-1 text-xs text-[#006655] font-medium">
            <span className="material-icons text-[14px]">star</span>
            <span>{currentAgent.role}</span>
          </div>
        </div>
        <div className="ml-auto flex gap-2">
          <a
            href={`https://wa.me/15552345678?text=${whatsappText}`}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={t('propertyDetail.chatWhatsApp')}
            className="p-2 rounded-full bg-[#006655]/10 text-[#006655] hover:bg-[#006655] hover:text-white transition-colors cursor-pointer"
          >
            <span className="material-icons text-sm">chat</span>
          </a>
          <a
            href={`tel:${currentAgent.phone || '+15552345678'}`}
            aria-label="Call agent"
            className="p-2 rounded-full bg-[#006655]/10 text-[#006655] hover:bg-[#006655] hover:text-white transition-colors cursor-pointer"
          >
            <span className="material-icons text-sm">call</span>
          </a>
        </div>
      </div>

      <div className="space-y-3">
        <button
          onClick={() => setModalType('schedule')}
          className="w-full bg-[#006655] hover:bg-[#005544] text-white py-4 px-6 rounded-lg font-medium transition-all shadow-lg shadow-[#006655]/20 flex items-center justify-center gap-2 group cursor-pointer"
        >
          <span className="material-icons text-xl group-hover:scale-110 transition-transform">
            calendar_today
          </span>
          {t('propertyDetail.scheduleTour')}
        </button>

        <button
          onClick={() => setModalType('contact')}
          className="w-full bg-transparent border border-[#19322F]/10 hover:border-[#006655] text-[#19322F]/80 hover:text-[#006655] py-4 px-6 rounded-lg font-medium transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          <span className="material-icons text-xl">mail_outline</span>
          {t('propertyDetail.requestInfo')}
        </button>
      </div>

      {/* Modal Dialog */}
      {modalType && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 sm:p-8 max-w-md w-full shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
            <button
              onClick={() => setModalType(null)}
              className="absolute top-4 right-4 text-gray-400 hover:text-[#19322F] cursor-pointer"
            >
              <span className="material-icons">close</span>
            </button>

            {submitted ? (
              <div className="text-center py-8">
                <div className="w-14 h-14 rounded-full bg-[#006655]/10 text-[#006655] flex items-center justify-center mx-auto mb-4">
                  <span className="material-icons text-3xl">check_circle</span>
                </div>
                <h3 className="text-xl font-bold text-[#19322F] mb-2">
                  {modalType === 'schedule' ? t('propertyDetail.tourScheduledTitle') : t('propertyDetail.infoSentTitle')}
                </h3>
                <p className="text-sm text-[#5C706D]">
                  {modalType === 'schedule' ? t('propertyDetail.tourScheduledDesc') : t('propertyDetail.infoSentDesc')}
                </p>
              </div>
            ) : (
              <div>
                <h3 className="text-xl font-bold text-[#19322F] mb-1">
                  {modalType === 'schedule' ? t('propertyDetail.scheduleTour') : t('propertyDetail.requestInfo')}
                </h3>
                <p className="text-xs text-[#5C706D] mb-6">
                  {propertyTitle} • {propertyPrice}
                </p>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#19322F]/70 mb-1">
                      {t('propertyDetail.name')}
                    </label>
                    <input
                      required
                      type="text"
                      placeholder="e.g. Alexander Vance"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#006655]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#19322F]/70 mb-1">
                      {t('propertyDetail.email')}
                    </label>
                    <input
                      required
                      type="email"
                      placeholder="alexander@example.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#006655]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#19322F]/70 mb-1">
                      {t('propertyDetail.phone')}
                    </label>
                    <input
                      required
                      type="tel"
                      placeholder="+1 (555) 000-0000"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#006655]"
                    />
                  </div>

                  {modalType === 'schedule' && (
                    <div>
                      <label className="block text-xs font-semibold text-[#19322F]/70 mb-1">
                        {t('propertyDetail.preferredDate')}
                      </label>
                      <input
                        required
                        type="date"
                        value={formData.date}
                        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#006655]"
                      />
                    </div>
                  )}

                  <button
                    type="submit"
                    className="w-full mt-2 bg-[#006655] hover:bg-[#005544] text-white py-3 rounded-lg font-medium transition-colors cursor-pointer shadow-md"
                  >
                    {modalType === 'schedule' ? t('propertyDetail.confirmSchedule') : t('propertyDetail.sendRequest')}
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

