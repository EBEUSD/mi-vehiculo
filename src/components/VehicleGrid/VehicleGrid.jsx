import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FiHeart, FiTrash2 } from "react-icons/fi";
import { formatKm, formatPriceARS } from "../../data/vehicles";
import {
  getFavorites,
  removeFavorite,
  toggleFavorite,
} from "../../utils/favorites";
import styles from "./VehicleGrid.module.css";

const VehicleGrid = ({
  vehicles,
  currentSearch = "",
  compact = false,
  showRemove = false,
}) => {
  const [favorites, setFavorites] = useState([]);

  useEffect(() => {
    const syncFavorites = () => setFavorites(getFavorites());

    syncFavorites();
    window.addEventListener("favorites-updated", syncFavorites);

    return () => {
      window.removeEventListener("favorites-updated", syncFavorites);
    };
  }, []);

  const handleFavorite = (e, id) => {
    e.preventDefault();
    e.stopPropagation();
    const next = toggleFavorite(id);
    setFavorites(next);
  };

  const handleRemove = (e, id) => {
    e.preventDefault();
    e.stopPropagation();
    const next = removeFavorite(id);
    setFavorites(next);
  };

  return (
    <div className={`${styles.grid} ${compact ? styles.compactGrid : ""}`}>
      {vehicles.map((vehicle) => {
        const liked = favorites.includes(vehicle.id);

        return (
          <article key={vehicle.id} className={styles.card}>
            <Link
              to={`/vehiculo/${vehicle.id}`}
              state={{
                fromSearch: currentSearch
                  ? `/vehiculos?${currentSearch}`
                  : "/vehiculos",
              }}
              className={styles.cardLink}
            >
              <div className={styles.imageWrap}>
                <img src={vehicle.image} alt={vehicle.title} />
                <span
                  className={`${styles.tag} ${
                    vehicle.tag === "DESTACADO"
                      ? styles.green
                      : vehicle.tag === "NUEVO"
                      ? styles.blue
                      : styles.gray
                  }`}
                >
                  {vehicle.tag}
                </span>

                <button
                  className={`${styles.favorite} ${
                    liked ? styles.favoriteActive : ""
                  }`}
                  onClick={(e) => handleFavorite(e, vehicle.id)}
                  aria-label="Guardar"
                >
                  <FiHeart />
                </button>
              </div>

              <div className={styles.info}>
                <h3>{vehicle.title}</h3>
                <strong>{formatPriceARS(vehicle.price)}</strong>
                <p>
                  {vehicle.year} · {formatKm(vehicle.km)} km · {vehicle.fuel} ·{" "}
                  {vehicle.transmission}
                </p>
                <span>{vehicle.location}</span>

                {showRemove && (
                  <div className={styles.favoriteActions}>
                    <button
                      className={styles.removeBtn}
                      onClick={(e) => handleRemove(e, vehicle.id)}
                    >
                      <FiTrash2 />
                      <span>Quitar</span>
                    </button>
                  </div>
                )}
              </div>
            </Link>
          </article>
        );
      })}
    </div>
  );
};

export default VehicleGrid;