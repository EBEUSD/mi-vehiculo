import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { FiSliders } from "react-icons/fi";
import Navbar from "../../components/Navbar/Navbar";
import VehicleFiltersSidebar from "../../components/VehicleFiltersSidebar/VehicleFiltersSidebar";
import VehicleResultsToolbar from "../../components/VehicleResultsToolbar/VehicleResultsToolbar";
import VehicleGrid from "../../components/VehicleGrid/VehicleGrid";
import Pagination from "../../components/Pagination/Pagination";
import { api } from "../../lib/api";
import styles from "./Vehiculos.module.css";

const PLACEHOLDER_IMG =
  "https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=800&auto=format&fit=crop";

const CATEGORY_LABEL = { AUTO: "Autos", MOTO: "Motos", CAMION: "Camiones", CAMIONETA: "Camionetas", ACUATICO: "Náutica", OTRO: "Otros" };

const TYPE_TO_CATEGORY = {
  Autos: "AUTO", Motos: "MOTO", Camiones: "CAMION",
  Camionetas: "CAMIONETA", "Náutica": "ACUATICO", Otros: "OTRO",
};

const mapRow = (row) => ({
  id: row.id,
  slug: row.slug,
  title: [row.brand?.name, row.model?.name, row.version].filter(Boolean).join(" "),
  brand: row.brand?.name || "",
  model: row.model?.name || "",
  year: row.year || 0,
  km: row.mileage || 0,
  price: row.price || 0,
  type: CATEGORY_LABEL[row.category] || "Autos",
  fuel: row.attributes?.find((a) => a.definition?.name === "Combustible")?.value || "Gasolina",
  transmission: row.attributes?.find((a) => a.definition?.name === "Transmisión")?.value || "Manual",
  condition: row.condition === "NEW" ? "new" : "used",
  location: [row.city?.name, row.city?.province?.name].filter(Boolean).join(", "),
  image: row.images?.[0]?.url || PLACEHOLDER_IMG,
  tag: row.plan === "premium" ? "DESTACADO" : row.condition === "NEW" ? "NUEVO" : "USADO",
  sellerType: row.dealership ? "Concesionaria" : "Particular",
  dealershipName: row.dealership?.name || null,
});

const ITEMS_PER_PAGE = 9;
const parseArray = (value) => (value ? value.split(",").filter(Boolean) : []);

