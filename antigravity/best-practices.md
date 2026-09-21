# Buenas Prácticas: Bienes Raíces en Next.js

Guía rápida y condensada de estándares técnicos, arquitectura, UX y producto para aplicaciones inmobiliarias de alto impacto.

---

## 1. Arquitectura & Rendimiento (Next.js App Router)
* **Server Components por defecto:** Mantener catálogos, fichas y layouts como RSC para cero JS innecesario al cliente.
* **Client Components mínimos:** Reservar `'use client'` exclusivamente para interacción (mapas, favoritos, calculadoras, carruseles).
* **Renderizado híbrido inteligente:**
  * **ISR (`revalidate: 3600`)** en detalle de propiedades (`/properties/[slug]`) con `generateStaticParams`.
  * **SSR dinámico** en búsquedas y listados filtrados mediante `searchParams`.
* **Streaming & Suspense:** Envolver secciones pesadas (similares, mapa, reviews) en `<Suspense>` con skeletons visuales.
* **Server Actions:** Procesar leads, reservas y formularios de contacto en el servidor con validación estricta (`zod`).

---

## 2. Imágenes & Multimedia (Impacto Visual)
* **Uso estricto de `next/image`:**
  * Definir siempre el atributo `sizes` responsivo para evitar descargar archivos gigantes en móviles.
  * Aplicar `priority` únicamente a la imagen principal del Hero y portada del detalle (LCP < 2s).
  * Usar `placeholder="blur"` para transiciones suaves y evitar saltos de pantalla (CLS = 0).
* **Formatos modernos:** Habilitar AVIF y WebP en `next.config.ts`.
* **Carga diferida (Lazy Loading):** Carruseles secundarios, planos, videos y tours 3D (Matterport) deben cargar sólo bajo demanda.

---

## 3. SEO & Posicionamiento Local
* **Metadatos dinámicos (`generateMetadata`):**
  * Títulos y descripciones únicos por propiedad: `[Título] en [Zona] | [Precio] - [Marca]`.
  * Vista previa enriquecida para WhatsApp y redes sociales (`og:image`, `twitter:image`).
* **Datos estructurados (JSON-LD / Schema.org):** Integrar esquemas `RealEstateListing`, `SingleFamilyResidence` y `Offer` para Rich Snippets en Google.
* **Sitemap dinámico (`app/sitemap.ts`):** Indexación automática de propiedades activas desde la base de datos.
* **URLs semánticas:** Estructura limpia orientada a SEO local: `/propiedades/[ciudad]/[tipo]/[slug]`.

---

## 4. Búsqueda, Filtros & Paginación
* **Estado 100% sincronizado en URL:**
  * Almacenar filtros (precio, recámaras, tipo, zona) en query params (`?tipo=venta&recamaras=3&max=500000`).
  * Permite compartir enlaces exactos, guardar en marcadores y soporte nativo del botón atrás.
* **Paginación en el servidor:**
  * Usar enlaces `<Link>` para los botones de página en vez de estados locales en JavaScript.
  * Emplear paginación por cursor/keyset si el catálogo supera decenas de miles de registros.
* **Búsqueda fluida:** Aplicar `useTransition` o debounce (300ms) en inputs de texto libre para evitar llamadas redundantes.
* **Búsqueda geoespacial:** Aprovechar **PostGIS** en Supabase para búsquedas por radio y cercanía.

---

## 5. UX/UI & Conversión de Leads
* **CTAs flotantes (Sticky):** Botón directo a WhatsApp, "Agendar Visita" o "Contactar Agente" siempre visible en móvil.
* **Mensajes prellenados:** Incluir código de referencia, título y precio al abrir chat con el asesor.
* **Calculadora hipotecaria interactiva:** Simulación en tiempo real de cuota mensual, enganche y plazos.
* **Mapas con carga diferida:** Cargar Mapbox / Google Maps con `next/dynamic({ ssr: false })` para no bloquear el render inicial.
* **Favoritos híbridos:** Guardar en `localStorage` para visitantes anónimos y sincronizar con la cuenta al iniciar sesión.
* **Comparador de propiedades:** Vista lado a lado de 2 a 4 inmuebles (precio/m², amenidades, gastos comunes).

---

## 6. Base de Datos & Seguridad (Supabase)
* **Row Level Security (RLS) mandatorio:**
  * `properties`: Lectura pública (`is_active = true`), mutaciones solo para rol `admin` o `agent`.
  * `leads` / `inquiries`: Inserción pública anónima, lectura restringida a agentes asignados.
* **Protección contra spam:** Cloudflare Turnstile / Captcha invisible y Rate Limiting en Server Actions.
* **Manejo de credenciales:** Exponer solo `NEXT_PUBLIC_SUPABASE_ANON_KEY`; nunca filtrar `service_role`.

---

## 7. Ideas de Producto & Diferenciación
* **Búsqueda semántica con IA:** Búsqueda en lenguaje natural con embeddings y `pgvector` (*"Penthouse luminoso cerca de parques"*).
* **Ficha imprimible / PDF:** Generación dinámica de dossier en PDF para descarga o envío por correo al cliente.
* **Alertas automatizadas:** Notificar al usuario por email o WhatsApp si una propiedad baja de precio o entra una similar.
* **Métricas de inversión:** Mostrar Cap Rate estimado, retorno anual (ROI) y precio promedio por m² de la zona.
* **Agenda de citas en tiempo real:** Integración con calendario del agente para visitas guiadas sin intermediarios.
