// Claves de localStorage de los borradores de publicación.
export const DRAFT_KEYS = {
  vehicle:   "miVehiculo_publicarVehiculoDraft",
  servicio:  "miVehiculo_publicarServicioDraft",
  repuesto:  "miVehiculo_publicarRepuestoDraft",
  accesorio: "miVehiculo_publicarAccesorioDraft",
};

export const readDraft = (key) => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
};

// Guarda el formulario sin fotos (los File no se pueden serializar)
export const writeDraft = (key, formData, extra = {}) => {
  try {
    const { fotos: _fotos, ...rest } = formData;
    localStorage.setItem(key, JSON.stringify({ formData: { ...rest, fotos: [] }, ...extra, savedAt: new Date().toISOString() }));
    return true;
  } catch { return false; }
};

export const clearDraft = (key) => {
  try { localStorage.removeItem(key); } catch { /* storage no disponible */ }
};

// Libera las URLs de vista previa creadas con URL.createObjectURL
export const revokePreviews = (photos) => {
  (photos || []).forEach((p) => {
    if (p?.preview?.startsWith("blob:")) URL.revokeObjectURL(p.preview);
  });
};
