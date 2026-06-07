import { Gauge, Info, Sparkles } from "lucide-react";
import styles from "./DatosBasicosStep.module.css";

const DatosBasicosStep = ({ formData, onChange }) => {
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
      <div className={styles.formGrid}>
        <div className={styles.field}>
          <label>
            Tipo de vehículo <span>*</span>
          </label>

          <select
            name="tipoVehiculo"
            value={formData.tipoVehiculo}
            onChange={onChange}
          >
            <option value="">Seleccioná el tipo</option>
            <option value="Auto">Auto</option>
            <option value="Moto">Moto</option>
            <option value="Camioneta">Camioneta</option>
            <option value="Camión">Camión</option>
          </select>
        </div>

        <div className={styles.field}>
          <label>
            Marca <span>*</span>
          </label>

          <select name="marca" value={formData.marca} onChange={onChange}>
            <option value="">Seleccioná la marca</option>
            <option value="Toyota">Toyota</option>
            <option value="Volkswagen">Volkswagen</option>
            <option value="Ford">Ford</option>
            <option value="Chevrolet">Chevrolet</option>
            <option value="Peugeot">Peugeot</option>
            <option value="Fiat">Fiat</option>
            <option value="Renault">Renault</option>
          </select>
        </div>

        <div className={styles.field}>
          <label>
            Modelo <span>*</span>
          </label>

          <select
            name="modelo"
            value={formData.modelo}
            onChange={onChange}
            className={!formData.modelo ? styles.fieldError : ""}
          >
            <option value="">Seleccioná el modelo</option>
            <option value="Corolla">Corolla</option>
            <option value="Hilux">Hilux</option>
            <option value="Golf">Golf</option>
            <option value="Focus">Focus</option>
            <option value="Cruze">Cruze</option>
            <option value="208">208</option>
          </select>

          {!formData.modelo && (
            <p className={styles.errorText}>Campo obligatorio</p>
          )}
        </div>

        <div className={styles.field}>
          <label>
            Año <span>*</span>
          </label>

          <input
            type="text"
            name="anio"
            value={formData.anio}
            onChange={onChange}
            placeholder="Ej.: 2018"
          />
        </div>

        <div className={styles.field}>
          <label>Versión</label>

          <input
            type="text"
            name="version"
            value={formData.version}
            onChange={onChange}
            placeholder="Ej.: 1.6 Trendline"
          />
        </div>

        <div className={styles.field}>
          <label>
            Kilometraje <span>*</span>
          </label>

          <div className={styles.inputWithSuffix}>
            <input
              type="text"
              name="kilometraje"
              value={formData.kilometraje}
              onChange={onChange}
              placeholder="Ej.: 85000"
            />
            <span>km</span>
          </div>
        </div>

        <div className={`${styles.field} ${styles.conditionField}`}>
          <label>
            Condición <span>*</span>
          </label>

          <div className={styles.conditionGrid}>
            <button
              type="button"
              className={`${styles.conditionCard} ${
                formData.condicion === "Nuevo" ? styles.conditionActive : ""
              }`}
              onClick={() => setValue("condicion", "Nuevo")}
            >
              <span className={styles.conditionIcon}>
                <Sparkles size={29} />
              </span>

              <span className={styles.conditionContent}>
                <strong>Nuevo</strong>
                <small>0 km. Sin uso previo.</small>
              </span>
            </button>

            <button
              type="button"
              className={`${styles.conditionCard} ${
                formData.condicion === "Usado" ? styles.conditionActive : ""
              }`}
              onClick={() => setValue("condicion", "Usado")}
            >
              <span className={styles.conditionIcon}>
                <Gauge size={29} />
              </span>

              <span className={styles.conditionContent}>
                <strong>Usado</strong>
                <small>Con uso previo.</small>
              </span>
            </button>
          </div>
        </div>
      </div>

      <div className={styles.infoNotice}>
        <Info size={18} />
        <p>
          Todos los campos marcados con <span>*</span> son obligatorios.
        </p>
      </div>
    </>
  );
};

export default DatosBasicosStep;