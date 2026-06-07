import { Info } from "lucide-react";
import styles from "../../PublicarVehiculo.module.css";

const papersOptions = ["Sí", "No"];
const vtvOptions = ["Vigente", "Vencida", "No aplica"];
const debtOptions = ["Sin deudas", "Tiene deudas"];
const ownershipOptions = ["Titular", "Familiar", "Gestor", "Concesionaria"];
const conditionOptions = ["Excelente", "Muy bueno", "Bueno", "Regular"];

const EstadoDocumentacionStep = ({ formData, onChange }) => {
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
      <div className={styles.documentCard}>
        <h3>Documentación</h3>

        <div className={styles.documentationGrid}>
          <div className={styles.segmentGroup}>
            <label>
              Papeles al día <span>*</span>
            </label>

            <div className={styles.segmentControl}>
              {papersOptions.map((option) => (
                <button
                  key={option}
                  type="button"
                  className={`${styles.segmentBtn} ${
                    formData.papelesAlDia === option ? styles.segmentActive : ""
                  }`}
                  onClick={() => setValue("papelesAlDia", option)}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>

          <div className={styles.segmentGroup}>
            <label>
              VTV <span>*</span>
            </label>

            <div className={styles.segmentControl}>
              {vtvOptions.map((option) => (
                <button
                  key={option}
                  type="button"
                  className={`${styles.segmentBtn} ${
                    formData.vtv === option ? styles.segmentActive : ""
                  }`}
                  onClick={() => setValue("vtv", option)}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>

          <div className={styles.segmentGroup}>
            <label>
              Deudas <span>*</span>
            </label>

            <div className={styles.segmentControl}>
              {debtOptions.map((option) => (
                <button
                  key={option}
                  type="button"
                  className={`${styles.segmentBtn} ${
                    formData.deudas === option ? styles.segmentActive : ""
                  }`}
                  onClick={() => setValue("deudas", option)}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>

          <div className={styles.field}>
            <label>
              Titularidad <span>*</span>
            </label>

            <select
              name="titularidad"
              value={formData.titularidad || ""}
              onChange={onChange}
            >
              {ownershipOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className={styles.documentCard}>
        <h3>Estado mecánico</h3>

        <div className={styles.segmentGroup}>
          <label>
            Estado general <span>*</span>
          </label>

          <div className={styles.wideSegmentControl}>
            {conditionOptions.map((option) => (
              <button
                key={option}
                type="button"
                className={`${styles.segmentBtn} ${
                  formData.estadoGeneral === option ? styles.segmentActive : ""
                }`}
                onClick={() => setValue("estadoGeneral", option)}
              >
                {option}
              </button>
            ))}
          </div>

          <p className={styles.fieldHelper}>
            Seleccioná la opción que mejor describa el estado general del
            vehículo.
          </p>
        </div>
      </div>

      <div className={styles.documentCard}>
        <h3>Observaciones</h3>
        <p className={styles.cardDescription}>
          Agregá detalles o aclaraciones que consideres importantes.
        </p>

        <div className={styles.textareaWrap}>
          <textarea
            name="observaciones"
            value={formData.observaciones || ""}
            onChange={onChange}
            maxLength={500}
            placeholder="Ej.: Se le cambiaron los frenos delanteros y traseros hace 3 meses."
          />
          <span>{formData.observaciones?.length || 0}/500</span>
        </div>
      </div>

      <div className={styles.trustNotice}>
        <div className={styles.trustIcon}>
          <Info size={22} />
        </div>

        <div>
          <strong>La información transparente ayuda a vender más rápido</strong>
          <p>
            Los compradores valoran la honestidad y eso se refleja en más
            consultas y mejores ofertas.
          </p>
        </div>
      </div>
    </>
  );
};

export default EstadoDocumentacionStep;