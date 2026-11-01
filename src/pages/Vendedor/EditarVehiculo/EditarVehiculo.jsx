import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  AlertCircle, ArrowLeft, CheckCircle, Edit3, Loader2,
  Plus, Save, Star, Trash2, X,
} from "lucide-react";
import Navbar from "../../../components/Navbar/Navbar";
import { api } from "../../../lib/api";
import { formatUSD, isValidPrice, parseMoney } from "../../../lib/money";
import { formatSvPhone, isValidSvPhone, normalizeSvPhone } from "../../../lib/phone";
import { IMAGE_ACCEPT, validateImageFiles } from "../../../lib/images";
import useSafeTimeout from "../../../hooks/useSafeTimeout";
import LocationSelect from "../shared/LocationSelect/LocationSelect";
import styles from "./EditarVehiculo.module.css";

/* ── Constants ──────────────────────────────── */
const CY = new Date().getFullYear();
const YEARS = Array.from({ length: CY - 1959 }, (_, i) => CY + 1 - i);

const CATEGORY_OPTIONS = [
  { value: "AUTO",      label: "Auto" },
  { value: "MOTO",      label: "Moto" },
  { value: "CAMIONETA", label: "Camioneta / Pick-up" },
  { value: "CAMION",    label: "Camión" },
  { value: "ACUATICO",  label: "Náutica" },
  { value: "BICICLETA", label: "Bicicleta" },
  { value: "OTRO",      label: "Otro" },
];

const COMBUSTIBLE_OPTIONS = ["Gasolina", "Diésel", "Híbrido", "Eléctrico", "Gas Natural", "Otro"];
const TRANSMISION_OPTIONS = ["Manual", "Automático", "CVT", "Semiautomático", "Doble embrague"];

const STATUS_OPTIONS = [
  { value: "ACTIVE", label: "Activo",  color: "#059669" },
  { value: "PAUSED", label: "Pausado", color: "#d97706" },
  { value: "SOLD",   label: "Vendido", color: "#6b7280" },
];

/* ── Map API → form state ──────────────────── */
const fromApi = (v, attrDefs) => {
  const combustibleDef = attrDefs.find((d) => d.name?.toLowerCase().includes("combustible"));
  const transmisionDef = attrDefs.find((d) => d.name?.toLowerCase().includes("transm"));
  return {
    vehicleId:         v.id,
    marcaId:           String(v.brand?.id  || ""),
    marca:             v.brand?.name        || "",
    modeloId:          String(v.model?.id  || ""),
    modelo:            v.model?.name        || "",
    anio:              String(v.year        || ""),
    version:           v.version            || "",
    km:                String(v.mileage     || 0),
    condicion:         v.condition === "NEW" ? "Nuevo" : "Usado",
    categoria:         v.category           || "AUTO",
    precio:            v.price ? String(v.price) : "",
    aceptaPermuta:     v.acceptsExchange    ? "Si" : "No",
    precioNegociable:  v.negotiablePrice    ? "Si" : "No",
    financiacion:      v.financingAvailable ? "Si" : "No",
    descripcion:       v.description        || "",
    phone:             formatSvPhone(v.contactPhone),
    provinceId:        String(v.city?.province?.id || ""),
    provincia:         v.city?.province?.name      || "",
    cityId:            String(v.city?.id            || ""),
    ciudad:            v.city?.name                || "",
    combustible:       v.attributes?.find((a) => a.definition?.name?.toLowerCase().includes("combustible"))?.value || "Gasolina",
    transmision:       v.attributes?.find((a) => a.definition?.name?.toLowerCase().includes("transm"))?.value || "Manual",
    // Sin definición en el catálogo → el atributo no se envía
    combustibleDefId:  combustibleDef?.id ?? null,
    transmisionDefId:  transmisionDef?.id ?? null,
    status:            v.status || "ACTIVE",
    images:            v.images || [],
  };
};

