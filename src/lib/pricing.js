// Precios que define el servidor (GET /payments/pricing), solo para mostrar: el
// monto que se cobra lo fija el backend al crear el enlace de Wompi.
// plans.js queda como respaldo si el endpoint falla.

import { useEffect, useState } from "react";
import { api, getAccessToken } from "./api";
import { PLANS, HIGHLIGHT_OPTIONS } from "./plans";

// id interno de plans.js ↔ enum del backend
export const PLAN_API = { gratuito: "GRATUITO", basico: "BASICO", premium: "PREMIUM" };

let pricingPromise = null;
export const fetchPricing = () => {
  if (!pricingPromise) {
    pricingPromise = api.get("/payments/pricing")
      .then((res) => res?.data ?? res)
      .catch((err) => { pricingPromise = null; throw err; });
  }
  return pricingPromise;
};

const mergePlans = (server) => PLANS.map((p) => {
  const s = server?.plans?.find((sp) => sp.plan === PLAN_API[p.id]);
  if (!s) return p;
  const cents = Number(s.amountInCents) || 0;
  return { ...p, amountCents: cents, precio: cents > 0 ? cents / 100 : null, dias: s.durationDays ?? p.dias };
});

const mergeHighlights = (server) =>
  server?.featured?.length
    ? server.featured.map((f) => ({ dias: f.days, precio: f.amountInCents / 100, amountCents: f.amountInCents }))
    : HIGHLIGHT_OPTIONS.map((o) => ({ ...o, amountCents: o.precio * 100 }));

// Cupo gratuito: 1 publicación por año calendario, compartida entre vehículos, productos y servicios
export const fetchFreeQuota = () =>
  api.get("/payments/free-quota").then((res) => res?.data ?? res);

export const usePricing = () => {
  const [server, setServer] = useState(null);
  const [freeQuota, setFreeQuota] = useState(null);

  useEffect(() => {
    let ignore = false;
    fetchPricing().then((d) => { if (!ignore) setServer(d); }).catch(() => {});
    if (getAccessToken()) {
      fetchFreeQuota().then((q) => { if (!ignore) setFreeQuota(q); }).catch(() => {});
    }
    return () => { ignore = true; };
  }, []);

  return {
    plans:      mergePlans(server),
    highlights: mergeHighlights(server),
    freeQuota,  // { used, limit, remaining } o null si no se pudo consultar
  };
};
