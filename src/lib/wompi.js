const WOMPI_BASE = import.meta.env.VITE_WOMPI_ENV === "production"
  ? "https://production.wompi.sv/v1"
  : "https://sandbox.wompi.sv/v1";

const CHECKOUT_URL = "https://checkout.wompi.sv/p/";

export const WOMPI_PUBLIC_KEY = import.meta.env.VITE_WOMPI_PUBLIC_KEY || "";

export const PLAN_AMOUNTS = {
  basico:  500,   // $5.00 en centavos
  premium: 1200,  // $12.00 en centavos
};

/**
 * Guarda el contexto en sessionStorage y redirige al checkout de WOMPI.
 * @param {{ plan: string, itemId: number|string, itemType: "vehicle"|"repuesto"|"accesorio" }} opts
 */
export const redirectToWompiCheckout = ({ plan, itemId, itemType }) => {
  const amountCents = PLAN_AMOUNTS[plan];
  const reference   = `mv-${itemType}-${itemId}-${Date.now()}`;
  const redirectUrl = `${window.location.origin}/pago/resultado`;

  sessionStorage.setItem(
    "mv_pending_payment",
    JSON.stringify({ itemId, itemType, reference, plan })
  );

  const params = new URLSearchParams({
    "public-key":       WOMPI_PUBLIC_KEY,
    currency:           "USD",
    "amount-in-cents":  String(amountCents),
    reference,
    "redirect-url":     redirectUrl,
  });

  window.location.href = `${CHECKOUT_URL}?${params}`;
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
