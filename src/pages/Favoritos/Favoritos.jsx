import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  FiBell,
  FiHeart,
  FiTrash2,
  FiFolder,
} from "react-icons/fi";
import { FaCarSide, FaMotorcycle, FaTruckPickup, FaTruck } from "react-icons/fa";
import Navbar from "../../components/Navbar/Navbar";
import VehicleGrid from "../../components/VehicleGrid/VehicleGrid";
import { api } from "../../lib/api";
import { useAuth } from "../../context/AuthContext";
import { clearFavorites, getFavorites } from "../../utils/favorites";
import styles from "./Favoritos.module.css";

const PLACEHOLDER_IMG =
  "https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=800&auto=format&fit=crop";

const mapVehicle = (v) => ({
  id:           v.id,
  slug:         v.slug,
  title:        [v.brand?.name, v.model?.name, v.version].filter(Boolean).join(" "),
  price:        v.price   || 0,
  year:         v.year    || 0,
  km:           v.mileage || 0,
  fuel:         v.attributes?.find((a) => a.definition?.name === "Combustible")?.value || "",
  transmission: v.attributes?.find((a) => a.definition?.name === "Transmisión")?.value || "",
  location:     [v.city?.name, v.city?.province?.name].filter(Boolean).join(", "),
  image:        v.images?.[0]?.url || PLACEHOLDER_IMG,
  tag:          v.plan === "premium" ? "DESTACADO" : v.condition === "NEW" ? "NUEVO" : "USADO",
  type:         v.category || "AUTO",
  condition:    v.condition === "NEW" ? "new" : "used",
});

