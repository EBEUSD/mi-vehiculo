import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import {
  FiArrowLeft,
  FiChevronLeft,
  FiChevronRight,
  FiHeart,
  FiMapPin,
  FiPhone,
  FiShield,
  FiShare2,
  FiX,
  FiZoomIn,
} from "react-icons/fi";
import { FaWhatsapp } from "react-icons/fa";
import Navbar from "../../components/Navbar/Navbar";
import Footer from "../../components/Footer/Footer";
import VehicleGrid from "../../components/VehicleGrid/VehicleGrid";
import { vehicles, formatKm, formatPriceARS } from "../../data/vehicles";
import { getFavorites, toggleFavorite } from "../../utils/favorites";
import styles from "./VehiculoDetalle.module.css";

const extraGallery = [
  "https://images.unsplash.com/photo-1494976388531-d1058494cdd8?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1502877338535-766e1452684a?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1549924231-f129b911e442?auto=format&fit=crop&w=1200&q=80",
];

const VehiculoDetalle = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const vehicle = useMemo(
    () => vehicles.find((item) => String(item.id) === String(id)),
    [id]
  );

  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [favorites, setFavorites] = useState([]);
  const [shareLabel, setShareLabel] = useState("Compartir");

  useEffect(() => {
    const syncFavorites = () => setFavorites(getFavorites());

    syncFavorites();
    window.addEventListener("favorites-updated", syncFavorites);

    return () => {
      window.removeEventListener("favorites-updated", syncFavorites);
    };
  }, []);

  useEffect(() => {
    document.body.style.overflow = isLightboxOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isLightboxOpen]);

  if (!vehicle) {
    return (
      <div className={styles.page}>
        <Navbar />
        <main className={styles.notFoundWrapper}>
          <div className={styles.notFoundCard}>
            <h1>Vehículo no encontrado</h1>
            <p>La publicación que buscás no existe o fue removida.</p>
            <button onClick={() => navigate("/vehiculos")}>
              Volver a resultados
            </button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const backHref = location.state?.fromSearch || "/vehiculos";
  const gallery = [vehicle.image, ...extraGallery];
  const similarVehicles = vehicles
    .filter((item) => item.id !== vehicle.id && item.type === vehicle.type)
    .slice(0, 4);

  const liked = favorites.includes(vehicle.id);

  const detailRows = [
    ["Marca", vehicle.brand],
    ["Modelo", vehicle.model],
    ["Año", vehicle.year],
    ["Kilometraje", `${formatKm(vehicle.km)} km`],
    ["Combustible", vehicle.fuel],
    ["Transmisión", vehicle.transmission],
    ["Ubicación", vehicle.location],
    ["Tipo", vehicle.type],
    ["Vendedor", vehicle.sellerType],
    ["Condición", vehicle.condition === "new" ? "Nuevo" : "Usado"],
  ];

  const prevImage = () => {
    setSelectedIndex((prev) => (prev === 0 ? gallery.length - 1 : prev - 1));
  };

  const nextImage = () => {
    setSelectedIndex((prev) => (prev === gallery.length - 1 ? 0 : prev + 1));
  };

  const handleFavorite = () => {
    const next = toggleFavorite(vehicle.id);
    setFavorites(next);
  };

  const handleShare = async () => {
    const shareData = {
      title: vehicle.title,
      text: `Mirá este vehículo: ${vehicle.title}`,
      url: window.location.href,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(window.location.href);
        setShareLabel("Link copiado");
        setTimeout(() => setShareLabel("Compartir"), 1800);
      }
    } catch {
      setShareLabel("Compartir");
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
            <Link to={backHref}>Resultados</Link>
            <span>›</span>
            <span>{vehicle.title}</span>
          </div>

          <div className={styles.topActions}>
            <button className={styles.backBtn} onClick={() => navigate(backHref)}>
              <FiArrowLeft />
              <span>Volver a resultados</span>
            </button>

            <div className={styles.topRightActions}>
              <button className={styles.iconAction} onClick={handleShare}>
                <FiShare2 />
                <span>{shareLabel}</span>
              </button>
              <button
                className={`${styles.iconAction} ${liked ? styles.iconActionActive : ""}`}
                onClick={handleFavorite}
              >
                <FiHeart />
                <span>{liked ? "Guardado" : "Guardar"}</span>
              </button>
            </div>
          </div>

          <section className={styles.topSection}>
            <div className={styles.galleryColumn}>
              <div className={styles.mainImageWrap}>
                <img
                  src={gallery[selectedIndex]}
                  alt={vehicle.title}
                  className={styles.mainImage}
                />

                <span
                  className={`${styles.badge} ${
                    vehicle.tag === "DESTACADO"
                      ? styles.green
                      : vehicle.tag === "NUEVO"
                      ? styles.blue
                      : styles.gray
                  }`}
                >
                  {vehicle.tag}
                </span>

                <button className={styles.favoriteBtn} onClick={handleFavorite}>
                  <FiHeart />
                </button>

                <button className={styles.zoomBtn} onClick={() => setIsLightboxOpen(true)}>
                  <FiZoomIn />
                </button>

                <button
                  className={`${styles.galleryArrow} ${styles.leftArrow}`}
                  onClick={prevImage}
                  type="button"
                >
                  <FiChevronLeft />
                </button>

                <button
                  className={`${styles.galleryArrow} ${styles.rightArrow}`}
                  onClick={nextImage}
                  type="button"
                >
                  <FiChevronRight />
                </button>

                <div className={styles.galleryCounter}>
                  {selectedIndex + 1} / {gallery.length}
                </div>
              </div>

              <div className={styles.thumbRow}>
                {gallery.map((image, index) => (
                  <button
                    key={`${image}-${index}`}
                    className={`${styles.thumbBtn} ${
                      selectedIndex === index ? styles.thumbActive : ""
                    }`}
                    onClick={() => setSelectedIndex(index)}
                    type="button"
                  >
                    <img src={image} alt={`${vehicle.title} ${index + 1}`} />
                  </button>
                ))}
              </div>

              <div className={styles.specsQuick}>
                <div className={styles.quickItem}>
                  <strong>{vehicle.year}</strong>
                  <span>Año</span>
                </div>
                <div className={styles.quickItem}>
                  <strong>{formatKm(vehicle.km)} km</strong>
                  <span>Kilometraje</span>
                </div>
                <div className={styles.quickItem}>
                  <strong>{vehicle.fuel}</strong>
                  <span>Combustible</span>
                </div>
                <div className={styles.quickItem}>
                  <strong>{vehicle.transmission}</strong>
                  <span>Transmisión</span>
                </div>
              </div>

              <div className={styles.card}>
                <h3>Descripción</h3>
                <p>
                  {vehicle.title} en excelente estado general, con mantenimiento
                  al día y documentación lista para transferir. Una opción ideal
                  para quien busca una unidad confiable, bien cuidada y con muy
                  buena presentación.
                </p>

                <ul>
                  <li>Service al día</li>
                  <li>Unidad revisada</li>
                  <li>Muy buena mecánica general</li>
                  <li>Interior y exterior en muy buen estado</li>
                </ul>
              </div>

              <div className={styles.card}>
                <h3>Detalles técnicos</h3>

                <div className={styles.detailsGrid}>
                  {detailRows.map(([label, value]) => (
                    <div key={label} className={styles.detailRow}>
                      <span>{label}</span>
                      <strong>{value}</strong>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <aside className={styles.sidebar}>
              <div className={styles.priceCard}>
                <span
                  className={`${styles.badgeInline} ${
                    vehicle.tag === "DESTACADO"
                      ? styles.green
                      : vehicle.tag === "NUEVO"
                      ? styles.blue
                      : styles.gray
                  }`}
                >
                  {vehicle.tag}
                </span>

                <h1>{vehicle.title}</h1>

                <p className={styles.meta}>
                  {vehicle.year} · {formatKm(vehicle.km)} km · {vehicle.fuel} ·{" "}
                  {vehicle.transmission}
                </p>

                <strong className={styles.price}>
                  {formatPriceARS(vehicle.price)}
                </strong>

                <p className={styles.location}>
                  <FiMapPin />
                  <span>{vehicle.location}</span>
                </p>

                <div className={styles.sellerTag}>
                  <FiShield />
                  <span>Concesionario verificado</span>
                </div>

                <div className={styles.actions}>
                  <button className={styles.primaryBtn}>
                    <FiPhone />
                    <span>Contactar vendedor</span>
                  </button>

                  <button className={styles.whatsappBtn}>
                    <FaWhatsapp />
                    <span>WhatsApp</span>
                  </button>

                  <button className={styles.secondaryBtn} onClick={handleFavorite}>
                    <FiHeart />
                    <span>{liked ? "Guardado en favoritos" : "Guardar publicación"}</span>
                  </button>
                </div>

                <p className={styles.helperText}>
                  Recibí asesoramiento, verificá el vehículo y coordiná una visita
                  antes de cerrar.
                </p>
              </div>

              <div className={styles.sellerCard}>
                <div className={styles.sellerHeader}>
                  <div className={styles.sellerAvatar}>AM</div>
                  <div>
                    <span className={styles.sellerVerified}>
                      Concesionario verificado
                    </span>
                    <h3>Automotor Motors</h3>
                    <p>4.8 ★ · 132 opiniones · responde en 1 hora</p>
                  </div>
                </div>

                <div className={styles.sellerButtons}>
                  <button>Ver perfil</button>
                  <button>Ver más publicaciones</button>
                </div>
              </div>

              <div className={styles.mapCard}>
                <h3>Ubicación del vehículo</h3>
                <div className={styles.mapPlaceholder}>
                  <div className={styles.mapPin}>📍</div>
                  <span>{vehicle.location}</span>
                  <a href="#">Ver en Google Maps</a>
                </div>
              </div>
            </aside>
          </section>

          {similarVehicles.length > 0 && (
            <section className={styles.similarSection}>
              <div className={styles.similarHeader}>
                <h2>Vehículos similares</h2>
                <Link to={backHref}>Ver más</Link>
              </div>

              <VehicleGrid vehicles={similarVehicles} />
            </section>
          )}
        </div>
      </main>

      {isLightboxOpen && (
        <div className={styles.lightboxOverlay} onClick={() => setIsLightboxOpen(false)}>
          <div className={styles.lightboxInner} onClick={(e) => e.stopPropagation()}>
            <button className={styles.lightboxClose} onClick={() => setIsLightboxOpen(false)}>
              <FiX />
            </button>

            <button
              className={`${styles.lightboxArrow} ${styles.lightboxLeft}`}
              onClick={prevImage}
            >
              <FiChevronLeft />
            </button>

            <img
              src={gallery[selectedIndex]}
              alt={vehicle.title}
              className={styles.lightboxImage}
            />

            <button
              className={`${styles.lightboxArrow} ${styles.lightboxRight}`}
              onClick={nextImage}
            >
              <FiChevronRight />
            </button>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default VehiculoDetalle;