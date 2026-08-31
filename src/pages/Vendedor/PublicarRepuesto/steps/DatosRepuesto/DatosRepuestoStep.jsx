import { useState } from "react";
import { Wrench, Package2, RefreshCw } from "lucide-react";
import styles from "./DatosRepuestoStep.module.css";

const CATEGORIAS = [
  "Motor", "Frenos", "Suspensión", "Dirección", "Transmisión",
  "Carrocería", "Sistema eléctrico", "Enfriamiento", "Escape",
  "Neumáticos y rines", "Otro",
];

const CONDICIONES = [
  { value: "Nuevo",           icon: <Package2 size={22} />, sub: "Sin uso previo" },
  { value: "Usado",           icon: <Wrench size={22} />,   sub: "En buen estado" },
  { value: "Reacondicionado", icon: <RefreshCw size={22} />, sub: "Restaurado / revisado" },
];

const DatosRepuestoStep = ({ formData, onChange, hideCategory = false }) => {
  const set = (name, value) => onChange({ target: { name, value } });

  // Progressive reveal: 1=nombre, 2=condición, 3=descripción+cantidad
  const [reveal, setReveal] = useState(() => {
    if (!hideCategory) return 3; // old standalone mode: show everything
    if (formData.descripcionItem?.trim()) return 3;
    if (formData.nombreRepuesto?.trim()) return 2;
    return 1;
  });

  const handleNombre = (e) => {
    onChange(e);
    if (e.target.value.trim().length >= 2) setReveal((r) => Math.max(r, 2));
  };

  const handleCondicion = (value) => {
    set("condicion", value);
    setReveal((r) => Math.max(r, 3));
  };

  return (
    <div className={styles.formGrid}>

      {/* ── Nombre — siempre visible ── */}
      <div className={`${styles.field} ${styles.fullWidth}`}>
        <label>Nombre del repuesto <span>*</span></label>
        <input
          name="nombreRepuesto"
          value={formData.nombreRepuesto}
          onChange={handleNombre}
          placeholder="Ej: Bomba de agua, pastillas de freno, alternador…"
        />
      </div>

      {/* ── Categoría (solo en modo standalone) ── */}
      {!hideCategory && (
        <div className={styles.field}>
          <label>Categoría <span>*</span></label>
          <select name="categoriaRepuesto" value={formData.categoriaRepuesto} onChange={onChange}>
            <option value="">Seleccioná la categoría</option>
            {CATEGORIAS.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
      )}

      {/* ── Condición — aparece al escribir el nombre ── */}
      {reveal >= 2 && (
        <div className={`${styles.field} ${styles.fullWidth} ${reveal === 2 ? styles.reveal : ""}`}>
          <label>Condición <span>*</span></label>
          <div className={styles.conditionGrid}>
            {CONDICIONES.map((c) => (
              <button
                key={c.value}
                type="button"
                className={`${styles.conditionCard} ${formData.condicion === c.value ? styles.conditionActive : ""}`}
                onClick={() => handleCondicion(c.value)}
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
      )}

      {/* ── Descripción + Cantidad — aparecen al elegir condición ── */}
      {reveal >= 3 && (
        <>
          <div className={`${styles.field} ${styles.fullWidth} ${reveal === 3 ? styles.reveal : ""}`}>
            <label>Descripción <span>*</span></label>
            <textarea
              name="descripcionItem"
              value={formData.descripcionItem}
              onChange={onChange}
              rows={4}
              placeholder="Describe el repuesto: marca, código OEM, estado de uso, si tiene garantía, etc."
            />
          </div>

          <div className={`${styles.field} ${hideCategory ? styles.fullWidth : ""} ${reveal === 3 ? styles.reveal : ""}`}>
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
        </>
      )}

    </div>
  );
};

export default DatosRepuestoStep;
