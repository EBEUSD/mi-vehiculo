// Helpers compartidos para tarjetas y fichas de vehículos/productos:
// placeholder neutro "Sin foto", formato de números y mapeo de filas de la API.

import { labelForApiCategory } from "./categories";

// Placeholder neutro (SVG inline) — nunca una foto de stock que parezca real
const NO_PHOTO_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600">
<rect width="800" height="600" fill="#eef2f7"/>
<g fill="none" stroke="#9aa6b8" stroke-width="14" stroke-linecap="round" stroke-linejoin="round">
<rect x="300" y="210" width="200" height="150" rx="18"/>
<circle cx="400" cy="285" r="40"/>
<path d="M350 210l18-28h64l18 28"/>
</g>
<text x="400" y="420" text-anchor="middle" font-family="system-ui,sans-serif" font-size="34" font-weight="600" fill="#7b8798">Sin foto</text>
</svg>`;

export const NO_PHOTO = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(NO_PHOTO_SVG)}`;

// Primera imagen (prioriza isPrimary) o el placeholder
export const primaryImage = (images) =>
  images?.find((i) => i?.isPrimary)?.url || images?.[0]?.url || NO_PHOTO;

// ── Formato de números (único formateador para todo el sitio de vehículos) ──
const NUM = new Intl.NumberFormat("es-SV", { maximumFractionDigits: 2 });

export const formatNumber = (n) => NUM.format(Number(n) || 0);
export const formatUSD    = (p) => `$${formatNumber(p)}`;
export const formatKm     = (km) => `${formatNumber(km)} km`;

// Valor de un atributo dinámico por nombre parcial ("combustible", "transm"…)
export const attrValue = (row, match) =>
  row?.attributes?.find((a) => a.definition?.name?.toLowerCase().includes(match))?.value || "";

// Destacado vigente según featuredUntil (campo documentado en GET /vehicles)
const isFeatured = (row) => Boolean(row.featuredUntil) && new Date(row.featuredUntil) > new Date();

// Fila de la API → tarjeta de VehicleGrid. Sin valores inventados: lo que no viene queda vacío.
export const mapVehicleCard = (row) => ({
  id:           row.id,
  slug:         row.slug,
  title:        [row.brand?.name, row.model?.name, row.version].filter(Boolean).join(" ") || row.title || "",
  brand:        row.brand?.name || "",
  model:        row.model?.name || "",
  year:         row.year || null,
  km:           row.mileage ?? null,
  price:        Number(row.price) || 0,
  category:     row.category || "",
  type:         row.category ? labelForApiCategory(row.category) : "",
  fuel:         attrValue(row, "combustible"),
  transmission: attrValue(row, "transm"),
  operation:    attrValue(row, "operaci"),
  origin:       attrValue(row, "origen"),
  condition:    row.condition === "NEW" ? "new" : row.condition === "USED" ? "used" : "",
  location:     [row.city?.name, row.city?.province?.name].filter(Boolean).join(", "),
  image:        primaryImage(row.images),
  hasPhoto:     Boolean(row.images?.length),
  tag:          isFeatured(row) ? "DESTACADO" : row.condition === "NEW" ? "NUEVO" : row.condition === "USED" ? "USADO" : "",
  dealershipName: row.dealership?.name || null,
});

// Línea de specs "2020 · 55,000 km · Gasolina · Manual" sin "undefined" ni ceros falsos
export const specsLine = (v) =>
  [v.year, v.km != null ? formatKm(v.km) : null, v.fuel, v.transmission].filter(Boolean).join(" · ");
