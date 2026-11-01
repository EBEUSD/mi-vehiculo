import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import Navbar from "../../components/Navbar/Navbar";
import Pagination from "../../components/Pagination/Pagination";
import { api } from "../../lib/api";
import { SERVICE_TYPES } from "../../lib/categories";
import { formatUSD, primaryImage } from "../../lib/vehicleImage";
import styles from "./Productos.module.css";

const API_PAGE_SIZE = 50;   // páginas que se piden al backend
const MAX_API_PAGES = 10;   // tope de seguridad (500 productos)
const PAGE_SIZE     = 24;   // productos por página en pantalla

const mapProduct = (p) => ({
  id:        p.id,
  slug:      p.slug,
  title:     p.title || "",
  price:     p.price || 0,
  currency:  p.currency || "USD",
  condition: p.condition,
  category:  p.category?.name || "",
  seller:    p.seller?.fullName && !p.seller.fullName.includes("@") ? p.seller.fullName : "",
  image:     primaryImage(p.images),
});

const TABS = [
  { key: "todos",      label: "Todos" },
  { key: "repuestos",  label: "Repuestos" },
  { key: "accesorios", label: "Accesorios" },
  { key: "servicios",  label: "Servicios" },
  { key: "otros",      label: "Otros" },
];

const TAB_TITLES = {
  todos: "Repuestos y Accesorios",
  repuestos: "Repuestos",
  accesorios: "Accesorios",
  servicios: "Servicios automotrices",
  otros: "Otros productos",
};

const REPUESTO_CATS = new Set([
  "Motor", "Frenos", "Suspensión", "Dirección", "Transmisión",
  "Carrocería", "Sistema eléctrico", "Enfriamiento", "Escape", "Neumáticos y rines",
]);
const SERVICIO_CATS = new Set([...SERVICE_TYPES, "Servicios"]);
const ACCESORIO_CATS = new Set([
  "Audio y multimedia", "Rines y llantas", "Iluminación", "Exterior", "Interior",
  "Seguridad", "Cuidado y limpieza", "Tapicería", "Mecánica de rendimiento",
]);

// Cada categoría cae en una sola pestaña ("Otro" y desconocidas → Otros)
const tabOf = (category) =>
  REPUESTO_CATS.has(category)  ? "repuestos"  :
  ACCESORIO_CATS.has(category) ? "accesorios" :
  SERVICIO_CATS.has(category)  ? "servicios"  :
  "otros";

/* La API no filtra por texto ni por grupo de categorías, así que se recorren
   las páginas del listado (paginado) y las pestañas/búsqueda se aplican acá. */
const fetchAllProducts = async () => {
  const first = await api.get(`/products?page=1&limit=${API_PAGE_SIZE}`);
  const rows = [...(first.data || [])];
  const totalPages = Math.min(first.meta?.totalPages || 1, MAX_API_PAGES);
  for (let page = 2; page <= totalPages; page++) {
    const res = await api.get(`/products?page=${page}&limit=${API_PAGE_SIZE}`);
    rows.push(...(res.data || []));
  }
  return rows;
};

const Productos = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [result, setResult] = useState({ key: null, products: [], error: null });
  const [reloadTick, setReloadTick] = useState(0);
  const [search, setSearch] = useState("");

  const tipoRaw = searchParams.get("tipo") || "todos";
  const tipo    = TABS.some((t) => t.key === tipoRaw) ? tipoRaw : "todos";
  const pageRaw = parseInt(searchParams.get("page") || "1", 10);
  const page    = Number.isFinite(pageRaw) && pageRaw > 0 ? pageRaw : 1;

  const setTipo = (t) => setSearchParams(t === "todos" ? {} : { tipo: t }, { replace: true });
  const setPage = (p) => {
    const next = new URLSearchParams(searchParams);
    next.set("page", String(p));
    setSearchParams(next);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  useEffect(() => {
    let ignore = false;
    fetchAllProducts()
      .then((rows) => { if (!ignore) setResult({ key: reloadTick, products: rows.map(mapProduct), error: null }); })
      .catch((error) => { if (!ignore) setResult({ key: reloadTick, products: [], error }); });
    return () => { ignore = true; };
  }, [reloadTick]);

  const loading = result.key !== reloadTick;

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return result.products.filter((p) => {
      const matchSearch = !q || p.title.toLowerCase().includes(q) || p.category.toLowerCase().includes(q);
      const matchTipo = tipo === "todos" || tabOf(p.category) === tipo;
      return matchSearch && matchTipo;
    });
  }, [result.products, search, tipo]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const visible = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const heading = TAB_TITLES[tipo];

  return (
    <div className={styles.page}>
      <title>{`${heading} en El Salvador | Mi Vehículo`}</title>
      <meta
        name="description"
        content={`${heading} para tu vehículo en El Salvador: compará precios y contactá vendedores en Mi Vehículo.`}
      />

      <Navbar />
      <main className={styles.main}>
        <div className={styles.container}>

          <div className={styles.header}>
            <div>
              <h1>{heading}</h1>
              {!loading && !result.error && (
                <p aria-live="polite">
                  {filtered.length.toLocaleString("es-SV")} producto{filtered.length !== 1 ? "s" : ""} disponible{filtered.length !== 1 ? "s" : ""}
                </p>
              )}
            </div>
            <div className={styles.searchWrap}>
              <input
                type="search"
                placeholder="Buscar productos…"
                aria-label="Buscar productos"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  // Nueva búsqueda vuelve a la primera página
                  if (searchParams.has("page")) {
                    const next = new URLSearchParams(searchParams);
                    next.delete("page");
                    setSearchParams(next, { replace: true });
                  }
                }}
                className={styles.searchInput}
              />
            </div>
          </div>

          <div className={styles.tabs} role="tablist" aria-label="Tipo de producto">
            {TABS.map((t) => (
              <button
                key={t.key}
                type="button"
                role="tab"
                aria-selected={tipo === t.key}
                className={`${styles.tab} ${tipo === t.key ? styles.tabActive : ""}`}
                onClick={() => setTipo(t.key)}
              >
                {t.label}
              </button>
            ))}
          </div>

          {loading ? (
            <p className={styles.msg} role="status">Cargando productos…</p>
          ) : result.error ? (
            <div className={styles.msg} role="alert">
              <p>No pudimos cargar los productos.</p>
              <button type="button" className={styles.retryBtn} onClick={() => setReloadTick((t) => t + 1)}>
                Reintentar
              </button>
            </div>
          ) : visible.length === 0 ? (
            <p className={styles.msg}>No hay productos disponibles.</p>
          ) : (
            <>
              <div className={styles.grid}>
                {visible.map((p) => (
                  <article key={p.id} className={styles.card}>
                    <Link to={`/producto/${p.slug}`} className={styles.cardLink}>
                      <div className={styles.imageWrap}>
                        <img src={p.image} alt={p.title} loading="lazy" decoding="async" />
                        <span className={`${styles.badge} ${p.condition === "NEW" ? styles.badgeNew : styles.badgeUsed}`}>
                          {p.condition === "NEW" ? "Nuevo" : "Usado"}
                        </span>
                      </div>
                      <div className={styles.info}>
                        {p.category && <span className={styles.category}>{p.category}</span>}
                        <h2 className={styles.title}>{p.title}</h2>
                        <strong className={styles.price}>{formatUSD(p.price)}</strong>
                        {p.seller && <span className={styles.seller}>{p.seller}</span>}
                      </div>
                    </Link>
                  </article>
                ))}
              </div>
              <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setPage} />
            </>
          )}

        </div>
      </main>
    </div>
  );
};

export default Productos;
