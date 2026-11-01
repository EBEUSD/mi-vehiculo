import { useEffect, useId, useState } from "react";
import SearchableSelect from "../SearchableSelect/SearchableSelect";
import styles from "./VehicleFiltersSidebar.module.css";
import { VEHICLE_CATEGORIES, OPERATION_TYPES, SELLER_TYPES, findVehicleCategory } from "../../lib/categories";

// Sin categoría elegida se muestran todos los filtros
const ALL_FILTERS = { km: true, fuel: true, transmission: true, year: true };

// Mismos valores que se guardan al publicar (CaracteristicasStep)
const FUEL_OPTIONS = ["Gasolina", "Diésel", "Híbrido", "Eléctrico", "Gas LP"];
const TRANSMISSION_OPTIONS = ["Manual", "Automática", "CVT"];

// Input numérico con estado local: aplica el filtro con debounce (400ms) o al salir del campo.
// Vacío = sin filtro.
const RangeInput = ({ id, value, onCommit, placeholder, prefix, ariaLabel }) => {
  const propText = value === "" || value == null ? "" : String(value);
  const [text, setText] = useState(propText);
  const [prev, setPrev] = useState(propText);

  // Si el valor cambia desde afuera (chip, limpiar filtros) se refleja acá
  if (propText !== prev) {
    setPrev(propText);
    setText(propText);
  }

  useEffect(() => {
    if (text === propText) return;
    const t = setTimeout(() => onCommit(text), 400);
    return () => clearTimeout(t);
  }, [text, propText, onCommit]);

  return (
    <div className={`${styles.numberWrap} ${prefix ? styles.hasPrefix : ""}`}>
      {prefix && <span className={styles.prefix} aria-hidden="true">{prefix}</span>}
      <input
        id={id}
        type="text"
        inputMode="numeric"
        autoComplete="off"
        placeholder={placeholder}
        aria-label={ariaLabel}
        value={text}
        onChange={(e) => setText(e.target.value.replace(/\D/g, ""))}
        onBlur={() => { if (text !== propText) onCommit(text); }}
        onKeyDown={(e) => { if (e.key === "Enter" && text !== propText) onCommit(text); }}
      />
    </div>
  );
};

const RangeGroup = ({ label, minKey, maxKey, filters, onFilterChange, prefix }) => {
  const id = useId();
  return (
    <fieldset className={`${styles.group} ${styles.fieldset}`}>
      <legend className={styles.legend}>{label}</legend>
      <div className={styles.rangeRow}>
        <RangeInput
          id={`${id}-min`}
          value={filters[minKey]}
          prefix={prefix}
          placeholder="Desde"
          ariaLabel={`${label} desde`}
          onCommit={(v) => onFilterChange(minKey, v)}
        />
        <RangeInput
          id={`${id}-max`}
          value={filters[maxKey]}
          prefix={prefix}
          placeholder="Hasta"
          ariaLabel={`${label} hasta`}
          onCommit={(v) => onFilterChange(maxKey, v)}
        />
      </div>
    </fieldset>
  );
};

