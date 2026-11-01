import { useEffect, useState } from "react";
import { api } from "../lib/api";

// Cache a nivel de módulo: CategoriesStrip y HomePromo comparten una sola
// petición a /vehicles/stats/public por carga de página.
let statsPromise = null;
let statsCache = null;

const fetchPublicStats = () => {
  if (!statsPromise) {
    statsPromise = api.get("/vehicles/stats/public")
      .then((res) => { statsCache = res.data || {}; return statsCache; })
      .catch(() => { statsPromise = null; return null; }); // permite reintentar en el próximo montaje
  }
  return statsPromise;
};

/** Devuelve las estadísticas públicas (`null` mientras carga o si falló). */
export default function usePublicStats() {
  const [stats, setStats] = useState(statsCache);

  useEffect(() => {
    if (statsCache) return;
    let alive = true;
    fetchPublicStats().then((data) => { if (alive && data) setStats(data); });
    return () => { alive = false; };
  }, []);

  return stats;
}
