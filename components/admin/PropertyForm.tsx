'use client';

import React, { useState, useRef, useTransition } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Property, PropertyCategory, ListingType } from '@/types/property';
import { supabase } from '@/lib/supabase';
import { AdminLocationMap } from './AdminLocationMap';

interface PropertyFormProps {
  mode: 'create' | 'edit';
  initialData?: Property;
}

const CATEGORY_OPTIONS: { label: string; value: Exclude<PropertyCategory, 'all'> }[] = [
  { label: 'Villa', value: 'villa' },
  { label: 'Casa', value: 'house' },
  { label: 'Apartamento', value: 'apartment' },
  { label: 'Penthouse', value: 'penthouse' },
  { label: 'Condominio', value: 'condo' },
  { label: 'Townhouse', value: 'townhouse' },
];

const AMENITY_OPTIONS = [
  { id: 'Swimming Pool', label: 'Piscina privada', icon: 'pool' },
  { id: 'Garden', label: 'Jardín & Áreas verdes', icon: 'yard' },
  { id: 'Air Conditioning', label: 'Aire acondicionado', icon: 'ac_unit' },
  { id: 'Smart Home', label: 'Sistema inteligente / Domótica', icon: 'settings_remote' },
  { id: 'Gym', label: 'Gimnasio privado', icon: 'fitness_center' },
  { id: 'Spa', label: 'Spa / Sauna', icon: 'hot_tub' },
  { id: 'Security', label: 'Seguridad 24/7', icon: 'security' },
  { id: 'Ocean View', label: 'Vista al mar / Panorámica', icon: 'water' },
  { id: 'Terrace', label: 'Terraza / Balcón', icon: 'deck' },
  { id: 'Fireplace', label: 'Chimenea', icon: 'fireplace' },
  { id: 'Wine Cellar', label: 'Cava de vinos', icon: 'wine_bar' },
];

