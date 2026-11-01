import { isValidPrice } from "../../../../../lib/money";
import styles from "./PrecioSimpleStep.module.css";

const OPTS_SI_NO = ["Si", "No"];

const PrecioSimpleStep = ({ formData, onChange }) => {
  const set = (name, value) => onChange({ target: { name, value } });
  const priceTyped = String(formData.precio || "").trim() !== "";

  return (
    <div className={styles.formGrid}>
      <div className={`${styles.field} ${styles.fullWidth}`}>
        <label htmlFor="precio-simple">Precio (USD) <span>*</span></label>
        <div className={styles.priceWrap}>
          <span className={styles.currency}>$</span>
          <input
            id="precio-simple"
            name="precio"
            type="text"
            inputMode="decimal"
            autoComplete="off"
            value={formData.precio}
            onChange={onChange}
            placeholder="Ej.: 35.00"
          />
        </div>
        {priceTyped && !isValidPrice(formData.precio) && (
          <p className={styles.fieldHint} role="alert">Ingresá un precio mayor a $0.</p>
        )}
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
