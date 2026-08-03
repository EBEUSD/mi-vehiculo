import { DollarSign, MapPin, Users } from "lucide-react";
import styles from "./PrecioContactoStep.module.css";

const DEPTOS = [
  "Ahuachapán","Cabañas","Chalatenango","Cuscatlán",
  "La Libertad","La Paz","La Unión","Morazán",
  "San Miguel","San Salvador","San Vicente","Santa Ana",
  "Sonsonate","Usulután",
];

const MUNICIPIOS = [
  "San Salvador","Santa Ana","San Miguel","Santa Tecla",
  "Antiguo Cuscatlán","Soyapango","Apopa","Mejicanos",
  "Sonsonate","Ahuachapán","Zacatecoluca","Cojutepeque",
  "Chalatenango","Usulután","San Vicente","La Unión",
  "Ciudad Delgado","Ilopango","Tonacatepeque","Aguilares",
];

const PrecioContactoStep = ({ formData, onChange }) => {
  const setValue = (name, value) => onChange({ target: { name, value } });

  const Toggle = ({ name, label }) => (
    <div className={styles.toggleGroup}>
      <span className={styles.toggleLabel}>{label}</span>
      <div className={styles.togglePill}>
        {["Si", "No"].map((v) => (
          <button
            key={v}
            type="button"
            className={`${styles.pillBtn} ${formData[name] === v ? styles.pillActive : ""}`}
            onClick={() => setValue(name, v)}
          >
            {v}
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <>
      {/* Precio */}
      <div className={styles.section}>
        <div className={styles.sectionHead}>
          <DollarSign size={20} />
          <h3>Precio</h3>
        </div>

        <div className={styles.priceRow}>
          <span className={styles.currency}>$</span>
          <input
            type="text"
            name="precio"
            value={formData.precio}
            onChange={onChange}
            placeholder="0"
            className={styles.priceInput}
          />
          <span className={styles.priceCurrency}>USD</span>
        </div>

        <div className={styles.toggleRow}>
          <Toggle name="precioNegociable" label="Precio negociable" />
          <Toggle name="aceptaPermuta"    label="Acepta permuta" />
          <Toggle name="financiacion"     label="Acepta financiación" />
        </div>
      </div>

      {/* Ubicación */}
      <div className={styles.section}>
        <div className={styles.sectionHead}>
          <MapPin size={20} />
          <h3>Ubicación</h3>
        </div>

        <div className={styles.twoCol}>
          <div className={styles.field}>
            <label>Departamento <span>*</span></label>
            <select name="provincia" value={formData.provincia} onChange={onChange}>
              <option value="">Seleccioná el departamento</option>
              {DEPTOS.map((d) => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
          <div className={styles.field}>
            <label>Municipio <span>*</span></label>
            <select name="ciudad" value={formData.ciudad} onChange={onChange}>
              <option value="">Seleccioná el municipio</option>
              {MUNICIPIOS.map((m) => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* Contacto */}
      <div className={styles.section}>
        <div className={styles.sectionHead}>
          <Users size={20} />
          <h3>Datos de contacto</h3>
        </div>

        <div className={styles.twoCol}>
          <div className={styles.field}>
            <label>Nombre <span>*</span></label>
            <input
              type="text"
              name="nombreContacto"
              value={formData.nombreContacto}
              onChange={onChange}
              placeholder="Ej.: Juan Pérez"
            />
          </div>

          <div className={styles.field}>
            <label>WhatsApp <span>*</span></label>
            <div className={styles.phoneInput}>
              <span>+503</span>
              <input
                type="text"
                name="whatsapp"
                value={formData.whatsapp}
                onChange={onChange}
                placeholder="7000-0000"
              />
            </div>
          </div>

          <div className={styles.field}>
            <label>Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={onChange}
              placeholder="correo@email.com"
            />
          </div>

          <div className={styles.field}>
            <label>Horario de contacto</label>
            <select name="horarioContacto" value={formData.horarioContacto} onChange={onChange}>
              <option value="">Seleccioná un horario</option>
              <option value="Mañana">Mañana</option>
              <option value="Tarde">Tarde</option>
              <option value="Noche">Noche</option>
              <option value="Todo el día">Todo el día</option>
            </select>
          </div>
        </div>

        <label className={styles.switchRow}>
          <span className={`${styles.switchTrack} ${formData.mostrarWhatsapp === "Si" ? styles.switchOn : ""}`}
            onClick={() => setValue("mostrarWhatsapp", formData.mostrarWhatsapp === "Si" ? "No" : "Si")}
          >
            <span className={styles.switchKnob} />
          </span>
          <span className={styles.switchText}>Mostrar WhatsApp públicamente</span>
        </label>
      </div>
    </>
  );
};

export default PrecioContactoStep;
