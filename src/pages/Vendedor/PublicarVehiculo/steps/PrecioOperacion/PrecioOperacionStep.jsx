import {
  ArrowLeftRight,
  Ban,
  Building2,
  CircleSlash,
  Info,
  Lock,
  Tag,
  TrendingUp,
} from "lucide-react";
import styles from "./PrecioOperacionStep.module.css";

const PrecioOperacionStep = ({ formData, onChange }) => {
  const setValue = (name, value) => {
    onChange({
      target: {
        name,
        value,
      },
    });
  };

  return (
    <>
      <div className={styles.priceHeaderNote}>
        <div className={styles.priceNoteIcon}>
          <TrendingUp size={24} />
        </div>

        <p>Un precio competitivo ayuda a recibir más consultas.</p>
      </div>

      <div className={styles.formGrid}>
        <div className={styles.field}>
          <label>
            Precio <span>*</span>
          </label>

          <div className={styles.inputWithPrefix}>
            <span>$</span>
            <input
              type="text"
              name="precio"
              value={formData.precio}
              onChange={onChange}
              placeholder="12,500"
            />
          </div>
        </div>

        <div className={styles.field}>
          <label>Moneda</label>
          <select name="moneda" value={formData.moneda} onChange={onChange}>
            <option value="USD">USD — Dólar estadounidense</option>
          </select>
        </div>

        <div className={styles.optionGroup}>
          <label>Acepta permuta</label>

          <div className={styles.compactOptionGrid}>
            <button
              type="button"
              className={`${styles.choiceCard} ${
                formData.aceptaPermuta === "Si" ? styles.choiceActive : ""
              }`}
              onClick={() => setValue("aceptaPermuta", "Si")}
            >
              <span className={styles.choiceIcon}>
                <ArrowLeftRight size={16} />
              </span>

              <span className={styles.choiceText}>
                <strong>Sí, acepto permuta</strong>
              </span>
            </button>

            <button
              type="button"
              className={`${styles.choiceCard} ${
                formData.aceptaPermuta === "No" ? styles.choiceActive : ""
              }`}
              onClick={() => setValue("aceptaPermuta", "No")}
            >
              <span className={styles.choiceIcon}>
                <CircleSlash size={16} />
              </span>

              <span className={styles.choiceText}>
                <strong>No acepto permuta</strong>
              </span>
            </button>
          </div>
        </div>

        <div className={styles.optionGroup}>
          <label>Precio negociable</label>

          <div className={styles.compactOptionGrid}>
            <button
              type="button"
              className={`${styles.choiceCard} ${
                formData.precioNegociable === "Si" ? styles.choiceActive : ""
              }`}
              onClick={() => setValue("precioNegociable", "Si")}
            >
              <span className={styles.choiceIcon}>
                <Tag size={16} />
              </span>

              <span className={styles.choiceText}>
                <strong>Sí, negociable</strong>
              </span>
            </button>

            <button
              type="button"
              className={`${styles.choiceCard} ${
                formData.precioNegociable === "No" ? styles.choiceActive : ""
              }`}
              onClick={() => setValue("precioNegociable", "No")}
            >
              <span className={styles.choiceIcon}>
                <Lock size={16} />
              </span>

              <span className={styles.choiceText}>
                <strong>No, precio fijo</strong>
              </span>
            </button>
          </div>
        </div>

        <div className={styles.fullField}>
          <label>Financiación</label>

          <div className={styles.wideOptionGrid}>
            <button
              type="button"
              className={`${styles.choiceCard} ${
                formData.financiacion === "Si" ? styles.choiceActive : ""
              }`}
              onClick={() => setValue("financiacion", "Si")}
            >
              <span className={styles.choiceIcon}>
                <Building2 size={16} />
              </span>

              <span className={styles.choiceText}>
                <strong>Sí, ofrezco financiación</strong>
              </span>
            </button>

            <button
              type="button"
              className={`${styles.choiceCard} ${
                formData.financiacion === "No" ? styles.choiceActive : ""
              }`}
              onClick={() => setValue("financiacion", "No")}
            >
              <span className={styles.choiceIcon}>
                <Ban size={16} />
              </span>

              <span className={styles.choiceText}>
                <strong>No ofrezco financiación</strong>
              </span>
            </button>
          </div>
        </div>

        <div className={styles.fullField}>
          <label>Información adicional sobre financiación</label>

          <div className={styles.textareaWrap}>
            <textarea
              name="infoFinanciacion"
              value={formData.infoFinanciacion || ""}
              onChange={onChange}
              maxLength={500}
              placeholder="Ej.: Entidad financiera, monto máximo, tasa, plazo, etc."
            />
            <span>{formData.infoFinanciacion?.length || 0}/500</span>
          </div>
        </div>
      </div>

      <div className={styles.infoNotice}>
        <Info size={18} />
        <p>
          Completá esta información con claridad para evitar consultas
          innecesarias.
        </p>
      </div>
    </>
  );
};

export default PrecioOperacionStep;