/* ── Field helpers ──────────────────────────── */
const Field = ({ label, required, children, error }) => (
  <div className={styles.field}>
    <label>{label}{required && <span className={styles.req}>*</span>}</label>
    {children}
    {error && <p className={styles.fieldError}>{error}</p>}
  </div>
);

const Toggle = ({ label, value, onChange }) => (
  <button
    type="button"
    className={`${styles.toggle} ${value === "Si" ? styles.toggleOn : ""}`}
    onClick={() => onChange(value === "Si" ? "No" : "Si")}
  >
    <span className={styles.toggleKnob} />
    <span className={styles.toggleLabel}>{value === "Si" ? "Sí" : "No"} — {label}</span>
  </button>
);

/* ── Main component ─────────────────────────── */
const EditarVehiculo = () => {
  const { slug }   = useParams();
  const navigate   = useNavigate();
  const fileRef    = useRef(null);
  const later      = useSafeTimeout();

  const [loading, setLoading]   = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [form, setForm]         = useState(null);
  const [brands, setBrands]     = useState([]);
  // Modelos guardados junto a la marca que los pidió
  const [modelsState, setModelsState] = useState({ brandId: null, list: [] });
  const [saving, setSaving]     = useState(false);
  const [saved, setSaved]       = useState(false);
  const [saveError, setSaveError] = useState("");
  const [errors, setErrors]     = useState({});
  const [uploadingImages, setUploadingImages] = useState(false);

  /* Load vehicle + catalog data in parallel */
  useEffect(() => {
    let ignore = false;
    Promise.all([
      api.get(`/vehicles/${slug}/detail`),
      api.get("/catalog/attribute-definitions").catch(() => ({ data: [] })),
      api.get("/catalog/brands").catch(() => ({ data: [] })),
    ])
      .then(([vehicleRes, defsRes, brandsRes]) => {
        if (ignore) return;
        setForm(fromApi(vehicleRes.data, defsRes.data || []));
        setBrands(brandsRes.data || []);
      })
      .catch(() => { if (!ignore) setNotFound(true); })
      .finally(() => { if (!ignore) setLoading(false); });
    return () => { ignore = true; };
  }, [slug]);

  /* Cascade: brand → models (descarta respuestas de una marca anterior) */
  const brandId = form?.marcaId || "";
  useEffect(() => {
    if (!brandId) return;
    let ignore = false;
    api.get(`/catalog/brands/${brandId}/models`)
      .then((r) => { if (!ignore) setModelsState({ brandId, list: r.data || [] }); })
      .catch(() => { if (!ignore) setModelsState({ brandId, list: [] }); });
    return () => { ignore = true; };
  }, [brandId]);
  const models = modelsState.brandId === brandId ? modelsState.list : [];

  const handleBrandChange = (e) => {
    const id    = e.target.value;
    const brand = brands.find((b) => String(b.id) === id);
    setForm((p) => ({ ...p, marcaId: id, marca: brand?.name || "", modeloId: "", modelo: "" }));
  };

  const handleModelChange = (e) => {
    const id    = e.target.value;
    const model = models.find((m) => String(m.id) === id);
    setForm((p) => ({ ...p, modeloId: id, modelo: model?.name || "" }));
  };

  /* Departamento → municipio */
  const handleLocationChange = (patch) => {
    setForm((p) => ({ ...p, ...patch }));
    setSaved(false);
  };

  const set = (name, value) => {
    setForm((p) => ({ ...p, [name]: value }));
    setErrors((p) => { const n = { ...p }; delete n[name]; return n; });
    setSaved(false);
    setSaveError("");
  };

  const handleChange = (e) => set(e.target.name, e.target.value);

  /* Validate */
  const validate = () => {
    const errs = {};
    if (!form.marcaId)   errs.marcaId   = "Seleccioná la marca.";
    if (!form.modeloId)  errs.modeloId  = "Seleccioná el modelo.";
    if (!form.anio)      errs.anio      = "Seleccioná el año.";
    if (!form.km && form.km !== "0") errs.km = "Ingresá el kilometraje.";
    if (!isValidPrice(form.precio)) errs.precio = "Ingresá un precio mayor a $0 (ej.: 15,000).";
    if (form.phone && !isValidSvPhone(form.phone)) errs.phone = "El teléfono debe tener 8 dígitos.";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  /* Save vehicle */
  const handleSave = async () => {
    if (!validate()) return;
    setSaving(true); setSaveError(""); setSaved(false);
    try {
      await api.patch(`/vehicles/${form.vehicleId}`, {
        category:           form.categoria,
        brandId:            parseInt(form.marcaId)  || undefined,
        modelId:            parseInt(form.modeloId) || undefined,
        year:               parseInt(form.anio)     || undefined,
        version:            form.version            || undefined,
        condition:          form.condicion === "Nuevo" ? "NEW" : "USED",
        mileage:            parseInt(String(form.km).replace(/\D/g, "")) || 0,
        price:              parseMoney(form.precio),
        currency:           "USD",
        acceptsExchange:    form.aceptaPermuta === "Si",
        negotiablePrice:    form.precioNegociable === "Si",
        financingAvailable: form.financiacion === "Si",
        description:        form.descripcion || undefined,
        contactPhone:       normalizeSvPhone(form.phone),
        cityId:             Number(form.cityId) > 0 ? Number(form.cityId) : undefined,
        attributes: [
          { definitionId: form.combustibleDefId, value: form.combustible },
          { definitionId: form.transmisionDefId, value: form.transmision },
        ].filter((a) => a.definitionId && a.value),
      });
      setSaved(true);
      later(() => setSaved(false), 3000);
    } catch (err) {
      setSaveError(err?.message || "No se pudo guardar. Intentá de nuevo.");
    } finally {
      setSaving(false);
    }
  };

  /* Change status */
  const handleStatusChange = async (newStatus) => {
    if (newStatus === form.status) return;
    try {
      await api.patch(`/vehicles/${form.vehicleId}/status`, { status: newStatus });
      setForm((p) => ({ ...p, status: newStatus }));
    } catch {
      setSaveError("No se pudo cambiar el estado.");
    }
  };

  /* Set primary image */
  const handleSetPrimary = async (imageId) => {
    try {
      await api.patch(`/vehicles/${form.vehicleId}/images/${imageId}/primary`, {});
      setForm((p) => ({
        ...p,
        images: p.images.map((i) => ({ ...i, isPrimary: i.id === imageId })),
      }));
    } catch {
      setSaveError("No se pudo cambiar la foto principal.");
    }
  };

  /* Delete image */
  const handleDeleteImage = async (imageId) => {
    if (!window.confirm("¿Eliminar esta foto?")) return;
    try {
      await api.delete(`/vehicles/${form.vehicleId}/images/${imageId}`);
      setForm((p) => ({ ...p, images: p.images.filter((i) => i.id !== imageId) }));
    } catch {
      setSaveError("No se pudo eliminar la imagen.");
    }
  };

  /* Upload new images */
  const handleUploadImages = async (e) => {
    const picked = Array.from(e.target.files || []);
    e.target.value = "";
    if (!picked.length) return;
    const { valid: files, error } = validateImageFiles(picked);
    if (error) setSaveError(error);
    if (!files.length) return;
    setUploadingImages(true);
    try {
      const fd = new FormData();
      const CATS = ["FRENTE", "LATERAL", "TRASERA", "INTERIOR"];
      files.forEach((f, i) => fd.append(CATS[i] || "OTRA", f));
      const res = await api.upload(`/vehicles/${form.vehicleId}/images`, fd);
      const newImgs = Array.isArray(res.data) ? res.data : (res.images || []);
      setForm((p) => ({ ...p, images: [...p.images, ...newImgs] }));
    } catch {
      setSaveError("No se pudieron subir las imágenes.");
    } finally {
      setUploadingImages(false);
    }
  };

  /* ── Render states ── */
  if (loading) {
    return (
      <div className={styles.page}>
        <title>Editar vehículo | Mi Vehículo</title>
        <Navbar />
        <div className={styles.center}><Loader2 size={28} className={styles.spin} /> Cargando…</div>
      </div>
    );
  }

  if (notFound || !form) {
    return (
      <div className={styles.page}>
        <Navbar />
        <div className={styles.center}>
          <p>No se encontró el vehículo.</p>
          <Link to="/vendedor?tab=publicaciones" className={styles.backLink}>Volver al panel</Link>
        </div>
      </div>
    );
  }

  const errorList = Object.values(errors);
  const currentStatus = STATUS_OPTIONS.find((s) => s.value === form.status) || STATUS_OPTIONS[0];

  return (
    <div className={styles.page}>
      <title>{`Editar ${[form.marca, form.modelo].filter(Boolean).join(" ") || "vehículo"} | Mi Vehículo`}</title>
      <Navbar />

      {/* Top bar */}
      <header className={styles.topBar}>
        <div className={styles.topBarInner}>
          <button className={styles.backBtn} onClick={() => navigate("/vendedor?tab=publicaciones")}>
            <ArrowLeft size={16} /> <span>Mis publicaciones</span>
          </button>
          <div className={styles.topBarTitle}>
            <Edit3 size={18} />
            <h1>Editar publicación</h1>
            <span className={styles.topBarVehicle}>{form.marca} {form.modelo} {form.anio}</span>
          </div>
          <div className={styles.topBarActions}>
            <Link to={`/vehiculo/${slug}`} target="_blank" rel="noreferrer" className={styles.viewBtn}>
              Ver publicación
            </Link>
            <button
              className={styles.saveBtn}
              onClick={handleSave}
              disabled={saving}
            >
              {saving
                ? <><Loader2 size={15} className={styles.spin} /> Guardando…</>
                : saved
                  ? <><CheckCircle size={15} /> Guardado</>
                  : <><Save size={15} /> Guardar cambios</>
              }
            </button>
          </div>
        </div>
      </header>

      <main className={styles.main}>
        <div className={styles.layout}>

          {/* ── Left column: main form ── */}
          <div className={styles.formCol}>

            {errorList.length > 0 && (
              <div className={styles.errorBanner}>
                <AlertCircle size={18} />
                <div>
                  <strong>Revisá estos campos:</strong>
                  <ul>{errorList.map((e) => <li key={e}>{e}</li>)}</ul>
                </div>
              </div>
            )}
            {saveError && (
              <div className={styles.errorBanner}>
                <AlertCircle size={18} />
                <span>{saveError}</span>
              </div>
            )}

            {/* Datos del vehículo */}
            <section className={styles.card}>
              <h2 className={styles.cardTitle}>Datos del vehículo</h2>
              <div className={styles.grid2}>
                <Field label="Marca" required error={errors.marcaId}>
                  <select name="marcaId" value={form.marcaId} onChange={handleBrandChange}>
                    <option value="">Seleccioná la marca</option>
                    {brands.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
                  </select>
                </Field>

                <Field label="Modelo" required error={errors.modeloId}>
                  <select name="modeloId" value={form.modeloId} onChange={handleModelChange} disabled={!form.marcaId}>
                    <option value="">{!form.marcaId ? "Primero elegí la marca" : "Seleccioná el modelo"}</option>
                    {models.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
                  </select>
                </Field>

                <Field label="Año" required error={errors.anio}>
                  <select name="anio" value={form.anio} onChange={handleChange}>
                    <option value="">Seleccioná el año</option>
                    {YEARS.map((y) => <option key={y} value={y}>{y}</option>)}
                  </select>
                </Field>

                <Field label="Versión / Trim">
                  <input type="text" name="version" value={form.version} onChange={handleChange} placeholder="Ej: XEI, LTZ 4x4…" />
                </Field>

                <Field label="Kilometraje" required error={errors.km}>
                  <div className={styles.inputSuffix}>
                    <input type="text" name="km" value={form.km} onChange={handleChange} placeholder="Ej: 85000" />
                    <span>km</span>
                  </div>
                </Field>

                <Field label="Categoría">
                  <select name="categoria" value={form.categoria} onChange={handleChange}>
                    {CATEGORY_OPTIONS.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
                  </select>
                </Field>

                <Field label="Condición">
                  <div className={styles.condRow}>
                    {["Nuevo", "Usado"].map((c) => (
                      <button
                        key={c}
                        type="button"
                        className={`${styles.condBtn} ${form.condicion === c ? styles.condBtnActive : ""}`}
                        onClick={() => set("condicion", c)}
                      >
                        {c}
                      </button>
                    ))}
                  </div>
                </Field>
              </div>
            </section>

            {/* Características */}
            <section className={styles.card}>
              <h2 className={styles.cardTitle}>Características</h2>
              <div className={styles.grid2}>
                <Field label="Combustible">
                  <select name="combustible" value={form.combustible} onChange={handleChange}>
                    {COMBUSTIBLE_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
                  </select>
                </Field>

                <Field label="Transmisión">
                  <select name="transmision" value={form.transmision} onChange={handleChange}>
                    {TRANSMISION_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
                  </select>
                </Field>
              </div>
            </section>

            {/* Descripción */}
            <section className={styles.card}>
              <h2 className={styles.cardTitle}>Descripción</h2>
              <textarea
                name="descripcion"
                value={form.descripcion}
                onChange={handleChange}
                placeholder="Describí el estado del vehículo, service realizados, extras, etc."
                className={styles.textarea}
                rows={5}
                maxLength={800}
              />
              <p className={styles.charCount}>{form.descripcion.length}/800</p>
            </section>

            {/* Precio */}
            <section className={styles.card}>
              <h2 className={styles.cardTitle}>Precio</h2>
              <div className={styles.grid2}>
                <Field label="Precio (USD)" required error={errors.precio}>
                  <div className={styles.inputPrefix}>
                    <span>$</span>
                    <input type="text" inputMode="decimal" name="precio" value={form.precio} onChange={handleChange} placeholder="Ej: 15,000" />
                  </div>
                </Field>
              </div>
              <div className={styles.toggleRow}>
                <Toggle label="Acepta permuta" value={form.aceptaPermuta} onChange={(v) => set("aceptaPermuta", v)} />
                <Toggle label="Precio negociable" value={form.precioNegociable} onChange={(v) => set("precioNegociable", v)} />
                <Toggle label="Acepta financiación" value={form.financiacion} onChange={(v) => set("financiacion", v)} />
              </div>
            </section>

            {/* Contacto y ubicación */}
            <section className={styles.card}>
              <h2 className={styles.cardTitle}>Contacto y ubicación</h2>
              <div className={styles.grid2}>
                <Field label="Teléfono / WhatsApp" error={errors.phone}>
                  <input type="tel" inputMode="tel" name="phone" value={form.phone} onChange={handleChange} placeholder="+503 7000-0000" />
                </Field>

                <div /> {/* spacer */}

                <LocationSelect
                  provinceId={form.provinceId}
                  cityId={form.cityId}
                  onChange={handleLocationChange}
                  fieldClassName={styles.field}
                />
              </div>
            </section>

            {/* Fotos */}
            <section className={styles.card}>
              <div className={styles.cardTitleRow}>
                <h2 className={styles.cardTitle}>Fotos</h2>
                <button
                  type="button"
                  className={styles.addPhotoBtn}
                  onClick={() => fileRef.current?.click()}
                  disabled={uploadingImages}
                >
                  {uploadingImages
                    ? <><Loader2 size={14} className={styles.spin} /> Subiendo…</>
                    : <><Plus size={14} /> Agregar fotos</>
                  }
                </button>
                <input
                  ref={fileRef}
                  type="file"
                  accept={IMAGE_ACCEPT}
                  multiple
                  className={styles.hiddenInput}
                  onChange={handleUploadImages}
                />
              </div>

              {form.images.length === 0 ? (
                <div className={styles.noPhotos}>
                  <p>No hay fotos. Agregá al menos una imagen.</p>
                </div>
              ) : (
                <div className={styles.imagesGrid}>
                  {form.images.map((img, i) => (
                    <div key={img.id} className={`${styles.imageThumb} ${img.isPrimary ? styles.imagePrimary : ""}`}>
                      <img src={img.url} alt={`Foto ${i + 1}`} />
                      {img.isPrimary && <span className={styles.primaryBadge}>Principal</span>}
                      {!img.isPrimary && (
                        <button
                          type="button"
                          className={styles.setPrimaryBtn}
                          onClick={() => handleSetPrimary(img.id)}
                          title="Usar como foto principal"
                        >
                          <Star size={12} />
                        </button>
                      )}
                      <button
                        type="button"
                        className={styles.deleteImageBtn}
                        onClick={() => handleDeleteImage(img.id)}
                        title="Eliminar foto"
                      >
                        <X size={13} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </section>

          </div>

          {/* ── Right column: sidebar ── */}
          <aside className={styles.sidebar}>

            {/* Estado del aviso */}
            <div className={styles.sideCard}>
              <h3>Estado del aviso</h3>
              <div className={styles.statusGrid}>
                {STATUS_OPTIONS.map((s) => (
                  <button
                    key={s.value}
                    type="button"
                    className={`${styles.statusBtn} ${form.status === s.value ? styles.statusBtnActive : ""}`}
                    style={form.status === s.value ? { borderColor: s.color, color: s.color } : {}}
                    onClick={() => handleStatusChange(s.value)}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
              <p className={styles.statusHint}>
                Estado actual: <strong style={{ color: currentStatus.color }}>{currentStatus.label}</strong>
              </p>
            </div>

            {/* Quick info */}
            <div className={styles.sideCard}>
              <h3>Información</h3>
              <ul className={styles.infoList}>
                <li><span>Marca</span><strong>{form.marca || "—"}</strong></li>
                <li><span>Modelo</span><strong>{form.modelo || "—"}</strong></li>
                <li><span>Año</span><strong>{form.anio || "—"}</strong></li>
                <li><span>Precio</span><strong>{formatUSD(form.precio)}</strong></li>
                <li><span>Fotos</span><strong>{form.images.length}</strong></li>
              </ul>
            </div>

            {/* Save / discard */}
            <div className={styles.sideCard}>
              {saved && (
                <div className={styles.savedMsg}>
                  <CheckCircle size={16} /> Cambios guardados correctamente
                </div>
              )}
              <button className={styles.saveBtnFull} onClick={handleSave} disabled={saving}>
                {saving
                  ? <><Loader2 size={15} className={styles.spin} /> Guardando…</>
                  : <><Save size={15} /> Guardar cambios</>
                }
              </button>
              <button
                className={styles.deletePubBtn}
                onClick={async () => {
                  if (!window.confirm("¿Eliminar esta publicación? No se puede deshacer.")) return;
                  try {
                    await api.patch(`/vehicles/${form.vehicleId}/status`, { status: "DELETED" });
                    navigate("/vendedor?tab=publicaciones");
                  } catch {
                    setSaveError("No se pudo eliminar.");
                  }
                }}
              >
                <Trash2 size={14} /> Eliminar publicación
              </button>
            </div>

          </aside>
        </div>
      </main>
    </div>
  );
};

export default EditarVehiculo;
