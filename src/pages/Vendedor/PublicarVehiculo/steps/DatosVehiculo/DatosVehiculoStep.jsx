import { useEffect, useMemo, useState } from "react";
import { Loader, Pencil } from "lucide-react";
import { catalogCache } from "../../../../../lib/catalogCache";
import { getBrandsForCategory } from "../../../../../lib/vehicleBrands";
import SearchableSelect from "../../../../../components/SearchableSelect/SearchableSelect";
import FotosStep from "../Fotos/FotosStep";
import styles from "./DatosVehiculoStep.module.css";

const CY = new Date().getFullYear();
const YEAR_OPTIONS = [
  { value: "", label: "Seleccioná el año" },
  ...Array.from({ length: CY - 1969 }, (_, i) => CY + 1 - i).map((y) => ({
    value: String(y), label: String(y),
  })),
];

const calcReach = (fd) => {
  const hasKm = fd.condicion === "Nuevo"
    || (fd.condicion === "Usado" && fd.kilometraje && fd.kilometraje !== "");
  if (fd.condicion && hasKm)         return 4;
  if (fd.anio)                       return 3;
  if (fd.modeloId || fd.modelo)      return 2;
  if (fd.marcaId)                    return 1;
  return 0;
};

const DatosVehiculoStep = ({ formData, onChange }) => {
  const [apiBrands,     setApiBrands]     = useState([]);
  const [models,        setModels]        = useState([]);
  const [loadingBrands, setLoadingBrands] = useState(true);
  const [loadingModels, setLoadingModels] = useState(false);
  const [slowWarning,   setSlowWarning]   = useState(false);
  const [maxReached,    setMaxReached]    = useState(() => calcReach(formData));
  const [currentCard,   setCurrentCard]   = useState(() => calcReach(formData));
  const [snapshot,      setSnapshot]      = useState(null);

  const setValue = (name, value) => onChange({ target: { name, value } });

  // Load brands on mount
  useEffect(() => {
    setLoadingBrands(true);
    const timer = setTimeout(() => setSlowWarning(true), 5000);
    catalogCache.get("/catalog/brands")
      .then((data) => setApiBrands(data || []))
      .catch(() => setApiBrands([]))
      .finally(() => { setLoadingBrands(false); setSlowWarning(false); clearTimeout(timer); });
    return () => clearTimeout(timer);
  }, []);

  // Load models when API brand is selected
  useEffect(() => {
    const id = formData.marcaId;
    if (!id || id === "OTRA" || String(id).startsWith("__static__")) {
      setModels([]);
      return;
    }
    let cancelled = false;
    setLoadingModels(true);
    setModels([]);
    catalogCache.get(`/catalog/brands/${id}/models`)
      .then((data) => { if (!cancelled) setModels(data || []); })
      .catch(() => { if (!cancelled) setModels([]); })
      .finally(() => { if (!cancelled) setLoadingModels(false); });
    return () => { cancelled = true; };
  }, [formData.marcaId]);

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
    apiBrands.forEach((b) => {
      if (!merged.some((o) => o.value === String(b.id)))
        merged.push({ value: String(b.id), label: b.name });
    });
    merged.sort((a, b) => a.label.localeCompare(b.label));
    merged.push({ value: "OTRA", label: "Otra marca (escribir)" });
    return merged;
  }, [apiBrands, formData.categoria]);

  const modelOptions = useMemo(() => {
    const opts = models.map((m) => ({ value: String(m.id), label: m.name }));
    if (opts.length > 0) opts.push({ value: "OTRO", label: "Otro modelo (escribir)" });
    return opts;
  }, [models]);

  const isCustomBrand = formData.marcaId === "OTRA" || String(formData.marcaId || "").startsWith("__static__");
  const isCustomModel = formData.modeloId === "OTRO";

  const handleMarcaChange = (val) => {
    if (val === "OTRA") {
      setValue("marcaId", "OTRA"); setValue("marca", "");
    } else if (val.startsWith("__static__")) {
      setValue("marcaId", val); setValue("marca", val.replace("__static__", ""));
    } else {
      const brand = apiBrands.find((b) => String(b.id) === val);
      setValue("marcaId", val); setValue("marca", brand?.name || "");
    }
  };

  const handleModeloChange = (val) => {
    if (val === "OTRO") { setValue("modeloId", "OTRO"); setValue("modelo", ""); return; }
    const model = models.find((m) => String(m.id) === val);
    setValue("modeloId", val); setValue("modelo", model?.name || "");
  };

  const confirm = (cardIdx) => {
    let next = Math.max(maxReached, cardIdx + 1);
    // Cascade-clear downstream when brand changes
    if (cardIdx === 0 && snapshot && formData.marcaId !== snapshot.fields.marcaId) {
      setValue("modeloId", ""); setValue("modelo", "");
      setValue("anio",     ""); setValue("version", "");
      next = 1;
    }
    // Cascade-clear anio/version when model changes
    if (cardIdx === 1 && snapshot &&
      (formData.modeloId !== snapshot.fields.modeloId || formData.modelo !== snapshot.fields.modelo)) {
      setValue("anio", ""); setValue("version", "");
      next = Math.min(next, 2);
    }
    setMaxReached(next);
    setCurrentCard(next);
    setSnapshot(null);
  };

  const editCard = (cardIdx, fieldNames) => {
    const snap = {};
    fieldNames.forEach((f) => { snap[f] = formData[f]; });
    setSnapshot({ cardIdx, fields: snap });
    setCurrentCard(cardIdx);
  };

  const cancelEdit = () => {
    if (snapshot) Object.entries(snapshot.fields).forEach(([k, v]) => setValue(k, v));
    setCurrentCard(maxReached);
    setSnapshot(null);
  };

  const isEditing   = (i) => currentCard === i;
  const isConfirmed = (i) => maxReached > i && currentCard !== i;
  const isVisible   = (i) => i <= maxReached;

  // Confirm guards
  const canConfirm0 = !!(formData.marcaId && (formData.marcaId !== "OTRA" || formData.marca));
  const canConfirm1 = !!(formData.modeloId && (formData.modeloId !== "OTRO" || formData.modelo));
  const canConfirm2 = !!formData.anio;
  const canConfirm3 = !!(formData.condicion && (formData.condicion === "Nuevo" || formData.kilometraje));

  // Confirmed summaries
  const marcaLabel   = formData.marca || "";
  const modeloLabel  = formData.modelo || "";
  const anioLabel    = [formData.anio, formData.version && `· ${formData.version}`].filter(Boolean).join(" ");
  const condKmLabel  = formData.condicion === "Nuevo"
    ? "Nuevo · 0 km"
    : `Usado · ${Number(formData.kilometraje || 0).toLocaleString("en-US")} km`;

  return (
    <div className={styles.flow}>

      {/* ══════ Card 0: Marca ══════ */}
      <div className={`${styles.card} ${isEditing(0) ? styles.cardEditing : ""} ${isConfirmed(0) ? styles.cardDone : ""}`}>
        <div className={styles.cardHead}>
          <div>
            <span className={styles.cardTitle}>Marca <span className={styles.req}>*</span></span>
            {!isConfirmed(0) && <p className={styles.cardSub}>¿Cuál es la marca del vehículo?</p>}
          </div>
          {isConfirmed(0) && (
            <button type="button" className={styles.editBtn}
              onClick={() => editCard(0, ["marcaId", "marca", "modeloId", "modelo", "anio", "version"])}>
              <Pencil size={13} /> Cambiar
            </button>
          )}
        </div>

        {isConfirmed(0) ? (
          <p className={styles.doneValue}>{marcaLabel}</p>
        ) : (
          <>
            {loadingBrands ? (
              <div className={styles.loadingRow}>
                <Loader size={14} className={styles.spin} />
                <span>Cargando marcas…</span>
              </div>
            ) : (
              <SearchableSelect
                options={brandOptions}
                value={formData.marcaId || ""}
                onChange={handleMarcaChange}
                placeholder="Seleccioná la marca"
              />
            )}
            {slowWarning && (
              <p className={styles.slowWarn}>
                <Loader size={12} className={styles.spin} />
                El servidor está iniciando, puede tardar hasta 1 min la primera vez…
              </p>
            )}
            {formData.marcaId === "OTRA" && (
              <input
                type="text"
                className={styles.textInputBelow}
                placeholder="Escribí el nombre de la marca"
                value={formData.marca || ""}
                onChange={(e) => setValue("marca", e.target.value)}
              />
            )}
            {formData.marcaId !== "OTRA" && !loadingBrands && (
              <button type="button" className={styles.customBrandLink}
                onClick={() => { setValue("marcaId", "OTRA"); setValue("marca", ""); setValue("modeloId", ""); setValue("modelo", ""); }}>
                ¿No encontrás tu marca? Escribila manualmente
              </button>
            )}
            <div className={styles.cardFooter}>
              {snapshot?.cardIdx === 0 && (
                <button type="button" className={styles.cancelBtn} onClick={cancelEdit}>Cancelar</button>
              )}
              <button type="button" className={styles.confirmBtn}
                disabled={!canConfirm0} onClick={() => confirm(0)}>
                Confirmar
              </button>
            </div>
          </>
        )}
      </div>

      {/* ══════ Card 1: Modelo ══════ */}
      {isVisible(1) && (
        <div className={`${styles.card} ${styles.fadeIn} ${isEditing(1) ? styles.cardEditing : ""} ${isConfirmed(1) ? styles.cardDone : ""}`}>
          <div className={styles.cardHead}>
            <div>
              <span className={styles.cardTitle}>
                Modelo <span className={styles.req}>*</span>
                {loadingModels && isEditing(1) && <span className={styles.loadingDot} />}
              </span>
              {!isConfirmed(1) && <p className={styles.cardSub}>¿Cuál es el modelo?</p>}
            </div>
            {isConfirmed(1) && (
              <button type="button" className={styles.editBtn}
                onClick={() => editCard(1, ["modeloId", "modelo", "anio", "version"])}>
                <Pencil size={13} /> Cambiar
              </button>
            )}
          </div>

          {isConfirmed(1) ? (
            <p className={styles.doneValue}>{modeloLabel}</p>
          ) : (
            <>
              {isCustomBrand || (!loadingModels && modelOptions.length === 0) ? (
                <input
                  type="text"
                  placeholder="Escribí el modelo"
                  value={formData.modelo || ""}
                  onChange={(e) => {
                    setValue("modeloId", "OTRO");
                    setValue("modelo",   e.target.value);
                  }}
                />
              ) : (
                <>
                  <SearchableSelect
                    options={modelOptions}
                    value={formData.modeloId || ""}
                    onChange={handleModeloChange}
                    placeholder={loadingModels ? "Cargando modelos…" : "Seleccioná el modelo"}
                    disabled={loadingModels}
                  />
                  {!loadingModels && models.length > 0 && (
                    <p className={styles.modelCount}>{models.length} modelos disponibles</p>
                  )}
                  {isCustomModel && (
                    <input
                      type="text"
                      className={styles.textInputBelow}
                      placeholder="Escribí el nombre del modelo"
                      value={formData.modelo || ""}
                      onChange={(e) => setValue("modelo", e.target.value)}
                    />
                  )}
                </>
              )}
              <div className={styles.cardFooter}>
                <button type="button" className={styles.cancelBtn} onClick={cancelEdit}>Cancelar</button>
                <button type="button" className={styles.confirmBtn}
                  disabled={!canConfirm1} onClick={() => confirm(1)}>
                  Confirmar
                </button>
              </div>
            </>
          )}
        </div>
      )}

      {/* ══════ Card 2: Año y versión ══════ */}
      {isVisible(2) && (
        <div className={`${styles.card} ${styles.fadeIn} ${isEditing(2) ? styles.cardEditing : ""} ${isConfirmed(2) ? styles.cardDone : ""}`}>
          <div className={styles.cardHead}>
            <div>
              <span className={styles.cardTitle}>Año <span className={styles.req}>*</span></span>
              {!isConfirmed(2) && <p className={styles.cardSub}>¿De qué año es el vehículo?</p>}
            </div>
            {isConfirmed(2) && (
              <button type="button" className={styles.editBtn}
                onClick={() => editCard(2, ["anio", "version"])}>
                <Pencil size={13} /> Cambiar
              </button>
            )}
          </div>

          {isConfirmed(2) ? (
            <p className={styles.doneValue}>{anioLabel}</p>
          ) : (
            <>
              <div className={styles.twoCol}>
                <div className={styles.field}>
                  <label>Año <span>*</span></label>
                  <SearchableSelect
                    options={YEAR_OPTIONS}
                    value={formData.anio ? String(formData.anio) : ""}
                    onChange={(v) => setValue("anio", v)}
                    placeholder="Seleccioná el año"
                  />
                </div>
                <div className={styles.field}>
                  <label>Versión <span className={styles.opt}>(opcional)</span></label>
                  <input
                    type="text"
                    name="version"
                    value={formData.version}
                    onChange={onChange}
                    placeholder="Ej.: XEI CVT, LTZ 4x4, SR5…"
                  />
                </div>
              </div>
              <div className={styles.cardFooter}>
                <button type="button" className={styles.cancelBtn} onClick={cancelEdit}>Cancelar</button>
                <button type="button" className={styles.confirmBtn}
                  disabled={!canConfirm2} onClick={() => confirm(2)}>
                  Confirmar
                </button>
              </div>
            </>
          )}
        </div>
      )}

      {/* ══════ Card 3: Condición y kilometraje ══════ */}
      {isVisible(3) && (
        <div className={`${styles.card} ${styles.fadeIn} ${isEditing(3) ? styles.cardEditing : ""} ${isConfirmed(3) ? styles.cardDone : ""}`}>
          <div className={styles.cardHead}>
            <div>
              <span className={styles.cardTitle}>Condición <span className={styles.req}>*</span></span>
              {!isConfirmed(3) && <p className={styles.cardSub}>¿Es nuevo o ya fue usado?</p>}
            </div>
            {isConfirmed(3) && (
              <button type="button" className={styles.editBtn}
                onClick={() => editCard(3, ["condicion", "kilometraje"])}>
                <Pencil size={13} /> Cambiar
              </button>
            )}
          </div>

          {isConfirmed(3) ? (
            <p className={styles.doneValue}>{condKmLabel}</p>
          ) : (
            <>
              <div className={styles.condKmRow}>
                <div className={styles.field}>
                  <label>Condición <span>*</span></label>
                  <div className={styles.condToggle}>
                    {["Usado", "Nuevo"].map((v) => (
                      <button
                        key={v}
                        type="button"
                        className={`${styles.condBtn} ${formData.condicion === v ? styles.condBtnActive : ""}`}
                        onClick={() => {
                          setValue("condicion", v);
                          if (v === "Nuevo") setValue("kilometraje", "0");
                        }}
                      >
                        {v}
                      </button>
                    ))}
                  </div>
                </div>

                {formData.condicion !== "Nuevo" && (
                  <div className={styles.field}>
                    <label>Kilometraje <span>*</span></label>
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
                )}
              </div>
              <div className={styles.cardFooter}>
                <button type="button" className={styles.cancelBtn} onClick={cancelEdit}>Cancelar</button>
                <button type="button" className={styles.confirmBtn}
                  disabled={!canConfirm3} onClick={() => confirm(3)}>
                  Confirmar
                </button>
              </div>
            </>
          )}
        </div>
      )}

      {/* ══════ Fotos ══════ */}
      {isVisible(4) && (
        <div className={`${styles.fotosSection} ${styles.fadeIn}`}>
          <h3 className={styles.fotosTitle}>Fotos del vehículo</h3>
          <p className={styles.fotosDesc}>
            Subí al menos 1 foto. Los avisos con más fotos reciben hasta 3× más consultas.
          </p>
          <FotosStep formData={formData} onChange={onChange} />
        </div>
      )}
    </div>
  );
};

export default DatosVehiculoStep;
