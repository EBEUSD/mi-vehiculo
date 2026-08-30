import { useEffect, useMemo, useState } from "react";
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
  const [allListings, setAllListings] = useState([]);
  const [loadingListings, setLoadingListings] = useState(true);

  useEffect(() => {
    const fetchListings = async () => {
      setLoadingListings(true);
      try {
        const res = await api.get("/vehicles?status=ACTIVE");
        setAllListings((res.data || []).map(mapRow));
      } catch {
        setAllListings([]);
      }
      setLoadingListings(false);
    };
    fetchListings();
  }, []);

  const brands    = useMemo(() => [...new Set(allListings.map((v) => v.brand).filter(Boolean))].sort(), [allListings]);
  const models    = useMemo(() => [...new Set(allListings.map((v) => v.model).filter(Boolean))].sort(), [allListings]);
  const locations = useMemo(() => [...new Set(allListings.map((v) => v.location).filter(Boolean))].sort(), [allListings]);

  const filters = {
    type: searchParams.get("type") || "Autos",
    brand: searchParams.get("brand") || "",
    model: searchParams.get("model") || "",
    yearMin: Number(searchParams.get("yearMin") || 2018),
    yearMax: Number(searchParams.get("yearMax") || new Date().getFullYear()),
    priceMin: Number(searchParams.get("priceMin") || 0),
    priceMax: Number(searchParams.get("priceMax") || 40000),
    kmMin: Number(searchParams.get("kmMin") || 0),
    kmMax: Number(searchParams.get("kmMax") || 150000),
    fuel: parseArray(searchParams.get("fuel")),
    transmission: parseArray(searchParams.get("transmission")),
    location: searchParams.get("location") || "",
    sellerType: parseArray(searchParams.get("sellerType")),
    condition: searchParams.get("condition") || "used",
  };

  const sortBy = searchParams.get("sortBy") || "relevant";
  const currentPage = Number(searchParams.get("page") || 1);

  const updateParams = (updates, resetPage = true) => {
    const next = new URLSearchParams(searchParams);

    Object.entries(updates).forEach(([key, value]) => {
      const isEmptyArray = Array.isArray(value) && value.length === 0;
      const isEmptyValue =
        value === "" || value === null || value === undefined || isEmptyArray;

      if (isEmptyValue) {
        next.delete(key);
      } else if (Array.isArray(value)) {
        next.set(key, value.join(","));
      } else {
        next.set(key, String(value));
      }
    });

    if (resetPage) {
      next.set("page", "1");
    }

    setSearchParams(next);
  };

  const filteredVehicles = useMemo(() => {
    let result = [...allListings];

    result = result.filter((vehicle) => {
      const matchesType = !filters.type || vehicle.type === filters.type;
      const matchesBrand = !filters.brand || vehicle.brand === filters.brand;
      const matchesModel =
        !filters.model ||
        vehicle.model.toLowerCase().includes(filters.model.toLowerCase());
      const matchesLocation =
        !filters.location ||
        vehicle.location.toLowerCase().includes(filters.location.toLowerCase());
      const matchesCondition =
        !filters.condition || vehicle.condition === filters.condition;

      const matchesYear =
        vehicle.year >= filters.yearMin && vehicle.year <= filters.yearMax;

      const matchesPrice =
        vehicle.price >= filters.priceMin && vehicle.price <= filters.priceMax;

      const matchesKm =
        vehicle.km >= filters.kmMin && vehicle.km <= filters.kmMax;

      const matchesFuel =
        filters.fuel.length === 0 || filters.fuel.includes(vehicle.fuel);

      const matchesTransmission =
        filters.transmission.length === 0 ||
        filters.transmission.includes(vehicle.transmission);

      const matchesSellerType =
        filters.sellerType.length === 0 ||
        filters.sellerType.includes(vehicle.sellerType);

      return (
        matchesType &&
        matchesBrand &&
        matchesModel &&
        matchesLocation &&
        matchesCondition &&
        matchesYear &&
        matchesPrice &&
        matchesKm &&
        matchesFuel &&
        matchesTransmission &&
        matchesSellerType
      );
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
          const scoreA =
            (a.tag === "DESTACADO" ? 3 : a.tag === "NUEVO" ? 2 : 1) +
            (a.condition === "new" ? 2 : 0) +
            a.year / 10000;
          const scoreB =
            (b.tag === "DESTACADO" ? 3 : b.tag === "NUEVO" ? 2 : 1) +
            (b.condition === "new" ? 2 : 0) +
            b.year / 10000;
          return scoreB - scoreA;
        });
        break;
    }

    return result;
  }, [allListings, filters, sortBy]);

  const totalResults = filteredVehicles.length;
  const totalPages = Math.max(1, Math.ceil(totalResults / ITEMS_PER_PAGE));
  const safePage = Math.min(currentPage, totalPages);

  const paginatedVehicles = useMemo(() => {
    const start = (safePage - 1) * ITEMS_PER_PAGE;
    return filteredVehicles.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredVehicles, safePage]);

  useEffect(() => {
    if (currentPage > totalPages) {
      updateParams({ page: totalPages }, false);
    }
  }, [currentPage, totalPages]);

  useEffect(() => {
    document.body.style.overflow = mobileFiltersOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileFiltersOpen]);

  const handleFilterChange = (key, value) => {
    updateParams({ [key]: value });
  };

  const handleArrayFilterChange = (key, value) => {
    const current = filters[key];
    const exists = current.includes(value);

    updateParams({
      [key]: exists
        ? current.filter((item) => item !== value)
        : [...current, value],
    });
  };

  const handleResetFilters = () => {
    setSearchParams({
      type: "Autos",
      condition: "used",
      sortBy: "relevant",
      page: "1",
    });
  };

  const activeChips = [
    filters.type && { key: "type", label: filters.type },
    filters.condition === "used" && { key: "condition", label: "Usados" },
    filters.brand && { key: "brand", label: filters.brand },
    filters.model && { key: "model", label: filters.model },
    (filters.yearMin !== 2018 || filters.yearMax !== new Date().getFullYear()) && {
      key: "year",
      label: `Año: ${filters.yearMin} - ${filters.yearMax}`,
    },
    filters.priceMax !== 40000 && {
      key: "priceMax",
      label: `Precio hasta ${new Intl.NumberFormat("en-US").format(
        filters.priceMax
      )}`,
    },
    filters.location && { key: "location", label: filters.location },
  ].filter(Boolean);

  const removeChip = (chipKey) => {
    switch (chipKey) {
      case "type":
        updateParams({ type: "" });
        break;
      case "condition":
        updateParams({ condition: "" });
        break;
      case "brand":
        updateParams({ brand: "" });
        break;
      case "model":
        updateParams({ model: "" });
        break;
      case "year":
        updateParams({ yearMin: 2018, yearMax: new Date().getFullYear() });
        break;
      case "priceMax":
        updateParams({ priceMax: 40000 });
        break;
      case "location":
        updateParams({ location: "" });
        break;
      default:
        break;
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
              <p>{totalResults.toLocaleString("en-US")} resultados encontrados</p>
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
                brands={brands}
                models={models}
                locations={locations}
                onFilterChange={handleFilterChange}
                onArrayFilterChange={handleArrayFilterChange}
                onResetFilters={handleResetFilters}
              />
            </aside>

            <section className={styles.results}>
              <VehicleResultsToolbar
                total={totalResults}
                start={totalResults === 0 ? 0 : (safePage - 1) * ITEMS_PER_PAGE + 1}
                end={Math.min(safePage * ITEMS_PER_PAGE, totalResults)}
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
              ) : paginatedVehicles.length === 0 ? (
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
                  vehicles={paginatedVehicles}
                  currentSearch={searchParams.toString()}
                />
              )}

              <Pagination
                currentPage={safePage}
                totalPages={totalPages}
                onPageChange={(page) => updateParams({ page }, false)}
              />
            </section>
          </div>
        </div>
      </main>

      <div
        className={`${styles.mobileFiltersOverlay} ${
          mobileFiltersOpen ? styles.mobileFiltersOverlayOpen : ""
        }`}
        onClick={() => setMobileFiltersOpen(false)}
      />

      <div
        className={`${styles.mobileFiltersDrawer} ${
          mobileFiltersOpen ? styles.mobileFiltersDrawerOpen : ""
        }`}
      >
        <div className={styles.mobileFiltersContent}>
          <VehicleFiltersSidebar
            filters={filters}
            brands={brands}
            models={models}
            locations={locations}
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