import styles from "./VehicleFiltersSidebar.module.css";

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
}) => {
  const handleClose = () => {
    if (onCloseMobile) onCloseMobile();
  };

  return (
    <div className={`${styles.sidebarCard} ${isMobile ? styles.mobileCard : ""}`}>
      {isMobile && (
        <div className={styles.mobileTop}>
          <h3>Filtros</h3>
          <button type="button" onClick={handleClose}>
            Cerrar
          </button>
        </div>
      )}

      {!isMobile && (
        <div className={styles.topRow}>
          <h3>Filtros</h3>
          <button onClick={onResetFilters}>Limpiar</button>
        </div>
      )}

      <div className={styles.group}>
        <label>Tipo de vehículo</label>
        <select
          value={filters.type}
          onChange={(e) => onFilterChange("type", e.target.value)}
        >
          <option value="">Todos</option>
          <option value="Autos">Autos</option>
          <option value="Camionetas">Camionetas</option>
          <option value="Motos">Motos</option>
          <option value="Camiones">Camiones</option>
        </select>
      </div>

      <div className={styles.group}>
        <label>Condición</label>
        <select
          value={filters.condition}
          onChange={(e) => onFilterChange("condition", e.target.value)}
        >
          <option value="">Todas</option>
          <option value="used">Usados</option>
          <option value="new">Nuevos</option>
        </select>
      </div>

      <div className={styles.group}>
        <label>Marca</label>
        <select
          value={filters.brand}
          onChange={(e) => onFilterChange("brand", e.target.value)}
        >
          <option value="">Todas las marcas</option>
          {brands.map((brand) => (
            <option key={brand} value={brand}>
              {brand}
            </option>
          ))}
        </select>
      </div>

      <div className={styles.group}>
        <label>Modelo</label>
        <select
          value={filters.model}
          onChange={(e) => onFilterChange("model", e.target.value)}
        >
          <option value="">Todos los modelos</option>
          {models.map((model) => (
            <option key={model} value={model}>
              {model}
            </option>
          ))}
        </select>
      </div>

      <div className={styles.group}>
        <label>Año</label>
        <div className={styles.rangeRow}>
          <input
            type="number"
            value={filters.yearMin}
            onChange={(e) => onFilterChange("yearMin", Number(e.target.value))}
          />
          <input
            type="number"
            value={filters.yearMax}
            onChange={(e) => onFilterChange("yearMax", Number(e.target.value))}
          />
        </div>
      </div>

      <div className={styles.group}>
        <label>Precio</label>
        <div className={styles.rangeRow}>
          <input
            type="number"
            value={filters.priceMin}
            onChange={(e) => onFilterChange("priceMin", Number(e.target.value))}
          />
          <input
            type="number"
            value={filters.priceMax}
            onChange={(e) => onFilterChange("priceMax", Number(e.target.value))}
          />
        </div>
      </div>

      <div className={styles.group}>
        <label>Kilometraje</label>
        <div className={styles.rangeRow}>
          <input
            type="number"
            value={filters.kmMin}
            onChange={(e) => onFilterChange("kmMin", Number(e.target.value))}
          />
          <input
            type="number"
            value={filters.kmMax}
            onChange={(e) => onFilterChange("kmMax", Number(e.target.value))}
          />
        </div>
      </div>

      <div className={styles.group}>
        <label>Combustible</label>
        <div className={styles.checks}>
          {["Nafta", "Diésel", "Híbrido", "Eléctrico"].map((fuel) => (
            <label key={fuel}>
              <input
                type="checkbox"
                checked={filters.fuel.includes(fuel)}
                onChange={() => onArrayFilterChange("fuel", fuel)}
              />
              {fuel}
            </label>
          ))}
        </div>
      </div>

      <div className={styles.group}>
        <label>Transmisión</label>
        <div className={styles.checks}>
          {["Manual", "Automática"].map((transmission) => (
            <label key={transmission}>
              <input
                type="checkbox"
                checked={filters.transmission.includes(transmission)}
                onChange={() =>
                  onArrayFilterChange("transmission", transmission)
                }
              />
              {transmission}
            </label>
          ))}
        </div>
      </div>

      <div className={styles.group}>
        <label>Ubicación</label>
        <select
          value={filters.location}
          onChange={(e) => onFilterChange("location", e.target.value)}
        >
          <option value="">Todas las provincias</option>
          {locations.map((location) => (
            <option key={location} value={location}>
              {location}
            </option>
          ))}
        </select>
      </div>

      <div className={styles.group}>
        <label>Tipo de vendedor</label>
        <div className={styles.checks}>
          {["Particular", "Concesionario"].map((sellerType) => (
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
      </div>

      <div className={styles.bottomActions}>
        <button className={styles.resultsBtn} onClick={handleClose}>
          Ver resultados
        </button>
        <button className={styles.saveBtn} onClick={onResetFilters}>
          Limpiar filtros
        </button>
      </div>
    </div>
  );
};

export default VehicleFiltersSidebar;