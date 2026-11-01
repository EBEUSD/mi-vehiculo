import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Heart, Trash2, Folder, Car, Motorbike, Van, Truck } from "lucide-react";
import Navbar from "../../components/Navbar/Navbar";
import VehicleGrid from "../../components/VehicleGrid/VehicleGrid";
import { api } from "../../lib/api";
import { mapVehicleCard } from "../../lib/vehicleImage";
import { useFavorites } from "../../hooks/useFavorites";
import styles from "./Favoritos.module.css";

const TYPE_FILTERS = [
  { key: "todos",      icon: <Folder size={16} aria-hidden="true" />,    label: "Todos" },
  { key: "AUTO",       icon: <Car size={16} aria-hidden="true" />,       label: "Carros" },
  { key: "MOTO",       icon: <Motorbike size={16} aria-hidden="true" />, label: "Motos" },
  { key: "CAMIONETA",  icon: <Van size={16} aria-hidden="true" />,       label: "Panel / Microbús" },
  { key: "CAMION",     icon: <Truck size={16} aria-hidden="true" />,     label: "Camión / Bus" },
];

const Favoritos = () => {
  const { ids, items, loading: favLoading, error: favError, isServer, clear, reload } = useFavorites();
  const [sortBy, setSortBy]         = useState("recent");
  const [typeFilter, setTypeFilter] = useState("todos");

  // Con sesión: refresca la lista del servidor al entrar
  useEffect(() => {
    if (isServer) reload();
  }, [isServer, reload]);

  /* Sin sesión: se buscan los vehículos de los ids guardados en localStorage.
     Cache por id para no volver a pedir todo al quitar uno. */
  const [cache, setCache] = useState({}); // id → row | { failed, status }
  const [retryTick, setRetryTick] = useState(0);
  const missing = isServer ? [] : ids.filter((id) => !(id in cache));
  const missingKey = missing.join(",");

  useEffect(() => {
    if (!missingKey) return;
    let ignore = false;
    const pending = missingKey.split(",");
    // TODO backend: GET /vehicles/:id no está documentado (solo /vehicles/:slug/detail)
    Promise.allSettled(pending.map((id) => api.get(`/vehicles/${id}`))).then((results) => {
      if (ignore) return;
      setCache((prev) => {
        const next = { ...prev };
        results.forEach((r, i) => {
          next[pending[i]] = r.status === "fulfilled" && r.value?.data
            ? r.value.data
            : { failed: true, status: r.reason?.status };
        });
        return next;
      });
    });
    return () => { ignore = true; };
  }, [missingKey, retryTick]);

  const localRows = ids.map((id) => cache[id]).filter((r) => r && !r.failed);
  // Error de red (no un 404 de una publicación borrada)
  const localError = !isServer && ids.some((id) => cache[id]?.failed && cache[id].status !== 404);

  const loading = isServer ? favLoading && items.length === 0 : missing.length > 0;
  const loadError = isServer ? Boolean(favError) : localError && localRows.length === 0;

  const retry = () => {
    if (isServer) { reload(); return; }
    setCache((prev) => Object.fromEntries(Object.entries(prev).filter(([, v]) => !v?.failed)));
    setRetryTick((t) => t + 1);
  };

  // Server: ordenado por fecha de guardado (desc). Local: el último agregado va al final del array.
  const allVehicles = useMemo(
    () => (isServer ? items : [...localRows].reverse()).map(mapVehicleCard),
    [isServer, items, localRows]
  );

  const favoriteVehicles = useMemo(() => {
    const filtered = typeFilter === "todos"
      ? allVehicles
      : allVehicles.filter((v) => v.category === typeFilter);

    switch (sortBy) {
      case "priceAsc":  return [...filtered].sort((a, b) => a.price - b.price);
      case "priceDesc": return [...filtered].sort((a, b) => b.price - a.price);
      case "kmAsc":     return [...filtered].sort((a, b) => (a.km ?? Infinity) - (b.km ?? Infinity));
      case "recent":
      default:          return filtered;
    }
  }, [allVehicles, sortBy, typeFilter]);

  const countFor = (key) =>
    key === "todos" ? allVehicles.length : allVehicles.filter((v) => v.category === key).length;

  const handleClear = () => {
    if (!window.confirm("¿Quitar todos tus favoritos?")) return;
    setTypeFilter("todos");
    clear();
  };

  const isEmpty = !loading && !loadError && allVehicles.length === 0;

  return (
    <div className={styles.page}>
      <title>Mis favoritos | Mi Vehículo</title>
      <meta name="description" content="Los vehículos que guardaste en Mi Vehículo para compararlos más tarde." />
      <meta name="robots" content="noindex" />

      <Navbar />

      <main className={styles.main}>
        <div className={styles.container}>
          <nav className={styles.breadcrumbs} aria-label="Migas de pan">
            <Link to="/">Inicio</Link>
            <span aria-hidden="true">›</span>
            <span>Favoritos</span>
          </nav>

          <header className={styles.header}>
            <h1>Tus favoritos</h1>
            {allVehicles.length > 0 && <p>Guardaste estos vehículos para compararlos más tarde.</p>}
          </header>

          {allVehicles.length > 0 && (
            <div className={styles.topRow}>
              <div className={styles.metaPills}>
                <div className={styles.savedPill}>
                  <Heart size={16} aria-hidden="true" />
                  <span>
                    {allVehicles.length} {allVehicles.length === 1 ? "vehículo guardado" : "vehículos guardados"}
                  </span>
                </div>
              </div>

              <div className={styles.sortBar} role="group" aria-label="Ordenar favoritos">
                <span>Ordenar por:</span>
                {[
                  ["recent", "Más recientes"],
                  ["priceAsc", "Menor precio"],
                  ["priceDesc", "Mayor precio"],
                  ["kmAsc", "Menor kilometraje"],
                ].map(([key, label]) => (
                  <button
                    key={key}
                    type="button"
                    className={sortBy === key ? styles.activeSort : ""}
                    aria-pressed={sortBy === key}
                    onClick={() => setSortBy(key)}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {loading ? (
            <VehicleGrid vehicles={[]} loading compact skeletonCount={5} />
          ) : loadError ? (
            <div className={styles.emptyState} role="alert">
              <h2>No pudimos cargar tus favoritos</h2>
              <p>Revisá tu conexión e intentá de nuevo.</p>
              <button type="button" className={styles.emptyBtn} onClick={retry}>
                Reintentar
              </button>
            </div>
          ) : isEmpty ? (
            <div className={styles.emptyState}>
              <Heart size={32} aria-hidden="true" />
              <h2>No tenés favoritos todavía</h2>
              <p>Guardá publicaciones para verlas más tarde acá.</p>
              <Link to="/vehiculos" className={styles.emptyBtn}>
                Explorar vehículos
              </Link>
            </div>
          ) : (
            <div className={styles.layout}>
              <aside className={styles.sidebar}>
                <div className={styles.sidebarCard}>
                  <h2 className={styles.sidebarTitle}>Organizá tus favoritos</h2>

                  <div className={styles.categoryList}>
                    {TYPE_FILTERS.map(({ key, icon, label }) => (
                      <button
                        key={key}
                        type="button"
                        className={`${styles.categoryItem} ${typeFilter === key ? styles.categoryItemActive : ""}`}
                        aria-pressed={typeFilter === key}
                        onClick={() => setTypeFilter(key)}
                      >
                        <span className={styles.categoryLabel}>{icon}<span>{label}</span></span>
                        <strong>{countFor(key)}</strong>
                      </button>
                    ))}
                  </div>

                  <button type="button" className={styles.clearBtn} onClick={handleClear}>
                    <Trash2 size={16} aria-hidden="true" />
                    <span>Limpiar todo</span>
                  </button>
                </div>
              </aside>

              <section className={styles.results} aria-label="Vehículos guardados">
                {favoriteVehicles.length === 0 ? (
                  <p className={styles.noMatch}>No hay favoritos en esta categoría.</p>
                ) : (
                  <VehicleGrid
                    vehicles={favoriteVehicles}
                    compact
                    showRemove
                    currentSearch=""
                  />
                )}
              </section>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Favoritos;
