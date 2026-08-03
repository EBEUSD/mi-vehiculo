import { Gauge, Info, Sparkles } from "lucide-react";
import styles from "./CaracteristicasCompletasStep.module.css";

const fuelOpts    = ["Gasolina", "Diésel", "Híbrido", "Eléctrico", "Gas LP"];
const transOpts   = ["Manual", "Automática", "CVT"];
const doorsOpts   = ["2", "3", "4", "5"];
const bodyOpts    = ["Sedán", "Hatchback", "SUV", "Pickup", "Station Wagon", "Coupé", "Convertible", "Furgón", "Monovolumen"];
const tracOpts    = ["Delantera 4x2", "Trasera 4x2", "4x4", "AWD"];
const colorOpts   = ["Blanco","Negro","Gris","Plateado","Azul","Azul oscuro","Rojo","Bordo","Beige","Marrón","Verde","Amarillo","Naranja","Dorado","Celeste","Violeta"];
const stateOpts   = ["Excelente", "Muy bueno", "Bueno", "Regular"];
const papersOpts  = ["Sí", "No"];
const vtvOpts     = ["Al día", "Vencida", "No aplica"];
const debtOpts    = ["Sin deudas", "Tiene deudas"];
const ownerOpts   = ["Titular", "Familiar", "Gestor", "Concesionaria"];

const CaracteristicasCompletasStep = ({ formData, onChange }) => {
  const setValue = (name, value) => onChange({ target: { name, value } });

  const Chips = ({ name, opts }) => (
    <div className={styles.chips}>
      {opts.map((o) => (
        <button
          key={o}
          type="button"
          className={`${styles.chip} ${formData[name] === o ? styles.chipActive : ""}`}
          onClick={() => setValue(name, o)}
        >
          {o}
        </button>
      ))}
    </div>
  );

  return (
    <>
      {/* Condición */}
      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>Condición <span>*</span></h3>
        <div className={styles.condGrid}>
          <button
            type="button"
            className={`${styles.condCard} ${formData.condicion === "Nuevo" ? styles.condActive : ""}`}
            onClick={() => setValue("condicion", "Nuevo")}
          >
            <span className={styles.condIcon}><Sparkles size={18} /></span>
            <span className={styles.condContent}>
              <strong>Nuevo</strong><small>0 km. Sin uso previo.</small>
            </span>
          </button>
          <button
            type="button"
            className={`${styles.condCard} ${formData.condicion === "Usado" ? styles.condActive : ""}`}
            onClick={() => setValue("condicion", "Usado")}
          >
            <span className={styles.condIcon}><Gauge size={18} /></span>
            <span className={styles.condContent}>
              <strong>Usado</strong><small>Con uso previo.</small>
            </span>
          </button>
        </div>
      </div>

      {/* Características */}
      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>Características</h3>
        <div className={styles.specsGrid}>

          <div className={styles.field}>
            <label>Color <span>*</span></label>
            <select name="color" value={formData.color} onChange={onChange}>
              <option value="">Seleccioná el color</option>
              {colorOpts.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          <div className={styles.field}>
            <label>Motor</label>
            <input
              type="text"
              name="motor"
              value={formData.motor}
              onChange={onChange}
              placeholder="Ej.: 1.6, 2.0, 3.5 V6"
            />
          </div>

          <div className={`${styles.field} ${styles.full}`}>
            <label>Combustible <span>*</span></label>
            <Chips name="combustible" opts={fuelOpts} />
          </div>

          <div className={`${styles.field} ${styles.full}`}>
            <label>Transmisión <span>*</span></label>
            <Chips name="transmision" opts={transOpts} />
          </div>

          <div className={styles.field}>
            <label>Puertas</label>
            <Chips name="puertas" opts={doorsOpts} />
          </div>

          <div className={styles.field}>
            <label>Tracción</label>
            <Chips name="traccion" opts={tracOpts} />
          </div>

          <div className={`${styles.field} ${styles.full}`}>
            <label>Carrocería</label>
            <Chips name="carroceria" opts={bodyOpts} />
          </div>
        </div>
      </div>

      {/* Documentación y estado */}
      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>Documentación y estado</h3>
        <div className={styles.docsGrid}>
          <div className={styles.field}>
            <label>Papeles al día</label>
            <Chips name="papelesAlDia" opts={papersOpts} />
          </div>

          <div className={styles.field}>
            <label>Tarjeta de circulación</label>
            <Chips name="vtv" opts={vtvOpts} />
          </div>

          <div className={styles.field}>
            <label>Deudas</label>
            <Chips name="deudas" opts={debtOpts} />
          </div>

          <div className={styles.field}>
            <label>Titularidad</label>
            <select name="titularidad" value={formData.titularidad} onChange={onChange}>
              {ownerOpts.map((o) => <option key={o} value={o}>{o}</option>)}
            </select>
          </div>

          <div className={`${styles.field} ${styles.full}`}>
            <label>Estado general</label>
            <Chips name="estadoGeneral" opts={stateOpts} />
          </div>
        </div>
      </div>

      {/* Descripción */}
      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>
          Descripción <span className={styles.optional}>(opcional)</span>
        </h3>
        <div className={styles.field}>
          <textarea
            name="descripcion"
            value={formData.descripcion || ""}
            onChange={onChange}
            maxLength={800}
            placeholder="Describí tu vehículo: estado, historial de mantenimiento, equipamiento, razón de venta…"
            className={styles.textarea}
          />
          <p className={styles.charCount}>{(formData.descripcion || "").length}/800</p>
        </div>
      </div>

      <div className={styles.notice}>
        <Info size={16} />
        <p>La información detallada y honesta genera más consultas de compradores serios.</p>
      </div>
    </>
  );
};

export default CaracteristicasCompletasStep;
