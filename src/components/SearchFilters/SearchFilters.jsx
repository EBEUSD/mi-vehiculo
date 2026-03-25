import styles from "./SearchFilters.module.css";
import { FiSearch } from "react-icons/fi";

const SearchFilters = () => {
  return (
    <section className={styles.wrapper}>
      <div className={styles.header}>
        <h2>
          <FiSearch />
          <span>Encontrá tu vehículo ideal</span>
        </h2>
      </div>

      <div className={styles.filtersGrid}>
        <div className={styles.field}>
          <label>Tipo</label>
          <select>
            <option>Autos</option>
            <option>Motos</option>
            <option>Camionetas</option>
            <option>Camiones</option>
          </select>
        </div>

        <div className={styles.field}>
          <label>Marca</label>
          <select>
            <option>Todas las marcas</option>
          </select>
        </div>

        <div className={styles.field}>
          <label>Modelo</label>
          <select>
            <option>Todos los modelos</option>
          </select>
        </div>

        <div className={styles.field}>
          <label>Año desde</label>
          <select>
            <option>Año mínimo</option>
          </select>
        </div>

        <div className={styles.field}>
          <label>Año hasta</label>
          <select>
            <option>Año máximo</option>
          </select>
        </div>

        <div className={styles.field}>
          <label>Precio máximo</label>
          <select>
            <option>Precio máximo</option>
          </select>
        </div>

        <div className={styles.field}>
          <label>Ubicación</label>
          <select>
            <option>Todas las provincias</option>
          </select>
        </div>

        <div className={styles.actions}>
          <button className={styles.primaryBtn}>Ver resultados</button>
          <button className={styles.clearBtn}>Limpiar filtros</button>
        </div>
      </div>
    </section>
  );
};

export default SearchFilters;