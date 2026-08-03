import { Package2, Wrench } from "lucide-react";
import styles from "./DatosAccesorioStep.module.css";

const CATEGORIAS = [
  "Audio y multimedia", "Rines y llantas", "Iluminación",
  "Exterior", "Interior", "Seguridad", "Cuidado y limpieza",
  "Tapicería", "Mecánica de rendimiento", "Otro",
];

const CONDICIONES = [
  { value: "Nuevo",  icon: <Package2 size={22} />, sub: "Sin uso previo" },
  { value: "Usado",  icon: <Wrench size={22} />,   sub: "En buen estado" },
];

const DatosAccesorioStep = ({ formData, onChange }) => {
  const set = (name, value) => onChange({ target: { name, value } });

  return (
    <>
      <div className={styles.formGrid}>
        <div className={`${styles.field} ${styles.fullWidth}`}>
          <label>Nombre del accesorio <span>*</span></label>
          <input
            name="nombreAccesorio"
            value={formData.nombreAccesorio}
            onChange={onChange}
            placeholder="Ej: Rines 17 pulgadas, cámara de reversa, tapetes de cuero…"
          />
        </div>

        <div className={styles.field}>
          <label>Categoría <span>*</span></label>
          <select name="categoriaAccesorio" value={formData.categoriaAccesorio} onChange={onChange}>
            <option value="">Seleccioná la categoría</option>
            {CATEGORIAS.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        <div className={styles.field}>
          <label>Cantidad disponible</label>
          <input
            name="cantidad"
            type="number"
            min="1"
            value={formData.cantidad}
            onChange={onChange}
            placeholder="1"
          />
        </div>

        <div className={`${styles.field} ${styles.fullWidth}`}>
          <label>Condición <span>*</span></label>
          <div className={styles.conditionGrid}>
            {CONDICIONES.map((c) => (
              <button
                key={c.value}
                type="button"
                className={`${styles.conditionCard} ${formData.condicion === c.value ? styles.conditionActive : ""}`}
                onClick={() => set("condicion", c.value)}
              >
                <div className={styles.conditionIcon}>{c.icon}</div>
                <div className={styles.conditionContent}>
                  <strong>{c.value}</strong>
                  <small>{c.sub}</small>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className={`${styles.field} ${styles.fullWidth}`}>
          <label>Descripción <span>*</span></label>
          <textarea
            name="descripcionItem"
            value={formData.descripcionItem}
            onChange={onChange}
            rows={4}
            placeholder="Describe el accesorio: marca, medidas, compatibilidad, estado, si incluye instalación, etc."
          />
        </div>
      </div>
    </>
  );
};

export default DatosAccesorioStep;
