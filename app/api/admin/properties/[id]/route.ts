import { NextRequest, NextResponse } from 'next/server';
import { getAdminSupabaseClient } from '@/lib/supabase/admin-client';
import { revalidatePath } from 'next/cache';

// GET: Fetch property details by ID (Admin)
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const { supabase } = await getAdminSupabaseClient(request);

    const { data, error } = await supabase
      .from('properties')
      .select('*')
      .or(`id.eq.${id},slug.eq.${id}`)
      .maybeSingle();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!data) {
      return NextResponse.json({ error: 'Propiedad no encontrada' }, { status: 404 });
    }

    return NextResponse.json({ property: data });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Error inesperado';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// PUT: Update an existing property
export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const { supabase, user, authError } = await getAdminSupabaseClient(request);

    // 1. Verify user authentication
    if (authError || !user) {
      console.warn('[Properties API - PUT] User not authenticated:', authError?.message);
      return NextResponse.json({ error: 'No autenticado. Por favor inicia sesión.' }, { status: 401 });
    }

    // 2. Verify admin or agent role
    const { data: roleRecord, error: roleCheckError } = await supabase
      .from('user_roles')
      .select('role')
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

    const numPrice = Number(price);
    const formattedPrice = `$${numPrice.toLocaleString('en-US')}`;
    const formattedLocation = locationFormatted || `${locationCity}, ${locationRegion}`;

    const parseCoordinate = (val: unknown): number | null => {
      if (val === '' || val === null || val === undefined) return null;
      const parsed = Number(val);
      return isNaN(parsed) ? null : parsed;
    };

    const updatePayload: Record<string, unknown> = {
      title: title?.trim(),
      price: numPrice,
      formatted_price: formattedPrice,
      price_period: listingType === 'rent' ? pricePeriod || '/mo' : null,
      category,
      listing_type: listingType,
      badge: badge && ['Exclusive', 'New Arrival'].includes(badge) ? badge : null,
      location_address: locationAddress?.trim() || null,
      location_city: locationCity?.trim(),
      location_region: locationRegion?.trim(),
      location_formatted: formattedLocation.trim(),
      beds: Number(beds) || 1,
      baths: Number(baths) || 1,
      area: Number(area) || 50,
      area_unit: areaUnit || 'm²',
      image_alt: title?.trim() || 'Propiedad LuxeEstate',
      images: Array.isArray(images) ? images : [],
      is_featured: Boolean(isFeatured),
      description: description?.trim() || null,
      amenities: Array.isArray(amenities) ? amenities : [],
      garage: Number(garage) || 0,
      latitude: parseCoordinate(latitude),
      longitude: parseCoordinate(longitude),
    };

    // Try update by id first
    let { data: updated, error: updateError } = await supabase
      .from('properties')
      .update(updatePayload)
      .eq('id', id)
      .select()
      .maybeSingle();

    // If not found by id, try updating by slug
    if (!updated && !updateError) {
      const slugRes = await supabase
        .from('properties')
        .update(updatePayload)
        .eq('slug', id)
        .select()
        .maybeSingle();

      updated = slugRes.data;
      updateError = slugRes.error;
    }

    if (updateError) {
      console.error('[Properties API - PUT] Error updating property:', updateError);
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    if (!updated) {
      return NextResponse.json(
        { error: 'No se encontró la propiedad para actualizar.' },
        { status: 404 }
      );
    }

    revalidatePath('/');
    revalidatePath('/properties');
    revalidatePath('/admin');
    if (updated.slug) {
      revalidatePath(`/properties/${updated.slug}`);
    }

    return NextResponse.json({ success: true, property: updated });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Error inesperado';
    console.error('[Properties API - PUT] Catch error:', err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// PATCH: Toggle is_enabled status (enable/disable without deleting)
export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const { supabase, user, authError } = await getAdminSupabaseClient(request);

    // 1. Verify user authentication
    if (authError || !user) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }

    // 2. Verify admin or agent role
    const { data: roleRecord, error: roleCheckError } = await supabase
      .from('user_roles')
      .select('role')
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
    const { is_enabled } = body;

    if (typeof is_enabled !== 'boolean') {
      return NextResponse.json(
        { error: 'El campo is_enabled debe ser un valor booleano.' },
        { status: 400 }
      );
    }

    // Try update by id first
    let { data: updated, error: updateError } = await supabase
      .from('properties')
      .update({ is_enabled })
      .eq('id', id)
      .select()
      .maybeSingle();

    // If not found by id, try updating by slug
    if (!updated && !updateError) {
      const slugRes = await supabase
        .from('properties')
        .update({ is_enabled })
        .eq('slug', id)
        .select()
        .maybeSingle();

      updated = slugRes.data;
      updateError = slugRes.error;
    }

    if (updateError) {
      console.error('[Properties API - PATCH] Error updating property status:', updateError);
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    if (!updated) {
      return NextResponse.json(
        { error: 'No se encontró la propiedad para actualizar.' },
        { status: 404 }
      );
    }

    revalidatePath('/');
    revalidatePath('/properties');
    revalidatePath('/admin');
    if (updated.slug) {
      revalidatePath(`/properties/${updated.slug}`);
    }

    return NextResponse.json({
      success: true,
      property: updated,
      message: is_enabled ? 'Propiedad activada con éxito' : 'Propiedad desactivada con éxito',
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Error inesperado';
    console.error('[Properties API - PATCH] Catch error:', err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
