import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Heart } from "lucide-react";
import styles from "./FeaturedCars.module.css";
import { api } from "../../lib/api";
import { formatKm, formatUSD, mapVehicleCard } from "../../lib/vehicleImage";
import { useFavorites } from "../../hooks/useFavorites";

const FeaturedCars = () => {
  const { isFavorite, toggle } = useFavorites();
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    let ignore = false;
    api.get("/vehicles/featured")
      .then((res) => { if (!ignore) setVehicles((res.data || []).slice(0, 4).map(mapVehicleCard)); })
      .catch(() => { if (!ignore) setVehicles([]); })
      .finally(() => { if (!ignore) setLoading(false); });
    return () => { ignore = true; };
  }, []);

  if (loading || !vehicles.length) return null;

  return (
    <section className={styles.wrapper}>
      <div className={styles.topbar}>
        <h2>🔥 Publicaciones destacadas</h2>
        <Link to="/vehiculos?sortBy=relevant&page=1">Ver todas las publicaciones</Link>
      </div>

      <div className={styles.grid}>
        {vehicles.map((vehicle) => {
          const liked = isFavorite(vehicle.id);
          const meta = [
            vehicle.year,
            vehicle.km != null ? formatKm(vehicle.km) : null,
            vehicle.location,
          ].filter(Boolean).join(" • ");
          return (
            <article key={vehicle.id} className={styles.card}>
              <Link
                to={`/vehiculo/${vehicle.slug || vehicle.id}`}
                state={{ fromSearch: "/vehiculos?sortBy=relevant&page=1" }}
                className={styles.cardLink}
              >
                <div className={styles.imageWrap}>
                  <img src={vehicle.image} alt={vehicle.title} loading="lazy" decoding="async" />
                  {vehicle.tag && (
                    <span
                      className={`${styles.tag} ${
                        vehicle.tag === "DESTACADO" ? styles.green
                        : vehicle.tag === "NUEVO"   ? styles.blue
                        : styles.gray
                      }`}
                    >
                      {vehicle.tag}
                    </span>
                  )}
                </div>

                <div className={styles.info}>
                  <strong className={styles.price}>{formatUSD(vehicle.price)}</strong>
                  <h3>{vehicle.title}</h3>
                  {meta && <p className={styles.meta}>{meta}</p>}
                  {vehicle.type && <span className={styles.type}>{vehicle.type}</span>}
                </div>
              </Link>

              {/* Hermano del link: un botón no puede ir dentro de <a> */}
              <button
                type="button"
                className={`${styles.favorite} ${liked ? styles.favoriteActive : ""}`}
                aria-label={liked ? "Quitar de favoritos" : "Guardar en favoritos"}
                aria-pressed={liked}
                onClick={() => toggle(vehicle.id)}
              >
                <Heart size={18} fill={liked ? "currentColor" : "none"} aria-hidden="true" />
              </button>
            </article>
          );
        })}
      </div>
    </section>
  );
};

export default FeaturedCars;
