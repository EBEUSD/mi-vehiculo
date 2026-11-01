import { useEffect, useId, useRef, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Heart,
  LogIn,
  MapPin,
  MessageCircle,
  Phone,
  Send,
  Shield,
  Share2,
  X,
  ZoomIn,
} from "lucide-react";
import Navbar from "../../components/Navbar/Navbar";
import PageLoader from "../../components/PageLoader/PageLoader";
import NotFound from "../NotFound/NotFound";
import VehicleGrid from "../../components/VehicleGrid/VehicleGrid";
import { api } from "../../lib/api";
import { attrValue, formatKm, formatUSD, mapVehicleCard, NO_PHOTO, specsLine } from "../../lib/vehicleImage";
import { useFavorites } from "../../hooks/useFavorites";
import { useAuth } from "../../context/AuthContext";
import { loginHref } from "../../lib/redirect";
import { formatSvPhone } from "../../lib/phone";
import styles from "./VehiculoDetalle.module.css";

const CATEGORY_LABEL = {
  AUTO:      "Carro / Pickup / SUV",
  MOTO:      "Moto",
  CAMION:    "Camión / Bus",
  CAMIONETA: "Panel / Microbús",
  ACUATICO:  "Acuáticos",
  AEREO:     "Aeronaves",
  BICICLETA: "Bicicletas / Remolques",
  OTRO:      "Otros",
};

const mapVehicle = (v) => ({
  id:           v.id,
  slug:         v.slug,
  title:        [v.brand?.name, v.model?.name, v.version].filter(Boolean).join(" ") || v.title || "",
  brand:        v.brand?.name  || "",
  model:        v.model?.name  || "",
  version:      v.version      || "",
  segment:      v.segment?.name || "",
  year:         v.year         || null,
  km:           v.mileage ?? null,
  price:        Number(v.price) || 0,
  currency:     v.currency     || "USD",
  fuel:         attrValue(v, "combustible"),
  transmission: attrValue(v, "transm"),
  condition:    v.condition === "NEW" ? "new" : v.condition === "USED" ? "used" : "",
  location:     [v.city?.name, v.city?.province?.name].filter(Boolean).join(", "),
  images:       (v.images || []).map((img) => img.url).filter(Boolean),
  tag:          v.condition === "NEW" ? "NUEVO" : v.condition === "USED" ? "USADO" : "",
  description:  v.description  || "",
  contactPhone: v.contactPhone || "",
  // La API devuelve showWhatsapp: si el vendedor lo desactivó no se muestra su número
  showContact:  v.showWhatsapp !== false,
  seller:       v.seller       || null,
  dealership:   v.dealership   || null,
  category:     v.category,
  type:         CATEGORY_LABEL[v.category] || "",
});

// Nombre público del vendedor: nunca el email
const publicSellerName = (v) => {
  const name = v.dealership?.name || v.seller?.fullName || "";
  return name && !name.includes("@") ? name : "Vendedor particular";
};

const initialsOf = (name) =>
  name.split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]).join("").toUpperCase() || "VP";

