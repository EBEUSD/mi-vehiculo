// Teléfonos de El Salvador: 8 dígitos locales, prefijo +503.

// Dígitos locales sin el prefijo de país ("+503 7000-0000" → "70000000")
export const svLocalDigits = (raw) => {
  const digits = String(raw || "").replace(/\D/g, "");
  return digits.length > 8 && digits.startsWith("503") ? digits.slice(3) : digits;
};

// Normaliza a "+50370000000"; undefined si está vacío
export const normalizeSvPhone = (raw) => {
  const local = svLocalDigits(raw);
  return local ? `+503${local}` : undefined;
};

// Válido si tiene exactamente 8 dígitos locales
export const isValidSvPhone = (raw) => svLocalDigits(raw).length === 8;

// Para mostrar: "+503 7000-0000"
export const formatSvPhone = (raw) => {
  const local = svLocalDigits(raw);
  if (!local) return "";
  return local.length === 8 ? `+503 ${local.slice(0, 4)}-${local.slice(4)}` : `+503 ${local}`;
};
