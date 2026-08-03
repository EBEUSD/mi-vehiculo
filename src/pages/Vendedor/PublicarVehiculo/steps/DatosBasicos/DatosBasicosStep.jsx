import { Gauge, Info, Sparkles } from "lucide-react";
import styles from "./DatosBasicosStep.module.css";

const BRANDS = [
  "Toyota", "Nissan", "Honda", "Hyundai", "Kia", "Suzuki", "Mitsubishi",
  "Mazda", "Chevrolet", "Ford", "Volkswagen", "Jeep", "Dodge",
  "Mercedes-Benz", "BMW", "Audi", "Subaru", "Isuzu",
  "Fiat", "Renault", "Peugeot", "Otra",
];

const BRAND_MODELS = {
  Toyota:    ["Corolla", "Hilux", "RAV4", "Land Cruiser", "Prado", "Yaris", "Camry", "Fortuner", "Hiace", "Tacoma", "4Runner", "Prius", "C-HR", "Tundra", "Sienna"],
  Nissan:    ["Frontier", "X-Trail", "Kicks", "March", "Sentra", "Pathfinder", "Navara", "Versa", "Murano", "Qashqai", "Titan", "Armada"],
  Honda:     ["CR-V", "Civic", "HR-V", "Pilot", "Fit", "Accord", "Odyssey", "Passport", "Ridgeline"],
  Hyundai:   ["Tucson", "Santa Fe", "Accent", "Elantra", "Creta", "H-100", "Sonata", "Ioniq", "Kona", "Staria"],
  Kia:       ["Sportage", "Sorento", "Rio", "Picanto", "Seltos", "Telluride", "Soul", "Stinger", "Carnival"],
  Suzuki:    ["Grand Vitara", "Jimny", "Swift", "Vitara", "Carry", "Ertiga", "S-Cross", "Baleno"],
  Mitsubishi:["Montero Sport", "L200", "Outlander", "ASX", "Eclipse Cross", "Galant", "Lancer", "Xpander"],
  Mazda:     ["CX-5", "3", "CX-30", "CX-9", "6", "BT-50", "2", "MX-5", "CX-50"],
  Chevrolet: ["Tracker", "D-MAX", "Silverado", "Colorado", "Tahoe", "Aveo", "Cruze", "Trax", "Equinox", "Suburban", "Express"],
  Ford:      ["Ranger", "Explorer", "EcoSport", "F-150", "Escape", "Mustang", "Expedition", "Bronco", "Transit"],
  Volkswagen:["Golf", "Jetta", "Tiguan", "Passat", "Polo", "T-Cross", "Amarok"],
  Jeep:      ["Wrangler", "Grand Cherokee", "Compass", "Cherokee", "Gladiator", "Renegade"],
  Dodge:     ["Ram 1500", "Durango", "Challenger", "Charger", "Journey"],
  "Mercedes-Benz": ["Clase C", "Clase E", "Clase A", "GLC", "GLE", "GLA", "Sprinter", "Vito"],
  BMW:       ["Serie 1", "Serie 3", "Serie 5", "Serie 7", "X1", "X3", "X5"],
  Audi:      ["A3", "A4", "A6", "Q2", "Q3", "Q5", "Q7"],
  Subaru:    ["Forester", "Outback", "Impreza", "Crosstrek", "Legacy", "Ascent"],
  Isuzu:     ["D-Max", "MU-X", "Trooper", "Rodeo"],
  Fiat:      ["Argo", "Cronos", "Toro", "Mobi", "Strada"],
  Renault:   ["Duster", "Sandero", "Logan", "Kwid", "Oroch", "Koleos", "Stepway"],
  Peugeot:   ["208", "2008", "3008", "308", "408", "5008"],
};

