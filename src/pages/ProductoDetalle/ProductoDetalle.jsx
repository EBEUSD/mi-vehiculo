import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { FiArrowLeft, FiChevronLeft, FiChevronRight, FiShield } from "react-icons/fi";
import { FaWhatsapp } from "react-icons/fa";
import Navbar from "../../components/Navbar/Navbar";
import { api } from "../../lib/api";
import styles from "./ProductoDetalle.module.css";

const PLACEHOLDER = "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&auto=format&fit=crop";
const formatUSD   = (p) => `$${new Intl.NumberFormat("en-US").format(Number(p))}`;

const ProductoDetalle = () => {
  const { slug }  = useParams();
  const navigate  = useNavigate();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);

  useEffect(() => {
    setLoading(true);
    setNotFound(false);
    setSelectedIndex(0);

    api.get(`/products/${slug}/detail`)
      .then((res) => setProduct(res.data))
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <div className={styles.page}>
        <Navbar />
        <main className={styles.centerMsg}><p>Cargando…</p></main>
      </div>
    );
  }

  if (notFound || !product) {
    return (
      <div className={styles.page}>
        <Navbar />
        <main className={styles.centerMsg}>
          <div className={styles.notFoundCard}>
            <h1>Producto no encontrado</h1>
            <p>La publicación que buscás no existe o fue removida.</p>
            <button onClick={() => navigate("/productos")}>Volver a productos</button>
          </div>
        </main>
      </div>
    );
  }

  const images  = (product.images || []).map((i) => i.url);
  const gallery = images.length > 0 ? images : [PLACEHOLDER];

  const prevImage = () => setSelectedIndex((p) => (p === 0 ? gallery.length - 1 : p - 1));
  const nextImage = () => setSelectedIndex((p) => (p === gallery.length - 1 ? 0 : p + 1));

  const sellerName     = product.seller?.fullName || product.seller?.email || "Vendedor";
  const sellerInitials = sellerName.slice(0, 2).toUpperCase();

  return (
    <div className={styles.page}>
      <Navbar />
      <main className={styles.main}>
        <div className={styles.container}>

          <nav className={styles.breadcrumbs}>
            <Link to="/">Inicio</Link>
            <span>›</span>
            <Link to="/productos">Repuestos y Accesorios</Link>
            <span>›</span>
            <span>{product.title}</span>
          </nav>

          <button className={styles.backBtn} onClick={() => navigate("/productos")}>
            <FiArrowLeft /> <span>Volver</span>
          </button>

          <div className={styles.layout}>
            {/* Gallery */}
            <div className={styles.galleryCol}>
              <div className={styles.mainImageWrap}>
                <img src={gallery[selectedIndex]} alt={product.title} className={styles.mainImage} />
                {gallery.length > 1 && (
                  <>
                    <button className={`${styles.arrow} ${styles.arrowLeft}`} onClick={prevImage} type="button">
                      <FiChevronLeft />
                    </button>
                    <button className={`${styles.arrow} ${styles.arrowRight}`} onClick={nextImage} type="button">
                      <FiChevronRight />
                    </button>
                    <div className={styles.counter}>{selectedIndex + 1} / {gallery.length}</div>
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
                    >
                      <img src={img} alt={`${product.title} ${i + 1}`} />
                    </button>
                  ))}
                </div>
              )}

              {product.description && (
                <div className={styles.card}>
                  <h3>Descripción</h3>
                  <p style={{ whiteSpace: "pre-line", color: "#374151", lineHeight: 1.6 }}>{product.description}</p>
                </div>
              )}

              {product.compatibilities?.length > 0 && (
                <div className={styles.card}>
                  <h3>Compatibilidad</h3>
                  <div className={styles.compatGrid}>
                    {product.compatibilities.map((c) => (
                      <div key={c.id} className={styles.compatRow}>
                        <strong>{c.brand?.name} {c.model?.name}</strong>
                        <span>{c.fromYear} – {c.toYear}</span>
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
                  <FiShield size={14} />
                  <span>Vendedor registrado</span>
                </div>
              </div>

              <div className={styles.sellerCard}>
                <div className={styles.sellerHeader}>
                  <div className={styles.sellerAvatar}>{sellerInitials}</div>
                  <div>
                    <span className={styles.sellerLabel}>Vendedor</span>
                    <h3 className={styles.sellerName}>{sellerName}</h3>
                  </div>
                </div>
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
