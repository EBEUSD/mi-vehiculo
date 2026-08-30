import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import Navbar from "../../components/Navbar/Navbar";
import { api } from "../../lib/api";
import styles from "./Productos.module.css";

const PLACEHOLDER = "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&auto=format&fit=crop";
const formatUSD   = (p) => `$${new Intl.NumberFormat("en-US").format(Number(p))}`;

const mapProduct = (p) => ({
  id:        p.id,
  slug:      p.slug,
  title:     p.title,
  price:     p.price || 0,
  currency:  p.currency || "USD",
  condition: p.condition,
  category:  p.category?.name || "—",
  seller:    p.seller?.fullName || "—",
  image:     p.images?.find((i) => i.isPrimary)?.url || p.images?.[0]?.url || PLACEHOLDER,
});

const TABS = [
  { key: "todos",      label: "Todos" },
  { key: "repuestos",  label: "Repuestos" },
  { key: "accesorios", label: "Accesorios" },
];

const REPUESTO_CATS = new Set([
  "Motor", "Frenos", "Suspensión", "Dirección", "Transmisión",
  "Carrocería", "Sistema eléctrico", "Enfriamiento", "Escape", "Neumáticos y rines",
]);
const ACCESORIO_CATS = new Set([
  "Audio y multimedia", "Rines y llantas", "Iluminación", "Exterior", "Interior",
  "Seguridad", "Cuidado y limpieza", "Tapicería", "Mecánica de rendimiento",
]);

const Productos = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [search, setSearch]     = useState("");

  const tipo    = searchParams.get("tipo") || "todos";
  const setTipo = (t) => setSearchParams(t === "todos" ? {} : { tipo: t });

  useEffect(() => {
    setLoading(true);
    api.get("/products?limit=100")
      .then((res) => setProducts((res.data || []).map(mapProduct)))
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, []);

  const filtered = products.filter((p) => {
    const q = search.toLowerCase();
    const matchSearch = !q || p.title.toLowerCase().includes(q) || p.category.toLowerCase().includes(q);
    const matchTipo =
      tipo === "todos"      ? true :
      tipo === "repuestos"  ? (REPUESTO_CATS.has(p.category)  || p.category === "Otro") :
      tipo === "accesorios" ? (ACCESORIO_CATS.has(p.category) || p.category === "Otro") :
      true;
    return matchSearch && matchTipo;
  });

  return (
    <div className={styles.page}>
      <Navbar />
      <main className={styles.main}>
        <div className={styles.container}>

          <div className={styles.header}>
            <div>
              <h1>Repuestos y Accesorios</h1>
              <p>{filtered.length} producto{filtered.length !== 1 ? "s" : ""} disponible{filtered.length !== 1 ? "s" : ""}</p>
            </div>
            <div className={styles.searchWrap}>
              <input
                type="text"
                placeholder="Buscar productos…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className={styles.searchInput}
              />
            </div>
          </div>

          <div className={styles.tabs}>
            {TABS.map((t) => (
              <button
                key={t.key}
                className={`${styles.tab} ${tipo === t.key ? styles.tabActive : ""}`}
                onClick={() => setTipo(t.key)}
              >
                {t.label}
              </button>
            ))}
          </div>

          {loading ? (
            <p className={styles.msg}>Cargando productos…</p>
          ) : filtered.length === 0 ? (
            <p className={styles.msg}>No hay productos disponibles.</p>
          ) : (
            <div className={styles.grid}>
              {filtered.map((p) => (
                <article key={p.id} className={styles.card}>
                  <Link to={`/producto/${p.slug}`} className={styles.cardLink}>
                    <div className={styles.imageWrap}>
                      <img src={p.image} alt={p.title} />
                      <span className={`${styles.badge} ${p.condition === "NEW" ? styles.badgeNew : styles.badgeUsed}`}>
                        {p.condition === "NEW" ? "Nuevo" : "Usado"}
                      </span>
                    </div>
                    <div className={styles.info}>
                      <span className={styles.category}>{p.category}</span>
                      <h3 className={styles.title}>{p.title}</h3>
                      <strong className={styles.price}>{formatUSD(p.price)}</strong>
                      <span className={styles.seller}>{p.seller}</span>
                    </div>
                  </Link>
                </article>
              ))}
            </div>
          )}

        </div>
      </main>
    </div>
  );
};

export default Productos;