export function PropertyForm({ mode, initialData }: PropertyFormProps) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form State
  const [title, setTitle] = useState(initialData?.title || '');
  const [price, setPrice] = useState<number | string>(initialData?.price ?? '');
  const [pricePeriod, setPricePeriod] = useState(initialData?.pricePeriod || '/mo');
  const [listingType, setListingType] = useState<ListingType>(initialData?.listingType || 'sale');
  const [category, setCategory] = useState<Exclude<PropertyCategory, 'all'>>(
    initialData?.category || 'villa'
  );
  const [badge, setBadge] = useState<string>(initialData?.badge || '');
  const [isFeatured, setIsFeatured] = useState<boolean>(initialData?.isFeatured ?? false);

  // Description
  const [description, setDescription] = useState(initialData?.description || '');

  // Gallery
  const [images, setImages] = useState<string[]>(initialData?.images || []);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<string | null>(null);

  // Location
  const [address, setAddress] = useState(initialData?.location.address || '');
  const [city, setCity] = useState(initialData?.location.city || '');
  const [region, setRegion] = useState(initialData?.location.region || '');
  const [latitude, setLatitude] = useState<number | string>(initialData?.latitude ?? '');
  const [longitude, setLongitude] = useState<number | string>(initialData?.longitude ?? '');

  // Details
  const [area, setArea] = useState<number | string>(initialData?.area ?? 250);
  const [beds, setBeds] = useState<number>(initialData?.beds ?? 3);
  const [baths, setBaths] = useState<number>(initialData?.baths ?? 2);
  const [garage, setGarage] = useState<number>(initialData?.garage ?? 1);

  // Amenities
  const [amenities, setAmenities] = useState<string[]>(initialData?.amenities || []);

  // UI State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  // Handle amenities toggling
  const handleToggleAmenity = (amenityId: string) => {
    setAmenities((prev) =>
      prev.includes(amenityId) ? prev.filter((a) => a !== amenityId) : [...prev, amenityId]
    );
  };

  // Upload images to Supabase Storage bucket 'properties'
  const uploadFiles = async (files: FileList | File[]) => {
    if (!files || files.length === 0) return;

    setIsUploading(true);
    setUploadProgress('Iniciando subida de imágenes...');
    setErrorMessage(null);

    const uploadedUrls: string[] = [];

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];

        // Validate max 5MB
        if (file.size > 5 * 1024 * 1024) {
          throw new Error(`El archivo ${file.name} supera el límite máximo de 5MB.`);
        }

        setUploadProgress(`Subiendo (${i + 1}/${files.length}): ${file.name}`);

        const fileExt = file.name.split('.').pop()?.toLowerCase() || 'jpg';
        const cleanName = file.name.replace(/[^a-zA-Z0-9]/g, '_');
        const fileName = `${Date.now()}_${Math.random().toString(36).substring(2, 7)}_${cleanName}.${fileExt}`;
        const filePath = `property-images/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('properties')
          .upload(filePath, file, {
            cacheControl: '3600',
            upsert: false,
          });

        if (uploadError) {
          console.error('Error subiendo imagen:', uploadError);
          throw new Error(`Error al subir ${file.name}: ${uploadError.message}`);
        }

        const { data: publicUrlData } = supabase.storage
          .from('properties')
          .getPublicUrl(filePath);

        if (publicUrlData?.publicUrl) {
          uploadedUrls.push(publicUrlData.publicUrl);
        }
      }

      setImages((prev) => [...prev, ...uploadedUrls]);
      setSuccessMessage(`Se subieron ${uploadedUrls.length} imágenes correctamente al bucket.`);
      setTimeout(() => setSuccessMessage(null), 4000);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al subir imágenes';
      setErrorMessage(msg);
    } finally {
      setIsUploading(false);
      setUploadProgress(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      uploadFiles(e.target.files);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      uploadFiles(e.dataTransfer.files);
    }
  };

  // Reorder: set image as main (index 0)
  const setAsMainImage = (index: number) => {
    if (index === 0) return;
    setImages((prev) => {
      const copy = [...prev];
      const selected = copy.splice(index, 1)[0];
      return [selected, ...copy];
    });
  };

  // Remove image
  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  // Text formatting helper
  const insertFormatting = (syntax: string) => {
    setDescription((prev) => `${prev} ${syntax} `);
  };

  // Submit Handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    // Basic Validations
    if (!title.trim()) {
      setErrorMessage('El título de la propiedad es obligatorio.');
      return;
    }
    if (!price || Number(price) <= 0) {
      setErrorMessage('Por favor ingrese un precio válido.');
      return;
    }
    if (!city.trim()) {
      setErrorMessage('La ciudad es obligatoria.');
      return;
    }
    if (!region.trim()) {
      setErrorMessage('La región / estado es obligatoria.');
      return;
    }
    if (images.length === 0) {
      setErrorMessage('Por favor agregue al menos una imagen a la galería.');
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        title: title.trim(),
        price: Number(price),
        pricePeriod: listingType === 'rent' ? pricePeriod : null,
        listingType,
        category,
        badge: badge ? badge : null,
        isFeatured,
        description: description.trim(),
        images,
        locationAddress: address.trim(),
        locationCity: city.trim(),
        locationRegion: region.trim(),
        locationFormatted: address.trim()
          ? `${address.trim()}, ${city.trim()}, ${region.trim()}`
          : `${city.trim()}, ${region.trim()}`,
        latitude:
          latitude !== '' && latitude !== null && latitude !== undefined && !isNaN(Number(latitude))
            ? Number(latitude)
            : null,
        longitude:
          longitude !== '' && longitude !== null && longitude !== undefined && !isNaN(Number(longitude))
            ? Number(longitude)
            : null,
        area: Number(area) || 1,
        areaUnit: 'm²',
        beds,
        baths,
        garage,
        amenities,
      };

      const url =
        mode === 'create'
          ? '/api/admin/properties'
          : `/api/admin/properties/${initialData?.id}`;
      const method = mode === 'create' ? 'POST' : 'PUT';

      // Attach active session token in Authorization header
      const { data: sessionData } = await supabase.auth.getSession();
      const accessToken = sessionData?.session?.access_token;

      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      if (accessToken) {
        headers['Authorization'] = `Bearer ${accessToken}`;
      }

      const response = await fetch(url, {
        method,
        headers,
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (!response.ok || result.error) {
        throw new Error(result.error || 'Error al guardar la propiedad.');
      }

      setSuccessMessage(
        mode === 'create'
          ? '¡Propiedad creada exitosamente!'
          : '¡Propiedad actualizada exitosamente!'
      );

      // Redirect back to admin properties view
      setTimeout(() => {
        startTransition(() => {
          router.push('/admin');
          router.refresh();
        });
      }, 1200);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error inesperado al procesar la solicitud.';
      setErrorMessage(msg);
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 pb-20 md:pb-10">
      {/* Notifications / Feedback */}
      {errorMessage && (
        <div className="rounded-2xl bg-red-50 border border-red-200 p-4 flex items-center gap-3 text-red-800 animate-in fade-in duration-200">
          <span className="material-symbols-outlined text-xl text-red-600 shrink-0">
            error
          </span>
          <p className="text-sm font-medium">{errorMessage}</p>
          <button
            type="button"
            onClick={() => setErrorMessage(null)}
            className="ml-auto text-xs text-red-500 hover:text-red-700"
          >
            Cerrar
          </button>
        </div>
      )}

      {successMessage && (
        <div className="rounded-2xl bg-emerald-50 border border-emerald-200 p-4 flex items-center gap-3 text-emerald-800 animate-in fade-in duration-200">
          <span className="material-symbols-outlined text-xl text-emerald-600 shrink-0">
            check_circle
          </span>
          <p className="text-sm font-medium">{successMessage}</p>
        </div>
      )}

      {/* Header & Breadcrumb */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-[#19322F]/10 pb-8">
        <div className="space-y-4">
          <nav aria-label="Breadcrumb" className="flex">
            <ol className="flex items-center space-x-2 text-sm text-[#5C706D] font-medium">
              <li>
                <Link
                  href="/admin"
                  className="hover:text-[#006655] transition-colors flex items-center gap-1"
                >
                  <span className="material-symbols-outlined text-sm">dashboard</span>
                  <span>Panel Admin</span>
                </Link>
              </li>
              <li>
                <span className="material-symbols-outlined text-xs text-gray-400">
                  chevron_right
                </span>
              </li>
              <li>
                <Link
                  href="/admin"
                  className="hover:text-[#006655] transition-colors"
                >
                  Propiedades
                </Link>
              </li>
              <li>
                <span className="material-symbols-outlined text-xs text-gray-400">
                  chevron_right
                </span>
              </li>
              <li aria-current="page" className="text-[#19322F] font-bold">
                {mode === 'create' ? 'Añadir Nueva' : `Editar (${initialData?.title || 'Inmueble'})`}
              </li>
            </ol>
          </nav>

          <div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-[#19322F] tracking-tight">
              {mode === 'create' ? 'Añadir Nueva Propiedad' : 'Editar Propiedad'}
            </h1>
            <p className="text-base text-[#5C706D] max-w-2xl font-normal mt-1">
              {mode === 'create'
                ? 'Completa los detalles a continuación para publicar una nueva propiedad. Los campos con * son obligatorios.'
                : 'Modifica las características, fotos y detalles de la propiedad en tiempo real.'}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          <Link
            href="/admin"
            className="px-5 py-2.5 rounded-xl border border-gray-300 bg-white text-[#19322F] hover:bg-gray-50 transition-colors font-semibold text-sm cursor-pointer shadow-xs"
          >
            Cancelar
          </Link>
          <button
            type="submit"
            disabled={isSubmitting || isUploading}
            className="px-6 py-2.5 rounded-xl bg-[#006655] hover:bg-[#19322F] text-white font-semibold shadow-md hover:shadow-lg transition-all duration-200 flex items-center gap-2 text-sm disabled:opacity-50 cursor-pointer"
          >
            {isSubmitting ? (
              <>
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Guardando...</span>
              </>
            ) : (
              <>
                <span className="material-symbols-outlined text-lg">save</span>
                <span>{mode === 'create' ? 'Guardar Propiedad' : 'Actualizar Propiedad'}</span>
              </>
            )}
          </button>
        </div>
      </header>

      {/* Main Grid Form */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
        {/* Left Column: Basic Info, Description, Gallery */}
        <div className="xl:col-span-8 space-y-8">
          {/* Card: Basic Information */}
          <div className="bg-white rounded-2xl shadow-xs border border-[#19322F]/10 overflow-hidden">
            <div className="px-8 py-6 border-b border-[#D9ECC8]/40 flex items-center gap-3 bg-gradient-to-r from-[#D9ECC8]/20 to-transparent">
              <div className="w-8 h-8 rounded-xl bg-[#D9ECC8] flex items-center justify-center text-[#19322F]">
                <span className="material-symbols-outlined text-lg">info</span>
              </div>
              <div>
                <h2 className="text-lg font-bold text-[#19322F]">Información Básica</h2>
                <p className="text-xs text-[#5C706D]">Título comercial, valor de mercado y clasificación</p>
              </div>
            </div>

            <div className="p-8 space-y-6">
              {/* Title */}
              <div>
                <label className="block text-sm font-semibold text-[#19322F] mb-1.5" htmlFor="title">
                  Título de la Propiedad <span className="text-red-500">*</span>
                </label>
                <input
                  id="title"
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="ej. Villa Seraphina con Vista al Océano Pacífico"
                  className="w-full text-base px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-[#19322F] placeholder-gray-400 focus:ring-2 focus:ring-[#006655]/30 focus:border-[#006655] outline-none transition-all font-medium"
                />
              </div>

              {/* Price, Type, Category */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Price */}
                <div>
                  <label className="block text-sm font-semibold text-[#19322F] mb-1.5" htmlFor="price">
                    Precio (USD) <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-sm">
                      $
                    </span>
                    <input
                      id="price"
                      type="number"
                      min="0"
                      step="any"
                      required
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      placeholder="0.00"
                      className="w-full pl-8 pr-4 py-2.5 rounded-xl border border-gray-200 bg-white text-[#19322F] placeholder-gray-400 focus:ring-2 focus:ring-[#006655]/30 focus:border-[#006655] outline-none transition-all text-base font-semibold"
                    />
                  </div>
                </div>

                {/* Status / Listing Type */}
                <div>
                  <label className="block text-sm font-semibold text-[#19322F] mb-1.5" htmlFor="listingType">
                    Tipo de Operación <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="listingType"
                    value={listingType}
                    onChange={(e) => setListingType(e.target.value as ListingType)}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-[#19322F] focus:ring-2 focus:ring-[#006655]/30 focus:border-[#006655] outline-none transition-all text-base font-medium cursor-pointer"
                  >
                    <option value="sale">En Venta</option>
                    <option value="rent">En Renta</option>
                  </select>
                </div>

                {/* Property Type / Category */}
                <div>
                  <label className="block text-sm font-semibold text-[#19322F] mb-1.5" htmlFor="category">
                    Categoría de Inmueble <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="category"
                    value={category}
                    onChange={(e) => setCategory(e.target.value as Exclude<PropertyCategory, 'all'>)}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-[#19322F] focus:ring-2 focus:ring-[#006655]/30 focus:border-[#006655] outline-none transition-all text-base font-medium cursor-pointer"
                  >
                    {CATEGORY_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Extra badges and periodic price */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2 border-t border-gray-100">
                {/* Period if rent */}
                {listingType === 'rent' && (
                  <div>
                    <label className="block text-xs font-semibold text-[#5C706D] mb-1.5" htmlFor="pricePeriod">
                      Período de Renta
                    </label>
                    <input
                      id="pricePeriod"
                      type="text"
                      value={pricePeriod}
                      onChange={(e) => setPricePeriod(e.target.value)}
                      placeholder="/mo o /mes"
                      className="w-full px-3 py-2 rounded-xl border border-gray-200 bg-white text-sm text-[#19322F] focus:ring-2 focus:ring-[#006655]/30 focus:border-[#006655] outline-none"
                    />
                  </div>
                )}

                {/* Badge */}
                <div>
                  <label className="block text-xs font-semibold text-[#5C706D] mb-1.5" htmlFor="badge">
                    Insignia Especial (Opcional)
                  </label>
                  <select
                    id="badge"
                    value={badge}
                    onChange={(e) => setBadge(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 bg-white text-sm text-[#19322F] focus:ring-2 focus:ring-[#006655]/30 focus:border-[#006655] outline-none cursor-pointer"
                  >
                    <option value="">Sin insignia</option>
                    <option value="Exclusive">Exclusive</option>
                    <option value="New Arrival">New Arrival</option>
                  </select>
                </div>

                {/* Featured Toggle */}
                <div className="flex flex-col justify-center">
                  <label className="text-xs font-semibold text-[#5C706D] mb-1.5">
                    Visibilidad Destacada
                  </label>
                  <label className="inline-flex items-center gap-2 cursor-pointer mt-1">
                    <input
                      type="checkbox"
                      checked={isFeatured}
                      onChange={(e) => setIsFeatured(e.target.checked)}
                      className="w-4 h-4 text-[#006655] border-gray-300 rounded focus:ring-[#006655]"
                    />
                    <span className="text-sm font-medium text-[#19322F]">
                      Mostrar en sección Destacados
                    </span>
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Card: Description */}
          <div className="bg-white rounded-2xl shadow-xs border border-[#19322F]/10 overflow-hidden">
            <div className="px-8 py-6 border-b border-[#D9ECC8]/40 flex items-center gap-3 bg-gradient-to-r from-[#D9ECC8]/20 to-transparent">
              <div className="w-8 h-8 rounded-xl bg-[#D9ECC8] flex items-center justify-center text-[#19322F]">
                <span className="material-symbols-outlined text-lg">description</span>
              </div>
              <div>
                <h2 className="text-lg font-bold text-[#19322F]">Descripción Completa</h2>
                <p className="text-xs text-[#5C706D]">Detalla las virtudes, acabados y puntos clave de venta</p>
              </div>
            </div>

            <div className="p-8">
              <div className="mb-3 flex gap-2 border-b border-gray-100 pb-2">
                <button
                  type="button"
                  onClick={() => insertFormatting('**Texto en negrita**')}
                  className="p-2 text-gray-400 hover:text-[#006655] hover:bg-gray-50 rounded-lg transition-colors"
                  title="Negrita"
                >
                  <span className="material-symbols-outlined text-lg">format_bold</span>
                </button>
                <button
                  type="button"
                  onClick={() => insertFormatting('*Texto en cursiva*')}
                  className="p-2 text-gray-400 hover:text-[#006655] hover:bg-gray-50 rounded-lg transition-colors"
                  title="Cursiva"
                >
                  <span className="material-symbols-outlined text-lg">format_italic</span>
                </button>
                <button
                  type="button"
                  onClick={() => insertFormatting('\n- Punto de lista')}
                  className="p-2 text-gray-400 hover:text-[#006655] hover:bg-gray-50 rounded-lg transition-colors"
                  title="Viñeta"
                >
                  <span className="material-symbols-outlined text-lg">format_list_bulleted</span>
                </button>
              </div>

              <textarea
                rows={6}
                maxLength={2000}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe la arquitectura, vistas, vecindario, privacidad y exclusividad del inmueble..."
                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-[#19322F] placeholder-gray-400 focus:ring-2 focus:ring-[#006655]/30 focus:border-[#006655] outline-none transition-all text-sm leading-relaxed resize-y min-h-[160px]"
              />

              <div className="mt-2 text-right text-xs text-gray-400">
                {description.length} / 2000 caracteres
              </div>
            </div>
          </div>

          {/* Card: Gallery (Supabase Storage Bucket 'properties') */}
          <div className="bg-white rounded-2xl shadow-xs border border-[#19322F]/10 overflow-hidden">
            <div className="px-8 py-6 border-b border-[#D9ECC8]/40 flex justify-between items-center bg-gradient-to-r from-[#D9ECC8]/20 to-transparent">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-[#D9ECC8] flex items-center justify-center text-[#19322F]">
                  <span className="material-symbols-outlined text-lg">image</span>
                </div>
                <div>
                  <h2 className="text-lg font-bold text-[#19322F]">Galería de Imágenes</h2>
                  <p className="text-xs text-[#5C706D]">Almacenamiento directo en Supabase Storage</p>
                </div>
              </div>
              <span className="text-xs font-semibold text-[#006655] bg-[#006655]/10 px-2.5 py-1 rounded-full border border-[#006655]/20">
                JPG, PNG, WEBP &bull; Max 5MB
              </span>
            </div>

            <div className="p-8">
              {/* Drag and Drop Zone */}
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`relative border-2 border-dashed rounded-2xl p-8 text-center transition-all cursor-pointer group ${
                  isDragOver
                    ? 'border-[#006655] bg-[#D9ECC8]/20 scale-[1.01]'
                    : 'border-gray-200 bg-[#EEF6F6]/40 hover:bg-[#D9ECC8]/10 hover:border-[#006655]/50'
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  onChange={handleFileInputChange}
                  className="hidden"
                />

                <div className="flex flex-col items-center justify-center space-y-3">
                  <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-xs text-[#006655] group-hover:scale-110 transition-transform duration-300">
                    {isUploading ? (
                      <span className="w-6 h-6 border-2 border-[#006655]/30 border-t-[#006655] rounded-full animate-spin" />
                    ) : (
                      <span className="material-symbols-outlined text-3xl">cloud_upload</span>
                    )}
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-semibold text-[#19322F]">
                      {isUploading
                        ? uploadProgress || 'Subiendo imágenes a Supabase...'
                        : 'Haz clic o arrastra imágenes aquí'}
                    </p>
                    <p className="text-xs text-[#5C706D]">
                      Se almacenarán automáticamente en el bucket &ldquo;properties&rdquo; de Supabase
                    </p>
                  </div>
                </div>
              </div>

              {/* Uploaded Images Grid */}
              {images.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mt-6">
                  {images.map((imgUrl, index) => (
                    <div
                      key={imgUrl + index}
                      className="aspect-square rounded-xl overflow-hidden relative group shadow-xs border border-gray-200 bg-slate-100"
                    >
                      <Image
                        src={imgUrl}
                        alt={`Foto ${index + 1}`}
                        fill
                        sizes="(max-width: 768px) 50vw, 25vw"
                        className="object-cover"
                      />

                      {/* Main Badge */}
                      {index === 0 && (
                        <span className="absolute top-2 left-2 bg-[#006655] text-white text-2xs font-bold px-2 py-0.5 rounded-md shadow-sm tracking-wider uppercase">
                          Principal
                        </span>
                      )}

                      {/* Hover Overlay Actions */}
                      <div className="absolute inset-0 bg-[#19322F]/70 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 backdrop-blur-[2px]">
                        {index !== 0 && (
                          <button
                            type="button"
                            onClick={() => setAsMainImage(index)}
                            className="w-8 h-8 rounded-full bg-white text-[#19322F] hover:bg-amber-50 hover:text-amber-600 flex items-center justify-center transition-colors shadow-xs"
                            title="Establecer como imagen principal"
                          >
                            <span className="material-symbols-outlined text-sm">star</span>
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="w-8 h-8 rounded-full bg-white text-red-500 hover:bg-red-50 flex items-center justify-center transition-colors shadow-xs"
                          title="Eliminar imagen"
                        >
                          <span className="material-symbols-outlined text-sm">delete</span>
                        </button>
                      </div>
                    </div>
                  ))}

                  {/* Add More Button Card */}
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="aspect-square rounded-xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center text-gray-400 hover:text-[#006655] hover:border-[#006655] hover:bg-[#D9ECC8]/20 transition-all group cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-2xl group-hover:scale-110 transition-transform">
                      add_photo_alternate
                    </span>
                    <span className="text-xs mt-1 font-semibold">Añadir más</span>
                  </button>
                </div>
              ) : (
                <p className="text-center text-xs text-[#5C706D] mt-4">
                  Aún no has agregado imágenes para esta propiedad. Se requiere al menos una.
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Location & Details */}
        <div className="xl:col-span-4 space-y-8">
          {/* Card: Location */}
          <div className="bg-white rounded-2xl shadow-xs border border-[#19322F]/10 overflow-hidden">
            <div className="px-6 py-4 border-b border-[#D9ECC8]/40 flex items-center gap-3 bg-gradient-to-r from-[#D9ECC8]/20 to-transparent">
              <div className="w-8 h-8 rounded-xl bg-[#D9ECC8] flex items-center justify-center text-[#19322F]">
                <span className="material-symbols-outlined text-lg">place</span>
              </div>
              <div>
                <h2 className="text-base font-bold text-[#19322F]">Ubicación</h2>
                <p className="text-2xs text-[#5C706D]">Dirección, ciudad y geolocalización</p>
              </div>
            </div>

            <div className="p-6 space-y-4">
              {/* Address */}
              <div>
                <label className="block text-xs font-semibold text-[#19322F] mb-1" htmlFor="address">
                  Dirección Exacta
                </label>
                <input
                  id="address"
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="ej. 120 Ocean Drive, Apt 4B"
                  className="w-full px-3.5 py-2 rounded-xl border border-gray-200 bg-white text-sm text-[#19322F] focus:ring-2 focus:ring-[#006655]/30 focus:border-[#006655] outline-none"
                />
              </div>

              {/* City & Region */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#19322F] mb-1" htmlFor="city">
                    Ciudad <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="city"
                    type="text"
                    required
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="Miami"
                    className="w-full px-3.5 py-2 rounded-xl border border-gray-200 bg-white text-sm text-[#19322F] focus:ring-2 focus:ring-[#006655]/30 focus:border-[#006655] outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#19322F] mb-1" htmlFor="region">
                    Región / Estado <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="region"
                    type="text"
                    required
                    value={region}
                    onChange={(e) => setRegion(e.target.value)}
                    placeholder="Florida"
                    className="w-full px-3.5 py-2 rounded-xl border border-gray-200 bg-white text-sm text-[#19322F] focus:ring-2 focus:ring-[#006655]/30 focus:border-[#006655] outline-none"
                  />
                </div>
              </div>

              {/* Lat & Lng */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <div>
                  <label className="block text-2xs font-semibold text-[#5C706D] mb-1" htmlFor="lat">
                    Latitud (Opcional)
                  </label>
                  <input
                    id="lat"
                    type="number"
                    step="any"
                    value={latitude}
                    onChange={(e) => setLatitude(e.target.value)}
                    placeholder="25.7617"
                    className="w-full px-3 py-1.5 rounded-xl border border-gray-200 bg-gray-50/50 text-xs text-[#19322F] focus:bg-white focus:ring-2 focus:ring-[#006655]/30 focus:border-[#006655] outline-none"
                  />
                </div>
                <div>
                  <label className="block text-2xs font-semibold text-[#5C706D] mb-1" htmlFor="lng">
                    Longitud (Opcional)
                  </label>
                  <input
                    id="lng"
                    type="number"
                    step="any"
                    value={longitude}
                    onChange={(e) => setLongitude(e.target.value)}
                    placeholder="-80.1918"
                    className="w-full px-3 py-1.5 rounded-xl border border-gray-200 bg-gray-50/50 text-xs text-[#19322F] focus:bg-white focus:ring-2 focus:ring-[#006655]/30 focus:border-[#006655] outline-none"
                  />
                </div>
              </div>

              {/* Interactive OpenStreetMap (Free, No API Key Required) */}
              <AdminLocationMap
                latitude={latitude}
                longitude={longitude}
                title={title}
                onCoordinatesChange={(newLat, newLng) => {
                  setLatitude(newLat);
                  setLongitude(newLng);
                }}
              />
            </div>
          </div>

          {/* Card: Details & Amenities (Sticky) */}
          <div className="bg-white rounded-2xl shadow-xs border border-[#19322F]/10 overflow-hidden sticky top-24">
            <div className="px-6 py-4 border-b border-[#D9ECC8]/40 flex items-center gap-3 bg-gradient-to-r from-[#D9ECC8]/20 to-transparent">
              <div className="w-8 h-8 rounded-xl bg-[#D9ECC8] flex items-center justify-center text-[#19322F]">
                <span className="material-symbols-outlined text-lg">straighten</span>
              </div>
              <div>
                <h2 className="text-base font-bold text-[#19322F]">Detalles & Distribución</h2>
                <p className="text-2xs text-[#5C706D]">Metraje, ambientes y servicios incluidos</p>
              </div>
            </div>

            <div className="p-6 space-y-5">
              {/* Area */}
              <div>
                <label className="text-xs text-[#5C706D] font-semibold mb-1 block" htmlFor="area">
                  Superficie Construida (m²) <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    id="area"
                    type="number"
                    min="1"
                    required
                    value={area}
                    onChange={(e) => setArea(e.target.value)}
                    placeholder="350"
                    className="w-full px-3.5 py-2 rounded-xl border border-gray-200 bg-white text-[#19322F] focus:ring-2 focus:ring-[#006655]/30 focus:border-[#006655] outline-none font-semibold text-sm"
                  />
                  <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-400">
                    m²
                  </span>
                </div>
              </div>

              <hr className="border-gray-100" />

              {/* Steppers */}
              <div className="space-y-3.5">
                {/* Bedrooms */}
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-[#19322F] flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-gray-400 text-sm">bed</span>
                    <span>Habitaciones</span>
                  </label>
                  <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden bg-white shadow-2xs">
                    <button
                      type="button"
                      onClick={() => setBeds((b) => Math.max(0, b - 1))}
                      className="w-8 h-8 flex items-center justify-center hover:bg-gray-50 text-gray-600 transition-colors border-r border-gray-100 font-bold"
                    >
                      -
                    </button>
                    <span className="w-10 text-center text-xs font-bold text-[#19322F]">
                      {beds}
                    </span>
                    <button
                      type="button"
                      onClick={() => setBeds((b) => b + 1)}
                      className="w-8 h-8 flex items-center justify-center hover:bg-gray-50 text-gray-600 transition-colors border-l border-gray-100 font-bold"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Bathrooms */}
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-[#19322F] flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-gray-400 text-sm">bathtub</span>
                    <span>Baños</span>
                  </label>
                  <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden bg-white shadow-2xs">
                    <button
                      type="button"
                      onClick={() => setBaths((b) => Math.max(1, b - 1))}
                      className="w-8 h-8 flex items-center justify-center hover:bg-gray-50 text-gray-600 transition-colors border-r border-gray-100 font-bold"
                    >
                      -
                    </button>
                    <span className="w-10 text-center text-xs font-bold text-[#19322F]">
                      {baths}
                    </span>
                    <button
                      type="button"
                      onClick={() => setBaths((b) => b + 1)}
                      className="w-8 h-8 flex items-center justify-center hover:bg-gray-50 text-gray-600 transition-colors border-l border-gray-100 font-bold"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Garage */}
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-[#19322F] flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-gray-400 text-sm">
                      directions_car
                    </span>
                    <span>Estacionamientos</span>
                  </label>
                  <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden bg-white shadow-2xs">
                    <button
                      type="button"
                      onClick={() => setGarage((g) => Math.max(0, g - 1))}
                      className="w-8 h-8 flex items-center justify-center hover:bg-gray-50 text-gray-600 transition-colors border-r border-gray-100 font-bold"
                    >
                      -
                    </button>
                    <span className="w-10 text-center text-xs font-bold text-[#19322F]">
                      {garage}
                    </span>
                    <button
                      type="button"
                      onClick={() => setGarage((g) => g + 1)}
                      className="w-8 h-8 flex items-center justify-center hover:bg-gray-50 text-gray-600 transition-colors border-l border-gray-100 font-bold"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>

              <hr className="border-gray-100" />

              {/* Amenities */}
              <div>
                <h3 className="text-xs font-bold text-[#5C706D] mb-3 uppercase tracking-wider">
                  Amenidades &amp; Confort
                </h3>
                <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                  {AMENITY_OPTIONS.map((amenity) => {
                    const checked = amenities.includes(amenity.id);
                    return (
                      <label
                        key={amenity.id}
                        className="flex items-center gap-2.5 cursor-pointer group py-0.5"
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => handleToggleAmenity(amenity.id)}
                          className="w-4 h-4 text-[#006655] border-gray-300 rounded focus:ring-[#006655]"
                        />
                        <span className="material-symbols-outlined text-base text-gray-400 group-hover:text-[#006655] transition-colors">
                          {amenity.icon}
                        </span>
                        <span className="text-xs text-gray-700 group-hover:text-[#19322F] transition-colors font-medium">
                          {amenity.label}
                        </span>
                      </label>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Fixed Floating Bottom Bar */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/95 backdrop-blur-md border-t border-gray-200 shadow-xl md:hidden z-40 flex gap-3">
        <Link
          href="/admin"
          className="flex-1 py-3 rounded-xl border border-gray-300 bg-white text-[#19322F] font-semibold text-center text-sm"
        >
          Cancelar
        </Link>
        <button
          type="submit"
          disabled={isSubmitting || isUploading}
          className="flex-1 py-3 rounded-xl bg-[#006655] text-white font-semibold flex justify-center items-center gap-2 text-sm shadow-md"
        >
          {isSubmitting ? 'Guardando...' : mode === 'create' ? 'Guardar' : 'Actualizar'}
        </button>
      </div>
    </form>
  );
}
