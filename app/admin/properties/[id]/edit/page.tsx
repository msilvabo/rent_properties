import React from 'react';
import { notFound } from 'next/navigation';
import { getPropertyBySlug } from '@/lib/properties';
import { PropertyForm } from '@/components/admin/PropertyForm';

export const dynamic = 'force-dynamic';

export async function generateMetadata(props: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await props.params;
  const property = await getPropertyBySlug(id);

  return {
    title: property ? `Editar: ${property.title} — Admin LuxeEstate` : 'Editar Propiedad',
    description: 'Modificación y gestión de ficha de propiedad',
  };
}

export default async function EditPropertyPage(props: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await props.params;
  const property = await getPropertyBySlug(id);

  if (!property) {
    notFound();
  }

  return <PropertyForm mode="edit" initialData={property} />;
}
