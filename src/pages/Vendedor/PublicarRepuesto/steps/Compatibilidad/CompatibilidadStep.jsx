import { Globe } from "lucide-react";
import styles from "./CompatibilidadStep.module.css";

const MARCAS = [
  "Toyota","Honda","Nissan","Kia","Hyundai","Chevrolet","Suzuki",
  "Mitsubishi","Mazda","Ford","Volkswagen","Subaru","Isuzu",
  "Jeep","Dodge","BMW","Mercedes-Benz",
];

const CompatibilidadStep = ({ formData, onChange }) => {
  const set = (name, value) => onChange({ target: { name, value } });

  const toggleMarca = (marca) => {
    const current = formData.compatibleMarcas
      ? formData.compatibleMarcas.split(",").map((m) => m.trim()).filter(Boolean)
      : [];
    const next = current.includes(marca)
      ? current.filter((m) => m !== marca)
      : [...current, marca];
    set("compatibleMarcas", next.join(", "));
  };

  const selectedMarcas = formData.compatibleMarcas
    ? formData.compatibleMarcas.split(",").map((m) => m.trim()).filter(Boolean)
    : [];

  return (
    <>
      <div className={styles.section}>
        <div className={styles.universalRow}>
          <label className={styles.universalLabel}>
            <input
              type="checkbox"
              checked={!!formData.esUniversal}
              onChange={(e) => set("esUniversal", e.target.checked)}
              className={styles.universalCheck}
            />
            <Globe size={18} />
            <span>Repuesto universal — compatible con cualquier vehículo</span>
          </label>
        </div>

        {!formData.esUniversal && (
          <>
            <div className={styles.field}>
              <label>Marcas compatibles</label>
              <div className={styles.marcasGrid}>
                {MARCAS.map((m) => (
                  <button
                    key={m}
                    type="button"
                    className={`${styles.marcaChip} ${selectedMarcas.includes(m) ? styles.marcaChipActive : ""}`}
                    onClick={() => toggleMarca(m)}
                  >
                    {m}
                  </button>
                ))}
              </div>
            </div>

            <div className={styles.fieldsRow}>
              <div className={styles.field}>
                <label>Modelos compatibles</label>
                <input
                  name="compatibleModelos"
                  value={formData.compatibleModelos}
                  onChange={onChange}
                  placeholder="Ej: Corolla, Yaris, RAV4 (separados por coma)"
                />
              </div>

              <div className={styles.field}>
                <label>Años compatibles</label>
                <input
                  name="compatibleAnios"
                  value={formData.compatibleAnios}
                  onChange={onChange}
                  placeholder="Ej: 2015-2022 o Todos"
                />
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
};

export default CompatibilidadStep;
