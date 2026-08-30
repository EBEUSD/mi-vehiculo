import { useEffect, useMemo, useState } from "react";
import { Gauge, Info, Sparkles, Loader } from "lucide-react";
import { catalogCache } from "../../../../../lib/catalogCache";
import { getBrandsForCategory } from "../../../../../lib/vehicleBrands";
import SearchableSelect from "../../../../../components/SearchableSelect/SearchableSelect";
import styles from "./DatosBasicosStep.module.css";

const DatosBasicosStep = ({ formData, onChange }) => {
  const [apiBrands, setApiBrands]       = useState([]);
  const [models, setModels]             = useState([]);
  const [loadingBrands, setLoadingBrands] = useState(true);
  const [loadingModels, setLoadingModels] = useState(false);
  const [slowWarning, setSlowWarning]     = useState(false);

  const set = (name, value) => onChange({ target: { name, value } });

  useEffect(() => {
    setLoadingBrands(true);
    const timer = setTimeout(() => setSlowWarning(true), 5000);
    catalogCache.get("/catalog/brands")
      .then((data) => setApiBrands(data || []))
      .catch(() => {})
      .finally(() => { setLoadingBrands(false); setSlowWarning(false); clearTimeout(timer); });
    return () => clearTimeout(timer);
  }, []);

  // Merged options: static list + API brands, deduped by name
  const brandOptions = useMemo(() => {
    const staticNames = getBrandsForCategory(formData.categoria);
    const apiByName = {};
    apiBrands.forEach((b) => { apiByName[b.name.toLowerCase()] = b; });

    const merged = staticNames.map((name) => {
      const api = apiByName[name.toLowerCase()];
      return api
        ? { value: String(api.id), label: api.name }
        : { value: `__static__${name}`, label: name };
    });

    // Add API brands not in static list
    apiBrands.forEach((b) => {
      const alreadyIn = merged.some((o) => o.value === String(b.id));
      if (!alreadyIn) merged.push({ value: String(b.id), label: b.name });
    });

    merged.sort((a, b) => a.label.localeCompare(b.label));
    merged.push({ value: "OTRA", label: "✏️ Otra marca…" });
    return merged;
  }, [apiBrands, formData.categoria]);

  // Model options
  const modelOptions = useMemo(() => {
    const opts = models.map((m) => ({ value: String(m.id), label: m.name }));
    if (opts.length > 0) opts.push({ value: "OTRO", label: "✏️ Otro modelo…" });
    return opts;
  }, [models]);

  const isCustomBrand = formData.marcaId === "OTRA" || String(formData.marcaId || "").startsWith("__static__");
  const isCustomModel = formData.modeloId === "OTRO";

  useEffect(() => {
    const id = formData.marcaId;
    if (!id || isCustomBrand) { setModels([]); return; }
    setLoadingModels(true);
    catalogCache.get(`/catalog/brands/${id}/models`)
      .then((data) => setModels(data || []))
      .catch(() => setModels([]))
      .finally(() => setLoadingModels(false));
  }, [formData.marcaId]);

  const handleBrandChange = (val) => {
    if (val === "OTRA") {
      set("marcaId", "OTRA");
      set("marca", "");
    } else if (val.startsWith("__static__")) {
      const name = val.replace("__static__", "");
      set("marcaId", val);
      set("marca", name);
    } else {
      const brand = apiBrands.find((b) => String(b.id) === val);
      set("marcaId", val);
      set("marca", brand?.name || "");
    }
    set("modeloId", "");
    set("modelo", "");
  };

  const handleModelChange = (val) => {
    if (val === "OTRO") {
      set("modeloId", "OTRO");
      set("modelo", "");
      return;
    }
    const model = models.find((m) => String(m.id) === val);
    set("modeloId", val);
    set("modelo", model?.name || "");
  };

  return (
    <>
      <div className={styles.formGrid}>
        <div className={styles.field}>
          <label>Marca <span>*</span></label>
          {loadingBrands ? (
            <div style={{ height: 54, display: "flex", alignItems: "center", gap: 8, color: "#9aadbe", fontSize: 14 }}>
              <Loader size={14} style={{ animation: "spin 1s linear infinite" }} />
              Cargando marcas…
            </div>
          ) : (
            <SearchableSelect
              options={brandOptions}
              value={formData.marcaId || ""}
              onChange={handleBrandChange}
              placeholder="Seleccioná la marca"
            />
          )}
          {slowWarning && (
            <p style={{ marginTop: 6, fontSize: 12, color: "#d97706", display: "flex", alignItems: "center", gap: 5 }}>
              <Loader size={12} style={{ animation: "spin 1s linear infinite" }} />
              El servidor está iniciando, puede tardar hasta 1 minuto la primera vez…
            </p>
          )}
          {formData.marcaId === "OTRA" && (
            <input
              type="text"
              style={{ marginTop: 8 }}
              placeholder="Escribí el nombre de la marca"
              value={formData.marca || ""}
              onChange={(e) => set("marca", e.target.value)}
            />
          )}
        </div>

        <div className={styles.field}>
          <label>Modelo <span>*</span></label>
          {isCustomBrand ? (
            <input
              type="text"
              placeholder="Escribí el modelo"
              value={formData.modelo || ""}
              onChange={(e) => set("modelo", e.target.value)}
            />
          ) : (
            <>
              <SearchableSelect
                options={modelOptions}
                value={formData.modeloId || ""}
                onChange={handleModelChange}
                placeholder={
                  !formData.marcaId
                    ? "Primero elegí la marca"
                    : loadingModels
                      ? "Cargando modelos…"
                      : "Seleccioná el modelo"
                }
                disabled={!formData.marcaId || loadingModels}
              />
              {isCustomModel && (
                <input
                  type="text"
                  style={{ marginTop: 8 }}
                  placeholder="Escribí el nombre del modelo"
                  value={formData.modelo || ""}
                  onChange={(e) => set("modelo", e.target.value)}
                />
              )}
            </>
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
              onClick={() => set("condicion", "Nuevo")}
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
              onClick={() => set("condicion", "Usado")}
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
            placeholder="Ej.: Único dueño, todos los service al día. Muy buen estado general, sin golpes ni rayones. Listo para transferir."
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
