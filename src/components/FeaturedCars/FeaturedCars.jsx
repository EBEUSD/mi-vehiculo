import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import styles from "./FeaturedCars.module.css";
import { FiHeart } from "react-icons/fi";
import { vehicles, formatPriceARS } from "../../data/vehicles";
import { getFavorites, toggleFavorite } from "../../utils/favorites";

const FeaturedCars = () => {
  const featuredVehicles = vehicles.slice(0, 4);
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

  return (
    <section className={styles.wrapper}>
      <div className={styles.topbar}>
        <h2>🔥 Publicaciones destacadas</h2>
        <Link to="/vehiculos?sortBy=relevant&page=1">
          Ver todas las publicaciones
        </Link>
      </div>

      <div className={styles.grid}>
        {featuredVehicles.map((vehicle) => {
          const liked = favorites.includes(vehicle.id);

          return (
            <article key={vehicle.id} className={styles.card}>
              <Link
                to={`/vehiculo/${vehicle.id}`}
                state={{ fromSearch: "/vehiculos?sortBy=relevant&page=1" }}
                className={styles.cardLink}
              >
                <div className={styles.imageWrap}>
                  <img src={vehicle.image} alt={vehicle.title} />
                  <span
                    className={`${styles.tag} ${
                      vehicle.tag === "DESTACADO" ? styles.green : styles.blue
                    }`}
                  >
                    {vehicle.tag}
                  </span>

                  <button
                    className={`${styles.favorite} ${
                      liked ? styles.favoriteActive : ""
                    }`}
                    aria-label="Guardar"
                    onClick={(e) => handleFavorite(e, vehicle.id)}
                  >
                    <FiHeart />
                  </button>
                </div>

                <div className={styles.info}>
                  <strong className={styles.price}>
                    {formatPriceARS(vehicle.price)}
                  </strong>
                  <h3>{vehicle.title}</h3>
                  <p className={styles.meta}>
                    {vehicle.year} • {vehicle.km.toLocaleString("es-AR")} km •{" "}
                    {vehicle.location}
                  </p>
                  <span className={styles.type}>
                    {vehicle.type.slice(0, -1) || vehicle.type}
                  </span>
                </div>
              </Link>
            </article>
          );
        })}
      </div>
    </section>
  );
};

export default FeaturedCars;