/* ── Galería + lightbox (se remonta por vehículo con key) ── */
const Gallery = ({ title, images, tag, liked, onFavorite }) => {
  const gallery = images.length > 0 ? images : [NO_PHOTO];
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const zoomRef = useRef(null);
  const closeRef = useRef(null);
  const len = gallery.length;

  const prevImage = () => setSelectedIndex((p) => (p === 0 ? len - 1 : p - 1));
  const nextImage = () => setSelectedIndex((p) => (p === len - 1 ? 0 : p + 1));

  useEffect(() => {
    if (!isLightboxOpen) return;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    const handleKey = (e) => {
      if (e.key === "Escape")     { setIsLightboxOpen(false); return; }
      if (len <= 1)               return;
      if (e.key === "ArrowRight") setSelectedIndex((p) => (p === len - 1 ? 0 : p + 1));
      if (e.key === "ArrowLeft")  setSelectedIndex((p) => (p === 0 ? len - 1 : p - 1));
    };
    window.addEventListener("keydown", handleKey);
    const zoomBtn = zoomRef.current;
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKey);
      zoomBtn?.focus();
    };
  }, [isLightboxOpen, len]);

  return (
    <>
      <div className={styles.mainImageWrap}>
        {/* Primera imagen: sin lazy, es el LCP */}
        <img src={gallery[selectedIndex]} alt={title} className={styles.mainImage} />

        {tag && (
          <span className={`${styles.badge} ${tag === "NUEVO" ? styles.blue : styles.gray}`}>
            {tag}
          </span>
        )}

        <button
          type="button"
          className={styles.favoriteBtn}
          onClick={onFavorite}
          aria-label={liked ? "Quitar de favoritos" : "Guardar en favoritos"}
          aria-pressed={liked}
        >
          <Heart size={18} fill={liked ? "currentColor" : "none"} aria-hidden="true" />
        </button>

        {images.length > 0 && (
          <button
            ref={zoomRef}
            type="button"
            className={styles.zoomBtn}
            onClick={() => setIsLightboxOpen(true)}
            aria-label="Ver foto en pantalla completa"
          >
            <ZoomIn size={18} aria-hidden="true" />
          </button>
        )}

        {len > 1 && (
          <>
            <button type="button" className={`${styles.galleryArrow} ${styles.leftArrow}`} onClick={prevImage} aria-label="Foto anterior">
              <ChevronLeft size={20} aria-hidden="true" />
            </button>
            <button type="button" className={`${styles.galleryArrow} ${styles.rightArrow}`} onClick={nextImage} aria-label="Foto siguiente">
              <ChevronRight size={20} aria-hidden="true" />
            </button>
          </>
        )}

        <div className={styles.galleryCounter} aria-live="polite">
          {selectedIndex + 1} / {len}
        </div>
      </div>

      {len > 1 && (
        <div className={styles.thumbRow}>
          {gallery.map((image, index) => (
            <button
              key={`${image}-${index}`}
              type="button"
              className={`${styles.thumbBtn} ${selectedIndex === index ? styles.thumbActive : ""}`}
              onClick={() => setSelectedIndex(index)}
              aria-label={`Ver foto ${index + 1} de ${len}`}
              aria-current={selectedIndex === index ? "true" : undefined}
            >
              <img src={image} alt="" loading="lazy" decoding="async" />
            </button>
          ))}
        </div>
      )}

      {isLightboxOpen && (
        <div className={styles.lightboxOverlay} onClick={() => setIsLightboxOpen(false)}>
          <div
            className={styles.lightboxInner}
            role="dialog"
            aria-modal="true"
            aria-label={`Fotos de ${title}`}
            onClick={(e) => e.stopPropagation()}
          >
            <button ref={closeRef} type="button" className={styles.lightboxClose} onClick={() => setIsLightboxOpen(false)} aria-label="Cerrar">
              <X size={20} aria-hidden="true" />
            </button>

            {len > 1 && (
              <button type="button" className={`${styles.lightboxArrow} ${styles.lightboxLeft}`} onClick={prevImage} aria-label="Foto anterior">
                <ChevronLeft size={22} aria-hidden="true" />
              </button>
            )}

            <img src={gallery[selectedIndex]} alt={`${title} – foto ${selectedIndex + 1} de ${len}`} className={styles.lightboxImage} />

            {len > 1 && (
              <button type="button" className={`${styles.lightboxArrow} ${styles.lightboxRight}`} onClick={nextImage} aria-label="Foto siguiente">
                <ChevronRight size={22} aria-hidden="true" />
              </button>
            )}
          </div>
        </div>
      )}
    </>
  );
};

