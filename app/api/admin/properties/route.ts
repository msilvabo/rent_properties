import { NextRequest, NextResponse } from 'next/server';
import { getAdminSupabaseClient } from '@/lib/supabase/admin-client';
import { revalidatePath } from 'next/cache';

function generateSlug(title: string): string {
  const base = title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');
  const unique = Math.random().toString(36).substring(2, 6);
  return `${base}-${unique}`;
}

export async function POST(request: NextRequest) {
  try {
    const { supabase, user, authError } = await getAdminSupabaseClient(request);

    // 1. Verify user authentication
    if (authError || !user) {
      console.warn('[Properties API - POST] User not authenticated:', authError?.message);
      return NextResponse.json({ error: 'No autenticado. Por favor inicia sesión.' }, { status: 401 });
    }

    // 2. Verify admin or agent role
    const { data: roleRecord, error: roleCheckError } = await supabase
      .from('user_roles')
      .select('role, full_name, avatar_url, email')
      .eq('user_id', user.id)
      .maybeSingle();

    if (
      roleCheckError ||
      !roleRecord ||
      !['admin', 'agent'].includes(roleRecord.role)
    ) {
      return NextResponse.json(
        { error: 'Permiso denegado. Se requiere rol de administrador o agente.' },
        { status: 403 }
      );
    }

    const body = await request.json();

    const {
      title,
      price,
      pricePeriod,
      category,
      listingType,
      badge,
      locationAddress,
      locationCity,
      locationRegion,
      locationFormatted,
      beds,
      baths,
      area,
      areaUnit = 'm²',
      images = [],
      isFeatured = false,
      description,
      amenities = [],
      garage = 2,
      latitude,
      longitude,
    } = body;

    if (!title || price === undefined || !category || !listingType || !locationCity || !locationRegion) {
      return NextResponse.json(
        { error: 'Faltan campos obligatorios requeridos (título, precio, categoría, tipo, ciudad, región).' },
        { status: 400 }
      );
    }

    const parseCoordinate = (val: unknown): number | null => {
      if (val === '' || val === null || val === undefined) return null;
      const parsed = Number(val);
      return isNaN(parsed) ? null : parsed;
    };

    const numPrice = Number(price);
    const formattedPrice = `$${numPrice.toLocaleString('en-US')}`;
    const formattedLocation = locationFormatted || `${locationCity}, ${locationRegion}`;
    const id = `prop-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`;
    const slug = generateSlug(title);

    const agentData = {
      name: roleRecord.full_name || user.email?.split('@')[0] || 'LuxeEstate Advisor',
      role: roleRecord.role === 'admin' ? 'Senior Managing Partner' : 'Licensed Real Estate Agent',
      avatar:
        roleRecord.avatar_url ||
        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
      email: roleRecord.email || user.email,
    };

    const newRecord = {
      id,
      slug,
      title: title.trim(),
      price: numPrice,
      formatted_price: formattedPrice,
      price_period: listingType === 'rent' ? pricePeriod || '/mo' : null,
      category,
      listing_type: listingType,
      badge: badge && ['Exclusive', 'New Arrival'].includes(badge) ? badge : null,
      location_address: locationAddress?.trim() || null,
      location_city: locationCity.trim(),
      location_region: locationRegion.trim(),
      location_formatted: formattedLocation.trim(),
      beds: Number(beds) || 1,
      baths: Number(baths) || 1,
      area: Number(area) || 50,
      area_unit: areaUnit || 'm²',
      image_alt: title.trim(),
      images: Array.isArray(images) ? images : [],
      is_featured: Boolean(isFeatured),
      description: description?.trim() || null,
      amenities: Array.isArray(amenities) ? amenities : [],
      garage: Number(garage) || 0,
      latitude: parseCoordinate(latitude),
      longitude: parseCoordinate(longitude),
      agent: agentData,
    };

    const { data: inserted, error: insertError } = await supabase
      .from('properties')
      .insert([newRecord])
      .select()
      .maybeSingle();

    if (insertError) {
      console.error('[Properties API - POST] Error inserting property:', insertError);
      return NextResponse.json({ error: insertError.message }, { status: 500 });
    }

    revalidatePath('/');
    revalidatePath('/properties');
    revalidatePath('/admin');
    if (inserted?.slug) {
      revalidatePath(`/properties/${inserted.slug}`);
    }

    return NextResponse.json({ success: true, property: inserted }, { status: 201 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Error inesperado';
    console.error('[Properties API - POST] Catch error:', err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
