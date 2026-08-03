import { useEffect, useRef, useState } from "react";
import FotosStep from "../Fotos/FotosStep";
import styles from "./DatosVehiculoStep.module.css";

const BRANDS = [
  "Toyota", "Nissan", "Honda", "Hyundai", "Kia", "Suzuki", "Mitsubishi",
  "Mazda", "Chevrolet", "Ford", "Volkswagen", "Jeep", "Dodge",
  "Mercedes-Benz", "BMW", "Audi", "Subaru", "Isuzu",
  "Fiat", "Renault", "Peugeot", "Otra",
];

// NHTSA uses slightly different spellings for some brands
const NHTSA_NAME = {
  "Mercedes-Benz": "Mercedes-Benz",
  "Volkswagen":    "Volkswagen",
  "Isuzu":         "Isuzu",
};

const modelsCache = {};

const fetchModels = async (make) => {
  if (!make || make === "Otra") return [];
  if (modelsCache[make]) return modelsCache[make];

  const query = NHTSA_NAME[make] || make;
  try {
    const res = await fetch(
      `https://vpic.nhtsa.dot.gov/api/vehicles/GetModelsForMake/${encodeURIComponent(query)}?format=json`
    );
    const data = await res.json();
    const names = [...new Set(
      (data.Results || []).map((r) => r.Model_Name)
    )].sort();
    modelsCache[make] = names;
    return names;
  } catch {
    return [];
  }
};

const CY = new Date().getFullYear();
const YEARS = Array.from({ length: CY - 1969 }, (_, i) => CY + 1 - i);

const DatosVehiculoStep = ({ formData, onChange }) => {
  const [modelSuggestions, setModelSuggestions] = useState([]);
  const [loadingModels, setLoadingModels]       = useState(false);
  const abortRef = useRef(null);

  const setValue = (name, value) => onChange({ target: { name, value } });

  useEffect(() => {
    if (!formData.marca) { setModelSuggestions([]); return; }

    let cancelled = false;
    setLoadingModels(true);
    setModelSuggestions([]);

    fetchModels(formData.marca).then((models) => {
      if (!cancelled) {
        setModelSuggestions(models);
        setLoadingModels(false);
      }
    });

    return () => { cancelled = true; };
  }, [formData.marca]);

  const handleMarcaChange = (e) => {
    onChange(e);
    setValue("modelo", "");
    setValue("anio", "");
    setValue("version", "");
  };

  const handleModeloChange = (e) => {
    onChange(e);
    setValue("anio", "");
    setValue("version", "");
  };

  const handleAnioChange = (e) => {
    onChange(e);
    setValue("version", "");
  };

  return (
    <>
      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>Marca y modelo</h3>

        <div className={styles.cascadeGrid}>
          <div className={styles.field}>
            <label>Marca <span>*</span></label>
            <select name="marca" value={formData.marca} onChange={handleMarcaChange}>
              <option value="">Seleccioná la marca</option>
              {BRANDS.map((b) => <option key={b} value={b}>{b}</option>)}
            </select>
          </div>

          {formData.marca && (
            <div className={styles.field}>
              <label>
                Modelo <span>*</span>
                {loadingModels && <span className={styles.loadingDot} />}
              </label>
              <input
                type="text"
                name="modelo"
                value={formData.modelo}
                onChange={handleModeloChange}
                list="modelo-list"
                placeholder={loadingModels ? "Cargando modelos…" : "Escribí o elegí el modelo"}
                autoComplete="off"
              />
              {modelSuggestions.length > 0 && (
                <datalist id="modelo-list">
                  {modelSuggestions.map((m) => <option key={m} value={m} />)}
                </datalist>
              )}
              {!loadingModels && modelSuggestions.length > 0 && (
                <p className={styles.modelCount}>{modelSuggestions.length} modelos disponibles</p>
              )}
            </div>
          )}

          {formData.modelo && (
            <div className={styles.field}>
              <label>Año <span>*</span></label>
              <select name="anio" value={formData.anio} onChange={handleAnioChange}>
                <option value="">Seleccioná el año</option>
                {YEARS.map((y) => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>
          )}

          {formData.anio && (
            <div className={styles.field}>
              <label>Versión <span className={styles.optional}>(opcional)</span></label>
              <input
                type="text"
                name="version"
                value={formData.version}
                onChange={onChange}
                placeholder="Ej.: XEI CVT, LTZ 4x4, SR5…"
              />
            </div>
          )}
        </div>
      </div>

      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>Kilometraje</h3>
        <div className={styles.kmWrap}>
          <div className={styles.field}>
            <label>Km <span>*</span></label>
            <div className={styles.inputSuffix}>
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
        </div>
      </div>

      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>Fotos del vehículo</h3>
        <p className={styles.sectionDesc}>
          Subí al menos 1 foto. Los avisos con más fotos reciben hasta 3× más consultas.
        </p>
        <FotosStep formData={formData} onChange={onChange} />
      </div>
    </>
  );
};

export default DatosVehiculoStep;
