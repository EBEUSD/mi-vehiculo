import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft, ChevronLeft, ChevronRight, Clock, Globe, LogIn, MapPin, MessageCircle, Phone, Shield,
} from "lucide-react";
import Navbar from "../../components/Navbar/Navbar";
import PageLoader from "../../components/PageLoader/PageLoader";
import NotFound from "../NotFound/NotFound";
import { api } from "../../lib/api";
import { formatUSD, NO_PHOTO } from "../../lib/vehicleImage";
import { formatSvPhone, normalizeSvPhone } from "../../lib/phone";
import { serviceTypeLabel } from "../../lib/categories";
import { loginHref } from "../../lib/redirect";
import { useAuth } from "../../context/AuthContext";
import styles from "./ServicioDetalle.module.css";

// Solo links http(s): el sitio lo escribe el vendedor
const safeWebsite = (raw) => {
  try {
    const url = new URL(raw);
    return url.protocol === "http:" || url.protocol === "https:" ? url.toString() : null;
  } catch { return null; }
};

const ServicioDetalle = () => {
  const { slug }  = useParams();
  const navigate  = useNavigate();
  const location  = useLocation();
  const { user }  = useAuth();

  const [result, setResult] = useState({ key: null, service: null, error: null });
  const [reloadTick, setReloadTick] = useState(0);
  // Índice de foto ligado al slug: al cambiar de servicio vuelve a 0
  const [selected, setSelected] = useState({ slug, index: 0 });
  // Con sesión el detalle trae el teléfono: se vuelve a pedir al loguearse
  const reqKey = `${slug}#${reloadTick}#${user?.id || ""}`;

  useEffect(() => {
    let ignore = false;
    api.get(`/services/${slug}/detail`)
      .then((res) => { if (!ignore) setResult({ key: reqKey, service: res.data, error: null }); })
      .catch((error) => { if (!ignore) setResult({ key: reqKey, service: null, error }); });
    return () => { ignore = true; };
  }, [slug, reqKey]);

  const loading = result.key !== reqKey;
  const service = loading ? null : result.service;
  const selectedIndex = selected.slug === slug ? selected.index : 0;
  const setSelectedIndex = (fn) =>
    setSelected({ slug, index: typeof fn === "function" ? fn(selectedIndex) : fn });

  if (loading) {
    return (
      <div className={styles.page}>
        <title>Cargando servicio… | Mi Vehículo</title>
        <Navbar />
        <main><PageLoader fullScreen={false} label="Cargando servicio…" /></main>
      </div>
    );
  }

  if (!service) {
    // Publicación borrada o link mal escrito: misma 404 que el resto del sitio
    if (result.error?.status === 404) return <NotFound />;
    return (
      <div className={styles.page}>
        <title>Error al cargar | Mi Vehículo</title>
        <meta name="robots" content="noindex" />
        <Navbar />
        <main className={styles.centerMsg}>
          <div className={styles.notFoundCard} role="alert">
            <h1>No pudimos cargar el servicio</h1>
            <p>Revisá tu conexión e intentá de nuevo.</p>
            <button type="button" onClick={() => setReloadTick((t) => t + 1)}>Reintentar</button>
          </div>
        </main>
      </div>
    );
  }

  const images  = (service.images || []).map((i) => i.url).filter(Boolean);
  const gallery = images.length > 0 ? images : [NO_PHOTO];

  const prevImage = () => setSelectedIndex((p) => (p === 0 ? gallery.length - 1 : p - 1));
  const nextImage = () => setSelectedIndex((p) => (p === gallery.length - 1 ? 0 : p + 1));

  const typeLabel = serviceTypeLabel(service.serviceType);
  const hasPrice  = Number(service.price) > 0;
  const priceText = hasPrice ? formatUSD(service.price) : "A convenir";
  // "Desde" va antes del precio; el resto ("Por hora"…) después
  const noteBefore = hasPrice && service.priceNote === "Desde";
  const noteAfter  = hasPrice && service.priceNote && !noteBefore ? service.priceNote.toLowerCase() : "";

  // Nunca mostrar el email del vendedor como nombre público
  const rawName        = service.contactName || service.seller?.fullName || "";
  const sellerName     = rawName && !rawName.includes("@") ? rawName : "Proveedor del servicio";
  const sellerInitials = sellerName.split(/\s+/).slice(0, 2).map((w) => w[0]).join("").toUpperCase();

  // Sin sesión el teléfono llega en null; contactAvailable dice si hay uno para mostrar
  // normalizeSvPhone agrega el +503 si vino solo el número local
  const phoneDigits  = String(normalizeSvPhone(service.contactPhone) || "").replace(/\D/g, "");
  const canAskLogin  = !user && service.contactAvailable === true;
  const whatsappHref = phoneDigits
    ? `https://wa.me/${phoneDigits}?text=${encodeURIComponent(`Hola, vi tu servicio "${service.title}" en Mi Vehículo`)}`
    : null;
  const telHref      = phoneDigits ? `tel:+${phoneDigits}` : null;

  const city     = service.city?.name;
  const province = service.city?.province?.name;
  const place    = [service.address, city, province].filter(Boolean).join(", ");
  const website  = service.website ? safeWebsite(service.website) : null;

  const seoDesc = (service.description
    ? service.description.replace(/\s+/g, " ").trim()
    : `${service.title}: ${typeLabel} en El Salvador.`
  ).slice(0, 160);

  return (
    <div className={styles.page}>
      <title>{`${service.title} – ${typeLabel} | Mi Vehículo`}</title>
      <meta name="description" content={seoDesc} />
      <Navbar />
      <main className={styles.main}>
        <div className={styles.container}>

          <nav className={styles.breadcrumbs} aria-label="Migas de pan">
            <Link to="/">Inicio</Link>
            <span aria-hidden="true">›</span>
            <Link to="/productos?tipo=servicios">Servicios</Link>
            <span aria-hidden="true">›</span>
            <span aria-current="page">{service.title}</span>
          </nav>

          <button type="button" className={styles.backBtn} onClick={() => navigate("/productos?tipo=servicios")}>
            <ArrowLeft size={16} aria-hidden="true" /> <span>Volver</span>
          </button>

          <div className={styles.layout}>
            {/* Galería */}
            <div className={styles.galleryCol}>
              <div className={styles.mainImageWrap}>
                <img src={gallery[selectedIndex]} alt={service.title} className={styles.mainImage} />
                {gallery.length > 1 && (
                  <>
                    <button className={`${styles.arrow} ${styles.arrowLeft}`} onClick={prevImage} type="button" aria-label="Foto anterior">
                      <ChevronLeft size={20} aria-hidden="true" />
                    </button>
                    <button className={`${styles.arrow} ${styles.arrowRight}`} onClick={nextImage} type="button" aria-label="Foto siguiente">
                      <ChevronRight size={20} aria-hidden="true" />
                    </button>
                    <div className={styles.counter} aria-live="polite">{selectedIndex + 1} / {gallery.length}</div>
                  </>
                )}
              </div>
              {gallery.length > 1 && (
                <div className={styles.thumbRow}>
                  {gallery.map((img, i) => (
                    <button
                      key={i}
                      className={`${styles.thumb} ${i === selectedIndex ? styles.thumbActive : ""}`}
                      onClick={() => setSelectedIndex(i)}
                      type="button"
                      aria-label={`Ver foto ${i + 1} de ${gallery.length}`}
                      aria-current={i === selectedIndex ? "true" : undefined}
                    >
                      <img src={img} alt="" loading="lazy" decoding="async" />
                    </button>
                  ))}
                </div>
              )}

              {service.description && (
                <div className={styles.card}>
                  <h2>Descripción</h2>
                  <p className={styles.description}>{service.description}</p>
                </div>
              )}

              {(place || service.contactHours || website) && (
                <div className={styles.card}>
                  <h2>Datos del servicio</h2>
                  <ul className={styles.infoList}>
                    {place && <li><MapPin size={16} aria-hidden="true" /><span>{place}</span></li>}
                    {service.contactHours && (
                      <li><Clock size={16} aria-hidden="true" /><span>Horario de contacto: {service.contactHours}</span></li>
                    )}
                    {website && (
                      <li>
                        <Globe size={16} aria-hidden="true" />
                        <a href={website} target="_blank" rel="noopener noreferrer nofollow">
                          {website.replace(/^https?:\/\//, "").replace(/\/$/, "")}
                        </a>
                      </li>
                    )}
                  </ul>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <aside className={styles.sidebar}>
              <div className={styles.priceCard}>
                <div className={styles.badges}>
                  <span className={styles.badgeCat}>{typeLabel}</span>
                </div>

                <h1 className={styles.productTitle}>{service.title}</h1>
                <strong className={`${styles.price} ${hasPrice ? "" : styles.priceConvenir}`}>
                  {noteBefore && <span className={styles.priceNote}>Desde </span>}
                  {priceText}
                  {noteAfter && <span className={styles.priceNote}>{noteAfter}</span>}
                </strong>

                {city && <p className={styles.stock}>{city}{province ? `, ${province}` : ""}</p>}

                <div className={styles.sellerTag}>
                  <Shield size={14} aria-hidden="true" />
                  <span>Proveedor registrado</span>
                </div>
              </div>

              <div className={styles.sellerCard}>
                <div className={styles.sellerHeader}>
                  <div className={styles.sellerAvatar} aria-hidden="true">{sellerInitials}</div>
                  <div>
                    <span className={styles.sellerLabel}>Contacto</span>
                    <p className={styles.sellerName}>{sellerName}</p>
                  </div>
                </div>
                {canAskLogin && (
                  <Link to={loginHref(location.pathname)} className={styles.contactPrimary}>
                    <LogIn size={16} aria-hidden="true" /> Iniciá sesión para contactar
                  </Link>
                )}
                {user && whatsappHref && (
                  <a href={whatsappHref} target="_blank" rel="noreferrer" className={styles.contactWhatsapp}>
                    <MessageCircle size={16} aria-hidden="true" /> WhatsApp
                  </a>
                )}
                {user && telHref && (
                  <a href={telHref} className={styles.contactTel}>
                    <Phone size={16} aria-hidden="true" /> Llamar al {formatSvPhone(service.contactPhone)}
                  </a>
                )}
                {!service.contactAvailable && !phoneDigits && (
                  <p className={styles.noContact}>Este proveedor no publicó un teléfono de contacto.</p>
                )}
                <Link to="/contacto" className={styles.contactLink}>
                  Contactar a soporte
                </Link>
              </div>
            </aside>
          </div>

        </div>
      </main>
    </div>
  );
};

export default ServicioDetalle;
