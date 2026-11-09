// Wompi El Salvador: el backend crea el enlace de pago (POST /payments/checkout) con la
// referencia y el monto de su tabla de precios. El front solo redirige a esa URL y, al
// volver, le reenvía al backend lo que Wompi puso en la URL de redirect.

import { api } from "./api";
import { PLAN_API } from "./pricing";

export const PENDING_PAYMENT_KEY = "mv_pending_payment";

// itemType → recurso del backend
export const ITEM_RESOURCE = {
  vehicle:   "vehicles",
  repuesto:  "products",
  accesorio: "products",
  servicio:  "services",
};

const goToCheckout = async ({ body, context }) => {
  // Usuarios mock (dev): no hay ítem real en el backend, se simula la vuelta de Wompi
  if (String(body.itemId).startsWith("mock-")) {
    sessionStorage.setItem(PENDING_PAYMENT_KEY, JSON.stringify(context));
    window.location.href = `/pago/resultado?idTransaccion=mock-${Date.now()}`;
    return;
  }

  const res = await api.post("/payments/checkout", body);
  const { url, reference } = res?.data || {};
  if (!url) throw new Error("No se pudo iniciar el pago. Intentá de nuevo.");
  sessionStorage.setItem(PENDING_PAYMENT_KEY, JSON.stringify({ ...context, reference }));
  window.location.href = url;
};

/**
 * Pago de una publicación.
 * @param {{ plan: string, itemId: string, itemType: "vehicle"|"repuesto"|"accesorio"|"servicio" }} opts
 */
export const redirectToWompiCheckout = ({ plan, itemId, itemType }) =>
  goToCheckout({
    body:    { itemType, itemId, plan: PLAN_API[plan] || plan },
    context: { kind: "publish", itemId, itemType, plan },
  });

/** Pago de un destaque. */
export const redirectToFeatureCheckout = ({ days, itemId, itemType }) =>
  goToCheckout({
    body:    { itemType, itemId, days },
    context: { kind: "feature", itemId, itemType, days },
  });
