import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import {
  FiArrowLeft,
  FiChevronLeft,
  FiChevronRight,
  FiHeart,
  FiMapPin,
  FiPhone,
  FiSend,
  FiShield,
  FiShare2,
  FiX,
  FiZoomIn,
} from "react-icons/fi";
import { FaWhatsapp } from "react-icons/fa";
import Navbar from "../../components/Navbar/Navbar";
import VehicleGrid from "../../components/VehicleGrid/VehicleGrid";
import { api } from "../../lib/api";
import { getFavorites, toggleFavorite } from "../../utils/favorites";
import { useAuth } from "../../context/AuthContext";
import styles from "./VehiculoDetalle.module.css";

const PLACEHOLDER_IMG =
  "https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=800&auto=format&fit=crop";

const formatKm  = (km) => Number(km).toLocaleString("en-US");
const formatUSD = (p)  => `$${new Intl.NumberFormat("en-US").format(p)}`;

const CATEGORY_LABEL = {
  AUTO:      "Autos",
  MOTO:      "Motos",
  CAMION:    "Camiones",
  CAMIONETA: "Camionetas",
  ACUATICO:  "Náutica",
  OTRO:      "Otros",
};

const mapVehicle = (v) => ({
  id:           v.id,
  slug:         v.slug,
  title:        [v.brand?.name, v.model?.name, v.version].filter(Boolean).join(" "),
  brand:        v.brand?.name  || "",
  model:        v.model?.name  || "",
  year:         v.year         || 0,
  km:           v.mileage      || 0,
  price:        v.price        || 0,
  fuel:         v.attributes?.find((a) => a.definition?.name === "Combustible")?.value || "Gasolina",
  transmission: v.attributes?.find((a) => a.definition?.name === "Transmisión")?.value || "Manual",
  condition:    v.condition === "NEW" ? "new" : "used",
  location:     [v.city?.name, v.city?.province?.name].filter(Boolean).join(", "),
  images:       (v.images || []).map((img) => img.url),
  image:        v.images?.[0]?.url || PLACEHOLDER_IMG,
  tag:          v.plan === "premium" ? "DESTACADO" : v.condition === "NEW" ? "NUEVO" : "USADO",
  description:  v.description  || "",
  contactPhone: v.contactPhone || "",
  seller:       v.seller       || null,
  category:     v.category,
  type:         CATEGORY_LABEL[v.category] || "Autos",
});

const LEAD_INIT = { name: "", email: "", phone: "", message: "" };

