// Datos de identidad del vendedor (El Salvador).
// Se piden en dos momentos:
//   1. Al crear la cuenta: teléfono (y tipo de cuenta en el registro con email).
//      Con Google/Apple, la primera vez se pide solo nombre y teléfono.
//   2. Al publicar por primera vez: tipo de cuenta si falta, y documento (particular)
//      o datos de la empresa. La publicación queda pendiente de aprobación.

import { isValidSvPhone } from "./phone";

export const DOC_TYPES = [
  { value: "DUI",                label: "DUI" },
  { value: "TARJETA_RESIDENCIA", label: "Tarjeta de residencia" },
  { value: "PASAPORTE",          label: "Pasaporte" },
];

export const formatDui = (raw) => {
  let v = raw.replace(/[^0-9-]/g, "");
  if (v.length === 8 && !v.includes("-")) v = v + "-";
  return v.slice(0, 10);
};

export const formatNit = (raw) => {
  const d = raw.replace(/\D/g, "").slice(0, 14);
  return [d.slice(0, 4), d.slice(4, 10), d.slice(10, 13), d.slice(13, 14)].filter(Boolean).join("-");
};

export const validateDocNumber = (type, value) => {
  const v = value.trim();
  if (!v) return "Ingresá el número de documento.";
  if (type === "DUI") return /^\d{8}-\d$/.test(v) ? null : "Formato inválido. Ejemplo: 01234567-8";
  return /^[A-Z0-9-]{5,20}$/i.test(v) ? null : "Ingresá un número válido (5 a 20 letras o números).";
};

export const validateNit = (value) =>
  /^\d{4}-\d{6}-\d{3}-\d$/.test(value.trim()) ? null : "Formato inválido. Ejemplo: 0614-010190-101-1";

export const isEmpresa = (user) => user?.user_metadata?.account_type === "EMPRESA";

// Paso 1: falta un teléfono válido
export const needsOnboarding = (user) => {
  if (!user || user.role === "ADMIN") return false;
  return !isValidSvPhone(user.user_metadata?.phone);
};

// Paso 2: faltan los datos de identidad para publicar
export const needsIdentity = (user) => {
  if (!user || user.role === "ADMIN") return false;
  const meta = user.user_metadata || {};
  if (!meta.account_type) return true;
  if (meta.account_type === "EMPRESA") {
    return !meta.company_name || !meta.nit || !meta.company_address || !meta.company_phone;
  }
  return !meta.document_number;
};