const Vehiculos = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  // Current page from server (9 items)
  const [listings, setListings] = useState([]);
  const [serverTotal, setServerTotal] = useState(0);
  const [serverTotalPages, setServerTotalPages] = useState(1);
  const [loadingListings, setLoadingListings] = useState(true);

  // Filter sidebar options — fetched once for all brands/models/locations
  const [brandCatalog, setBrandCatalog] = useState([]); // [{ id, name }]
  const [brandOptions, setBrandOptions] = useState([]);
  const [modelOptions, setModelOptions] = useState([]);
  const [locationOptions, setLocationOptions] = useState([]);
  const optionsFetched = useRef(false);

  const filters = {
    type: searchParams.get("type") || "Autos",
    brand: searchParams.get("brand") || "",
    model: searchParams.get("model") || "",
    yearMin: Number(searchParams.get("yearMin") || 1960),
    yearMax: Number(searchParams.get("yearMax") || new Date().getFullYear()),
    priceMin: Number(searchParams.get("priceMin") || 0),
    priceMax: Number(searchParams.get("priceMax") || 500000),
    kmMin: Number(searchParams.get("kmMin") || 0),
    kmMax: Number(searchParams.get("kmMax") || 500000),
    fuel: parseArray(searchParams.get("fuel")),
    transmission: parseArray(searchParams.get("transmission")),
    location: searchParams.get("location") || "",
    sellerType: parseArray(searchParams.get("sellerType")),
    condition: searchParams.get("condition") || "",
  };

  const sortBy = searchParams.get("sortBy") || "relevant";
  const currentPage = Number(searchParams.get("page") || 1);

  // One-time fetch of brands catalog + models/locations from vehicle data
  useEffect(() => {
    if (optionsFetched.current) return;
    optionsFetched.current = true;

    api.get("/catalog/brands").then((res) => {
      const brands = res.data || [];
      setBrandCatalog(brands);
      setBrandOptions(brands.map((b) => b.name).sort());
    }).catch(() => {});

    api.get("/vehicles?status=ACTIVE&limit=500&page=1").then((res) => {
      const all = (res.data || []).map(mapRow);
      setModelOptions([...new Set(all.map((v) => v.model).filter(Boolean))].sort());
      setLocationOptions([...new Set(all.map((v) => v.location).filter(Boolean))].sort());
    }).catch(() => {});
  }, []);

  // Server-side paginated fetch — re-runs whenever filters or page change
  useEffect(() => {
    let cancelled = false;

    const fetchListings = async () => {
      // Si hay filtro de marca pero el catálogo aún no cargó, esperamos.
      // La dep brandCatalog triggerea un re-run cuando llega.
      if (filters.brand && brandCatalog.length === 0) {
        setLoadingListings(false);
        return;
      }
      setLoadingListings(true);
      try {
        const params = new URLSearchParams();
        params.set("status", "ACTIVE");
        params.set("page", String(currentPage));
        params.set("limit", String(ITEMS_PER_PAGE));

        const cat = TYPE_TO_CATEGORY[filters.type];
        if (cat) params.set("category", cat);
        if (filters.condition === "used") params.set("condition", "USED");
        if (filters.condition === "new") params.set("condition", "NEW");
        const brandEntry = brandCatalog.find((b) => b.name === filters.brand);
        if (brandEntry) params.set("brandId", String(brandEntry.id));
        if (filters.priceMin > 0) params.set("minPrice", String(filters.priceMin));
        if (filters.priceMax < 500000) params.set("maxPrice", String(filters.priceMax));
        if (filters.yearMin > 1960) params.set("minYear", String(filters.yearMin));
        if (filters.yearMax < new Date().getFullYear()) params.set("maxYear", String(filters.yearMax));
        if (filters.kmMax < 500000) params.set("maxMileage", String(filters.kmMax));

        const res = await api.get(`/vehicles?${params.toString()}`);
        if (cancelled) return;

        const data = (res.data || []).map(mapRow);
        setListings(data);
        setServerTotal(res.meta?.total ?? data.length);
        setServerTotalPages(res.meta?.totalPages ?? Math.max(1, Math.ceil((res.meta?.total ?? data.length) / ITEMS_PER_PAGE)));
      } catch {
        if (!cancelled) { setListings([]); setServerTotal(0); setServerTotalPages(1); }
      }
      if (!cancelled) setLoadingListings(false);
    };

    fetchListings();
    return () => { cancelled = true; };
  }, [searchParams.toString(), brandCatalog]); // eslint-disable-line react-hooks/exhaustive-deps

  // Client-side secondary filters (fuel, transmission, km, sellerType, location text, model text)
  // applied on top of what the server returned for the current page
  const displayListings = useMemo(() => {
    let result = [...listings];

    result = result.filter((v) => {
      const matchesFuel = filters.fuel.length === 0 || filters.fuel.includes(v.fuel);
      const matchesTransmission = filters.transmission.length === 0 || filters.transmission.includes(v.transmission);
      const matchesSellerType = filters.sellerType.length === 0 || filters.sellerType.includes(v.sellerType);
      const matchesLocation = !filters.location || v.location.toLowerCase().includes(filters.location.toLowerCase());
      const matchesModel = !filters.model || v.model.toLowerCase().includes(filters.model.toLowerCase());
      const matchesKm = v.km >= filters.kmMin && v.km <= filters.kmMax;
      return matchesFuel && matchesTransmission && matchesSellerType && matchesLocation && matchesModel && matchesKm;
    });

    switch (sortBy) {
      case "recent":
        result.sort((a, b) => b.year - a.year || a.km - b.km);
        break;
      case "priceAsc":
        result.sort((a, b) => a.price - b.price);
        break;
      case "priceDesc":
        result.sort((a, b) => b.price - a.price);
        break;
      case "kmAsc":
        result.sort((a, b) => a.km - b.km);
        break;
      default:
        result.sort((a, b) => {
          const scoreA = (a.tag === "DESTACADO" ? 3 : a.tag === "NUEVO" ? 2 : 1) + (a.condition === "new" ? 2 : 0) + a.year / 10000;
          const scoreB = (b.tag === "DESTACADO" ? 3 : b.tag === "NUEVO" ? 2 : 1) + (b.condition === "new" ? 2 : 0) + b.year / 10000;
          return scoreB - scoreA;
        });
    }

    return result;
  }, [listings, filters.fuel, filters.transmission, filters.sellerType, filters.location, filters.model, filters.kmMin, filters.kmMax, sortBy]);

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
    setSearchParams(next);
  };

  useEffect(() => {
    document.body.style.overflow = mobileFiltersOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileFiltersOpen]);

  const handleFilterChange = (key, value) => updateParams({ [key]: value });

  const handleArrayFilterChange = (key, value) => {
    const current = filters[key];
    const exists = current.includes(value);
    updateParams({ [key]: exists ? current.filter((item) => item !== value) : [...current, value] });
  };

  const handleResetFilters = () => {
    setSearchParams({ type: "Autos", sortBy: "relevant", page: "1" });
  };

  const activeChips = [
    filters.type && { key: "type", label: filters.type },
    filters.condition && { key: "condition", label: filters.condition === "used" ? "Usados" : "Nuevos" },
    filters.brand && { key: "brand", label: filters.brand },
    filters.model && { key: "model", label: filters.model },
    (filters.yearMin !== 1960 || filters.yearMax !== new Date().getFullYear()) && {
      key: "year",
      label: `Año: ${filters.yearMin} - ${filters.yearMax}`,
    },
    filters.priceMax !== 500000 && {
      key: "priceMax",
      label: `Precio hasta $${new Intl.NumberFormat("en-US").format(filters.priceMax)}`,
    },
    filters.location && { key: "location", label: filters.location },
  ].filter(Boolean);

  const removeChip = (chipKey) => {
    switch (chipKey) {
      case "type":       updateParams({ type: "" }); break;
      case "condition":  updateParams({ condition: "" }); break;
      case "brand":      updateParams({ brand: "" }); break;
      case "model":      updateParams({ model: "" }); break;
      case "year":       updateParams({ yearMin: 1960, yearMax: new Date().getFullYear() }); break;
      case "priceMax":   updateParams({ priceMax: 500000 }); break;
      case "location":   updateParams({ location: "" }); break;
      default: break;
    }
  };

  return (
    <div className={styles.page}>
      <Navbar />

      <main className={styles.main}>
        <div className={styles.container}>
          <div className={styles.breadcrumbs}>
            <span>Inicio</span>
            <span>›</span>
            <span>{filters.type || "Vehículos"}</span>
            <span>›</span>
            <span>Resultados</span>
          </div>

          <div className={styles.headingRow}>
            <div>
              <h1>
                Resultados para{" "}
                <span>
                  {(filters.type || "vehículos").toLowerCase()}
                  {filters.condition === "used" ? " usados" : filters.condition === "new" ? " nuevos" : ""}
                </span>
              </h1>
              <p>{serverTotal.toLocaleString("en-US")} resultados encontrados</p>
            </div>

            <div className={styles.headingActions}>
              <button
                className={styles.mobileFilterBtn}
                onClick={() => setMobileFiltersOpen(true)}
              >
                <FiSliders />
                <span>Filtrar</span>
              </button>

              <button className={styles.saveSearchBtn} disabled title="Próximamente">
                Guardar búsqueda
              </button>
            </div>
          </div>

          <div className={styles.layout}>
            <aside className={styles.sidebar}>
              <VehicleFiltersSidebar
                filters={filters}
                brands={brandOptions}
                models={modelOptions}
                locations={locationOptions}
                onFilterChange={handleFilterChange}
                onArrayFilterChange={handleArrayFilterChange}
                onResetFilters={handleResetFilters}
              />
            </aside>

            <section className={styles.results}>
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

              {loadingListings ? (
                <p style={{ padding: "2rem", color: "#6b7280", textAlign: "center" }}>
                  Cargando vehículos…
                </p>
              ) : displayListings.length === 0 ? (
                <div style={{ padding: "3rem 1rem", textAlign: "center" }}>
                  <p style={{ fontSize: "1.05rem", fontWeight: 700, color: "#111827", marginBottom: "0.4rem" }}>
                    Sin resultados
                  </p>
                  <p style={{ fontSize: "0.95rem", color: "#6b7280", marginBottom: "1.25rem" }}>
                    Probá modificando los filtros para encontrar más vehículos.
                  </p>
                  <button
                    onClick={handleResetFilters}
                    style={{ padding: "0.6rem 1.4rem", borderRadius: "10px", background: "#1570ff",
                      border: "none", color: "#fff", fontWeight: 700, cursor: "pointer", fontSize: "0.95rem" }}
                  >
                    Limpiar filtros
                  </button>
                </div>
              ) : (
                <VehicleGrid
                  vehicles={displayListings}
                  currentSearch={searchParams.toString()}
                />
              )}

              <Pagination
                currentPage={currentPage}
                totalPages={serverTotalPages}
                onPageChange={(page) => updateParams({ page }, false)}
              />
            </section>
          </div>
        </div>
      </main>

      <div
        className={`${styles.mobileFiltersOverlay} ${mobileFiltersOpen ? styles.mobileFiltersOverlayOpen : ""}`}
        onClick={() => setMobileFiltersOpen(false)}
      />

      <div
        className={`${styles.mobileFiltersDrawer} ${mobileFiltersOpen ? styles.mobileFiltersDrawerOpen : ""}`}
      >
        <div className={styles.mobileFiltersContent}>
          <VehicleFiltersSidebar
            filters={filters}
            brands={brandOptions}
            models={modelOptions}
            locations={locationOptions}
            onFilterChange={handleFilterChange}
            onArrayFilterChange={handleArrayFilterChange}
            onResetFilters={handleResetFilters}
            isMobile
            onCloseMobile={() => setMobileFiltersOpen(false)}
          />
        </div>
      </div>

    </div>
  );
};

export default Vehiculos;
