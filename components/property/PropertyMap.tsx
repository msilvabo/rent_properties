'use client';

import { useEffect, useRef, useState } from 'react';
import 'leaflet/dist/leaflet.css';

interface PropertyMapProps {
  latitude?: number;
  longitude?: number;
  title: string;
  formattedAddress: string;
}

export const PropertyMap = ({
  latitude = 37.4419,
  longitude = -122.143,
  title,
  formattedAddress,
}: PropertyMapProps) => {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mapInstanceRef = useRef<any>(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isClient || !mapContainerRef.current) return;

    let isMounted = true;

    // Dynamically import Leaflet so it never executes during SSR
    import('leaflet').then((L) => {
      if (!isMounted || !mapContainerRef.current) return;

      // Clean up previous instance if already initialized
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }

      const map = L.map(mapContainerRef.current, {
        center: [latitude, longitude],
        zoom: 14,
        zoomControl: false,
        attributionControl: false,
        scrollWheelZoom: false,
      });

      mapInstanceRef.current = map;

      // Free OpenStreetMap tiles (no API key required)
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }).addTo(map);

      // Custom LuxeEstate pin icon using L.divIcon
      const customIcon = L.divIcon({
        className: 'luxe-custom-pin',
        html: `
          <div style="
            width: 38px;
            height: 38px;
            background-color: #006655;
            border-radius: 50%;
            border: 3px solid #ffffff;
            box-shadow: 0 4px 12px rgba(0, 102, 85, 0.4);
            display: flex;
            align-items: center;
            justify-content: center;
            transform: translate(-50%, -50%);
          ">
            <span class="material-icons" style="color: #ffffff; font-size: 20px;">home</span>
          </div>
        `,
        iconSize: [38, 38],
        iconAnchor: [19, 19],
      });

      const marker = L.marker([latitude, longitude], { icon: customIcon }).addTo(map);
      marker.bindPopup(`
        <div style="font-family: inherit; padding: 4px;">
          <strong style="color: #19322F; font-size: 13px;">${title}</strong><br/>
          <span style="color: #5C706D; font-size: 11px;">${formattedAddress}</span>
        </div>
      `);
    });

    return () => {
      isMounted = false;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [isClient, latitude, longitude, title, formattedAddress]);

  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;

  return (
    <div className="bg-white p-2 rounded-xl shadow-sm border border-[#006655]/5">
      <div className="relative w-full aspect-[4/3] rounded-lg overflow-hidden bg-slate-100">
        {/* Leaflet container */}
        <div ref={mapContainerRef} className="w-full h-full z-0" />

        {/* View on Google Maps external link badge */}
        <a
          href={googleMapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="absolute bottom-2 right-2 z-10 bg-white/95 text-xs font-medium px-2.5 py-1.5 rounded shadow-sm text-[#19322F] hover:text-[#006655] hover:bg-white transition-all flex items-center gap-1 border border-slate-200/50"
        >
          <span className="material-icons text-xs text-[#006655]">open_in_new</span>
          View on Google Maps
        </a>
      </div>
    </div>
  );
};
