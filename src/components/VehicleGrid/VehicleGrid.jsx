import { Link } from "react-router-dom";
import { Heart, Trash2 } from "lucide-react";
import { useFavorites } from "../../hooks/useFavorites";
import { formatUSD, specsLine } from "../../lib/vehicleImage";
import styles from "./VehicleGrid.module.css";

const VehicleGrid = ({
  vehicles,
  currentSearch = "",
  compact = false,
  showRemove = false,
  loading = false,
  skeletonCount = 6,
}) => {
  const { isFavorite, toggle, remove } = useFavorites();

  if (loading) {
    return (
      <div className={`${styles.grid} ${compact ? styles.compactGrid : ""}`} aria-busy="true" aria-label="Cargando vehículos">
        {Array.from({ length: skeletonCount }, (_, i) => (
          <div key={i} className={`${styles.card} ${styles.skeleton}`} aria-hidden="true">
            <div className={styles.imageWrap} />
            <div className={styles.info}>
              <div className={styles.skelLine} />
              <div className={`${styles.skelLine} ${styles.skelShort}`} />
              <div className={`${styles.skelLine} ${styles.skelShort}`} />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className={`${styles.grid} ${compact ? styles.compactGrid : ""}`}>
      {vehicles.map((vehicle) => {
        const liked = isFavorite(vehicle.id);
        return (
          <article key={vehicle.id} className={styles.card}>
            <Link
              to={`/vehiculo/${vehicle.slug || vehicle.id}`}
              state={{ fromSearch: currentSearch ? `/vehiculos?${currentSearch}` : "/vehiculos" }}
              className={styles.cardLink}
            >
              <div className={styles.imageWrap}>
                <img src={vehicle.image} alt={vehicle.title} loading="lazy" decoding="async" />
                {vehicle.tag && (
                  <span className={`${styles.tag} ${vehicle.tag === "DESTACADO" ? styles.green : vehicle.tag === "NUEVO" ? styles.blue : styles.gray}`}>
                    {vehicle.tag}
                  </span>
                )}
              </div>
              <div className={styles.info}>
                <h3>{vehicle.title}</h3>
                <strong>{formatUSD(vehicle.price)}</strong>
                <p>{specsLine(vehicle)}</p>
                {vehicle.location && <span>{vehicle.location}</span>}
              </div>
            </Link>

            {/* Botón hermano del link (no anidado) para que sea accesible */}
            <button
              type="button"
              className={`${styles.favorite} ${liked ? styles.favoriteActive : ""}`}
              onClick={() => toggle(vehicle.id)}
              aria-label={liked ? "Quitar de favoritos" : "Guardar en favoritos"}
              aria-pressed={liked}
            >
              <Heart size={16} fill={liked ? "currentColor" : "none"} aria-hidden="true" />
            </button>

            {showRemove && (
              <div className={styles.favoriteActions}>
                <button type="button" className={styles.removeBtn} onClick={() => remove(vehicle.id)}>
                  <Trash2 size={14} aria-hidden="true" /><span>Quitar</span>
                </button>
              </div>
            )}
          </article>
        );
      })}
    </div>
  );
};

export default VehicleGrid;
