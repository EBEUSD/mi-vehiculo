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
import { apiErrorMessage, errorCode, productItemType, publishItem } from "../../../lib/publishing";
import LocationSelect from "../shared/LocationSelect/LocationSelect";
import styles from "../EditarVehiculo/EditarVehiculo.module.css";

const STATUS_OPTIONS = [
  { value: "ACTIVE", label: "Activo",  color: "#059669" },
  { value: "PAUSED", label: "Pausado", color: "#d97706" },
  { value: "SOLD",   label: "Vendido", color: "#6b7280" },
];

const fromApi = (p) => ({
  productId:           p.id,
  itemType:            productItemType(p),
  slug:                p.slug || "",
  titulo:              p.title || "",
  descripcion:         p.description || "",
  precio:              p.price ? String(p.price) : "",
  condicion:           p.condition === "NEW" ? "Nuevo" : "Usado",
  categoria:           p.category || "",
  stock:               String(p.stock || 1),
  negotiable:          p.negotiable   ? "Si" : "No",
  acceptsTrade:        p.acceptsTrade ? "Si" : "No",
  universal:           !!p.universal,
  compatibilityBrands: p.compatibilityBrands || "",
  compatibilityModels: p.compatibilityModels || "",
  compatibilityYears:  p.compatibilityYears  || "",
  phone:               formatSvPhone(p.contactPhone),
  provinceId:          String(p.city?.province?.id || ""),
  cityId:              String(p.city?.id || ""),
  status:              p.status || "ACTIVE",
  images:              p.images || [],
});

const Field = ({ label, required, children, error }) => (
  <div className={styles.field}>
    <label>{label}{required && <span className={styles.req}>*</span>}</label>
    {children}
    {error && <p className={styles.fieldError}>{error}</p>}
  </div>
);

const ToggleBtn = ({ label, value, onChange }) => (
  <button
    type="button"
    className={`${styles.toggle} ${value === "Si" ? styles.toggleOn : ""}`}
    onClick={() => onChange(value === "Si" ? "No" : "Si")}
  >
    <span className={styles.toggleKnob} />
    <span className={styles.toggleLabel}>{value === "Si" ? "Sí" : "No"} — {label}</span>
  </button>
);

