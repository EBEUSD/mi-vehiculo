import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import styles from "./FeaturedCars.module.css";
import { FiHeart } from "react-icons/fi";
import { api } from "../../lib/api";
import { getFavorites, toggleFavorite } from "../../utils/favorites";
import { useAuth } from "../../context/AuthContext";

const PLACEHOLDER_IMG =
  "https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=800&auto=format&fit=crop";

const formatUSD = (p) => `$${new Intl.NumberFormat("en-US").format(p)}`;

const mapVehicle = (v) => ({
  id:       v.id,
  slug:     v.slug,
  title:    [v.brand?.name, v.model?.name, v.version].filter(Boolean).join(" "),
  price:    v.price  || 0,
  year:     v.year   || 0,
  km:       v.mileage || 0,
  location: [v.city?.name, v.city?.province?.name].filter(Boolean).join(", "),
  image:    v.images?.[0]?.url || PLACEHOLDER_IMG,
  tag:      v.plan === "premium" ? "DESTACADO" : v.condition === "NEW" ? "NUEVO" : "USADO",
  type:     v.category || "AUTO",
});

const FeaturedCars = () => {
  const { user } = useAuth();
  const isAuthed = !!user && !user.id?.startsWith("mock-");
  const [vehicles, setVehicles]   = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading]     = useState(true);

  useEffect(() => {
    api.get("/vehicles/featured")
      .then((res) => setVehicles((res.data || []).slice(0, 4).map(mapVehicle)))
      .catch(() => setVehicles([]))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const sync = () => setFavorites(getFavorites());
    sync();
    window.addEventListener("favorites-updated", sync);
    return () => window.removeEventListener("favorites-updated", sync);
  }, []);

  const handleFavorite = (e, id) => {
    e.preventDefault();
    e.stopPropagation();
    const next = toggleFavorite(id);
    setFavorites(next);
    if (isAuthed) {
      if (next.includes(id)) {
        api.post(`/favorites/${id}`).catch(() => {});
      } else {
        api.delete(`/favorites/${id}`).catch(() => {});
      }
    }
  };

  if (loading || !vehicles.length) return null;

  return (
    <section className={styles.wrapper}>
      <div className={styles.topbar}>
        <h2>🔥 Publicaciones destacadas</h2>
        <Link to="/vehiculos?sortBy=relevant&page=1">Ver todas las publicaciones</Link>
      </div>

      <div className={styles.grid}>
        {vehicles.map((vehicle) => {
          const liked = favorites.includes(vehicle.id);
          return (
            <article key={vehicle.id} className={styles.card}>
              <Link
                to={`/vehiculo/${vehicle.slug || vehicle.id}`}
                state={{ fromSearch: "/vehiculos?sortBy=relevant&page=1" }}
                className={styles.cardLink}
              >
                <div className={styles.imageWrap}>
                  <img src={vehicle.image} alt={vehicle.title} />
                  <span
                    className={`${styles.tag} ${
                      vehicle.tag === "DESTACADO" ? styles.green
                      : vehicle.tag === "NUEVO"   ? styles.blue
                      : styles.gray
                    }`}
                  >
                    {vehicle.tag}
                  </span>

                  <button
                    className={`${styles.favorite} ${liked ? styles.favoriteActive : ""}`}
                    aria-label="Guardar"
                    onClick={(e) => handleFavorite(e, vehicle.id)}
                  >
                    <FiHeart />
                  </button>
                </div>

                <div className={styles.info}>
                  <strong className={styles.price}>{formatUSD(vehicle.price)}</strong>
                  <h3>{vehicle.title}</h3>
                  <p className={styles.meta}>
                    {vehicle.year} • {vehicle.km.toLocaleString("en-US")} km • {vehicle.location}
                  </p>
                  <span className={styles.type}>{vehicle.type}</span>
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
