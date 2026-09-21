'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';

interface PropertyGalleryProps {
  title: string;
  badge?: string;
  images: string[];
}

export const PropertyGallery = ({
  title,
  badge,
  images,
}: PropertyGalleryProps) => {
  const photoList = images && images.length > 0 ? images : ['/placeholder.jpg'];
  const [activeIndex, setActiveIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  const activeImage = photoList[activeIndex] || photoList[0];

  // Keyboard navigation for lightbox
  useEffect(() => {
    if (!lightboxOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setLightboxOpen(false);
      } else if (e.key === 'ArrowRight') {
        setLightboxIndex((prev) => (prev + 1) % photoList.length);
      } else if (e.key === 'ArrowLeft') {
        setLightboxIndex((prev) => (prev - 1 + photoList.length) % photoList.length);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lightboxOpen, photoList.length]);

  const openLightbox = (index: number) => {
    setLightboxIndex(index);
    setLightboxOpen(true);
  };

  return (
    <div className="space-y-4">
      {/* Main Image Container */}
      <div className="relative aspect-[16/10] overflow-hidden rounded-xl shadow-sm group bg-slate-100">
        <Image
          src={activeImage}
          alt={`${title} - Photo ${activeIndex + 1}`}
          fill
          priority
          sizes="(max-width: 1024px) 100vw, 66vw"
          className="object-cover transition-transform duration-700 group-hover:scale-105 cursor-pointer"
          onClick={() => openLightbox(activeIndex)}
        />

        {/* Badges */}
        <div className="absolute top-4 left-4 flex gap-2 z-10 pointer-events-none">
          {badge && (
            <span className="bg-[#006655] text-white text-xs font-medium px-3 py-1.5 rounded-full uppercase tracking-wider shadow-sm">
              {badge}
            </span>
          )}
          <span className="bg-white/90 backdrop-blur-sm text-[#19322F] text-xs font-medium px-3 py-1.5 rounded-full uppercase tracking-wider shadow-sm">
            Exclusive
          </span>
        </div>

        {/* View All Photos Button */}
        <button
          onClick={() => openLightbox(activeIndex)}
          className="absolute bottom-4 right-4 bg-white/90 hover:bg-white text-[#19322F] px-4 py-2 rounded-lg text-sm font-medium shadow-lg backdrop-blur-sm transition-all flex items-center gap-2 cursor-pointer z-10 hover:shadow-xl"
        >
          <span className="material-icons text-sm">grid_view</span>
          View All Photos ({photoList.length})
        </button>
      </div>

      {/* Thumbnails Row */}
      {photoList.length > 1 && (
        <div className="flex gap-4 overflow-x-auto hide-scroll pb-2 snap-x">
          {photoList.map((imgUrl, idx) => {
            const isActive = idx === activeIndex;
            return (
              <button
                key={idx}
                onClick={() => setActiveIndex(idx)}
                aria-label={`Show photo ${idx + 1}`}
                className={`relative flex-none w-44 sm:w-48 aspect-[4/3] rounded-lg overflow-hidden cursor-pointer transition-all snap-start ${
                  isActive
                    ? 'ring-2 ring-[#006655] ring-offset-2 ring-offset-[#EEF6F6] opacity-100 shadow-md'
                    : 'opacity-70 hover:opacity-100'
                }`}
              >
                <Image
                  src={imgUrl}
                  alt={`${title} thumbnail ${idx + 1}`}
                  fill
                  sizes="192px"
                  className="object-cover"
                />
              </button>
            );
          })}
        </div>
      )}

      {/* Lightbox Modal */}
      {lightboxOpen && (
        <div className="fixed inset-0 z-50 bg-black/95 flex flex-col justify-between p-4 sm:p-6 backdrop-blur-md">
          {/* Header bar */}
          <div className="flex justify-between items-center text-white z-10">
            <div className="font-medium text-sm sm:text-base">
              {title} — Photo {lightboxIndex + 1} of {photoList.length}
            </div>
            <button
              onClick={() => setLightboxOpen(false)}
              className="p-2 text-white/80 hover:text-white rounded-full bg-white/10 hover:bg-white/20 transition-all cursor-pointer"
              aria-label="Close photo viewer"
            >
              <span className="material-icons text-2xl">close</span>
            </button>
          </div>

          {/* Main modal image */}
          <div className="relative flex-1 my-4 flex items-center justify-center">
            <div className="relative w-full h-full max-h-[82vh]">
              <Image
                src={photoList[lightboxIndex]}
                alt={`${title} - Expanded photo ${lightboxIndex + 1}`}
                fill
                sizes="100vw"
                className="object-contain"
              />
            </div>

            {/* Prev / Next buttons */}
            {photoList.length > 1 && (
              <>
                <button
                  onClick={() =>
                    setLightboxIndex(
                      (prev) => (prev - 1 + photoList.length) % photoList.length
                    )
                  }
                  className="absolute left-2 sm:left-6 p-3 rounded-full bg-black/50 text-white hover:bg-[#006655] transition-colors cursor-pointer"
                  aria-label="Previous image"
                >
                  <span className="material-icons text-2xl">chevron_left</span>
                </button>
                <button
                  onClick={() =>
                    setLightboxIndex((prev) => (prev + 1) % photoList.length)
                  }
                  className="absolute right-2 sm:right-6 p-3 rounded-full bg-black/50 text-white hover:bg-[#006655] transition-colors cursor-pointer"
                  aria-label="Next image"
                >
                  <span className="material-icons text-2xl">chevron_right</span>
                </button>
              </>
            )}
          </div>

          {/* Footer thumbnails in modal */}
          <div className="flex gap-2 overflow-x-auto hide-scroll justify-center pb-2">
            {photoList.map((img, i) => (
              <button
                key={i}
                onClick={() => setLightboxIndex(i)}
                className={`relative flex-none w-16 h-12 rounded overflow-hidden cursor-pointer transition-all ${
                  i === lightboxIndex
                    ? 'ring-2 ring-[#006655] scale-105 opacity-100'
                    : 'opacity-50 hover:opacity-80'
                }`}
              >
                <Image
                  src={img}
                  alt={`Thumbnail ${i + 1}`}
                  fill
                  sizes="64px"
                  className="object-cover"
                />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
