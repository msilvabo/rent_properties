'use client';

import React, { useEffect, useRef, useState } from 'react';
import 'leaflet/dist/leaflet.css';

interface AdminLocationMapProps {
  latitude?: number | string | null;
  longitude?: number | string | null;
  onCoordinatesChange: (lat: number, lng: number) => void;
  title?: string;
}

export function AdminLocationMap({
  latitude,
  longitude,
  onCoordinatesChange,
  title = 'Ubicación de la Propiedad',
}: AdminLocationMapProps) {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mapInstanceRef = useRef<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const markerRef = useRef<any>(null);
  const [isClient, setIsClient] = useState(false);

  const numLat =
    latitude !== '' && latitude !== null && latitude !== undefined && !isNaN(Number(latitude))
      ? Number(latitude)
      : null;
  const numLng =
    longitude !== '' && longitude !== null && longitude !== undefined && !isNaN(Number(longitude))
      ? Number(longitude)
      : null;

  // Default fallback center (e.g. Miami, Florida)
  const defaultLat = 25.7617;
  const defaultLng = -80.1918;

  const currentLat = numLat ?? defaultLat;
  const currentLng = numLng ?? defaultLng;

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isClient || !mapContainerRef.current) return;

    let isMounted = true;

    import('leaflet').then((L) => {
      if (!isMounted || !mapContainerRef.current) return;

      if (!mapInstanceRef.current) {
        const map = L.map(mapContainerRef.current, {
          center: [currentLat, currentLng],
          zoom: numLat && numLng ? 14 : 11,
          zoomControl: true,
          attributionControl: true,
          scrollWheelZoom: false,
        });

        mapInstanceRef.current = map;

        // 100% Free OpenStreetMap tiles (no API key required)
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          maxZoom: 19,
          attribution:
            '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        }).addTo(map);

        // Click on map to set coordinates
        map.on('click', (e: any) => {
          const clickedLat = Number(e.latlng.lat.toFixed(6));
          const clickedLng = Number(e.latlng.lng.toFixed(6));
          onCoordinatesChange(clickedLat, clickedLng);
        });
      }

      const map = mapInstanceRef.current;

      // Custom LuxeEstate pin icon
      const customIcon = L.divIcon({
        className: 'luxe-map-picker-pin',
        html: `
          <div style="
            width: 34px;
            height: 34px;
            background-color: #006655;
            border-radius: 50%;
            border: 3px solid #ffffff;
            box-shadow: 0 4px 10px rgba(0, 102, 85, 0.4);
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: grab;
            transform: translate(-50%, -50%);
          ">
            <span class="material-icons" style="color: #ffffff; font-size: 18px;">location_on</span>
          </div>
        `,
        iconSize: [34, 34],
        iconAnchor: [17, 17],
      });

      if (numLat && numLng) {
        if (!markerRef.current) {
          const marker = L.marker([numLat, numLng], {
            icon: customIcon,
            draggable: true,
          }).addTo(map);

          marker.on('dragend', (e: any) => {
            const pos = e.target.getLatLng();
            onCoordinatesChange(Number(pos.lat.toFixed(6)), Number(pos.lng.toFixed(6)));
          });

          markerRef.current = marker;
        } else {
          markerRef.current.setLatLng([numLat, numLng]);
        }

        map.panTo([numLat, numLng], { animate: true, duration: 0.5 });
      } else if (markerRef.current) {
        map.removeLayer(markerRef.current);
        markerRef.current = null;
      }
    });

    return () => {
      isMounted = false;
    };
  }, [isClient, currentLat, currentLng, numLat, numLng, onCoordinatesChange, title]);

  useEffect(() => {
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
        markerRef.current = null;
      }
    };
  }, []);

  return (
    <div className="space-y-1.5 mt-2">
      <div className="relative h-48 w-full rounded-xl overflow-hidden bg-slate-100 border border-gray-200 shadow-2xs">
        <div ref={mapContainerRef} className="w-full h-full z-0" />
      </div>
      <p className="text-2xs text-[#5C706D] flex items-center gap-1">
        <span className="material-symbols-outlined text-xs text-[#006655]">touch_app</span>
        <span>Haz clic en el mapa o arrastra el marcador para fijar la latitud y longitud.</span>
      </p>
    </div>
  );
}