const Favoritos = () => {
  const { user }                       = useAuth();
  const [favoriteIds, setFavoriteIds]  = useState([]);
  const [rawVehicles, setRawVehicles]  = useState([]);
  const [loading, setLoading]          = useState(false);
  const [sortBy, setSortBy]            = useState("recent");
  const [typeFilter, setTypeFilter]    = useState("todos");

  const isAuthed = !!user && !user.id?.startsWith("mock-");

  /* Load favorites — API when authenticated, localStorage otherwise */
  useEffect(() => {
    if (isAuthed) {
      setLoading(true);
      api.get("/favorites")
        .then((res) => setRawVehicles((res.data || []).map((item) => mapVehicle(item.vehicle || item))))
        .catch(() => setRawVehicles([]))
        .finally(() => setLoading(false));
      return;
    }

    const sync = () => setFavoriteIds(getFavorites());
    sync();
    window.addEventListener("favorites-updated", sync);
    return () => window.removeEventListener("favorites-updated", sync);
  }, [isAuthed]);

  /* Fetch vehicles by localStorage IDs (unauthenticated path) */
  useEffect(() => {
    if (isAuthed) return;
    if (!favoriteIds.length) { setRawVehicles([]); return; }
    Promise.allSettled(favoriteIds.map((id) => api.get(`/vehicles/${id}`)))
      .then((results) =>
        setRawVehicles(
          results
            .filter((r) => r.status === "fulfilled")
            .map((r) => mapVehicle(r.value.data))
        )
      );
  }, [favoriteIds, isAuthed]);

  const favoriteVehicles = useMemo(() => {
    const TYPE_MAP = { autos: "AUTO", motos: "MOTO", camionetas: "CAMIONETA", camiones: "CAMION" };
    const filtered = typeFilter === "todos"
      ? rawVehicles
      : rawVehicles.filter((v) => v.type === TYPE_MAP[typeFilter]);

    switch (sortBy) {
      case "priceAsc":  return [...filtered].sort((a, b) => a.price - b.price);
      case "priceDesc": return [...filtered].sort((a, b) => b.price - a.price);
      case "kmAsc":     return [...filtered].sort((a, b) => a.km - b.km);
      case "recent":
      default:          return [...filtered].sort((a, b) => b.year - a.year);
    }
  }, [rawVehicles, sortBy, typeFilter]);

  const counts = {
    todos:      rawVehicles.length,
    autos:      rawVehicles.filter((v) => v.type === "AUTO").length,
    motos:      rawVehicles.filter((v) => v.type === "MOTO").length,
    camionetas: rawVehicles.filter((v) => v.type === "CAMIONETA").length,
    camiones:   rawVehicles.filter((v) => v.type === "CAMION").length,
  };

  const handleClear = () => {
    setTypeFilter("todos");
    if (isAuthed) {
      setRawVehicles([]);
    } else {
      clearFavorites();
      setFavoriteIds([]);
      setRawVehicles([]);
    }
  };

  return (
    <div className={styles.page}>
      <Navbar />

      <main className={styles.main}>
        <div className={styles.container}>
          <div className={styles.breadcrumbs}>
            <Link to="/">Inicio</Link>
            <span>›</span>
            <span>Favoritos</span>
          </div>

          <header className={styles.header}>
            <h1>Tus favoritos</h1>
            <p>Guardaste estos vehículos para compararlos más tarde.</p>
          </header>

          <div className={styles.topRow}>
            <div className={styles.metaPills}>
              <div className={styles.savedPill}>
                <FiHeart />
                <span>{favoriteVehicles.length} vehículos guardados</span>
              </div>

              <div className={styles.alertPill}>
                <FiBell />
                <span>Activá alertas y te avisamos si bajan de precio</span>
              </div>

              <button className={styles.createAlertBtn}>Crear alerta</button>
            </div>

            <div className={styles.sortBar}>
              <span>Ordenar por:</span>
              <button className={sortBy === "recent" ? styles.activeSort : ""} onClick={() => setSortBy("recent")}>Más recientes</button>
              <button className={sortBy === "priceAsc" ? styles.activeSort : ""} onClick={() => setSortBy("priceAsc")}>Menor precio</button>
              <button className={sortBy === "priceDesc" ? styles.activeSort : ""} onClick={() => setSortBy("priceDesc")}>Mayor precio</button>
              <button className={sortBy === "kmAsc" ? styles.activeSort : ""} onClick={() => setSortBy("kmAsc")}>Menor kilometraje</button>
            </div>
          </div>

          {loading ? (
            <div className={styles.emptyState}>
              <p style={{ color: "#6b7280" }}>Cargando favoritos…</p>
            </div>
          ) : favoriteVehicles.length === 0 ? (
            <div className={styles.emptyState}>
              <FiHeart />
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
                  <h3>Organizá tus favoritos</h3>

                  <div className={styles.categoryList}>
                    {[
                      { key: "todos",      icon: <FiFolder />,      label: "Todos",      count: counts.todos      },
                      { key: "autos",      icon: <FaCarSide />,     label: "Autos",      count: counts.autos      },
                      { key: "motos",      icon: <FaMotorcycle />,  label: "Motos",      count: counts.motos      },
                      { key: "camionetas", icon: <FaTruckPickup />, label: "Camionetas", count: counts.camionetas },
                      { key: "camiones",   icon: <FaTruck />,       label: "Camiones",   count: counts.camiones   },
                    ].map(({ key, icon, label, count }) => (
                      <button
                        key={key}
                        className={`${styles.categoryItem} ${typeFilter === key ? styles.categoryItemActive : ""}`}
                        onClick={() => setTypeFilter(key)}
                        style={{ width: "100%", background: "none", border: "none", cursor: "pointer", textAlign: "left", padding: 0 }}
                      >
                        <div className={styles.categoryLabel}>{icon}<span>{label}</span></div>
                        <strong>{count}</strong>
                      </button>
                    ))}
                  </div>
                </div>

                <div className={styles.sidebarCard}>
                  <h3>Filtrar resultados</h3>

                  <div className={styles.filterGroup}>
                    <label>Precio</label>
                    <div className={styles.rangeNumbers}>
                      <span>$ 0</span>
                      <span>$ 60.000</span>
                    </div>
                    <div className={styles.fakeRange}>
                      <div className={styles.fakeTrack} />
                      <div className={styles.fakeFill} />
                      <span className={styles.fakeThumbLeft} />
                      <span className={styles.fakeThumbRight} />
                    </div>
                  </div>

                  <div className={styles.filterGroup}>
                    <label>Ubicación</label>
                    <select>
                      <option>Todos los departamentos</option>
                    </select>
                  </div>

                  <div className={styles.filterGroup}>
                    <label>Tipo de vendedor</label>
                    <div className={styles.checkList}>
                      <label><div><input type="checkbox" /><span>Particular</span></div><strong>—</strong></label>
                      <label><div><input type="checkbox" /><span>Concesionario</span></div><strong>—</strong></label>
                    </div>
                  </div>

                  <button className={styles.clearBtn} onClick={handleClear}>
                    <FiTrash2 />
                    <span>Limpiar favoritos</span>
                  </button>
                </div>
              </aside>

              <section className={styles.results}>
                <div className={styles.alertBanner}>
                  <div className={styles.alertBannerLeft}>
                    <FiBell />
                    <div>
                      <strong>Activá alertas para saber cuando baja el precio</strong>
                      <p>Recibí notificaciones por email o WhatsApp si alguno de tus favoritos baja de precio.</p>
                    </div>
                  </div>
                  <div className={styles.alertBannerRight}>
                    <button>Activar alerta</button>
                    <span>×</span>
                  </div>
                </div>

                <VehicleGrid
                  vehicles={favoriteVehicles}
                  compact
                  showRemove
                  currentSearch=""
                />
              </section>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Favoritos;
