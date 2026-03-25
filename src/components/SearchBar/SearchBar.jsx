import styles from "./SearchBar.module.css";

const SearchBar = () => {
  return (
    <div className={styles.searchBox}>
      <div className={styles.field}>
        <label>¿Qué buscás?</label>
        <input type="text" placeholder="Ej: Toyota Corolla" />
      </div>

      <div className={styles.field}>
        <label>Ubicación</label>
        <input type="text" placeholder="Ej: Buenos Aires" />
      </div>

      <div className={styles.field}>
        <label>Precio máximo</label>
        <input type="text" placeholder="Ej: USD 20.000" />
      </div>

      <button className={styles.searchBtn}>Buscar</button>
    </div>
  );
};

export default SearchBar;