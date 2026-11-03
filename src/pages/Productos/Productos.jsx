import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import Navbar from "../../components/Navbar/Navbar";
import Pagination from "../../components/Pagination/Pagination";
import { api } from "../../lib/api";
import { SERVICE_TYPE_OPTIONS, serviceTypeLabel } from "../../lib/categories";
import { formatUSD, primaryImage } from "../../lib/vehicleImage";
import styles from "./Productos.module.css";

const API_PAGE_SIZE = 50;   // páginas que se piden al backend
const MAX_API_PAGES = 10;   // tope de seguridad (500 productos)
const PAGE_SIZE     = 24;   // productos/servicios por página en pantalla
const SEARCH_DELAY  = 350;  // debounce del buscador (ms)
const MIN_SEARCH    = 2;    // largo mínimo para buscar en el servidor

const sellerName = (name) => (name && !name.includes("@") ? name : "");

const mapProduct = (p) => ({
  id:        p.id,
  slug:      p.slug,
  href:      `/producto/${p.slug}`,
  title:     p.title || "",
  price:     p.price || 0,
  currency:  p.currency || "USD",
  condition: p.condition,
  category:  p.category?.name || "",
  seller:    sellerName(p.seller?.fullName),
  image:     primaryImage(p.images),
});

const mapService = (s) => ({
  id:        s.id,
  slug:      s.slug,
  href:      `/servicio/${s.slug}`,
  title:     s.title || "",
  price:     Number(s.price) > 0 ? Number(s.price) : null,
  priceNote: s.priceNote || "",
  category:  serviceTypeLabel(s.serviceType),
  seller:    sellerName(s.contactName || s.seller?.fullName) || s.city?.name || "",
  image:     primaryImage(s.images),
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
const ACCESORIO_CATS = new Set([
  "Audio y multimedia", "Rines y llantas", "Iluminación", "Exterior", "Interior",
  "Seguridad", "Cuidado y limpieza", "Tapicería", "Mecánica de rendimiento",
]);

// Cada categoría cae en una sola pestaña ("Otro" y desconocidas → Otros)
const tabOf = (category) =>
  REPUESTO_CATS.has(category)  ? "repuestos"  :
  ACCESORIO_CATS.has(category) ? "accesorios" :
  "otros";

/* La búsqueda (`q`) la hace el servidor; la API no filtra por grupo de categorías,
   así que se recorren las páginas del listado y las pestañas se aplican acá. */
const fetchAllProducts = async (q) => {
  const qs = q ? `&q=${encodeURIComponent(q)}` : "";
  const first = await api.get(`/products?page=1&limit=${API_PAGE_SIZE}${qs}`);
  const rows = [...(first.data || [])];
  const totalPages = Math.min(first.meta?.totalPages || 1, MAX_API_PAGES);
  for (let page = 2; page <= totalPages; page++) {
    const res = await api.get(`/products?page=${page}&limit=${API_PAGE_SIZE}${qs}`);
    rows.push(...(res.data || []));
  }
  return rows.map(mapProduct);
};

// Servicios: paginado en el servidor
const fetchServices = async ({ q, serviceType, page }) => {
  const params = new URLSearchParams({ page: String(page), limit: String(PAGE_SIZE) });
  if (q) params.set("q", q);
  if (serviceType) params.set("serviceType", serviceType);
  const res = await api.get(`/services?${params}`);
  const rows = (res.data || []).map(mapService);
  return {
    rows,
    total:      res.meta?.total ?? rows.length,
    totalPages: res.meta?.totalPages || 1,
  };
};

const Productos = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [result, setResult] = useState({ key: null, items: [], total: 0, totalPages: 1, error: null });
  const [reloadTick, setReloadTick] = useState(0);
  const [search, setSearch] = useState("");
  const [debounced, setDebounced] = useState("");

  const tipoRaw = searchParams.get("tipo") || "todos";
  const tipo    = TABS.some((t) => t.key === tipoRaw) ? tipoRaw : "todos";
  const pageRaw = parseInt(searchParams.get("page") || "1", 10);
  const page    = Number.isFinite(pageRaw) && pageRaw > 0 ? pageRaw : 1;
  const isServicios  = tipo === "servicios";
  const serviceRaw   = searchParams.get("serviceType") || "";
  const serviceType  = SERVICE_TYPE_OPTIONS.some((o) => o.value === serviceRaw) ? serviceRaw : "";

  const setTipo = (t) => setSearchParams(t === "todos" ? {} : { tipo: t }, { replace: true });
  const setPage = (p) => {
    const next = new URLSearchParams(searchParams);
    next.set("page", String(p));
    setSearchParams(next);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  const setServiceType = (value) => {
    const next = new URLSearchParams(searchParams);
    if (value) next.set("serviceType", value); else next.delete("serviceType");
    next.delete("page");
    setSearchParams(next, { replace: true });
  };

  // Debounce: el servidor busca recién cuando se deja de tipear
  useEffect(() => {
    const t = setTimeout(() => setDebounced(search.trim()), SEARCH_DELAY);
    return () => clearTimeout(t);
  }, [search]);
  const q = debounced.length >= MIN_SEARCH ? debounced : "";

  // Productos: las pestañas filtran en el cliente, no hace falta volver a pedir
  const reqKey = isServicios
    ? `s#${reloadTick}#${q}#${serviceType}#${page}`
    : `p#${reloadTick}#${q}`;

  useEffect(() => {
    let ignore = false;
    const load = isServicios
      ? fetchServices({ q, serviceType, page })
      : fetchAllProducts(q).then((rows) => ({ rows, total: rows.length, totalPages: 1 }));
    load
      .then(({ rows, total, totalPages }) => {
        if (!ignore) setResult({ key: reqKey, items: rows, total, totalPages, error: null });
      })
      .catch((error) => { if (!ignore) setResult({ key: reqKey, items: [], total: 0, totalPages: 1, error }); });
    return () => { ignore = true; };
  }, [reqKey, isServicios, q, serviceType, page]);

  const loading = result.key !== reqKey;

  const filtered = useMemo(() => {
    if (isServicios) return result.items;
    return result.items.filter((p) => tipo === "todos" || tabOf(p.category) === tipo);
  }, [result.items, tipo, isServicios]);

  const totalPages  = isServicios ? result.totalPages : Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const visible     = isServicios ? filtered : filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);
  const count       = isServicios ? result.total : filtered.length;
  const noun        = isServicios ? "servicio" : "producto";

  const heading = TAB_TITLES[tipo];

  return (
    <div className={styles.page}>
      <title>{`${heading} en El Salvador | Mi Vehículo`}</title>
      <meta
        name="description"
        content={isServicios
          ? "Talleres, grúas, detailing, trámites y más servicios para tu vehículo en El Salvador en Mi Vehículo."
          : `${heading} para tu vehículo en El Salvador: compará precios y contactá vendedores en Mi Vehículo.`}
      />

      <Navbar />
      <main className={styles.main}>
        <div className={styles.container}>

          <div className={styles.header}>
            <div>
              <h1>{heading}</h1>
              {!loading && !result.error && (
                <p aria-live="polite">
                  {count.toLocaleString("es-SV")} {noun}{count !== 1 ? "s" : ""} disponible{count !== 1 ? "s" : ""}
                </p>
              )}
            </div>
            <div className={styles.searchWrap} style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
              {isServicios && (
                <select
                  aria-label="Tipo de servicio"
                  value={serviceType}
                  onChange={(e) => setServiceType(e.target.value)}
                  className={styles.searchInput}
                >
                  <option value="">Todos los servicios</option>
                  {SERVICE_TYPE_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              )}
              <input
                type="search"
                placeholder={isServicios ? "Buscar servicios…" : "Buscar productos…"}
                aria-label={isServicios ? "Buscar servicios" : "Buscar productos"}
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
            <p className={styles.msg} role="status">Cargando {noun}s…</p>
          ) : result.error ? (
            <div className={styles.msg} role="alert">
              <p>No pudimos cargar los {noun}s.</p>
              <button type="button" className={styles.retryBtn} onClick={() => setReloadTick((t) => t + 1)}>
                Reintentar
              </button>
            </div>
          ) : visible.length === 0 ? (
            <p className={styles.msg}>No hay {noun}s disponibles.</p>
          ) : (
            <>
              <div className={styles.grid}>
                {visible.map((p) => (
                  <article key={p.id} className={styles.card}>
                    <Link to={p.href} className={styles.cardLink}>
                      <div className={styles.imageWrap}>
                        <img src={p.image} alt={p.title} loading="lazy" decoding="async" />
                        {!isServicios && (
                          <span className={`${styles.badge} ${p.condition === "NEW" ? styles.badgeNew : styles.badgeUsed}`}>
                            {p.condition === "NEW" ? "Nuevo" : "Usado"}
                          </span>
                        )}
                      </div>
                      <div className={styles.info}>
                        {p.category && <span className={styles.category}>{p.category}</span>}
                        <h2 className={styles.title}>{p.title}</h2>
                        <strong className={styles.price}>
                          {isServicios
                            ? (p.price ? `${p.priceNote === "Desde" ? "Desde " : ""}${formatUSD(p.price)}` : "A convenir")
                            : formatUSD(p.price)}
                        </strong>
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