const EditarProducto = () => {
  const { id }    = useParams();
  const navigate  = useNavigate();
  const fileRef   = useRef(null);
  const later     = useSafeTimeout();

  const [loading, setLoading]           = useState(true);
  const [notFound, setNotFound]         = useState(false);
  const [form, setForm]                 = useState(null);
  const [saving, setSaving]             = useState(false);
  const [saved, setSaved]               = useState(false);
  const [saveError, setSaveError]       = useState("");
  const [errors, setErrors]             = useState({});
  const [uploadingImages, setUploadingImages] = useState(false);

  useEffect(() => {
    let ignore = false;
    api.get(`/products/${id}`)
      .then((productRes) => { if (!ignore) setForm(fromApi(productRes.data)); })
      .catch(() => { if (!ignore) setNotFound(true); })
      .finally(() => { if (!ignore) setLoading(false); });
    return () => { ignore = true; };
  }, [id]);

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

  const validate = () => {
    const errs = {};
    if (!form.titulo?.trim()) errs.titulo = "Ingresá el título.";
    if (!isValidPrice(form.precio)) errs.precio = "Ingresá un precio mayor a $0.";
    if (form.phone && !isValidSvPhone(form.phone)) errs.phone = "El teléfono debe tener 8 dígitos.";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    setSaving(true); setSaveError(""); setSaved(false);
    try {
      await api.patch(`/products/${form.productId}`, {
        title:               form.titulo,
        description:         form.descripcion || undefined,
        price:               parseMoney(form.precio),
        currency:            "USD",
        stock:               parseInt(form.stock, 10) || 1,
        condition:           form.condicion === "Nuevo" ? "NEW" : "USED",
        category:            form.categoria || undefined,
        cityId:              Number(form.cityId) > 0 ? Number(form.cityId) : undefined,
        contactPhone:        normalizeSvPhone(form.phone),
        negotiable:          form.negotiable   === "Si",
        acceptsTrade:        form.acceptsTrade === "Si",
        universal:           !!form.universal,
        compatibilityBrands: form.compatibilityBrands || undefined,
        compatibilityModels: form.compatibilityModels || undefined,
        compatibilityYears:  form.compatibilityYears  || undefined,
      });
      setSaved(true);
      later(() => setSaved(false), 3000);
    } catch (err) {
      setSaveError(err?.message || "No se pudo guardar. Intentá de nuevo.");
    } finally {
      setSaving(false);
    }
  };

  // Activar solo por /publish (PATCH status ACTIVE responde 403): si el plan sigue
  // vigente no se cobra; si venció hay que volver a publicarla desde el panel.
  const handleStatusChange = async (newStatus) => {
    if (newStatus === form.status) return;
    try {
      if (newStatus === "ACTIVE") {
        const data = await publishItem({ itemType: form.itemType, itemId: form.productId });
        setForm((p) => ({ ...p, status: data.status || "ACTIVE" }));
        return;
      }
      await api.patch(`/products/${form.productId}/status`, { status: newStatus });
      setForm((p) => ({ ...p, status: newStatus }));
    } catch (err) {
      const code = errorCode(err);
      setSaveError(code === "INVALID_PLAN" || code === "PAYMENT_REQUIRED"
        ? "La publicación venció. Volvé a publicarla desde tu panel eligiendo un plan."
        : apiErrorMessage(err, "No se pudo cambiar el estado."));
    }
  };

  const handleSetPrimary = async (imageId) => {
    try {
      await api.patch(`/products/${form.productId}/images/${imageId}/primary`, {});
      setForm((p) => ({
        ...p,
        images: p.images.map((i) => ({ ...i, isPrimary: i.id === imageId })),
      }));
    } catch {
      setSaveError("No se pudo cambiar la foto principal.");
    }
  };

  const handleDeleteImage = async (imageId) => {
    if (!window.confirm("¿Eliminar esta foto?")) return;
    try {
      await api.delete(`/products/${form.productId}/images/${imageId}`);
      setForm((p) => ({ ...p, images: p.images.filter((i) => i.id !== imageId) }));
    } catch {
      setSaveError("No se pudo eliminar la imagen.");
    }
  };

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
      files.forEach((f, i) => fd.append(`image_${i}`, f));
      const res = await api.upload(`/products/${form.productId}/images`, fd);
      const newImgs = Array.isArray(res.data) ? res.data : (res.images || []);
      setForm((p) => ({ ...p, images: [...p.images, ...newImgs] }));
    } catch {
      setSaveError("No se pudieron subir las imágenes.");
    } finally {
      setUploadingImages(false);
    }
  };

  if (loading) return (
    <div className={styles.page}>
      <title>Editar publicación | Mi Vehículo</title>
      <Navbar />
      <div className={styles.center}><Loader2 size={28} className={styles.spin} /> Cargando…</div>
    </div>
  );

  if (notFound || !form) return (
    <div className={styles.page}>
      <Navbar />
      <div className={styles.center}>
        <p>No se encontró el producto.</p>
        <Link to="/vendedor?tab=publicaciones" className={styles.backLink}>Volver al panel</Link>
      </div>
    </div>
  );

  const errorList      = Object.values(errors);
  const currentStatus  = STATUS_OPTIONS.find((s) => s.value === form.status) || STATUS_OPTIONS[0];

  return (
    <div className={styles.page}>
      <title>{`Editar ${form.titulo || "publicación"} | Mi Vehículo`}</title>
      <Navbar />

      <header className={styles.topBar}>
        <div className={styles.topBarInner}>
          <button className={styles.backBtn} onClick={() => navigate("/vendedor?tab=publicaciones")}>
            <ArrowLeft size={16} /> <span>Mis publicaciones</span>
          </button>
          <div className={styles.topBarTitle}>
            <Edit3 size={18} />
            <h1>Editar publicación</h1>
            <span className={styles.topBarVehicle}>{form.titulo}</span>
          </div>
          <div className={styles.topBarActions}>
            {form.slug && (
              <Link to={`/producto/${form.slug}`} target="_blank" rel="noreferrer" className={styles.viewBtn}>
                Ver publicación
              </Link>
            )}
            <button className={styles.saveBtn} onClick={handleSave} disabled={saving}>
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

          {/* ── Left column ── */}
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

            {/* Datos del producto */}
            <section className={styles.card}>
              <h2 className={styles.cardTitle}>Datos del producto</h2>
              <div className={styles.grid2}>
                <Field label="Título" required error={errors.titulo} style={{ gridColumn: "1 / -1" }}>
                  <input type="text" name="titulo" value={form.titulo} onChange={handleChange} placeholder="Ej: Filtro de aceite Toyota Corolla" />
                </Field>
                <Field label="Categoría">
                  <input type="text" name="categoria" value={form.categoria} onChange={handleChange} placeholder="Ej: Motor, Frenos, Accesorios…" />
                </Field>
                <Field label="Stock / Cantidad">
                  <input type="number" name="stock" value={form.stock} onChange={handleChange} min={1} />
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

            {/* Descripción */}
            <section className={styles.card}>
              <h2 className={styles.cardTitle}>Descripción</h2>
              <textarea
                name="descripcion"
                value={form.descripcion}
                onChange={handleChange}
                placeholder="Describí el estado del producto, número de parte, compatibilidad, etc."
                className={styles.textarea}
                rows={5}
                maxLength={800}
              />
              <p className={styles.charCount}>{(form.descripcion || "").length}/800</p>
            </section>

            {/* Compatibilidad */}
            <section className={styles.card}>
              <h2 className={styles.cardTitle}>Compatibilidad</h2>
              <div className={styles.grid2}>
                <Field label="Marcas compatibles">
                  <input type="text" name="compatibilityBrands" value={form.compatibilityBrands} onChange={handleChange} placeholder="Ej: Toyota, Honda, Chevrolet" />
                </Field>
                <Field label="Modelos compatibles">
                  <input type="text" name="compatibilityModels" value={form.compatibilityModels} onChange={handleChange} placeholder="Ej: Corolla, Civic" />
                </Field>
                <Field label="Años compatibles">
                  <input type="text" name="compatibilityYears" value={form.compatibilityYears} onChange={handleChange} placeholder="Ej: 2015-2022" />
                </Field>
                <div className={styles.field}>
                  <label>Universal</label>
                  <button
                    type="button"
                    className={`${styles.toggle} ${form.universal ? styles.toggleOn : ""}`}
                    onClick={() => set("universal", !form.universal)}
                  >
                    <span className={styles.toggleKnob} />
                    <span className={styles.toggleLabel}>{form.universal ? "Sí" : "No"} — Compatible con todos</span>
                  </button>
                </div>
              </div>
            </section>

            {/* Precio */}
            <section className={styles.card}>
              <h2 className={styles.cardTitle}>Precio</h2>
              <div className={styles.grid2}>
                <Field label="Precio (USD)" required error={errors.precio}>
                  <div className={styles.inputPrefix}>
                    <span>$</span>
                    <input type="text" inputMode="decimal" name="precio" value={form.precio} onChange={handleChange} placeholder="Ej: 35.00" />
                  </div>
                </Field>
              </div>
              <div className={styles.toggleRow}>
                <ToggleBtn label="Precio negociable" value={form.negotiable}   onChange={(v) => set("negotiable", v)} />
                <ToggleBtn label="Acepta permuta"     value={form.acceptsTrade} onChange={(v) => set("acceptsTrade", v)} />
              </div>
            </section>

            {/* Contacto y ubicación */}
            <section className={styles.card}>
              <h2 className={styles.cardTitle}>Contacto y ubicación</h2>
              <div className={styles.grid2}>
                <Field label="Teléfono / WhatsApp" error={errors.phone}>
                  <input type="tel" inputMode="tel" name="phone" value={form.phone} onChange={handleChange} placeholder="+503 7000-0000" />
                </Field>
                <div />
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
                <div className={styles.noPhotos}><p>No hay fotos. Agregá al menos una imagen.</p></div>
              ) : (
                <div className={styles.imagesGrid}>
                  {form.images.map((img, i) => (
                    <div key={img.id} className={`${styles.imageThumb} ${img.isPrimary ? styles.imagePrimary : ""}`}>
                      <img src={img.url} alt={`Foto ${i + 1}`} />
                      {img.isPrimary && <span className={styles.primaryBadge}>Principal</span>}
                      {!img.isPrimary && (
                        <button type="button" className={styles.setPrimaryBtn} onClick={() => handleSetPrimary(img.id)} title="Usar como foto principal">
                          <Star size={12} />
                        </button>
                      )}
                      <button type="button" className={styles.deleteImageBtn} onClick={() => handleDeleteImage(img.id)} title="Eliminar foto">
                        <X size={13} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>

          {/* ── Right sidebar ── */}
          <aside className={styles.sidebar}>
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

            <div className={styles.sideCard}>
              <h3>Información</h3>
              <ul className={styles.infoList}>
                <li><span>Categoría</span><strong>{form.categoria || "—"}</strong></li>
                <li><span>Condición</span><strong>{form.condicion}</strong></li>
                <li><span>Precio</span><strong>{formatUSD(form.precio)}</strong></li>
                <li><span>Stock</span><strong>{form.stock}</strong></li>
                <li><span>Fotos</span><strong>{form.images.length}</strong></li>
              </ul>
            </div>

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
                    await api.patch(`/products/${form.productId}/status`, { status: "DELETED" });
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

export default EditarProducto;
