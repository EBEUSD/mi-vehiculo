import styles from "./Filters.module.css";

const Filters = () => {
  return (
    <div className={styles.filters}>
      <div className={styles.header}>
        <h3>Filtros</h3>
        <button>Limpiar</button>
      </div>

      <div className={styles.group}>
        <label>Categoría</label>
        <select>
          <option>Todos</option>
          <option>Autos</option>
          <option>Motos</option>
          <option>Camionetas</option>
        </select>
      </div>

      <div className={styles.group}>
        <label>Marca</label>
        <select>
          <option>Todas</option>
          <option>Ford</option>
          <option>Chevrolet</option>
          <option>Toyota</option>
          <option>Volkswagen</option>
        </select>
      </div>

      <div className={styles.group}>
        <label>Año</label>
        <select>
          <option>Cualquiera</option>
          <option>2024</option>
          <option>2023</option>
          <option>2022</option>
          <option>2021</option>
        </select>
      </div>

      <div className={styles.group}>
        <label>Combustible</label>
        <select>
          <option>Todos</option>
          <option>Nafta</option>
          <option>Diésel</option>
          <option>Híbrido</option>
          <option>Eléctrico</option>
        </select>
      </div>

      <div className={styles.group}>
        <label>Transmisión</label>
        <select>
          <option>Todas</option>
          <option>Manual</option>
          <option>Automática</option>
        </select>
      </div>
    </div>
  );
};

export default Filters;