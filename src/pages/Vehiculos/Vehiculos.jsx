import { useEffect, useId, useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { SlidersHorizontal } from "lucide-react";
import Navbar from "../../components/Navbar/Navbar";
import VehicleFiltersSidebar from "../../components/VehicleFiltersSidebar/VehicleFiltersSidebar";
import VehicleResultsToolbar from "../../components/VehicleResultsToolbar/VehicleResultsToolbar";
import VehicleGrid from "../../components/VehicleGrid/VehicleGrid";
import Pagination from "../../components/Pagination/Pagination";
import { api } from "../../lib/api";
import { catalogCache } from "../../lib/catalogCache";
import { findVehicleCategory, DEPARTAMENTOS, VEHICLE_CATEGORIES } from "../../lib/categories";
import { getPopularModels, mergeNames } from "../../lib/vehicleBrands";
import { attrValue, formatNumber, formatUSD, mapVehicleCard } from "../../lib/vehicleImage";
import styles from "./Vehiculos.module.css";

const ITEMS_PER_PAGE = 9;

// Orden soportado por GET /vehicles (orderBy). "Menor km" no existe en la API.
const SORT_TO_API = { recent: "newest", priceAsc: "price_asc", priceDesc: "price_desc" };

const norm = (s) => String(s || "").trim().toLowerCase();

// Número opcional de la URL: "" si falta o es inválido (vacío = sin filtro)
const numParam = (sp, key) => {
  const raw = sp.get(key);
  if (raw == null || raw === "") return "";
  const n = Number(raw);
  return Number.isFinite(n) && n >= 0 ? n : "";
};

const parseArray = (value) => (value ? value.split(",").filter(Boolean) : []);

const rangeLabel = (name, min, max, fmt = formatNumber) => {
  if (min !== "" && max !== "") return `${name}: ${fmt(min)} – ${fmt(max)}`;
  if (min !== "") return `${name} desde ${fmt(min)}`;
  return `${name} hasta ${fmt(max)}`;
};

const Vehiculos = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const drawerRef = useRef(null);
  const filterBtnRef = useRef(null);
  const drawerTitleId = useId();

  const filters = useMemo(() => ({
    // "categoria"/"busqueda": params viejos que todavía llegan desde algunos links
    type: findVehicleCategory(searchParams.get("type") || searchParams.get("categoria"))?.id || "",
    brand: searchParams.get("brand") || "",
    model: searchParams.get("model") || "",
    yearMin: numParam(searchParams, "yearMin"),
    yearMax: numParam(searchParams, "yearMax"),
    priceMin: numParam(searchParams, "priceMin"),
    priceMax: numParam(searchParams, "priceMax"),
    kmMin: numParam(searchParams, "kmMin"),
    kmMax: numParam(searchParams, "kmMax"),
    // La API filtra un solo valor por atributo: se toma el primero
    fuel: parseArray(searchParams.get("fuel"))[0] || "",
    transmission: parseArray(searchParams.get("transmission"))[0] || "",
    location: searchParams.get("location") || "",
    sellerType: parseArray(searchParams.get("sellerType")),
    operation: searchParams.get("operation") || "",
    q: (searchParams.get("q") || searchParams.get("busqueda") || "").trim(),
    condition: searchParams.get("condition") || "",
  }), [searchParams]);

  const sortBy = searchParams.get("sortBy") || "relevant";
  const pageRaw = parseInt(searchParams.get("page") || "1", 10);
  const currentPage = Number.isFinite(pageRaw) && pageRaw > 0 ? pageRaw : 1;
  const category = findVehicleCategory(filters.type);

  // ── Catálogos para resolver nombres → ids de la API ──
  const [brandsState, setBrandsState] = useState({ status: "loading", list: [] });
  const [brandsTick, setBrandsTick] = useState(0);

  useEffect(() => {
    let ignore = false;
    catalogCache.get("/catalog/brands")
      .then((list) => { if (!ignore) setBrandsState({ status: "ready", list: list || [] }); })
      .catch(() => { if (!ignore) setBrandsState({ status: "error", list: [] }); });
    return () => { ignore = true; };
  }, [brandsTick]);

  const retryBrands = () => {
    setBrandsState({ status: "loading", list: [] });
    setBrandsTick((t) => t + 1);
  };

  // Departamentos y atributos dinámicos (combustible, transmisión, operación)
  const [lookups, setLookups] = useState({ ready: false, provinces: null, attrDefs: null });

  useEffect(() => {
    let ignore = false;
    Promise.allSettled([
      catalogCache.get("/location/provinces"),
      catalogCache.get("/catalog/attribute-definitions"),
    ]).then(([prov, defs]) => {
      if (ignore) return;
      setLookups({
        ready: true,
        provinces: prov.status === "fulfilled" ? prov.value : null,
        attrDefs: defs.status === "fulfilled" ? defs.value : null,
      });
    });
    return () => { ignore = true; };
  }, []);

  const brandEntry = brandsState.status === "ready" && filters.brand
    ? brandsState.list.find((b) => norm(b.name) === norm(filters.brand))
    : null;
  const brandId = brandEntry?.id ?? null;

  // Modelos de la marca elegida (GET /catalog/brands/:id/models)
  const [modelsState, setModelsState] = useState({ brandId: null, list: [], error: false });

  useEffect(() => {
    if (!brandId) return;
    let ignore = false;
    catalogCache.get(`/catalog/brands/${brandId}/models`)
      .then((list) => { if (!ignore) setModelsState({ brandId, list: list || [], error: false }); })
      .catch(() => { if (!ignore) setModelsState({ brandId, list: [], error: true }); });
    return () => { ignore = true; };
  }, [brandId]);

  const modelsReady = brandId != null && modelsState.brandId === brandId;

  // ── Armado de la consulta: todo lo que la API soporta va al servidor ──
  const plan = useMemo(() => {
    const params = new URLSearchParams();
    const client = [];   // filtros que la API no tiene: se aplican sobre la página actual
    const ignored = [];  // filtros que no se pudieron aplicar
    let waiting = false;
    let impossible = false;
    let blocked = false;

    params.set("page", String(currentPage));
    params.set("limit", String(ITEMS_PER_PAGE));

    if (category?.api) params.set("category", category.api);
    if (filters.condition === "used") params.set("condition", "USED");
    if (filters.condition === "new") params.set("condition", "NEW");

    // Texto libre (mínimo 2 caracteres según la API)
    if (filters.q.length >= 2) params.set("q", filters.q);
    else if (filters.q) ignored.push("Búsqueda (mínimo 2 caracteres)");

    if (filters.brand) {
      if (brandsState.status === "loading") waiting = true;
      else if (brandsState.status === "error") blocked = true;
      else if (brandId) params.set("brandId", String(brandId));
      else impossible = true; // marca que no existe en el catálogo: no hay publicaciones
    }

    if (filters.model) {
      if (brandId) {
        if (!modelsReady) waiting = true;
        else if (modelsState.error) {
          client.push({ label: "Modelo", test: (r) => norm(r.model?.name).includes(norm(filters.model)) });
        } else {
          const m = modelsState.list.find((x) => norm(x.name) === norm(filters.model));
          if (m) params.set("modelId", String(m.id));
          else impossible = true;
        }
      } else if (!filters.brand) {
        // Sin marca no hay lista de modelos: se busca como texto
        if (!params.has("q") && filters.model.length >= 2) params.set("q", filters.model);
        else client.push({ label: "Modelo", test: (r) => norm(r.model?.name).includes(norm(filters.model)) });
      }
    }

    if (filters.priceMin !== "") params.set("minPrice", String(filters.priceMin));
    if (filters.priceMax !== "") params.set("maxPrice", String(filters.priceMax));
    if (filters.yearMin !== "") params.set("minYear", String(filters.yearMin));
    if (filters.yearMax !== "") params.set("maxYear", String(filters.yearMax));
    if (filters.kmMax !== "") params.set("maxMileage", String(filters.kmMax));
    // La API no tiene kilometraje mínimo
    if (filters.kmMin !== "") client.push({ label: "Km mínimo", test: (r) => (r.mileage ?? 0) >= filters.kmMin });

    if (filters.location) {
      if (!lookups.ready) waiting = true;
      else {
        const prov = lookups.provinces?.find((p) => norm(p.name) === norm(filters.location));
        if (prov) params.set("provinceId", String(prov.id));
        else client.push({ label: "Ubicación", test: (r) => norm(r.city?.province?.name) === norm(filters.location) });
      }
    }

    // Atributos dinámicos: attributes[definitionId]=valor
    // (se usa la primera definición que matchea, igual que al publicar)
    [
      ["fuel", "combustible", "Combustible"],
      ["transmission", "transm", "Transmisión"],
      ["operation", "operaci", "Tipo de operación"],
    ].forEach(([key, match, label]) => {
      if (!filters[key]) return;
      if (!lookups.ready) { waiting = true; return; }
      const def = lookups.attrDefs?.find((d) => d.name?.toLowerCase().includes(match));
      if (def) params.set(`attributes[${def.id}]`, filters[key]);
      else ignored.push(label);
    });

    // Tipo de vendedor / origen: la API no lo filtra. Solo se descarta lo que se sabe que no coincide.
    if (filters.sellerType.length > 0) {
      client.push({
        label: "Tipo de vendedor",
        test: (r) => {
          if (r.dealership === undefined && !r.attributes) return true;
          const types = [
            r.dealership ? "Agencia/Lote" : "Particular",
            attrValue(r, "origen").toLowerCase().startsWith("import") && "Importado",
          ].filter(Boolean);
          return filters.sellerType.some((t) => types.includes(t));
        },
      });
    }

    const apiSort = SORT_TO_API[sortBy];
    if (apiSort) params.set("orderBy", apiSort);

    return {
      query: params.toString(),
      client,
      ignored,
      waiting,
      impossible,
      blocked,
      clientSort: sortBy === "kmAsc",
    };
  }, [filters, category, currentPage, sortBy, brandsState, brandId, modelsReady, modelsState, lookups]);

  // ── Fetch del listado ──
  const [result, setResult] = useState({ key: null, rows: [], meta: null, error: null });
  const [reloadTick, setReloadTick] = useState(0);
  const fetchable = !plan.waiting && !plan.impossible && !plan.blocked;
  const query = plan.query;
  const reqKey = fetchable ? `${query}#${reloadTick}` : null;

  useEffect(() => {
    if (!reqKey) return;
    let ignore = false;
    api.get(`/vehicles?${query}`)
      .then((res) => { if (!ignore) setResult({ key: reqKey, rows: res.data || [], meta: res.meta || null, error: null }); })
      .catch((error) => { if (!ignore) setResult({ key: reqKey, rows: [], meta: null, error }); });
    return () => { ignore = true; };
  }, [reqKey, query]);

  const loading = plan.waiting || (fetchable && result.key !== reqKey);
  const loadError = !loading && (plan.blocked || (fetchable && result.error));

  const displayListings = useMemo(() => {
    if (plan.impossible || !fetchable || result.key !== reqKey) return [];
    const rows = result.rows.filter((r) => plan.client.every((c) => c.test(r)));
    const cards = rows.map(mapVehicleCard);
    if (plan.clientSort) cards.sort((a, b) => (a.km ?? Infinity) - (b.km ?? Infinity));
    return cards;
  }, [plan, fetchable, result, reqKey]);

  const serverTotal = plan.impossible ? 0 : result.meta?.total ?? displayListings.length;
  const serverTotalPages = plan.impossible
    ? 1
    : result.meta?.totalPages ?? Math.max(1, Math.ceil(serverTotal / ITEMS_PER_PAGE));
  // Filtros u orden aplicados solo en esta página: el total del servidor no es exacto
  const partial = plan.client.length > 0 || plan.clientSort;
  const partialLabels = [...plan.client.map((c) => c.label), plan.clientSort && "Orden por km"].filter(Boolean);

  const updateParams = (updates, resetPage = true) => {
    const next = new URLSearchParams(searchParams);

    Object.entries(updates).forEach(([key, value]) => {
      const isEmptyArray = Array.isArray(value) && value.length === 0;
      const isEmptyValue = value === "" || value === null || value === undefined || isEmptyArray;

      if (isEmptyValue) {
        next.delete(key);
      } else if (Array.isArray(value)) {
        next.set(key, value.join(","));
      } else {
        next.set(key, String(value));
      }
    });

    if (resetPage) next.set("page", "1");
    // Cambios de filtro reemplazan la entrada del historial (no ensucian "Atrás")
    setSearchParams(next, { replace: resetPage });
  };

  const goToPage = (page) => {
    updateParams({ page }, false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Drawer de filtros mobile: bloquea scroll, Escape cierra, foco adentro
  useEffect(() => {
    if (!mobileFiltersOpen) return;
    document.body.style.overflow = "hidden";
    drawerRef.current?.focus();
    const onKey = (e) => { if (e.key === "Escape") setMobileFiltersOpen(false); };
    window.addEventListener("keydown", onKey);
    const btn = filterBtnRef.current;
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
      btn?.focus();
    };
  }, [mobileFiltersOpen]);

  const handleFilterChange = (key, value) => updateParams({ [key]: value });

  const handleArrayFilterChange = (key, value) => {
    const current = filters[key];
    const exists = current.includes(value);
    updateParams({ [key]: exists ? current.filter((item) => item !== value) : [...current, value] });
  };

  const handleResetFilters = () => {
    setSearchParams({ sortBy: "relevant", page: "1" }, { replace: true });
  };

  const activeChips = [
    filters.type && { key: "type", label: category?.label },
    filters.operation && { key: "operation", label: filters.operation },
    filters.q && { key: "q", label: `"${filters.q}"` },
    filters.condition && { key: "condition", label: filters.condition === "used" ? "Usados" : "Nuevos" },
    filters.brand && { key: "brand", label: filters.brand },
    filters.model && { key: "model", label: filters.model },
    (filters.yearMin !== "" || filters.yearMax !== "") && {
      key: "year",
      label: rangeLabel("Año", filters.yearMin, filters.yearMax, String),
    },
    (filters.priceMin !== "" || filters.priceMax !== "") && {
      key: "price",
      label: rangeLabel("Precio", filters.priceMin, filters.priceMax, formatUSD),
    },
    (filters.kmMin !== "" || filters.kmMax !== "") && {
      key: "km",
      label: rangeLabel("Km", filters.kmMin, filters.kmMax),
    },
    filters.fuel && { key: "fuel", label: filters.fuel },
    filters.transmission && { key: "transmission", label: filters.transmission },
    filters.location && { key: "location", label: filters.location },
    ...filters.sellerType.map((t) => ({ key: `sellerType:${t}`, label: t })),
  ].filter(Boolean);

  const removeChip = (chipKey) => {
    if (chipKey.startsWith("sellerType:")) {
      handleArrayFilterChange("sellerType", chipKey.slice("sellerType:".length));
      return;
    }
    switch (chipKey) {
      case "type":  updateParams({ type: "", categoria: "" }); break;
      case "q":     updateParams({ q: "", busqueda: "" }); break;
      case "year":  updateParams({ yearMin: "", yearMax: "" }); break;
      case "price": updateParams({ priceMin: "", priceMax: "" }); break;
      case "km":    updateParams({ kmMin: "", kmMax: "" }); break;
      default:      updateParams({ [chipKey]: "" }); break;
    }
  };

  // ── Opciones del sidebar ──
  const brandNames = useMemo(() => {
    const fromApi = brandsState.list
      .filter((b) => !b.category || !category?.api || b.category === category.api)
      .map((b) => b.name)
      .sort((a, b) => a.localeCompare(b));
    // Si el catálogo falló, al menos las marcas conocidas
    const fallback = brandsState.status === "error"
      ? (category ? category.brands : VEHICLE_CATEGORIES.flatMap((c) => c.brands))
      : [];
    return mergeNames(category?.brands || [], fromApi, fallback);
  }, [brandsState, category]);

  const modelNames = useMemo(() => {
    if (modelsReady && !modelsState.error) {
      return modelsState.list.map((m) => m.name).sort((a, b) => a.localeCompare(b));
    }
    return mergeNames(getPopularModels(category?.id, filters.brand));
  }, [modelsReady, modelsState, category, filters.brand]);

  const locationNames = lookups.provinces?.length
    ? lookups.provinces.map((p) => p.name)
    : DEPARTAMENTOS;

  const sidebarProps = {
    filters,
    brands: brandNames,
    models: modelNames,
    locations: locationNames,
    onFilterChange: handleFilterChange,
    onArrayFilterChange: handleArrayFilterChange,
    onResetFilters: handleResetFilters,
    catalogError: brandsState.status === "error",
    onRetryCatalog: retryBrands,
  };

  const retry = () => {
    if (plan.blocked) retryBrands();
    else setReloadTick((t) => t + 1);
  };

  // ── SEO ──
  const catLabel = category?.label || "Vehículos";
  const condLabel = filters.condition === "used" ? " usados" : filters.condition === "new" ? " nuevos" : "";
  const pageTitle = `${catLabel}${condLabel} en venta en El Salvador | Mi Vehículo`;
  const pageDescription = category
    ? `Encontrá ${category.label.toLowerCase()}${condLabel} en venta en El Salvador. Filtrá por marca, modelo, año, precio y departamento.`
    : "Comprá y vendé vehículos en El Salvador: carros, motos, camiones y más. Filtrá por marca, modelo, año, precio y departamento.";

  const countText = loading
    ? "Buscando vehículos…"
    : loadError
      ? ""
      : partial
        ? `${formatNumber(displayListings.length)} resultados en esta página`
        : `${formatNumber(serverTotal)} resultados encontrados`;

  return (
    <div className={styles.page}>
      <title>{pageTitle}</title>
      <meta name="description" content={pageDescription} />

      <Navbar />

      <main className={styles.main}>
        <div className={styles.container}>
          <nav className={styles.breadcrumbs} aria-label="Migas de pan">
            <span>Inicio</span>
            <span aria-hidden="true">›</span>
            <span>{category?.label || "Vehículos"}</span>
            <span aria-hidden="true">›</span>
            <span>Resultados</span>
          </nav>

          <div className={styles.headingRow}>
            <div>
              <h1>
                Resultados para{" "}
                <span>
                  {(category?.label || "vehículos").toLowerCase()}
                  {condLabel}
                </span>
              </h1>
              <p aria-live="polite">{countText}</p>
            </div>

            <div className={styles.headingActions}>
              <button
                ref={filterBtnRef}
                type="button"
                className={styles.mobileFilterBtn}
                onClick={() => setMobileFiltersOpen(true)}
                aria-expanded={mobileFiltersOpen}
                aria-haspopup="dialog"
              >
                <SlidersHorizontal size={18} aria-hidden="true" />
                <span>Filtrar</span>
              </button>
            </div>
          </div>

          <div className={styles.layout}>
            <aside className={styles.sidebar}>
              <VehicleFiltersSidebar {...sidebarProps} />
            </aside>

            <section className={styles.results} aria-labelledby="vehiculos-results-title">
              <h2 id="vehiculos-results-title" className={styles.srOnly}>Listado de vehículos</h2>

              {/* La línea "Mostrando X - Y de N" se oculta mientras carga o si el total no es exacto */}
              <div className={loading || loadError || partial ? styles.toolbarNoCount : undefined}>
                <VehicleResultsToolbar
                  total={serverTotal}
                  start={serverTotal === 0 ? 0 : (currentPage - 1) * ITEMS_PER_PAGE + 1}
                  end={Math.min(currentPage * ITEMS_PER_PAGE, serverTotal)}
                  activeChips={activeChips}
                  onRemoveChip={removeChip}
                  onResetFilters={handleResetFilters}
                  sortBy={sortBy}
                  onSortChange={(value) => updateParams({ sortBy: value })}
                />
              </div>

              {!loading && !loadError && (partial || plan.ignored.length > 0) && (
                <p className={styles.partialNote} role="status">
                  {partial && (
                    <>
                      {partialLabels.join(", ")}{" "}
                      {partialLabels.length > 1 ? "se aplican" : "se aplica"} solo a los resultados de esta página.{" "}
                    </>
                  )}
                  {plan.ignored.length > 0 && (
                    <>No pudimos aplicar: {plan.ignored.join(", ")}.</>
                  )}
                </p>
              )}

              {loading ? (
                <VehicleGrid vehicles={[]} loading skeletonCount={ITEMS_PER_PAGE} />
              ) : loadError ? (
                <div className={styles.stateBox} role="alert">
                  <p className={styles.stateTitle}>No pudimos cargar los vehículos</p>
                  <p className={styles.stateText}>
                    Revisá tu conexión e intentá de nuevo en unos segundos.
                  </p>
                  <button type="button" className={styles.stateBtn} onClick={retry}>
                    Reintentar
                  </button>
                </div>
              ) : displayListings.length === 0 ? (
                <div className={styles.stateBox}>
                  <p className={styles.stateTitle}>Sin resultados</p>
                  <p className={styles.stateText}>
                    Probá modificando los filtros para encontrar más vehículos.
                  </p>
                  <button type="button" className={styles.stateBtn} onClick={handleResetFilters}>
                    Limpiar filtros
                  </button>
                </div>
              ) : (
                <VehicleGrid
                  vehicles={displayListings}
                  currentSearch={searchParams.toString()}
                />
              )}

              {!loading && !loadError && (
                <Pagination
                  currentPage={currentPage}
                  totalPages={serverTotalPages}
                  onPageChange={goToPage}
                />
              )}
            </section>
          </div>
        </div>
      </main>

      <div
        className={`${styles.mobileFiltersOverlay} ${mobileFiltersOpen ? styles.mobileFiltersOverlayOpen : ""}`}
        onClick={() => setMobileFiltersOpen(false)}
        aria-hidden="true"
      />

      <div
        ref={drawerRef}
        className={`${styles.mobileFiltersDrawer} ${mobileFiltersOpen ? styles.mobileFiltersDrawerOpen : ""}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby={drawerTitleId}
        tabIndex={-1}
        inert={!mobileFiltersOpen}
      >
        <div className={styles.mobileFiltersContent}>
          <VehicleFiltersSidebar
            {...sidebarProps}
            isMobile
            titleId={drawerTitleId}
            onCloseMobile={() => setMobileFiltersOpen(false)}
          />
        </div>
      </div>

    </div>
  );
};

export default Vehiculos;
