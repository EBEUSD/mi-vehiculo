import { Wrench, Package2, RefreshCw } from "lucide-react";
import styles from "./DatosRepuestoStep.module.css";

const CATEGORIAS = [
  "Motor", "Frenos", "Suspensión", "Dirección", "Transmisión",
  "Carrocería", "Sistema eléctrico", "Enfriamiento", "Escape",
  "Neumáticos y rines", "Otro",
];

const CONDICIONES = [
  { value: "Nuevo",         icon: <Package2 size={22} />, sub: "Sin uso previo" },
  { value: "Usado",         icon: <Wrench size={22} />,   sub: "En buen estado" },
  { value: "Reacondicionado", icon: <RefreshCw size={22} />, sub: "Restaurado / revisado" },
];

const DatosRepuestoStep = ({ formData, onChange }) => {
  const set = (name, value) => onChange({ target: { name, value } });

  return (
    <>
      <div className={styles.formGrid}>
        <div className={`${styles.field} ${styles.fullWidth}`}>
          <label>Nombre del repuesto <span>*</span></label>
          <input
            name="nombreRepuesto"
            value={formData.nombreRepuesto}
            onChange={onChange}
            placeholder="Ej: Bomba de agua, pastillas de freno, alternador…"
          />
        </div>

        <div className={styles.field}>
          <label>Categoría <span>*</span></label>
          <select name="categoriaRepuesto" value={formData.categoriaRepuesto} onChange={onChange}>
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
            placeholder="Describe el repuesto: marca, código OEM, estado de uso, si tiene garantía, etc."
          />
        </div>
      </div>
    </>
  );
};

export default DatosRepuestoStep;
