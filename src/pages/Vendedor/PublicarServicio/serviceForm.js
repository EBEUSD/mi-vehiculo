// Helpers compartidos entre publicar y editar servicio.

export const MAX_SERVICE_PHOTOS = 10; // tope del backend para servicios

// Cómo se cobra el servicio ("A convenir" no lleva precio)
export const PRICE_NOTES = ["Precio fijo", "Desde", "Por hora", "Por servicio", "A convenir"];
export const FIXED_PRICE_NOTE = "Precio fijo";
export const NO_PRICE_NOTE = "A convenir";

// "Precio fijo" no se guarda: es la ausencia de nota
export const priceNoteToApi = (note) => (note && note !== FIXED_PRICE_NOTE ? note : undefined);
export const priceNoteFromApi = (note) => note || FIXED_PRICE_NOTE;

// Acepta "misitio.com" y le agrega https://; undefined si está vacío, null si es inválido
export const normalizeWebsite = (raw) => {
  const v = String(raw || "").trim();
  if (!v) return undefined;
  const withProto = /^https?:\/\//i.test(v) ? v : `https://${v}`;
  try {
    const url = new URL(withProto);
    return url.hostname.includes(".") ? url.toString() : null;
  } catch { return null; }
};
