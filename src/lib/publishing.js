// Publicar, reactivar y destacar: mismas reglas para vehículos, productos y servicios.

import { api } from "./api";
import { ITEM_RESOURCE } from "./wompi";
import { PLAN_API } from "./pricing";

export const errorCode = (err) => err?.body?.code || null;

const MESSAGES = {
  PAYMENT_REQUIRED:           "Este plan requiere un pago. Elegí el plan y completá el pago con Wompi.",
  PAYMENT_NOT_APPROVED:       "Wompi todavía no aprobó el pago.",
  PAYMENT_AMOUNT_MISMATCH:    "El monto pagado no coincide con el precio vigente. Contactate con soporte.",
  PAYMENT_CURRENCY_MISMATCH:  "El pago no se hizo en dólares. Contactate con soporte.",
  PAYMENT_REFERENCE_MISMATCH: "La referencia del pago no coincide. Contactate con soporte.",
  PAYMENT_ITEM_MISMATCH:      "El pago corresponde a otra publicación o a otro usuario.",
  PAYMENT_ALREADY_USED:       "Ese pago ya se usó.",
  FREE_QUOTA_EXCEEDED:        "Ya usaste tu publicación gratuita de este año. Elegí el plan Básico o Premium.",
  PENDING_REVIEW:             "La publicación está en revisión. Te avisamos cuando el equipo la apruebe.",
  ALREADY_ACTIVE:             "La publicación ya está activa.",
  IDENTITY_LOCKED:            "Tu cuenta ya está verificada: para cambiar tus datos de identidad contactate con soporte.",
  INVALID_PLAN:               "El plan elegido no es válido.",
  INVALID_FEATURED_DAYS:      "La duración del destaque no es válida.",
  ACCOUNT_BLOCKED:            "Tu cuenta está bloqueada. Contactate con soporte.",
};

export const apiErrorMessage = (err, fallback = "Ocurrió un error. Intentá de nuevo.") =>
  MESSAGES[errorCode(err)] || err?.message || fallback;

/**
 * POST /{recurso}/:id/publish.
 * - Publicación nueva (borrador o vencida): `plan` obligatorio y `transactionId` en los pagos.
 * - Pausada vigente o rechazada con plan pago: sin `plan`, no se vuelve a cobrar.
 * Devuelve `{ id, status, plan, expiresAt, … }`.
 */
export const publishItem = async ({ itemType, itemId, plan, transactionId, reference }) => {
  const body = {};
  if (plan) body.plan = PLAN_API[plan] || plan;
  if (transactionId) body.transactionId = transactionId;
  if (reference) body.reference = reference;
  const res = await api.post(`/${ITEM_RESOURCE[itemType]}/${itemId}/publish`, body);
  return res?.data || {};
};

export const featureItem = async ({ itemType, itemId, days, transactionId, reference }) => {
  const res = await api.post(`/${ITEM_RESOURCE[itemType]}/${itemId}/feature`, { days, transactionId, reference });
  return res?.data || {};
};

// Repuesto o accesorio según la categoría del producto (la referencia de Wompi lo distingue)
export const productItemType = (product) => {
  const names = [product?.category?.name, product?.category?.slug, product?.category?.parent?.name, product?.category?.parent?.slug]
    .filter(Boolean).join(" ").toLowerCase();
  return names.includes("accesorio") ? "accesorio" : "repuesto";
};
