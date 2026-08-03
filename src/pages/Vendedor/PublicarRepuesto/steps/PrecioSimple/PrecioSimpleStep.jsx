import styles from "./PrecioSimpleStep.module.css";

const OPTS_SI_NO = ["Si", "No"];

const PrecioSimpleStep = ({ formData, onChange }) => {
  const set = (name, value) => onChange({ target: { name, value } });

  return (
    <div className={styles.formGrid}>
      <div className={`${styles.field} ${styles.fullWidth}`}>
        <label>Precio (USD) <span>*</span></label>
        <div className={styles.priceWrap}>
          <span className={styles.currency}>$</span>
          <input
            name="precio"
            type="number"
            min="0"
            value={formData.precio}
            onChange={onChange}
            placeholder="0.00"
          />
        </div>
      </div>

      <div className={styles.field}>
        <label>¿Precio negociable?</label>
        <div className={styles.btnGroup}>
          {OPTS_SI_NO.map((opt) => (
            <button
              key={opt}
              type="button"
              className={`${styles.groupBtn} ${formData.precioNegociable === opt ? styles.groupBtnActive : ""}`}
              onClick={() => set("precioNegociable", opt)}
            >
              {opt}
            </button>
          ))}
        </div>
      </div>

      <div className={styles.field}>
        <label>¿Aceptás permuta?</label>
        <div className={styles.btnGroup}>
          {OPTS_SI_NO.map((opt) => (
            <button
              key={opt}
              type="button"
              className={`${styles.groupBtn} ${formData.aceptaPermuta === opt ? styles.groupBtnActive : ""}`}
              onClick={() => set("aceptaPermuta", opt)}
            >
              {opt}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PrecioSimpleStep;
