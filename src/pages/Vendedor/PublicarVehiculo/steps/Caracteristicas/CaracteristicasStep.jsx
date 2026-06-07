import { useMemo, useState } from "react";
import {
  Car,
  Droplets,
  Fuel,
  Gauge,
  Info,
  Search,
  Settings2,
  SlidersHorizontal,
} from "lucide-react";
import styles from "./CaracteristicasStep.module.css";

const fuelOptions = ["Nafta", "Diésel", "GNC", "Híbrido", "Eléctrico"];
const transmissionOptions = ["Manual", "Automática"];
const motorOptions = ["1.0", "1.4", "1.6", "2.0+"];
const doorsOptions = ["2", "3", "4", "5"];
const bodyOptions = ["Sedán", "Hatchback", "SUV", "Pick up", "Rural/SW", "Coupé"];
const tractionOptions = ["Delantera 4x2", "Trasera 4x2", "Integral 4x4"];

const colorOptions = [
  "Blanco",
  "Negro",
  "Gris claro",
  "Gris oscuro",
  "Plateado",
  "Azul",
  "Azul oscuro",
  "Rojo",
  "Bordo",
  "Beige",
  "Marrón",
  "Verde",
  "Amarillo",
  "Naranja",
  "Dorado",
  "Celeste",
  "Violeta",
];

const CaracteristicasStep = ({ formData, onChange }) => {
  const [colorSearch, setColorSearch] = useState(formData.color || "");
  const [showColorOptions, setShowColorOptions] = useState(false);

  const setValue = (name, value) => {
    onChange({
      target: {
        name,
        value,
      },
    });
  };

  const filteredColors = useMemo(() => {
    const query = colorSearch.trim().toLowerCase();

    if (!query) {
      return colorOptions;
    }

    return colorOptions.filter((color) => color.toLowerCase().includes(query));
  }, [colorSearch]);

  const handleColorSelect = (color) => {
    setColorSearch(color);
    setValue("color", color);
    setShowColorOptions(false);
  };

  const renderChipList = (name, options, wrap = false) => {
    return (
      <div className={wrap ? styles.chipRowWrap : styles.chipRow}>
        {options.map((option) => (
          <button
            key={option}
            type="button"
            className={`${styles.miniChip} ${
              formData[name] === option ? styles.miniChipActive : ""
            }`}
            onClick={() => setValue(name, option)}
          >
            {option}
          </button>
        ))}
      </div>
    );
  };

  return (
    <>
      <div className={styles.featuresGrid}>
        <div className={styles.featureGroup}>
          <div className={styles.field}>
            <label>
              Combustible <span>*</span>
            </label>

            <div className={styles.iconSelect}>
              <Fuel size={20} />

              <select
                name="combustible"
                value={formData.combustible}
                onChange={onChange}
              >
                {fuelOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {renderChipList("combustible", fuelOptions)}
        </div>

        <div className={styles.featureGroup}>
          <div className={styles.field}>
            <label>
              Transmisión <span>*</span>
            </label>

            <div className={styles.iconSelect}>
              <SlidersHorizontal size={20} />

              <select
                name="transmision"
                value={formData.transmision}
                onChange={onChange}
              >
                {transmissionOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {renderChipList("transmision", transmissionOptions)}
        </div>

        <div className={styles.featureGroup}>
          <div className={styles.field}>
            <label>
              Motor <span>*</span>
            </label>

            <div className={styles.iconSelect}>
              <Settings2 size={20} />

              <select name="motor" value={formData.motor} onChange={onChange}>
                {motorOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {renderChipList("motor", motorOptions)}
        </div>

        <div className={styles.featureGroup}>
          <div className={styles.field}>
            <label>
              Color <span>*</span>
            </label>

            <div className={styles.colorSearchBox}>
              <Droplets size={20} className={styles.colorMainIcon} />

              <input
                type="text"
                value={colorSearch}
                placeholder="Buscar color"
                onFocus={() => setShowColorOptions(true)}
                onChange={(event) => {
                  setColorSearch(event.target.value);
                  setShowColorOptions(true);
                }}
              />

              <Search size={18} className={styles.colorSearchIcon} />

              {showColorOptions && (
                <div className={styles.colorDropdown}>
                  {filteredColors.length > 0 ? (
                    filteredColors.map((color) => (
                      <button
                        key={color}
                        type="button"
                        className={`${styles.colorOption} ${
                          formData.color === color ? styles.colorOptionActive : ""
                        }`}
                        onMouseDown={() => handleColorSelect(color)}
                      >
                        <span
                          className={`${styles.colorPreview} ${
                            styles[`color${color.replace(/\s/g, "")}`] || ""
                          }`}
                        ></span>

                        {color}
                      </button>
                    ))
                  ) : (
                    <p className={styles.emptyColors}>No encontramos ese color</p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className={styles.featureGroup}>
          <div className={styles.field}>
            <label>
              Puertas <span>*</span>
            </label>

            <div className={styles.iconSelect}>
              <Car size={20} />

              <select name="puertas" value={formData.puertas} onChange={onChange}>
                {doorsOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {renderChipList("puertas", doorsOptions)}
        </div>

        <div className={styles.featureGroup}>
          <div className={styles.field}>
            <label>
              Carrocería <span>*</span>
            </label>

            <div className={styles.iconSelect}>
              <Car size={20} />

              <select
                name="carroceria"
                value={formData.carroceria}
                onChange={onChange}
              >
                {bodyOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {renderChipList("carroceria", bodyOptions, true)}
        </div>

        <div className={styles.featureGroup}>
          <div className={styles.field}>
            <label>
              Tracción <span>*</span>
            </label>

            <div className={styles.iconSelect}>
              <Gauge size={20} />

              <select
                name="traccion"
                value={formData.traccion}
                onChange={onChange}
              >
                {tractionOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {renderChipList("traccion", tractionOptions, true)}
        </div>
      </div>

      <div className={styles.infoNotice}>
        <Info size={18} />
        <p>
          Cuanta más precisa sea la información, más rápido te encontrarán los
          compradores.
        </p>
      </div>
    </>
  );
};

export default CaracteristicasStep;