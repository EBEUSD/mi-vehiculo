import styles from "./VehicleResultsToolbar.module.css";

const VehicleResultsToolbar = ({
  total,
  start,
  end,
  activeChips,
  onRemoveChip,
  onResetFilters,
  sortBy,
  onSortChange,
}) => {
  return (
    <div className={styles.wrapper}>
      <div className={styles.chips}>
        {activeChips.map((chip) => (
          <span key={chip.key} className={styles.chip}>
            {chip.label}
            <button onClick={() => onRemoveChip(chip.key)}>×</button>
          </span>
        ))}

        {activeChips.length > 0 && (
          <button className={styles.clearBtn} onClick={onResetFilters}>
            Limpiar filtros
          </button>
        )}
      </div>

      <div className={styles.bar}>
        <p>
          Mostrando {start} - {end} de {total.toLocaleString("es-AR")} resultados
        </p>

        <div className={styles.sort}>
          <span>Ordenar por:</span>

          <button
            className={sortBy === "relevant" ? styles.active : ""}
            onClick={() => onSortChange("relevant")}
          >
            Más relevantes
          </button>

          <button
            className={sortBy === "recent" ? styles.active : ""}
            onClick={() => onSortChange("recent")}
          >
            Más recientes
          </button>

          <button
            className={sortBy === "priceAsc" ? styles.active : ""}
            onClick={() => onSortChange("priceAsc")}
          >
            Menor precio
          </button>

          <button
            className={sortBy === "priceDesc" ? styles.active : ""}
            onClick={() => onSortChange("priceDesc")}
          >
            Mayor precio
          </button>

          <button
            className={sortBy === "kmAsc" ? styles.active : ""}
            onClick={() => onSortChange("kmAsc")}
          >
            Menor km
          </button>
        </div>
      </div>
    </div>
  );
};

export default VehicleResultsToolbar;