const VehiculoDetalle = () => {
  const { slug }   = useParams();
  const navigate   = useNavigate();
  const location   = useLocation();

  const [vehicle, setVehicle]           = useState(null);
  const [vehicleId, setVehicleId]       = useState(null);
  const [similar, setSimilar]           = useState([]);
  const [loading, setLoading]           = useState(true);
  const [notFound, setNotFound]         = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [favorites, setFavorites]       = useState([]);
  const [shareLabel, setShareLabel]     = useState("Compartir");

  const { user } = useAuth();
  const isAuthed = !!user && !user.id?.startsWith("mock-");

  const [leadForm, setLeadForm]         = useState(LEAD_INIT);
  const [leadSubmitting, setLeadSubmitting] = useState(false);
  const [leadSent, setLeadSent]         = useState(false);
  const [leadError, setLeadError]       = useState("");

  const [mapCoords, setMapCoords]       = useState(null);

  useEffect(() => {
    const syncFavorites = () => setFavorites(getFavorites());
    syncFavorites();
    window.addEventListener("favorites-updated", syncFavorites);
    return () => window.removeEventListener("favorites-updated", syncFavorites);
  }, []);

  useEffect(() => {
    document.body.style.overflow = isLightboxOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isLightboxOpen]);

  useEffect(() => {
    if (!isLightboxOpen || !vehicle) return;
    const imgs = vehicle.images.length > 0 ? vehicle.images : [PLACEHOLDER_IMG];
    const len  = imgs.length;
    const handleKey = (e) => {
      if (e.key === "Escape")      { setIsLightboxOpen(false); return; }
      if (len <= 1)                return;
      if (e.key === "ArrowRight")  setSelectedIndex((p) => p === len - 1 ? 0 : p + 1);
      if (e.key === "ArrowLeft")   setSelectedIndex((p) => p === 0 ? len - 1 : p - 1);
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [isLightboxOpen, vehicle]);

  useEffect(() => {
    setLoading(true);
    setNotFound(false);
    setSelectedIndex(0);
    setVehicle(null);
    setSimilar([]);
    setLeadSent(false);
    setLeadForm(LEAD_INIT);

    api.get(`/vehicles/${slug}/detail`)
      .then((res) => {
        const raw = res.data;
        setVehicleId(raw.id);
        const v = mapVehicle(raw);
        setVehicle(v);

        // Geocode city for map (Nominatim, free, no key)
        const query = [raw.city?.name, "El Salvador"].filter(Boolean).join(", ");
        fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=1`, {
          headers: { "Accept-Language": "es" },
        })
          .then((r) => r.json())
          .then((results) => {
            if (results[0]) {
              setMapCoords({ lat: parseFloat(results[0].lat), lon: parseFloat(results[0].lon) });
            }
          })
          .catch(() => {});

        // Related fetch is non-fatal — failure must not hide the vehicle
        api.get(`/vehicles/${raw.id}/related`)
          .then((relRes) => setSimilar((relRes.data || []).map(mapVehicle).slice(0, 4)))
          .catch(() => {});
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [slug]);

  const handleLeadSubmit = async (e) => {
    e.preventDefault();
    if (!leadForm.name.trim() || !leadForm.email.trim() || !leadForm.message.trim()) {
      setLeadError("Nombre, email y mensaje son obligatorios.");
      return;
    }
    setLeadSubmitting(true);
    setLeadError("");
    try {
      await api.post(`/vehicles/${vehicleId}/leads`, {
        name:    leadForm.name.trim(),
        email:   leadForm.email.trim(),
        phone:   leadForm.phone.trim() || undefined,
        message: leadForm.message.trim(),
      });
      setLeadSent(true);
    } catch {
      setLeadError("No se pudo enviar. Intentá de nuevo.");
    } finally {
      setLeadSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className={styles.page}>
        <Navbar />
        <main className={styles.notFoundWrapper}>
          <p style={{ color: "#6b7280", textAlign: "center", padding: "4rem" }}>Cargando…</p>
        </main>
      </div>
    );
  }

  if (notFound || !vehicle) {
    return (
      <div className={styles.page}>
        <Navbar />
        <main className={styles.notFoundWrapper}>
          <div className={styles.notFoundCard}>
            <h1>Vehículo no encontrado</h1>
            <p>La publicación que buscás no existe o fue removida.</p>
            <button onClick={() => navigate("/vehiculos")}>Volver a resultados</button>
          </div>
        </main>
      </div>
    );
  }

  const backHref = location.state?.fromSearch || "/vehiculos";
  const gallery  = vehicle.images.length > 0 ? vehicle.images : [PLACEHOLDER_IMG];
  const liked    = favorites.includes(vehicle.id);

  const detailRows = [
    ["Marca",       vehicle.brand],
    ["Modelo",      vehicle.model],
    ["Año",         vehicle.year],
    ["Kilometraje", `${formatKm(vehicle.km)} km`],
    ["Combustible", vehicle.fuel],
    ["Transmisión", vehicle.transmission],
    ["Ubicación",   vehicle.location],
    ["Tipo",        vehicle.type],
    ["Condición",   vehicle.condition === "new" ? "Nuevo" : "Usado"],
  ].filter(([, val]) => val);

  const prevImage = () => setSelectedIndex((p) => (p === 0 ? gallery.length - 1 : p - 1));
  const nextImage = () => setSelectedIndex((p) => (p === gallery.length - 1 ? 0 : p + 1));

  const handleFavorite = () => {
    const next = toggleFavorite(vehicle.id);
    setFavorites(next);
    if (isAuthed) {
      if (next.includes(vehicle.id)) {
        api.post(`/favorites/${vehicle.id}`).catch(() => {});
      } else {
        api.delete(`/favorites/${vehicle.id}`).catch(() => {});
      }
    }
  };

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({ title: vehicle.title, url: window.location.href });
      } else {
        await navigator.clipboard.writeText(window.location.href);
        setShareLabel("Link copiado");
        setTimeout(() => setShareLabel("Compartir"), 1800);
      }
    } catch { setShareLabel("Compartir"); }
  };

  const whatsappHref = vehicle.contactPhone
    ? `https://wa.me/${vehicle.contactPhone.replace(/\D/g, "")}?text=${encodeURIComponent(`Hola, vi tu publicación de ${vehicle.title} en Mi Vehículo`)}`
    : "#";

  const sellerName     = vehicle.seller?.fullName || vehicle.seller?.email || "Vendedor particular";
  const sellerInitials = sellerName.slice(0, 2).toUpperCase();

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
            {/* Gallery column */}
            <div className={styles.galleryColumn}>
              <div className={styles.mainImageWrap}>
                <img
                  src={gallery[selectedIndex]}
                  alt={vehicle.title}
                  className={styles.mainImage}
                />

                <span
                  className={`${styles.badge} ${
                    vehicle.tag === "DESTACADO" ? styles.green
                    : vehicle.tag === "NUEVO"   ? styles.blue
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

                {gallery.length > 1 && (
                  <>
                    <button className={`${styles.galleryArrow} ${styles.leftArrow}`} onClick={prevImage} type="button">
                      <FiChevronLeft />
                    </button>
                    <button className={`${styles.galleryArrow} ${styles.rightArrow}`} onClick={nextImage} type="button">
                      <FiChevronRight />
                    </button>
                  </>
                )}

                <div className={styles.galleryCounter}>
                  {selectedIndex + 1} / {gallery.length}
                </div>
              </div>

              {gallery.length > 1 && (
                <div className={styles.thumbRow}>
                  {gallery.map((image, index) => (
                    <button
                      key={`${image}-${index}`}
                      className={`${styles.thumbBtn} ${selectedIndex === index ? styles.thumbActive : ""}`}
                      onClick={() => setSelectedIndex(index)}
                      type="button"
                    >
                      <img src={image} alt={`${vehicle.title} ${index + 1}`} />
                    </button>
                  ))}
                </div>
              )}

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

              {vehicle.description && (
                <div className={styles.card}>
                  <h3>Descripción</h3>
                  <p style={{ whiteSpace: "pre-line" }}>{vehicle.description}</p>
                </div>
              )}

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

            {/* Sidebar */}
            <aside className={styles.sidebar}>
              <div className={styles.priceCard}>
                <span
                  className={`${styles.badgeInline} ${
                    vehicle.tag === "DESTACADO" ? styles.green
                    : vehicle.tag === "NUEVO"   ? styles.blue
                    : styles.gray
                  }`}
                >
                  {vehicle.tag}
                </span>

                <h1>{vehicle.title}</h1>

                <p className={styles.meta}>
                  {vehicle.year} · {formatKm(vehicle.km)} km · {vehicle.fuel} · {vehicle.transmission}
                </p>

                <strong className={styles.price}>{formatUSD(vehicle.price)}</strong>

                {vehicle.location && (
                  <p className={styles.location}>
                    <FiMapPin />
                    <span>{vehicle.location}</span>
                  </p>
                )}

                <div className={styles.sellerTag}>
                  <FiShield />
                  <span>Vendedor registrado</span>
                </div>

                <div className={styles.actions}>
                  {vehicle.contactPhone && (
                    <a href={`tel:${vehicle.contactPhone}`} className={styles.primaryBtn}>
                      <FiPhone />
                      <span>Llamar al vendedor</span>
                    </a>
                  )}

                  {vehicle.contactPhone && (
                    <a href={whatsappHref} target="_blank" rel="noreferrer" className={styles.whatsappBtn}>
                      <FaWhatsapp />
                      <span>WhatsApp</span>
                    </a>
                  )}

                  <button className={styles.secondaryBtn} onClick={handleFavorite}>
                    <FiHeart />
                    <span>{liked ? "Guardado en favoritos" : "Guardar publicación"}</span>
                  </button>
                </div>

                <p className={styles.helperText}>
                  Verificá el vehículo y coordiná una visita antes de cerrar el trato.
                </p>
              </div>

              <div className={styles.sellerCard}>
                <div className={styles.sellerHeader}>
                  <div className={styles.sellerAvatar}>{sellerInitials}</div>
                  <div>
                    <span className={styles.sellerVerified}>Vendedor</span>
                    <h3>{sellerName}</h3>
                  </div>
                </div>
              </div>

              {/* ── Lead / Contact form ── */}
              <div className={styles.card} style={{ marginTop: 0 }}>
                <h3 style={{ marginBottom: "1rem" }}>Consultar al vendedor</h3>

                {leadSent ? (
                  <div style={{ textAlign: "center", padding: "1rem 0", color: "#059669" }}>
                    <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>✓</div>
                    <p style={{ fontWeight: 600 }}>¡Mensaje enviado!</p>
                    <p style={{ fontSize: "0.875rem", color: "#6b7280", marginTop: "0.25rem" }}>
                      El vendedor recibirá tu consulta y te contactará pronto.
                    </p>
                  </div>
                ) : (
                  <form onSubmit={handleLeadSubmit} style={{ display: "flex", flexDirection: "column", gap: "0.625rem" }}>
                    <input
                      type="text"
                      placeholder="Tu nombre *"
                      value={leadForm.name}
                      onChange={(e) => setLeadForm((p) => ({ ...p, name: e.target.value }))}
                      style={inputStyle}
                    />
                    <input
                      type="email"
                      placeholder="Tu email *"
                      value={leadForm.email}
                      onChange={(e) => setLeadForm((p) => ({ ...p, email: e.target.value }))}
                      style={inputStyle}
                    />
                    <input
                      type="tel"
                      placeholder="Tu teléfono (opcional)"
                      value={leadForm.phone}
                      onChange={(e) => setLeadForm((p) => ({ ...p, phone: e.target.value }))}
                      style={inputStyle}
                    />
                    <textarea
                      placeholder="Tu mensaje *"
                      value={leadForm.message}
                      onChange={(e) => setLeadForm((p) => ({ ...p, message: e.target.value }))}
                      rows={3}
                      style={{ ...inputStyle, resize: "vertical", minHeight: "4.5rem" }}
                    />
                    {leadError && (
                      <p style={{ color: "#dc2626", fontSize: "0.8125rem", margin: 0 }}>{leadError}</p>
                    )}
                    <button
                      type="submit"
                      disabled={leadSubmitting}
                      style={{
                        display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem",
                        padding: "0.625rem 1rem", borderRadius: "8px", border: "none", cursor: "pointer",
                        background: "#1570ff", color: "#fff", fontWeight: 600, fontSize: "0.9rem",
                        opacity: leadSubmitting ? 0.7 : 1,
                      }}
                    >
                      <FiSend size={15} />
                      {leadSubmitting ? "Enviando…" : "Enviar consulta"}
                    </button>
                  </form>
                )}
              </div>

              <div className={styles.mapCard}>
                <h3>Ubicación del vehículo</h3>
                {mapCoords ? (
                  <iframe
                    title="Ubicación"
                    src={`https://www.openstreetmap.org/export/embed.html?bbox=${mapCoords.lon - 0.12},${mapCoords.lat - 0.08},${mapCoords.lon + 0.12},${mapCoords.lat + 0.08}&layer=mapnik&marker=${mapCoords.lat},${mapCoords.lon}`}
                    style={{ width: "100%", height: 220, border: 0, borderRadius: 12 }}
                    loading="lazy"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className={styles.mapPlaceholder}>
                    <div className={styles.mapPin}>📍</div>
                    <span>{vehicle.location || "El Salvador"}</span>
                  </div>
                )}
              </div>
            </aside>
          </section>

          {similar.length > 0 && (
            <section className={styles.similarSection}>
              <div className={styles.similarHeader}>
                <h2>Vehículos similares</h2>
                <Link to={backHref}>Ver más</Link>
              </div>
              <VehicleGrid vehicles={similar} />
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

            {gallery.length > 1 && (
              <button className={`${styles.lightboxArrow} ${styles.lightboxLeft}`} onClick={prevImage}>
                <FiChevronLeft />
              </button>
            )}

            <img src={gallery[selectedIndex]} alt={vehicle.title} className={styles.lightboxImage} />

            {gallery.length > 1 && (
              <button className={`${styles.lightboxArrow} ${styles.lightboxRight}`} onClick={nextImage}>
                <FiChevronRight />
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

const inputStyle = {
  width: "100%",
  padding: "0.5rem 0.75rem",
  border: "1px solid #d1d5db",
  borderRadius: "6px",
  fontSize: "0.875rem",
  outline: "none",
  boxSizing: "border-box",
  background: "var(--input-bg, #fff)",
  color: "inherit",
};

export default VehiculoDetalle;
