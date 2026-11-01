import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Search } from "lucide-react";
import { catalogCache } from "../../lib/catalogCache";
import { getPopularModels, mergeNames } from "../../lib/vehicleBrands";
import { VEHICLE_CATEGORIES, OPERATION_TYPES, DEPARTAMENTOS, getVehicleCategory } from "../../lib/categories";
import SearchableSelect from "../SearchableSelect/SearchableSelect";
import styles from "./SearchFilters.module.css";

const TYPE_OPTIONS = VEHICLE_CATEGORIES.map((c) => ({ value: c.id, label: c.short }));

const CY = new Date().getFullYear();
const YEARS = Array.from({ length: CY - 1959 }, (_, i) => CY - i);

const INIT = {
  type:     "carros",
  operation: "",
  brand:    "",
  model:    "",
  yearMin:  "",
  yearMax:  "",
  priceMax: "",
  location: "",
  condition: "used",
};

const SearchFilters = () => {
  const navigate = useNavigate();
  const [form, setForm]      = useState(INIT);
  const [apiBrands, setApiBrands] = useState([]);

  useEffect(() => {
    catalogCache.get("/catalog/brands")
      .then((data) => setApiBrands(data || []))
      .catch(() => setApiBrands([]));
  }, []);

  const brandOptions = useMemo(() => {
    // Principales marcas primero (orden del cliente), después el resto del catálogo
    const cat = getVehicleCategory(form.type);
    const fromApi = apiBrands
      .filter((b) => !b.category || b.category === cat.api)
      .map((b) => b.name)
      .sort((a, b) => a.localeCompare(b));
    const names = mergeNames(cat.brands, fromApi);
    return [{ value: "", label: "Todas las marcas" }, ...names.map((n) => ({ value: n, label: n }))];
  }, [apiBrands, form.type]);

  const modelOptions = useMemo(() => {
    const models = mergeNames(getPopularModels(form.type ? getVehicleCategory(form.type).id : null, form.brand));
    return [{ value: "", label: "Todos los modelos" }, ...models.map((m) => ({ value: m, label: m }))];
  }, [form.type, form.brand]);

  const showYear = getVehicleCategory(form.type).filters.year;

  const set = (key, value) => setForm((p) => ({ ...p, [key]: value }));

  const handleNavigate = () => {
    const params = new URLSearchParams();
    Object.entries(form).forEach(([key, value]) => {
      if (value !== "") params.set(key, value);
    });
    params.set("sortBy", "relevant");
    params.set("page", "1");
    navigate(`/vehiculos?${params.toString()}`);
  };

  const handleClear = () => setForm(INIT);

  const hasFilters = form.brand || form.model || form.yearMin || form.yearMax || form.priceMax || form.location || form.operation;

  return (
    <section className={styles.wrapper}>
      <div className={styles.header}>
        <h2><Search size={22} className={styles.headerIcon} /> Encontrá tu vehículo ideal</h2>
        <div className={styles.condRow} role="group" aria-label="Condición">
          {["used", "new", ""].map((c) => (
            <button
              key={c}
              type="button"
              aria-pressed={form.condition === c}
              className={`${styles.condBtn} ${form.condition === c ? styles.condBtnActive : ""}`}
              onClick={() => set("condition", c)}
            >
              {c === "used" ? "Usado" : c === "new" ? "Nuevo" : "Todos"}
            </button>
          ))}
        </div>
      </div>

      <div className={styles.typePills}>
        {TYPE_OPTIONS.map((t) => (
          <button
            key={t.value}
            type="button"
            aria-pressed={form.type === t.value}
            className={`${styles.typePill} ${form.type === t.value ? styles.typePillActive : ""}`}
            onClick={() => { set("type", t.value); set("brand", ""); set("model", ""); }}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className={styles.filtersGrid}>
        <div className={styles.field}>
          <label>Marca</label>
          <SearchableSelect
            compact
            options={brandOptions}
            value={form.brand}
            onChange={(v) => { set("brand", v); set("model", ""); }}
            placeholder="Todas las marcas"
            searchPlaceholder="Buscar o escribir otra marca..."
            allowCustom
          />
        </div>

        <div className={styles.field}>
          <label>Modelo</label>
          <SearchableSelect
            compact
            options={modelOptions}
            value={form.model}
            onChange={(v) => set("model", v)}
            placeholder="Todos los modelos"
            searchPlaceholder="Buscar o escribir modelo..."
            allowCustom
          />
        </div>

        <div className={styles.field}>
          <label>Operación</label>
          <select value={form.operation} onChange={(e) => set("operation", e.target.value)}>
            <option value="">Todas</option>
            {OPERATION_TYPES.map((op) => <option key={op} value={op}>{op}</option>)}
          </select>
        </div>

        {showYear && (
          <div className={styles.field}>
            <label>Año</label>
            <div className={styles.yearRange}>
              <select value={form.yearMin} onChange={(e) => set("yearMin", e.target.value)} aria-label="Año desde">
                <option value="">Desde</option>
                {YEARS.map((y) => <option key={y} value={y}>{y}</option>)}
              </select>
              <select value={form.yearMax} onChange={(e) => set("yearMax", e.target.value)} aria-label="Año hasta">
                <option value="">Hasta</option>
                {YEARS.map((y) => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>
          </div>
        )}

        <div className={styles.field}>
          <label>Precio máximo</label>
          <div className={styles.inputPrefix}>
            <span>$</span>
            <input
              type="number"
              inputMode="numeric"
              placeholder="Sin límite"
              value={form.priceMax}
              onChange={(e) => set("priceMax", e.target.value)}
              min="0"
            />
          </div>
        </div>

        <div className={styles.field}>
          <label>Departamento</label>
          <select value={form.location} onChange={(e) => set("location", e.target.value)}>
            <option value="">Todos</option>
            {DEPARTAMENTOS.map((d) => <option key={d} value={d}>{d}</option>)}
          </select>
        </div>
      </div>

      <div className={styles.footer}>
        <button className={styles.clearBtn} onClick={handleClear} type="button" disabled={!hasFilters}>
          Limpiar filtros
        </button>
        <button className={styles.searchBtn} onClick={handleNavigate} type="button">
          <Search size={17} />
          <span>Ver resultados</span>
        </button>
      </div>
    </section>
  );
};

export default SearchFilters;
