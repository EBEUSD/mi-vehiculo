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
import Footer from "../../components/Footer/Footer";
import VehicleGrid from "../../components/VehicleGrid/VehicleGrid";
import { vehicles } from "../../data/vehicles";
import { clearFavorites, getFavorites } from "../../utils/favorites";
import styles from "./Favoritos.module.css";

const Favoritos = () => {
  const [favoriteIds, setFavoriteIds] = useState([]);
  const [sortBy, setSortBy] = useState("recent");

  useEffect(() => {
    const syncFavorites = () => setFavoriteIds(getFavorites());

    syncFavorites();
    window.addEventListener("favorites-updated", syncFavorites);

    return () => {
      window.removeEventListener("favorites-updated", syncFavorites);
    };
  }, []);

  const favoriteVehicles = useMemo(() => {
    const base = vehicles.filter((vehicle) => favoriteIds.includes(vehicle.id));

    switch (sortBy) {
      case "priceAsc":
        return [...base].sort((a, b) => a.price - b.price);
      case "priceDesc":
        return [...base].sort((a, b) => b.price - a.price);
      case "kmAsc":
        return [...base].sort((a, b) => a.km - b.km);
      case "recent":
      default:
        return [...base].sort((a, b) => b.year - a.year);
    }
  }, [favoriteIds, sortBy]);

  const counts = {
    todos: favoriteVehicles.length,
    autos: favoriteVehicles.filter((v) => v.type === "Autos").length,
    motos: favoriteVehicles.filter((v) => v.type === "Motos").length,
    camionetas: favoriteVehicles.filter((v) => v.type === "Camionetas").length,
    camiones: favoriteVehicles.filter((v) => v.type === "Camiones").length,
  };

  const handleClear = () => {
    clearFavorites();
    setFavoriteIds([]);
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

              <button
                className={sortBy === "recent" ? styles.activeSort : ""}
                onClick={() => setSortBy("recent")}
              >
                Más recientes
              </button>

              <button
                className={sortBy === "priceAsc" ? styles.activeSort : ""}
                onClick={() => setSortBy("priceAsc")}
              >
                Menor precio
              </button>

              <button
                className={sortBy === "priceDesc" ? styles.activeSort : ""}
                onClick={() => setSortBy("priceDesc")}
              >
                Mayor precio
              </button>

              <button
                className={sortBy === "kmAsc" ? styles.activeSort : ""}
                onClick={() => setSortBy("kmAsc")}
              >
                Menor kilometraje
              </button>
            </div>
          </div>

          {favoriteVehicles.length === 0 ? (
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
                    <div className={styles.categoryItem}>
                      <div className={styles.categoryLabel}>
                        <FiFolder />
                        <span>Todos</span>
                      </div>
                      <strong>{counts.todos}</strong>
                    </div>

                    <div className={styles.categoryItem}>
                      <div className={styles.categoryLabel}>
                        <FaCarSide />
                        <span>Autos</span>
                      </div>
                      <strong>{counts.autos}</strong>
                    </div>

                    <div className={styles.categoryItem}>
                      <div className={styles.categoryLabel}>
                        <FaMotorcycle />
                        <span>Motos</span>
                      </div>
                      <strong>{counts.motos}</strong>
                    </div>

                    <div className={styles.categoryItem}>
                      <div className={styles.categoryLabel}>
                        <FaTruckPickup />
                        <span>Camionetas</span>
                      </div>
                      <strong>{counts.camionetas}</strong>
                    </div>

                    <div className={styles.categoryItem}>
                      <div className={styles.categoryLabel}>
                        <FaTruck />
                        <span>Camiones</span>
                      </div>
                      <strong>{counts.camiones}</strong>
                    </div>
                  </div>
                </div>

                <div className={styles.sidebarCard}>
                  <h3>Filtrar resultados</h3>

                  <div className={styles.filterGroup}>
                    <label>Precio</label>

                    <div className={styles.rangeNumbers}>
                      <span>$ 0</span>
                      <span>$ 60.000.000</span>
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
                      <option>Todas las provincias</option>
                    </select>
                  </div>

                  <div className={styles.filterGroup}>
                    <label>Tipo de vendedor</label>

                    <div className={styles.checkList}>
                      <label>
                        <div>
                          <input type="checkbox" />
                          <span>Particular</span>
                        </div>
                        <strong>6</strong>
                      </label>

                      <label>
                        <div>
                          <input type="checkbox" />
                          <span>Concesionario</span>
                        </div>
                        <strong>3</strong>
                      </label>

                      <label>
                        <div>
                          <input type="checkbox" />
                          <span>Concesionario Verificado</span>
                        </div>
                        <strong>4</strong>
                      </label>
                    </div>
                  </div>

                  <button className={styles.clearBtn} onClick={handleClear}>
                    <FiTrash2 />
                    <span>Limpiar filtros</span>
                  </button>
                </div>
              </aside>

              <section className={styles.results}>
                <div className={styles.alertBanner}>
                  <div className={styles.alertBannerLeft}>
                    <FiBell />
                    <div>
                      <strong>Activá alertas para saber cuando baja el precio</strong>
                      <p>
                        Recibí notificaciones por email o WhatsApp si alguno de
                        tus favoritos baja de precio.
                      </p>
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

      <Footer />
    </div>
  );
};

export default Favoritos;