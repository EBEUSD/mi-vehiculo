import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { FiSearch, FiX } from "react-icons/fi";
import { catalogCache } from "../../lib/catalogCache";
import { getBrandsForCategory } from "../../lib/vehicleBrands";
import SearchableSelect from "../SearchableSelect/SearchableSelect";
import styles from "./SearchFilters.module.css";

const TYPE_OPTIONS = [
  { value: "Autos",      label: "Autos" },
  { value: "Motos",      label: "Motos" },
  { value: "Camionetas", label: "Camionetas" },
  { value: "Camiones",   label: "Camiones" },
];

const CY = new Date().getFullYear();
const YEARS = Array.from({ length: CY - 1979 }, (_, i) => CY - i);

const INIT = {
  type:     "Autos",
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
    const staticNames = getBrandsForCategory(form.type);
    const apiByName = {};
    apiBrands.forEach((b) => { apiByName[b.name.toLowerCase()] = b; });

    const merged = staticNames.map((name) => ({ value: name, label: name }));
    apiBrands.forEach((b) => {
      if (!merged.some((o) => o.label.toLowerCase() === b.name.toLowerCase())) {
        merged.push({ value: b.name, label: b.name });
      }
    });
    merged.sort((a, b) => a.label.localeCompare(b.label));
    return [{ value: "", label: "Todas las marcas" }, ...merged];
  }, [apiBrands, form.type]);

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

  const hasFilters = form.brand || form.model || form.yearMin || form.yearMax || form.priceMax || form.location;

  return (
    <section className={styles.wrapper}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <FiSearch className={styles.headerIcon} />
          <h2>Encontrá tu vehículo ideal</h2>
        </div>
        {/* Condición toggle */}
        <div className={styles.condRow}>
          {["used", "new", ""].map((c) => (
            <button
              key={c}
              type="button"
              className={`${styles.condBtn} ${form.condition === c ? styles.condBtnActive : ""}`}
              onClick={() => set("condition", c)}
            >
              {c === "used" ? "Usado" : c === "new" ? "Nuevo" : "Todos"}
            </button>
          ))}
        </div>
      </div>

      {/* Type pills */}
      <div className={styles.typePills}>
        {TYPE_OPTIONS.map((t) => (
          <button
            key={t.value}
            type="button"
            className={`${styles.typePill} ${form.type === t.value ? styles.typePillActive : ""}`}
            onClick={() => { set("type", t.value); set("brand", ""); set("model", ""); }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Filters row */}
      <div className={styles.filtersRow}>
        <div className={styles.field}>
          <label>Marca</label>
          <SearchableSelect
            options={brandOptions}
            value={form.brand}
            onChange={(v) => { set("brand", v); set("model", ""); }}
            placeholder="Todas las marcas"
          />
        </div>

        <div className={styles.field}>
          <label>Modelo</label>
          <input
            type="text"
            placeholder="Todos los modelos"
            value={form.model}
            onChange={(e) => set("model", e.target.value)}
          />
        </div>

        <div className={styles.field}>
          <label>Año</label>
          <div className={styles.yearRange}>
            <select value={form.yearMin} onChange={(e) => set("yearMin", e.target.value)}>
              <option value="">Desde</option>
              {YEARS.map((y) => <option key={y} value={y}>{y}</option>)}
            </select>
            <span className={styles.yearDash}>—</span>
            <select value={form.yearMax} onChange={(e) => set("yearMax", e.target.value)}>
              <option value="">Hasta</option>
              {YEARS.map((y) => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
        </div>

        <div className={styles.field}>
          <label>Precio máximo</label>
          <div className={styles.inputPrefix}>
            <span>$</span>
            <input
              type="number"
              placeholder="Sin límite"
              value={form.priceMax}
              onChange={(e) => set("priceMax", e.target.value)}
              min="0"
            />
          </div>
        </div>

        <div className={styles.field}>
          <label>Departamento</label>
          <input
            type="text"
            placeholder="Todos"
            value={form.location}
            onChange={(e) => set("location", e.target.value)}
          />
        </div>

        <div className={styles.actions}>
          {hasFilters && (
            <button className={styles.clearBtn} onClick={handleClear} type="button">
              <FiX size={14} />
              <span>Limpiar</span>
            </button>
          )}
          <button className={styles.searchBtn} onClick={handleNavigate} type="button">
            <FiSearch size={15} />
            <span>Ver resultados</span>
          </button>
        </div>
      </div>
    </section>
  );
};

export default SearchFilters;
