'use client';

import { useState, useMemo, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Property, PropertyCategory, ListingType } from '@/types/property';
import { supabase } from '@/lib/supabase';

interface AdminPropertiesViewProps {
  initialProperties: Property[];
}

const PAGE_SIZE_OPTIONS = [6, 18, 36, 100];

export function AdminPropertiesView({ initialProperties }: AdminPropertiesViewProps) {
  const [properties, setProperties] = useState<Property[]>(initialProperties);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [toggleError, setToggleError] = useState<string | null>(null);

  // Pagination states
  const [pageSize, setPageSize] = useState<number>(6);
  const [currentPage, setCurrentPage] = useState<number>(1);

  // Stats calculation
  const stats = useMemo(() => {
    const total = properties.length;
    const forSale = properties.filter((p) => p.listingType === 'sale').length;
    const forRent = properties.filter((p) => p.listingType === 'rent').length;
    const featured = properties.filter((p) => p.isFeatured).length;
    const disabled = properties.filter((p) => p.isEnabled === false).length;
    return { total, forSale, forRent, featured, disabled };
  }, [properties]);

  // Filtering
  const filteredProperties = useMemo(() => {
    return properties.filter((p) => {
      // Search term matching title, location, or slug
      const matchesSearch =
        !searchTerm.trim() ||
        p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.location.formatted.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.location.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.slug.toLowerCase().includes(searchTerm.toLowerCase());

      // Category filter
      const matchesCategory =
        selectedCategory === 'all' || p.category === selectedCategory;

      // Listing type filter
      const matchesType =
        selectedType === 'all' || p.listingType === selectedType;

      return matchesSearch && matchesCategory && matchesType;
      // NOTE: Admin view shows ALL properties including disabled ones
    });
  }, [properties, searchTerm, selectedCategory, selectedType]);

  // Toggle property enabled/disabled
  const handleToggleEnabled = useCallback(async (prop: Property) => {
    if (togglingId) return; // prevent double-click
    setTogglingId(prop.id);
    setToggleError(null);
    const newEnabledState = prop.isEnabled === false ? true : false;

    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const accessToken = sessionData?.session?.access_token;
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (accessToken) headers['Authorization'] = `Bearer ${accessToken}`;

      const response = await fetch(`/api/admin/properties/${prop.id}`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify({ is_enabled: newEnabledState }),
      });

      const result = await response.json();

      if (!response.ok || result.error) {
        throw new Error(result.error || 'Error al cambiar el estado de la propiedad.');
      }

      // Update local state immediately (optimistic update)
      setProperties((prev) =>
        prev.map((p) => (p.id === prop.id ? { ...p, isEnabled: newEnabledState } : p))
      );
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al cambiar estado';
      setToggleError(msg);
      setTimeout(() => setToggleError(null), 4000);
    } finally {
      setTogglingId(null);
    }
  }, [togglingId]);

  // Reset page when filters or page size change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedCategory, selectedType, pageSize]);

  // Pagination calculation
  const totalItems = filteredProperties.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const safeCurrentPage = Math.min(Math.max(1, currentPage), totalPages);

  const paginatedProperties = useMemo(() => {
    const startIndex = (safeCurrentPage - 1) * pageSize;
    return filteredProperties.slice(startIndex, startIndex + pageSize);
  }, [filteredProperties, safeCurrentPage, pageSize]);

  const startIndex = totalItems === 0 ? 0 : (safeCurrentPage - 1) * pageSize + 1;
  const endIndex = Math.min(safeCurrentPage * pageSize, totalItems);

  const categories: { label: string; value: PropertyCategory | 'all' }[] = [
    { label: 'Todas las categorías', value: 'all' },
    { label: 'Villas', value: 'villa' },
    { label: 'Penthouses', value: 'penthouse' },
    { label: 'Casas', value: 'house' },
    { label: 'Apartamentos', value: 'apartment' },
    { label: 'Condominios', value: 'condo' },
    { label: 'Townhouses', value: 'townhouse' },
  ];

  const handlePageChange = (page: number) => {
    const target = Math.min(Math.max(1, page), totalPages);
    setCurrentPage(target);
    // Smooth scroll back to top of property grid
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 320, behavior: 'smooth' });
    }
  };

  return (
    <div className="space-y-6">
      {/* Overview Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-[#19322F]/10 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#5C706D]">
              Total Propiedades
            </span>
            <span className="w-8 h-8 rounded-lg bg-[#006655]/10 text-[#006655] flex items-center justify-center">
              <span className="material-symbols-outlined text-base">apartment</span>
            </span>
          </div>
          <p className="text-2xl sm:text-3xl font-bold text-[#19322F] mt-2">
            {stats.total}
          </p>
          <span className="text-xs text-[#5C706D] mt-1 inline-block">
            En base de datos
          </span>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-[#19322F]/10 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#5C706D]">
              En Venta
            </span>
            <span className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <span className="material-symbols-outlined text-base">sell</span>
            </span>
          </div>
          <p className="text-2xl sm:text-3xl font-bold text-[#19322F] mt-2">
            {stats.forSale}
          </p>
          <span className="text-xs text-[#5C706D] mt-1 inline-block">
            Listadas para compraventa
          </span>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-[#19322F]/10 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#5C706D]">
              En Renta
            </span>
            <span className="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center">
              <span className="material-symbols-outlined text-base">key</span>
            </span>
          </div>
          <p className="text-2xl sm:text-3xl font-bold text-[#19322F] mt-2">
            {stats.forRent}
          </p>
          <span className="text-xs text-[#5C706D] mt-1 inline-block">
            Arrendamiento mensual
          </span>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-[#19322F]/10 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#5C706D]">
              Destacadas
            </span>
            <span className="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center">
              <span className="material-symbols-outlined text-base">star</span>
            </span>
          </div>
          <p className="text-2xl sm:text-3xl font-bold text-[#19322F] mt-2">
            {stats.featured}
          </p>
          <span className="text-xs text-[#5C706D] mt-1 inline-block">
            En vitrina principal
          </span>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-[#19322F]/10 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#5C706D]">
              Desactivadas
            </span>
            <span className="w-8 h-8 rounded-lg bg-slate-100 text-slate-500 flex items-center justify-center">
              <span className="material-symbols-outlined text-base">visibility_off</span>
            </span>
          </div>
          <p className="text-2xl sm:text-3xl font-bold text-[#19322F] mt-2">
            {stats.disabled}
          </p>
          <span className="text-xs text-[#5C706D] mt-1 inline-block">
            Ocultas del portal
          </span>
        </div>
      </div>

      {/* Toggle Error Notification */}
      {toggleError && (
        <div className="rounded-2xl bg-red-50 border border-red-200 p-3 flex items-center gap-3 text-red-800 animate-in fade-in duration-200">
          <span className="material-symbols-outlined text-lg text-red-600 shrink-0">error</span>
          <p className="text-sm font-medium">{toggleError}</p>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-[#19322F]/10 shadow-xs flex flex-col md:flex-row gap-4 justify-between items-stretch md:items-center">
        {/* Search Input */}
        <div className="relative flex-1 min-w-[240px]">
          <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-[#5C706D] text-lg pointer-events-none">
            search
          </span>
          <input
            type="text"
            placeholder="Buscar por título, ciudad o dirección..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#EEF6F6]/60 border border-[#19322F]/10 text-sm text-[#19322F] placeholder-[#5C706D] focus:outline-none focus:ring-2 focus:ring-[#006655]/30 focus:border-[#006655] transition-all"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#5C706D] hover:text-[#19322F]"
            >
              <span className="material-symbols-outlined text-base">close</span>
            </button>
          )}
        </div>

        {/* Dropdown Filters & Controls */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="py-2.5 px-3 rounded-xl bg-[#EEF6F6]/60 border border-[#19322F]/10 text-xs sm:text-sm text-[#19322F] focus:outline-none focus:ring-2 focus:ring-[#006655]/30 cursor-pointer"
          >
            {categories.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>

          {/* Type Filter */}
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="py-2.5 px-3 rounded-xl bg-[#EEF6F6]/60 border border-[#19322F]/10 text-xs sm:text-sm text-[#19322F] focus:outline-none focus:ring-2 focus:ring-[#006655]/30 cursor-pointer"
          >
            <option value="all">Todos los tipos</option>
            <option value="sale">Venta</option>
            <option value="rent">Renta</option>
          </select>

          {/* Page Size Selector */}
          <div className="flex items-center gap-1.5 bg-[#EEF6F6]/70 px-3 py-1.5 rounded-xl border border-[#19322F]/10">
            <span className="text-xs font-semibold text-[#5C706D] hidden lg:inline">
              Por página:
            </span>
            <select
              value={pageSize}
              onChange={(e) => setPageSize(Number(e.target.value))}
              aria-label="Cantidad de propiedades por página"
              className="bg-transparent text-xs sm:text-sm font-bold text-[#006655] focus:outline-none cursor-pointer"
            >
              {PAGE_SIZE_OPTIONS.map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
          </div>

          {/* View Mode Toggle */}
          <div className="inline-flex rounded-xl bg-[#EEF6F6] p-1 border border-[#19322F]/10">
            <button
              onClick={() => setViewMode('grid')}
              aria-label="Vista Cuadrícula"
              className={`p-1.5 rounded-lg transition-all ${
                viewMode === 'grid'
                  ? 'bg-white text-[#006655] shadow-2xs font-semibold'
                  : 'text-[#5C706D] hover:text-[#19322F]'
              }`}
            >
              <span className="material-symbols-outlined text-lg">grid_view</span>
            </button>
            <button
              onClick={() => setViewMode('table')}
              aria-label="Vista Tabla"
              className={`p-1.5 rounded-lg transition-all ${
                viewMode === 'table'
                  ? 'bg-white text-[#006655] shadow-2xs font-semibold'
                  : 'text-[#5C706D] hover:text-[#19322F]'
              }`}
            >
              <span className="material-symbols-outlined text-lg">table_rows</span>
            </button>
          </div>

          {/* Add Property Button */}
          <Link
            href="/admin/properties/new"
            className="px-4 py-2 rounded-xl bg-[#006655] hover:bg-[#19322F] text-white text-xs sm:text-sm font-semibold shadow-xs hover:shadow-md transition-all flex items-center gap-1.5 cursor-pointer shrink-0"
          >
            <span className="material-symbols-outlined text-base">add_business</span>
            <span>Nueva Propiedad</span>
          </Link>
        </div>
      </div>

      {/* Results Count & Quick Status */}
      <div className="flex items-center justify-between text-xs text-[#5C706D] px-1">
        <span>
          Mostrando <strong>{startIndex}</strong> - <strong>{endIndex}</strong> de{' '}
          <strong>{totalItems}</strong> propiedades encontradas (Página{' '}
          <strong>{safeCurrentPage}</strong> de <strong>{totalPages}</strong>)
        </span>
        {(searchTerm || selectedCategory !== 'all' || selectedType !== 'all') && (
          <button
            onClick={() => {
              setSearchTerm('');
              setSelectedCategory('all');
              setSelectedType('all');
            }}
            className="text-[#006655] hover:underline font-medium cursor-pointer"
          >
            Limpiar filtros
          </button>
        )}
      </div>

      {/* No Results Message */}
      {filteredProperties.length === 0 && (
        <div className="bg-white rounded-2xl p-12 text-center border border-[#19322F]/10">
          <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-3 text-slate-400">
            <span className="material-symbols-outlined text-2xl">search_off</span>
          </div>
          <h3 className="text-base font-bold text-[#19322F]">
            No se encontraron propiedades
          </h3>
          <p className="text-xs text-[#5C706D] mt-1">
            Intenta modificar los términos de búsqueda o los filtros seleccionados.
          </p>
        </div>
      )}

      {/* Grid View */}
      {viewMode === 'grid' && paginatedProperties.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {paginatedProperties.map((prop) => (
            <div
              key={prop.id}
              className={`group bg-white rounded-2xl overflow-hidden border shadow-xs hover:shadow-soft transition-all duration-300 flex flex-col ${
                prop.isEnabled !== false
                  ? 'border-[#19322F]/10'
                  : 'border-slate-200 opacity-60 grayscale-[20%]'
              }`}
            >
              {/* Image & Badges */}
              <div className="relative aspect-[16/10] overflow-hidden bg-slate-100">
                {prop.images && prop.images[0] ? (
                  <Image
                    src={prop.images[0]}
                    alt={prop.title}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-400">
                    <span className="material-symbols-outlined text-3xl">image</span>
                  </div>
                )}
                {/* Badges Overlay */}
                <div className="absolute top-3 left-3 flex flex-wrap gap-1.5 z-10">
                  <span className="px-2.5 py-1 rounded-full text-2xs font-bold uppercase tracking-wider bg-white/90 backdrop-blur-md text-[#19322F] shadow-2xs">
                    {prop.category}
                  </span>
                  {prop.isFeatured && (
                    <span className="px-2.5 py-1 rounded-full text-2xs font-bold uppercase tracking-wider bg-amber-500 text-white shadow-2xs flex items-center gap-1">
                      <span className="material-symbols-outlined text-xs">star</span>
                      Destacada
                    </span>
                  )}
                  {prop.isEnabled === false && (
                    <span className="px-2.5 py-1 rounded-full text-2xs font-bold uppercase tracking-wider bg-slate-700/80 text-white shadow-2xs flex items-center gap-1">
                      <span className="material-symbols-outlined text-xs">visibility_off</span>
                      Desactivada
                    </span>
                  )}
                </div>

                <div className="absolute bottom-3 right-3 z-10">
                  <span
                    className={`px-2.5 py-1 rounded-full text-2xs font-bold uppercase tracking-wider shadow-2xs ${
                      prop.listingType === 'sale'
                        ? 'bg-[#006655] text-white'
                        : 'bg-blue-600 text-white'
                    }`}
                  >
                    {prop.listingType === 'sale' ? 'En Venta' : 'En Renta'}
                  </span>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-baseline justify-between gap-2 mb-1.5">
                    <p className="text-xl font-bold text-[#006655]">
                      {prop.formattedPrice || `$${prop.price.toLocaleString()}`}
                      {prop.pricePeriod && (
                        <span className="text-xs font-normal text-[#5C706D]">
                          {prop.pricePeriod}
                        </span>
                      )}
                    </p>
                    <span className="text-xs text-[#5C706D] font-mono">
                      #{prop.id.slice(0, 8)}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-[#19322F] line-clamp-1 group-hover:text-[#006655] transition-colors">
                    {prop.title}
                  </h3>

                  <p className="text-xs text-[#5C706D] mt-1 flex items-center gap-1">
                    <span className="material-symbols-outlined text-xs text-[#006655]">
                      location_on
                    </span>
                    <span className="truncate">{prop.location.formatted}</span>
                  </p>
                </div>

                {/* Specs row */}
                <div className="pt-4 mt-4 border-t border-gray-100 flex items-center justify-between text-xs text-[#5C706D]">
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1" title="Habitaciones">
                      <span className="material-symbols-outlined text-sm">bed</span>
                      {prop.beds}
                    </span>
                    <span className="flex items-center gap-1" title="Baños">
                      <span className="material-symbols-outlined text-sm">bathtub</span>
                      {prop.baths}
                    </span>
                    <span className="flex items-center gap-1" title="Área">
                      <span className="material-symbols-outlined text-sm">square_foot</span>
                      {prop.area} {prop.areaUnit}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {/* Toggle Enable/Disable Eye Button */}
                    <button
                      type="button"
                      onClick={() => handleToggleEnabled(prop)}
                      disabled={togglingId === prop.id}
                      title={prop.isEnabled !== false ? 'Desactivar propiedad (ocultar del portal)' : 'Activar propiedad (mostrar en portal)'}
                      className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer disabled:opacity-50 disabled:cursor-wait ${
                        prop.isEnabled !== false
                          ? 'text-slate-500 hover:bg-slate-100 hover:text-slate-700'
                          : 'text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700'
                      }`}
                    >
                      {togglingId === prop.id ? (
                        <span className="material-symbols-outlined text-sm animate-spin">progress_activity</span>
                      ) : (
                        <span className="material-symbols-outlined text-sm">
                          {prop.isEnabled !== false ? 'visibility' : 'visibility_off'}
                        </span>
                      )}
                    </button>
                    <Link
                      href={`/admin/properties/${prop.id}/edit`}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#006655]/10 text-[#006655] hover:bg-[#006655] hover:text-white font-semibold text-xs transition-all cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-xs">edit</span>
                      <span>Editar</span>
                    </Link>
                    <Link
                      href={`/properties/${prop.slug || prop.id}`}
                      target="_blank"
                      className="inline-flex items-center gap-0.5 text-[#5C706D] hover:text-[#19322F] font-semibold text-xs transition-colors cursor-pointer px-1.5 py-1"
                      title="Ver ficha pública"
                    >
                      <span className="material-symbols-outlined text-xs">open_in_new</span>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Table View */}
      {viewMode === 'table' && paginatedProperties.length > 0 && (
        <div className="bg-white rounded-2xl border border-[#19322F]/10 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-[#EEF6F6]/50 border-b border-[#19322F]/10 text-xs font-semibold text-[#5C706D] uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Propiedad</th>
                  <th className="py-3 px-4">Categoría</th>
                  <th className="py-3 px-4">Tipo</th>
                  <th className="py-3 px-4">Precio</th>
                  <th className="py-3 px-4">Ubicación</th>
                  <th className="py-3 px-4">Distribución</th>
                  <th className="py-3 px-4 text-center">Estado</th>
                  <th className="py-3 px-4 text-right">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {paginatedProperties.map((prop) => (
                  <tr key={prop.id} className={`hover:bg-slate-50/80 transition-colors ${prop.isEnabled === false ? 'opacity-60 bg-slate-50/50' : ''}`}>
                    {/* Thumbnail & Title */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-slate-100 shrink-0">
                          {prop.images && prop.images[0] ? (
                            <Image
                              src={prop.images[0]}
                              alt={prop.title}
                              fill
                              sizes="48px"
                              className="object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-slate-400">
                              <span className="material-symbols-outlined text-sm">home</span>
                            </div>
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-[#19322F] truncate max-w-xs">
                            {prop.title}
                          </p>
                          {prop.isFeatured && (
                            <span className="inline-flex items-center gap-0.5 text-2xs font-bold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                              <span className="material-symbols-outlined text-2xs">star</span>
                              Destacada
                            </span>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Category */}
                    <td className="py-3 px-4 uppercase text-xs font-medium text-[#5C706D]">
                      {prop.category}
                    </td>

                    {/* Type */}
                    <td className="py-3 px-4">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                          prop.listingType === 'sale'
                            ? 'bg-emerald-50 text-emerald-800'
                            : 'bg-blue-50 text-blue-800'
                        }`}
                      >
                        {prop.listingType === 'sale' ? 'Venta' : 'Renta'}
                      </span>
                    </td>

                    {/* Price */}
                    <td className="py-3 px-4 font-bold text-[#006655] whitespace-nowrap">
                      {prop.formattedPrice || `$${prop.price.toLocaleString()}`}
                    </td>

                    {/* Location */}
                    <td className="py-3 px-4 text-xs text-[#5C706D] max-w-[180px] truncate">
                      {prop.location.city}, {prop.location.region}
                    </td>

                    {/* Distribution */}
                    <td className="py-3 px-4 text-xs text-[#5C706D] whitespace-nowrap">
                      {prop.beds} hab &bull; {prop.baths} bñ &bull; {prop.area} {prop.areaUnit}
                    </td>

                    {/* Status */}
                    <td className="py-3 px-4 text-center">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-2xs font-bold ${
                          prop.isEnabled !== false
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-slate-100 text-slate-500 border border-slate-200'
                        }`}
                      >
                        <span className="material-symbols-outlined text-xs">
                          {prop.isEnabled !== false ? 'check_circle' : 'cancel'}
                        </span>
                        {prop.isEnabled !== false ? 'Activa' : 'Inactiva'}
                      </span>
                    </td>

                    {/* Action */}
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <div className="inline-flex items-center gap-1.5 justify-end">
                        {/* Toggle Enable/Disable Eye Button */}
                        <button
                          type="button"
                          onClick={() => handleToggleEnabled(prop)}
                          disabled={togglingId === prop.id}
                          title={prop.isEnabled !== false ? 'Desactivar propiedad' : 'Activar propiedad'}
                          className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer disabled:opacity-50 disabled:cursor-wait ${
                            prop.isEnabled !== false
                              ? 'text-slate-500 hover:bg-slate-100 hover:text-slate-700'
                              : 'text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700'
                          }`}
                        >
                          {togglingId === prop.id ? (
                            <span className="material-symbols-outlined text-sm animate-spin">progress_activity</span>
                          ) : (
                            <span className="material-symbols-outlined text-sm">
                              {prop.isEnabled !== false ? 'visibility' : 'visibility_off'}
                            </span>
                          )}
                        </button>
                        <Link
                          href={`/admin/properties/${prop.id}/edit`}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-[#006655]/10 text-[#006655] hover:bg-[#006655] hover:text-white transition-all cursor-pointer"
                          title="Editar propiedad"
                        >
                          <span className="material-symbols-outlined text-xs">edit</span>
                          <span>Editar</span>
                        </Link>
                        <Link
                          href={`/properties/${prop.slug || prop.id}`}
                          target="_blank"
                          className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-semibold text-[#5C706D] hover:text-[#19322F] hover:bg-black/5 transition-all cursor-pointer"
                          title="Ver ficha pública"
                        >
                          <span className="material-symbols-outlined text-xs">open_in_new</span>
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Pagination Controls */}
      {totalItems > 0 && (
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-[#19322F]/10 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Interval Selector Pills */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-[#5C706D]">Mostrar por página:</span>
            <div className="inline-flex rounded-xl bg-[#EEF6F6] p-1 border border-[#19322F]/10">
              {PAGE_SIZE_OPTIONS.map((opt) => (
                <button
                  key={opt}
                  onClick={() => setPageSize(opt)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    pageSize === opt
                      ? 'bg-[#006655] text-white shadow-2xs'
                      : 'text-[#5C706D] hover:text-[#19322F] hover:bg-white/50'
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>

          {/* Page Buttons */}
          <div className="flex items-center gap-1.5">
            {/* Prev Button */}
            <button
              onClick={() => handlePageChange(safeCurrentPage - 1)}
              disabled={safeCurrentPage <= 1}
              className="px-3 py-1.5 rounded-xl border border-[#19322F]/10 text-xs font-semibold text-[#19322F] hover:bg-[#EEF6F6] disabled:opacity-40 disabled:pointer-events-none transition-all flex items-center gap-1 cursor-pointer"
            >
              <span className="material-symbols-outlined text-base">chevron_left</span>
              <span className="hidden sm:inline">Anterior</span>
            </button>

            {/* Page number buttons */}
            <div className="flex items-center gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => {
                // Show first, last, current, and adjacent pages
                const isEdgeOrNear =
                  pageNum === 1 ||
                  pageNum === totalPages ||
                  Math.abs(pageNum - safeCurrentPage) <= 1;

                if (!isEdgeOrNear) {
                  // Display ellipsis once between gaps
                  if (pageNum === 2 || pageNum === totalPages - 1) {
                    return (
                      <span key={pageNum} className="px-1 text-xs text-[#5C706D]">
                        ...
                      </span>
                    );
                  }
                  return null;
                }

                const isActive = pageNum === safeCurrentPage;

                return (
                  <button
                    key={pageNum}
                    onClick={() => handlePageChange(pageNum)}
                    className={`w-8 h-8 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      isActive
                        ? 'bg-[#006655] text-white shadow-xs'
                        : 'text-[#19322F] hover:bg-[#EEF6F6] border border-transparent hover:border-[#19322F]/10'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>

            {/* Next Button */}
            <button
              onClick={() => handlePageChange(safeCurrentPage + 1)}
              disabled={safeCurrentPage >= totalPages}
              className="px-3 py-1.5 rounded-xl border border-[#19322F]/10 text-xs font-semibold text-[#19322F] hover:bg-[#EEF6F6] disabled:opacity-40 disabled:pointer-events-none transition-all flex items-center gap-1 cursor-pointer"
            >
              <span className="hidden sm:inline">Siguiente</span>
              <span className="material-symbols-outlined text-base">chevron_right</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