/* ── Formulario de consulta (se remonta por vehículo con key) ── */
const LeadForm = ({ vehicleId, title, user }) => {
  const id = useId();
  const [form, setForm] = useState({
    name:  user?.user_metadata?.full_name || "",
    email: user?.email || "",
    phone: user?.user_metadata?.phone ? formatSvPhone(user.user_metadata.phone) : "",
    message: `Hola, me interesa ${title}. ¿Sigue disponible?`,
  });
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent]             = useState(false);
  const [error, setError]           = useState("");

  const set = (key) => (e) => setForm((p) => ({ ...p, [key]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim() || !form.message.trim()) {
      setError("Nombre, email y mensaje son obligatorios.");
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      await api.post(`/vehicles/${vehicleId}/leads`, {
        name:    form.name.trim(),
        email:   form.email.trim(),
        phone:   form.phone.trim() || undefined,
        message: form.message.trim(),
      });
      setSent(true);
    } catch {
      setError("No se pudo enviar. Intentá de nuevo.");
    } finally {
      setSubmitting(false);
    }
  };

  if (sent) {
    return (
      <div className={styles.leadSent} role="status">
        <div className={styles.leadSentIcon} aria-hidden="true">✓</div>
        <p className={styles.leadSentTitle}>¡Mensaje enviado!</p>
        <p className={styles.leadSentText}>El vendedor recibirá tu consulta y te contactará pronto.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className={styles.leadForm} noValidate>
      <label htmlFor={`${id}-name`} className={styles.srOnly}>Tu nombre (obligatorio)</label>
      <input id={`${id}-name`} type="text" autoComplete="name" placeholder="Tu nombre *" required
        value={form.name} onChange={set("name")} className={styles.leadInput} />

      <label htmlFor={`${id}-email`} className={styles.srOnly}>Tu email (obligatorio)</label>
      <input id={`${id}-email`} type="email" autoComplete="email" placeholder="Tu email *" required
        value={form.email} onChange={set("email")} className={styles.leadInput} />

      <label htmlFor={`${id}-phone`} className={styles.srOnly}>Tu teléfono (opcional)</label>
      <input id={`${id}-phone`} type="tel" autoComplete="tel" placeholder="Tu teléfono (opcional)"
        value={form.phone} onChange={set("phone")} className={styles.leadInput} />

      <label htmlFor={`${id}-msg`} className={styles.srOnly}>Tu mensaje (obligatorio)</label>
      <textarea id={`${id}-msg`} placeholder="Tu mensaje *" rows={3} required
        value={form.message} onChange={set("message")} className={`${styles.leadInput} ${styles.leadTextarea}`} />

      {error && <p className={styles.leadError} role="alert">{error}</p>}

      <button type="submit" disabled={submitting} className={styles.leadSubmit}>
        <Send size={15} aria-hidden="true" />
        {submitting ? "Enviando…" : "Enviar consulta"}
      </button>
    </form>
  );
};

/* ── Mapa: geocodifica la ciudad con Nominatim (gratis, sin key) ── */
const LocationMap = ({ city, label }) => {
  const query = [city, "El Salvador"].filter(Boolean).join(", ");
  const [geo, setGeo] = useState({ query: null, coords: null });

  useEffect(() => {
    if (!city) return;
    const ctrl = new AbortController();
    fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=1`, {
      headers: { "Accept-Language": "es" },
      signal: ctrl.signal,
    })
      .then((r) => r.json())
      .then((results) => {
        const hit = results?.[0];
        setGeo({ query, coords: hit ? { lat: parseFloat(hit.lat), lon: parseFloat(hit.lon) } : null });
      })
      .catch(() => {});
    return () => ctrl.abort();
  }, [city, query]);

  // Coordenadas de otra ciudad (vehículo anterior) no se muestran
  const mapCoords = geo.query === query ? geo.coords : null;

  return mapCoords ? (
    <iframe
      title={`Mapa de ${label || "la ubicación"}`}
      src={`https://www.openstreetmap.org/export/embed.html?bbox=${mapCoords.lon - 0.12},${mapCoords.lat - 0.08},${mapCoords.lon + 0.12},${mapCoords.lat + 0.08}&layer=mapnik&marker=${mapCoords.lat},${mapCoords.lon}`}
      className={styles.mapFrame}
      loading="lazy"
      referrerPolicy="no-referrer"
    />
  ) : (
    <div className={styles.mapPlaceholder}>
      <MapPin size={28} className={styles.mapPin} aria-hidden="true" />
      <span>{label || "El Salvador"}</span>
    </div>
  );
};

const VehiculoDetalle = () => {
  const { slug }   = useParams();
  const navigate   = useNavigate();
  const location   = useLocation();
  const { isFavorite, toggle } = useFavorites();
  const { user } = useAuth();

  const [result, setResult]         = useState({ key: null, raw: null, error: null });
  const [reloadTick, setReloadTick] = useState(0);
  const [shareLabel, setShareLabel] = useState("Compartir");
  const reqKey = `${slug}#${reloadTick}`;

  useEffect(() => {
    let ignore = false;
    api.get(`/vehicles/${slug}/detail`)
      .then((res) => { if (!ignore) setResult({ key: reqKey, raw: res.data, error: null }); })
      .catch((error) => { if (!ignore) setResult({ key: reqKey, raw: null, error }); });
    return () => { ignore = true; };
  }, [slug, reqKey]);

  const loading = result.key !== reqKey;
  const raw     = loading ? null : result.raw;
  const rawId   = raw?.id || null;

  // Relacionados: no fatal, ligado al id del vehículo actual
  const [similarState, setSimilarState] = useState({ id: null, list: [] });

  useEffect(() => {
    if (!rawId) return;
    let ignore = false;
    api.get(`/vehicles/${rawId}/related`)
      .then((res) => { if (!ignore) setSimilarState({ id: rawId, list: (res.data || []).map(mapVehicleCard).slice(0, 4) }); })
      .catch(() => {});
    return () => { ignore = true; };
  }, [rawId]);

  const similar = similarState.id === rawId ? similarState.list : [];

  if (loading) {
    return (
      <div className={styles.page}>
        <title>Cargando vehículo… | Mi Vehículo</title>
        <Navbar />
        <main>
          <PageLoader fullScreen={false} label="Cargando vehículo…" />
        </main>
      </div>
    );
  }

  if (!raw) {
    const notFound = result.error?.status === 404;
    // Publicación borrada o link mal escrito: misma 404 que el resto del sitio
    if (notFound) return <NotFound />;
    return (
      <div className={styles.page}>
        <title>{notFound ? "Vehículo no encontrado" : "Error al cargar"} | Mi Vehículo</title>
        <meta name="robots" content="noindex" />
        <Navbar />
        <main className={styles.notFoundWrapper}>
          <div className={styles.notFoundCard} role={notFound ? undefined : "alert"}>
            {notFound ? (
              <>
                <h1>Vehículo no encontrado</h1>
                <p>La publicación que buscás no existe o fue removida.</p>
                <button type="button" onClick={() => navigate("/vehiculos")}>Volver a resultados</button>
              </>
            ) : (
              <>
                <h1>No pudimos cargar la publicación</h1>
                <p>Revisá tu conexión e intentá de nuevo.</p>
                <button type="button" onClick={() => setReloadTick((t) => t + 1)}>Reintentar</button>
              </>
            )}
          </div>
        </main>
      </div>
    );
  }

  const vehicle  = mapVehicle(raw);
  const backHref = location.state?.fromSearch || "/vehiculos";
  const liked    = isFavorite(vehicle.id);
  const handleFavorite = () => toggle(vehicle.id);

  const detailRows = [
    ["Marca",       vehicle.brand],
    ["Modelo",      vehicle.model],
    ["Versión",     vehicle.version],
    ["Año",         vehicle.year],
    ["Kilometraje", vehicle.km != null ? formatKm(vehicle.km) : ""],
    ["Combustible", vehicle.fuel],
    ["Transmisión", vehicle.transmission],
    ["Carrocería",  vehicle.segment],
    ["Ubicación",   vehicle.location],
    ["Tipo",        vehicle.type],
    ["Condición",   vehicle.condition === "new" ? "Nuevo" : vehicle.condition === "used" ? "Usado" : ""],
  ].filter(([, val]) => val);

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

  // Para ver el teléfono o escribirle al vendedor hay que iniciar sesión
  const loginTo      = loginHref(location.pathname);
  const registerTo   = loginHref(location.pathname, "register");
  const phoneDigits  = vehicle.contactPhone.replace(/\D/g, "");
  const canContact   = Boolean(phoneDigits) && vehicle.showContact;
  const whatsappHref = canContact
    ? `https://wa.me/${phoneDigits}?text=${encodeURIComponent(`Hola, vi tu publicación de ${vehicle.title} en Mi Vehículo`)}`
    : null;

  const sellerName     = publicSellerName(vehicle);
  const sellerInitials = initialsOf(sellerName);

  // ── SEO ──
  const seoName  = [vehicle.brand, vehicle.model, vehicle.year].filter(Boolean).join(" ") || vehicle.title;
  const seoTitle = `${seoName} – ${formatUSD(vehicle.price)} | Mi Vehículo`;
  const seoDesc  = (vehicle.description
    ? vehicle.description.replace(/\s+/g, " ").trim()
    : `${vehicle.title} en venta${vehicle.location ? ` en ${vehicle.location}` : ""}. ${specsLine(vehicle)}. Precio: ${formatUSD(vehicle.price)}.`
  ).slice(0, 160);
  const pageUrl = typeof window !== "undefined" ? window.location.href : undefined;
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Car",
    name: vehicle.title,
    url: pageUrl,
    ...(vehicle.brand && { brand: { "@type": "Brand", name: vehicle.brand } }),
    ...(vehicle.model && { model: vehicle.model }),
    ...(vehicle.year && { vehicleModelDate: String(vehicle.year) }),
    ...(vehicle.km != null && {
      mileageFromOdometer: { "@type": "QuantitativeValue", value: vehicle.km, unitCode: "KMT" },
    }),
    ...(vehicle.fuel && { fuelType: vehicle.fuel }),
    ...(vehicle.transmission && { vehicleTransmission: vehicle.transmission }),
    ...(vehicle.condition && {
      itemCondition: vehicle.condition === "new" ? "https://schema.org/NewCondition" : "https://schema.org/UsedCondition",
    }),
    ...(vehicle.images.length > 0 && { image: vehicle.images }),
    ...(vehicle.description && { description: seoDesc }),
    offers: {
      "@type": "Offer",
      price: vehicle.price,
      priceCurrency: vehicle.currency || "USD",
      availability: "https://schema.org/InStock",
      url: pageUrl,
      ...(vehicle.condition && {
        itemCondition: vehicle.condition === "new" ? "https://schema.org/NewCondition" : "https://schema.org/UsedCondition",
      }),
    },
  };

  return (
    <div className={`${styles.page} ${styles.pageWithMobileCta}`}>
      <title>{seoTitle}</title>
      <meta name="description" content={seoDesc} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />

      <Navbar />

      <main className={styles.main}>
        <div className={styles.container}>
          <nav className={styles.breadcrumbs} aria-label="Migas de pan">
            <Link to="/">Inicio</Link>
            <span aria-hidden="true">›</span>
            <Link to={backHref}>Resultados</Link>
            <span aria-hidden="true">›</span>
            <span aria-current="page">{vehicle.title}</span>
          </nav>

          <div className={styles.topActions}>
            <button type="button" className={styles.backBtn} onClick={() => navigate(backHref)}>
              <ArrowLeft size={18} aria-hidden="true" />
              <span>Volver a resultados</span>
            </button>

            <div className={styles.topRightActions}>
              <button type="button" className={styles.iconAction} onClick={handleShare}>
                <Share2 size={16} aria-hidden="true" />
                <span aria-live="polite">{shareLabel}</span>
              </button>
              <button
                type="button"
                className={`${styles.iconAction} ${liked ? styles.iconActionActive : ""}`}
                onClick={handleFavorite}
                aria-pressed={liked}
              >
                <Heart size={16} fill={liked ? "currentColor" : "none"} aria-hidden="true" />
                <span>{liked ? "Guardado" : "Guardar"}</span>
              </button>
            </div>
          </div>

          <section className={styles.topSection}>
            {/* Gallery column */}
            <div className={styles.galleryColumn}>
              <Gallery
                key={vehicle.id}
                title={vehicle.title}
                images={vehicle.images}
                tag={vehicle.tag}
                liked={liked}
                onFavorite={handleFavorite}
              />

              <div className={styles.specsQuick}>
                <div className={styles.quickItem}>
                  <strong>{vehicle.year || "—"}</strong>
                  <span>Año</span>
                </div>
                <div className={styles.quickItem}>
                  <strong>{vehicle.km != null ? formatKm(vehicle.km) : "—"}</strong>
                  <span>Kilometraje</span>
                </div>
                <div className={styles.quickItem}>
                  <strong>{vehicle.fuel || "—"}</strong>
                  <span>Combustible</span>
                </div>
                <div className={styles.quickItem}>
                  <strong>{vehicle.transmission || "—"}</strong>
                  <span>Transmisión</span>
                </div>
              </div>

              {vehicle.description && (
                <div className={styles.card}>
                  <h2>Descripción</h2>
                  <p className={styles.description}>{vehicle.description}</p>
                </div>
              )}

              <div className={styles.card}>
                <h2>Detalles técnicos</h2>
                <dl className={styles.detailsGrid}>
                  {detailRows.map(([label, value]) => (
                    <div key={label} className={styles.detailRow}>
                      <dt>{label}</dt>
                      <dd>{value}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            </div>

            {/* Sidebar */}
            <aside className={styles.sidebar}>
              <div className={styles.priceCard}>
                {vehicle.tag && (
                  <span className={`${styles.badgeInline} ${vehicle.tag === "NUEVO" ? styles.blue : styles.gray}`}>
                    {vehicle.tag}
                  </span>
                )}

                <h1>{vehicle.title}</h1>

                {specsLine(vehicle) && <p className={styles.meta}>{specsLine(vehicle)}</p>}

                <strong className={styles.price}>{formatUSD(vehicle.price)}</strong>

                {vehicle.location && (
                  <p className={styles.location}>
                    <MapPin size={16} aria-hidden="true" />
                    <span>{vehicle.location}</span>
                  </p>
                )}

                <div className={styles.sellerTag}>
                  <Shield size={16} aria-hidden="true" />
                  <span>Vendedor registrado</span>
                </div>

                <div className={styles.actions}>
                  {!user && (
                    <Link to={loginTo} className={styles.primaryBtn}>
                      <LogIn size={18} aria-hidden="true" />
                      <span>Iniciá sesión para contactar</span>
                    </Link>
                  )}

                  {user && canContact && (
                    <a href={`tel:${vehicle.contactPhone}`} className={styles.primaryBtn}>
                      <Phone size={18} aria-hidden="true" />
                      <span>Llamar al vendedor</span>
                    </a>
                  )}

                  {user && canContact && (
                    <a href={whatsappHref} target="_blank" rel="noreferrer" className={styles.whatsappBtn}>
                      <MessageCircle size={18} aria-hidden="true" />
                      <span>WhatsApp</span>
                    </a>
                  )}

                  <button type="button" className={styles.secondaryBtn} onClick={handleFavorite} aria-pressed={liked}>
                    <Heart size={18} fill={liked ? "currentColor" : "none"} aria-hidden="true" />
                    <span>{liked ? "Guardado en favoritos" : "Guardar publicación"}</span>
                  </button>
                </div>

                <p className={styles.helperText}>
                  {user
                    ? "Verificá el vehículo y coordiná una visita antes de cerrar el trato."
                    : <>Para ver el teléfono o escribirle al vendedor necesitás una cuenta. <Link to={registerTo}>Creala gratis</Link>.</>}
                </p>
              </div>

              <div className={styles.sellerCard}>
                <div className={styles.sellerHeader}>
                  <div className={styles.sellerAvatar} aria-hidden="true">{sellerInitials}</div>
                  <div>
                    <span className={styles.sellerVerified}>Vendedor</span>
                    <p className={styles.sellerName}>{sellerName}</p>
                  </div>
                </div>
              </div>

              {/* ── Lead / Contact form ── */}
              <div id="consulta" className={`${styles.card} ${styles.leadCard}`}>
                <h2>Consultar al vendedor</h2>
                {user ? (
                  <LeadForm key={`${vehicle.id}-${user.id}`} vehicleId={vehicle.id} title={vehicle.title} user={user} />
                ) : (
                  <div className={styles.leadLocked}>
                    <p>Iniciá sesión para enviarle un mensaje al vendedor.</p>
                    <Link to={loginTo} className={styles.leadSubmit}>
                      <LogIn size={15} aria-hidden="true" />
                      Iniciar sesión
                    </Link>
                    <Link to={registerTo} className={styles.leadLockedLink}>Crear cuenta gratis</Link>
                  </div>
                )}
              </div>

              <div className={styles.mapCard}>
                <h2>Ubicación del vehículo</h2>
                <LocationMap city={raw.city?.name} label={vehicle.location} />
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

      {/* CTA fijo en mobile */}
      <div className={styles.mobileCta}>
        <div className={styles.mobileCtaPrice}>
          <strong>{formatUSD(vehicle.price)}</strong>
          <span>{vehicle.title}</span>
        </div>
        {!user ? (
          <Link to={loginTo} className={styles.mobileCtaPrimary}>
            <LogIn size={16} aria-hidden="true" />
            <span>Contactar</span>
          </Link>
        ) : canContact ? (
          <a href={whatsappHref} target="_blank" rel="noreferrer" className={styles.mobileCtaWhatsapp}>
            <MessageCircle size={18} aria-hidden="true" />
            <span>WhatsApp</span>
          </a>
        ) : (
          <a href="#consulta" className={styles.mobileCtaPrimary}>
            <Send size={16} aria-hidden="true" />
            <span>Consultar</span>
          </a>
        )}
      </div>
    </div>
  );
};

export default VehiculoDetalle;