const VehicleFiltersSidebar = ({
  filters,
  brands,
  models,
  locations,
  onFilterChange,
  onArrayFilterChange,
  onResetFilters,
  isMobile = false,
  onCloseMobile = null,
  catalogError = false,
  onRetryCatalog = null,
  titleId,
}) => {
  const id = useId();
  const applies = findVehicleCategory(filters.type)?.filters || ALL_FILTERS;

  const handleClose = () => {
    if (onCloseMobile) onCloseMobile();
  };

  return (
    <div className={`${styles.sidebarCard} ${isMobile ? styles.mobileCard : ""}`}>
      {isMobile ? (
        <div className={styles.mobileTop}>
          <h2 id={titleId}>Filtros</h2>
          <button type="button" onClick={handleClose}>
            Cerrar
          </button>
        </div>
      ) : (
        <div className={styles.topRow}>
          <h2 id={titleId}>Filtros</h2>
          <button type="button" onClick={onResetFilters}>Limpiar</button>
        </div>
      )}

      <div className={styles.group}>
        <label htmlFor={`${id}-type`}>Tipo de vehículo</label>
        <select
          id={`${id}-type`}
          value={filters.type}
          onChange={(e) => onFilterChange("type", e.target.value)}
        >
          <option value="">Todos</option>
          {VEHICLE_CATEGORIES.map((c) => (
            <option key={c.id} value={c.id}>{c.label}</option>
          ))}
        </select>
      </div>

      <div className={styles.group}>
        <label htmlFor={`${id}-op`}>Tipo de operación</label>
        <select
          id={`${id}-op`}
          value={filters.operation}
          onChange={(e) => onFilterChange("operation", e.target.value)}
        >
          <option value="">Todas</option>
          {OPERATION_TYPES.map((op) => (
            <option key={op} value={op}>{op}</option>
          ))}
        </select>
      </div>

      <div className={styles.group}>
        <label htmlFor={`${id}-cond`}>Condición</label>
        <select
          id={`${id}-cond`}
          value={filters.condition}
          onChange={(e) => onFilterChange("condition", e.target.value)}
        >
          <option value="">Todas</option>
          <option value="used">Usados</option>
          <option value="new">Nuevos</option>
        </select>
      </div>

      <div className={styles.group} role="group" aria-labelledby={`${id}-brand`}>
        <span id={`${id}-brand`} className={styles.label}>Marca</span>
        <SearchableSelect
          compact
          allowCustom
          searchPlaceholder="Buscar o escribir..."
          options={[
            { value: "", label: "Todas las marcas" },
            ...brands.map((b) => ({ value: b, label: b })),
          ]}
          value={filters.brand}
          onChange={(v) => onFilterChange("brand", v)}
          placeholder="Todas las marcas"
        />
        {catalogError && (
          <p className={styles.catalogError} role="alert">
            No pudimos cargar el catálogo de marcas.{" "}
            {onRetryCatalog && (
              <button type="button" onClick={onRetryCatalog}>Reintentar</button>
            )}
          </p>
        )}
      </div>

      <div className={styles.group} role="group" aria-labelledby={`${id}-model`}>
        <span id={`${id}-model`} className={styles.label}>Modelo</span>
        <SearchableSelect
          compact
          allowCustom
          searchPlaceholder="Buscar o escribir..."
          options={[
            { value: "", label: "Todos los modelos" },
            ...models.map((m) => ({ value: m, label: m })),
          ]}
          value={filters.model}
          onChange={(v) => onFilterChange("model", v)}
          placeholder="Todos los modelos"
        />
      </div>

      {applies.year && (
        <RangeGroup label="Año" minKey="yearMin" maxKey="yearMax" filters={filters} onFilterChange={onFilterChange} />
      )}

      <RangeGroup label="Precio" minKey="priceMin" maxKey="priceMax" prefix="$" filters={filters} onFilterChange={onFilterChange} />

      {applies.km && (
        <RangeGroup label="Kilometraje" minKey="kmMin" maxKey="kmMax" filters={filters} onFilterChange={onFilterChange} />
      )}

      {applies.fuel && (
        <div className={styles.group}>
          <label htmlFor={`${id}-fuel`}>Combustible</label>
          <select
            id={`${id}-fuel`}
            value={filters.fuel}
            onChange={(e) => onFilterChange("fuel", e.target.value)}
          >
            <option value="">Todos</option>
            {FUEL_OPTIONS.map((f) => <option key={f} value={f}>{f}</option>)}
          </select>
        </div>
      )}

      {applies.transmission && (
        <div className={styles.group}>
          <label htmlFor={`${id}-trans`}>Transmisión</label>
          <select
            id={`${id}-trans`}
            value={filters.transmission}
            onChange={(e) => onFilterChange("transmission", e.target.value)}
          >
            <option value="">Todas</option>
            {TRANSMISSION_OPTIONS.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
      )}

      <div className={styles.group}>
        <label htmlFor={`${id}-loc`}>Ubicación</label>
        <select
          id={`${id}-loc`}
          value={filters.location}
          onChange={(e) => onFilterChange("location", e.target.value)}
        >
          <option value="">Todos los departamentos</option>
          {locations.map((location) => (
            <option key={location} value={location}>
              {location}
            </option>
          ))}
        </select>
      </div>

      <fieldset className={`${styles.group} ${styles.fieldset}`}>
        <legend className={styles.legend}>Tipo de vendedor y origen</legend>
        <div className={styles.checks}>
          {SELLER_TYPES.map((sellerType) => (
            <label key={sellerType}>
              <input
                type="checkbox"
                checked={filters.sellerType.includes(sellerType)}
                onChange={() =>
                  onArrayFilterChange("sellerType", sellerType)
                }
              />
              {sellerType}
            </label>
          ))}
        </div>
      </fieldset>

      <div className={styles.bottomActions}>
        {isMobile && (
          <button type="button" className={styles.resultsBtn} onClick={handleClose}>
            Ver resultados
          </button>
        )}
        <button type="button" className={styles.saveBtn} onClick={onResetFilters}>
          Limpiar filtros
        </button>
      </div>
    </div>
  );
};

export default VehicleFiltersSidebar;