const DatosBasicosStep = ({ formData, onChange }) => {
  const setValue = (name, value) => onChange({ target: { name, value } });

  const handleMarcaChange = (e) => {
    onChange(e);
    setValue("modelo", "");
  };

  const modelSuggestions = BRAND_MODELS[formData.marca] || [];

  return (
    <>
      <div className={styles.formGrid}>
        <div className={styles.field}>
          <label>Tipo de vehículo <span>*</span></label>
          <select name="tipoVehiculo" value={formData.tipoVehiculo} onChange={onChange}>
            <option value="">Seleccioná el tipo</option>
            <option value="Auto">Auto</option>
            <option value="Moto">Moto</option>
            <option value="Camioneta">Camioneta</option>
            <option value="Pickup">Pickup</option>
            <option value="Camión">Camión</option>
            <option value="Van / Minivan">Van / Minivan</option>
          </select>
        </div>

        <div className={styles.field}>
          <label>Marca <span>*</span></label>
          <select name="marca" value={formData.marca} onChange={handleMarcaChange}>
            <option value="">Seleccioná la marca</option>
            {BRANDS.map((b) => <option key={b} value={b}>{b}</option>)}
          </select>
        </div>

        <div className={styles.field}>
          <label>Modelo <span>*</span></label>
          <input
            type="text"
            name="modelo"
            value={formData.modelo}
            onChange={onChange}
            placeholder={formData.marca ? "Seleccioná o escribí el modelo" : "Primero elegí la marca"}
            disabled={!formData.marca}
            list="modelo-suggestions"
            autoComplete="off"
          />
          {modelSuggestions.length > 0 && (
            <datalist id="modelo-suggestions">
              {modelSuggestions.map((m) => <option key={m} value={m} />)}
            </datalist>
          )}
        </div>

        <div className={styles.field}>
          <label>Año <span>*</span></label>
          <input
            type="text"
            name="anio"
            value={formData.anio}
            onChange={onChange}
            placeholder="Ej.: 2020"
          />
        </div>

        <div className={styles.field}>
          <label>Versión</label>
          <input
            type="text"
            name="version"
            value={formData.version}
            onChange={onChange}
            placeholder="Ej.: XEI CVT, LTZ 4x4…"
          />
        </div>

        <div className={styles.field}>
          <label>Kilometraje <span>*</span></label>
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
          <label>Condición <span>*</span></label>
          <div className={styles.conditionGrid}>
            <button
              type="button"
              className={`${styles.conditionCard} ${formData.condicion === "Nuevo" ? styles.conditionActive : ""}`}
              onClick={() => setValue("condicion", "Nuevo")}
            >
              <span className={styles.conditionIcon}><Sparkles size={18} /></span>
              <span className={styles.conditionContent}>
                <strong>Nuevo</strong>
                <small>0 km. Sin uso previo.</small>
              </span>
            </button>
            <button
              type="button"
              className={`${styles.conditionCard} ${formData.condicion === "Usado" ? styles.conditionActive : ""}`}
              onClick={() => setValue("condicion", "Usado")}
            >
              <span className={styles.conditionIcon}><Gauge size={18} /></span>
              <span className={styles.conditionContent}>
                <strong>Usado</strong>
                <small>Con uso previo.</small>
              </span>
            </button>
          </div>
        </div>

        <div className={`${styles.field} ${styles.descriptionField}`}>
          <label>
            Descripción del vehículo
            <span className={styles.optionalLabel}> (Opcional)</span>
          </label>
          <textarea
            name="descripcion"
            value={formData.descripcion || ""}
            onChange={onChange}
            maxLength={800}
            placeholder="Ej.: Único dueño, todos los service al día en concesionario oficial. Muy buen estado general, sin golpes ni rayones. Listo para transferir."
          />
          <p className={styles.charCount}>{(formData.descripcion || "").length}/800</p>
        </div>
      </div>

      <div className={styles.infoNotice}>
        <Info size={18} />
        <p>
          Los campos marcados con <span>*</span> son obligatorios. Una buena descripción genera el doble de consultas.
        </p>
      </div>
    </>
  );
};

export default DatosBasicosStep;