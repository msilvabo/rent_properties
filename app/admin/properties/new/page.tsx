import React from 'react';
import { PropertyForm } from '@/components/admin/PropertyForm';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Crear Nueva Propiedad — Admin LuxeEstate',
  description: 'Publicar una nueva propiedad de lujo en el catálogo',
};

export default function NewPropertyPage() {
  return <PropertyForm mode="create" />;
}
