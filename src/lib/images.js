// Validación de imágenes antes de subirlas (mismos límites en todo el sitio).
export const MAX_IMAGE_MB = 10;
export const VALID_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
export const IMAGE_ACCEPT = VALID_IMAGE_TYPES.join(",");

// Separa archivos válidos de inválidos; `error` describe el último problema encontrado
export const validateImageFiles = (files, { types = VALID_IMAGE_TYPES, maxMb = MAX_IMAGE_MB } = {}) => {
  const valid = [];
  let error = "";
  Array.from(files || []).forEach((f) => {
    if (!types.includes(f.type))           error = "Solo se permiten imágenes JPG, PNG o WEBP.";
    else if (f.size > maxMb * 1024 * 1024) error = `Cada imagen debe pesar menos de ${maxMb} MB.`;
    else valid.push(f);
  });
  return { valid, error };
};
