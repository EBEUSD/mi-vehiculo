const WOMPI_BASE = import.meta.env.VITE_WOMPI_ENV === "production"
  ? "https://production.wompi.sv/v1"
  : "https://sandbox.wompi.sv/v1";

const CHECKOUT_URL = "https://checkout.wompi.sv/p/";

export const WOMPI_PUBLIC_KEY = import.meta.env.VITE_WOMPI_PUBLIC_KEY || "";

import { planAmountCents, featuredAmountCents } from "./pricing";

export const PENDING_PAYMENT_KEY = "mv_pending_payment";

// itemType → recurso del backend
export const ITEM_RESOURCE = {
  vehicle:   "vehicles",
  repuesto:  "products",
  accesorio: "products",
  servicio:  "services",
};

const goToCheckout = ({ amountCents, reference, context }) => {
  if (!amountCents) throw new Error("No se pudo obtener el precio. Actualizá la página e intentá de nuevo.");
  sessionStorage.setItem(PENDING_PAYMENT_KEY, JSON.stringify({ ...context, reference }));

  const params = new URLSearchParams({
    "public-key":       WOMPI_PUBLIC_KEY,
    currency:           "USD",
    "amount-in-cents":  String(amountCents),
    reference,
    "redirect-url":     `${window.location.origin}/pago/resultado`,
  });
  window.location.href = `${CHECKOUT_URL}?${params}`;
};

/**
 * Pago de una publicación. El backend valida que la referencia sea
 * `mv-{itemType}-{uuid}-{timestamp}` y que el monto sea el de /payments/pricing.
 * @param {{ plan: string, itemId: string, itemType: "vehicle"|"repuesto"|"accesorio"|"servicio" }} opts
 */
export const redirectToWompiCheckout = async ({ plan, itemId, itemType }) => {
  goToCheckout({
    amountCents: await planAmountCents(plan),
    reference:   `mv-${itemType}-${itemId}-${Date.now()}`,
    context:     { kind: "publish", itemId, itemType, plan },
  });
};

/** Pago de un destaque: referencia `mv-destaque-{itemType}-{uuid}-{timestamp}`. */
export const redirectToFeatureCheckout = async ({ days, itemId, itemType }) => {
  goToCheckout({
    amountCents: await featuredAmountCents(days),
    reference:   `mv-destaque-${itemType}-${itemId}-${Date.now()}`,
    context:     { kind: "feature", itemId, itemType, days },
  });
};

/**
 * Verifica el estado de una transacción de WOMPI directamente con su API.
 * Retorna el objeto `data` de la respuesta.
 */
export const verifyTransaction = async (transactionId) => {
  const res = await fetch(`${WOMPI_BASE}/transactions/${transactionId}`, {
    headers: { Authorization: `Bearer ${WOMPI_PUBLIC_KEY}` },
  });
  if (!res.ok) throw new Error("No se pudo verificar el pago con WOMPI.");
  const json = await res.json();
  return json.data || json; // WOMPI envuelve en { data: {...} }
};
