import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, ChevronLeft, ChevronRight, LogIn, MessageCircle, Shield } from "lucide-react";
import Navbar from "../../components/Navbar/Navbar";
import PageLoader from "../../components/PageLoader/PageLoader";
import NotFound from "../NotFound/NotFound";
import { api } from "../../lib/api";
import { formatUSD, NO_PHOTO } from "../../lib/vehicleImage";
import { loginHref } from "../../lib/redirect";
import { useAuth } from "../../context/AuthContext";
import styles from "./ProductoDetalle.module.css";

const ProductoDetalle = () => {
  const { slug }  = useParams();
  const navigate  = useNavigate();
  const location  = useLocation();
  const { user }  = useAuth();

  const [result, setResult] = useState({ key: null, product: null, error: null });
  const [reloadTick, setReloadTick] = useState(0);
  // Índice de foto ligado al slug: al cambiar de producto vuelve a 0
  const [selected, setSelected] = useState({ slug, index: 0 });
  // Con sesión el detalle trae el WhatsApp: se vuelve a pedir al loguearse
  const reqKey = `${slug}#${reloadTick}#${user?.id || ""}`;

  useEffect(() => {
    let ignore = false;
    api.get(`/products/${slug}/detail`)
      .then((res) => { if (!ignore) setResult({ key: reqKey, product: res.data, error: null }); })
      .catch((error) => { if (!ignore) setResult({ key: reqKey, product: null, error }); });
    return () => { ignore = true; };
  }, [slug, reqKey]);

  const loading = result.key !== reqKey;
  const product = loading ? null : result.product;
  const selectedIndex = selected.slug === slug ? selected.index : 0;
  const setSelectedIndex = (fn) =>
    setSelected({ slug, index: typeof fn === "function" ? fn(selectedIndex) : fn });

  if (loading) {
    return (
      <div className={styles.page}>
        <title>Cargando producto… | Mi Vehículo</title>
        <Navbar />
        <main><PageLoader fullScreen={false} label="Cargando producto…" /></main>
      </div>
    );
  }

  if (!product) {
    const notFound = result.error?.status === 404;
    // Publicación borrada o link mal escrito: misma 404 que el resto del sitio
    if (notFound) return <NotFound />;
    return (
      <div className={styles.page}>
        <title>{notFound ? "Producto no encontrado | Mi Vehículo" : "Error al cargar | Mi Vehículo"}</title>
        <meta name="robots" content="noindex" />
        <Navbar />
        <main className={styles.centerMsg}>
          <div className={styles.notFoundCard} role={notFound ? undefined : "alert"}>
            {notFound ? (
              <>
                <h1>Producto no encontrado</h1>
                <p>La publicación que buscás no existe o fue removida.</p>
                <button type="button" onClick={() => navigate("/productos")}>Volver a productos</button>
              </>
            ) : (
              <>
                <h1>No pudimos cargar el producto</h1>
                <p>Revisá tu conexión e intentá de nuevo.</p>
                <button type="button" onClick={() => setReloadTick((t) => t + 1)}>Reintentar</button>
              </>
            )}
          </div>
        </main>
      </div>
    );
  }

  const images  = (product.images || []).map((i) => i.url).filter(Boolean);
  const gallery = images.length > 0 ? images : [NO_PHOTO];

  const prevImage = () => setSelectedIndex((p) => (p === 0 ? gallery.length - 1 : p - 1));
  const nextImage = () => setSelectedIndex((p) => (p === gallery.length - 1 ? 0 : p + 1));

  // Nunca mostrar el email del vendedor como nombre público
  const rawName        = product.seller?.fullName || "";
  const sellerName     = rawName && !rawName.includes("@") ? rawName : "Vendedor particular";
  const sellerInitials = sellerName.split(/\s+/).slice(0, 2).map((w) => w[0]).join("").toUpperCase();

  // Sin sesión el WhatsApp llega en null; contactAvailable dice si hay uno para mostrar
  const whatsappDigits = String(product.whatsapp || product.contactPhone || "").replace(/\D/g, "");
  const canAskLogin    = !user && product.contactAvailable !== false;
  const whatsappHref   = whatsappDigits
    ? `https://wa.me/${whatsappDigits}?text=${encodeURIComponent(`Hola, vi tu publicación de ${product.title} en Mi Vehículo`)}`
    : null;

  const seoDesc = (product.description
    ? product.description.replace(/\s+/g, " ").trim()
    : `${product.title} en venta en El Salvador. Precio: ${formatUSD(product.price)}.`
  ).slice(0, 160);

  return (
    <div className={styles.page}>
      <title>{`${product.title} – ${formatUSD(product.price)} | Mi Vehículo`}</title>
      <meta name="description" content={seoDesc} />
      <Navbar />
      <main className={styles.main}>
        <div className={styles.container}>

          <nav className={styles.breadcrumbs} aria-label="Migas de pan">
            <Link to="/">Inicio</Link>
            <span aria-hidden="true">›</span>
            <Link to="/productos">Repuestos y Accesorios</Link>
            <span aria-hidden="true">›</span>
            <span aria-current="page">{product.title}</span>
          </nav>

          <button type="button" className={styles.backBtn} onClick={() => navigate("/productos")}>
            <ArrowLeft size={16} aria-hidden="true" /> <span>Volver</span>
          </button>

          <div className={styles.layout}>
            {/* Gallery */}
            <div className={styles.galleryCol}>
              <div className={styles.mainImageWrap}>
                <img src={gallery[selectedIndex]} alt={product.title} className={styles.mainImage} />
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

              {product.description && (
                <div className={styles.card}>
                  <h2>Descripción</h2>
                  <p className={styles.description}>{product.description}</p>
                </div>
              )}

              {product.compatibilities?.length > 0 && (
                <div className={styles.card}>
                  <h2>Compatibilidad</h2>
                  <div className={styles.compatGrid}>
                    {product.compatibilities.map((c) => (
                      <div key={c.id} className={styles.compatRow}>
                        <strong>{c.brand?.name} {c.model?.name}</strong>
                        <span>{[c.fromYear, c.toYear].filter(Boolean).join(" – ")}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <aside className={styles.sidebar}>
              <div className={styles.priceCard}>
                <div className={styles.badges}>
                  <span className={`${styles.badge} ${product.condition === "NEW" ? styles.badgeNew : styles.badgeUsed}`}>
                    {product.condition === "NEW" ? "Nuevo" : "Usado"}
                  </span>
                  {product.category && (
                    <span className={styles.badgeCat}>{product.category.name}</span>
                  )}
                </div>

                <h1 className={styles.productTitle}>{product.title}</h1>
                <strong className={styles.price}>{formatUSD(product.price)}</strong>

                {product.stock > 0 && (
                  <p className={styles.stock}>{product.stock} en stock</p>
                )}

                <div className={styles.sellerTag}>
                  <Shield size={14} aria-hidden="true" />
                  <span>Vendedor registrado</span>
                </div>
              </div>

              <div className={styles.sellerCard}>
                <div className={styles.sellerHeader}>
                  <div className={styles.sellerAvatar} aria-hidden="true">{sellerInitials}</div>
                  <div>
                    <span className={styles.sellerLabel}>Vendedor</span>
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

export default ProductoDetalle;
