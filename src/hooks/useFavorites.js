// Favoritos compartidos entre tarjetas, ficha y página de Favoritos.
// Con sesión real: GET/POST/DELETE /favorites. Sin sesión (o usuario mock):
// localStorage con la misma clave/formato de utils/favorites (array de ids).

import { useCallback, useEffect, useSyncExternalStore } from "react";
import { api } from "../lib/api";
import { useAuth } from "../context/AuthContext";
import {
  getFavorites,
  toggleFavorite as toggleLocal,
  removeFavorite as removeLocal,
  clearFavorites as clearLocal,
} from "../utils/favorites";

// ── Store a nivel módulo: un solo GET /favorites para toda la app ──
let state = { key: "local", ids: getFavorites(), items: [], status: "ready", error: null };
const listeners = new Set();

const setState = (patch) => {
  state = { ...state, ...patch };
  listeners.forEach((l) => l());
};

const subscribe = (l) => {
  listeners.add(l);
  return () => listeners.delete(l);
};
const getSnapshot = () => state;

// Sincroniza el modo local con otros componentes/pestañas
const syncLocal = () => {
  if (state.key === "local") setState({ ids: getFavorites() });
};
if (typeof window !== "undefined") {
  window.addEventListener("favorites-updated", syncLocal);
  window.addEventListener("storage", (e) => { if (e.key === "mi-vehiculo-favorites") syncLocal(); });
}

const idOf = (fav) => fav?.vehicle?.id ?? fav?.vehicleId ?? fav?.id;

const loadServer = (key) => {
  // Al cambiar de usuario/modo se descartan los ids anteriores
  if (state.key !== key) setState({ key, ids: [], items: [], status: "loading", error: null });
  else setState({ status: "loading", error: null });
  api.get("/favorites")
    .then((res) => {
      if (state.key !== key) return; // cambió el usuario mientras cargaba
      const rows = res.data || [];
      setState({
        ids:    rows.map(idOf).filter(Boolean),
        items:  rows.map((f) => f.vehicle || f).filter(Boolean),
        status: "ready",
      });
    })
    .catch((error) => {
      if (state.key !== key) return;
      setState({ status: "error", error });
    });
};

const useMode = (key) => {
  useEffect(() => {
    if (key === null || key === state.key) return;
    if (key === "local") setState({ key: "local", ids: getFavorites(), items: [], status: "ready", error: null });
    else loadServer(key);
  }, [key]);
};

const toggleServer = async (id) => {
  const was = state.ids.includes(id);
  const prevItems = state.items;
  // Optimista
  setState({
    ids:   was ? state.ids.filter((x) => x !== id) : [...state.ids, id],
    items: was ? state.items.filter((v) => v.id !== id) : state.items,
  });
  try {
    if (was) await api.delete(`/favorites/${id}`);
    else     await api.post(`/favorites/${id}`);
  } catch (err) {
    // 404 al quitar / 409 al agregar = el servidor ya estaba en el estado deseado
    if (err.status === (was ? 404 : 409)) return;
    setState({
      ids:   was ? [...state.ids, id] : state.ids.filter((x) => x !== id),
      items: was ? prevItems : state.items,
    });
    throw err;
  }
};

export function useFavorites() {
  const { user, loading: authLoading } = useAuth();
  const isAuthed = !!user && !user.id?.startsWith("mock-");
  // null = auth todavía resolviendo: no cambiamos de modo
  const key = authLoading ? null : isAuthed ? `user:${user.id}` : "local";
  useMode(key);

  const snap = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
  const isServer = snap.key !== "local";

  const isFavorite = useCallback((id) => snap.ids.includes(id), [snap.ids]);

  const toggle = useCallback((id) => {
    if (state.key === "local") { setState({ ids: toggleLocal(id) }); return Promise.resolve(); }
    return toggleServer(id).catch(() => {});
  }, []);

  const remove = useCallback((id) => {
    if (state.key === "local") { setState({ ids: removeLocal(id) }); return Promise.resolve(); }
    if (!state.ids.includes(id)) return Promise.resolve();
    return toggleServer(id).catch(() => {});
  }, []);

  const clear = useCallback(async () => {
    if (state.key === "local") { clearLocal(); setState({ ids: [] }); return; }
    const ids = state.ids;
    const key = state.key;
    setState({ ids: [], items: [] });
    const results = await Promise.allSettled(ids.map((id) => api.delete(`/favorites/${id}`)));
    // Si alguno falló, recargamos para mostrar el estado real del servidor
    if (results.some((r) => r.status === "rejected" && r.reason?.status !== 404)) loadServer(key);
  }, []);

  const reload = useCallback(() => {
    // Si ya hay un GET en curso no se dispara otro
    if (state.key !== "local") { if (state.status !== "loading") loadServer(state.key); }
    else syncLocal();
  }, []);

  return {
    ids:     snap.ids,
    items:   snap.items,           // vehículos completos (solo modo servidor)
    loading: key === null || key !== snap.key || snap.status === "loading",
    error:   snap.status === "error" ? snap.error : null,
    isServer,
    isFavorite,
    toggle,
    remove,
    clear,
    reload,
  };
}

export default useFavorites;
