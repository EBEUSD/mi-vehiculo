import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  AlertCircle, ArrowLeft, CheckCircle, Edit3, Loader2,
  Plus, Save, Star, Trash2, X,
} from "lucide-react";
import Navbar from "../../../components/Navbar/Navbar";
import { api } from "../../../lib/api";
import styles from "../EditarVehiculo/EditarVehiculo.module.css";

const STATUS_OPTIONS = [
  { value: "ACTIVE", label: "Activo",  color: "#059669" },
  { value: "PAUSED", label: "Pausado", color: "#d97706" },
  { value: "SOLD",   label: "Vendido", color: "#6b7280" },
];

const fromApi = (p) => ({
  productId:           p.id,
  slug:                p.slug || "",
  titulo:              p.title || "",
  descripcion:         p.description || "",
  precio:              String(p.price || 0),
  condicion:           p.condition === "NEW" ? "Nuevo" : "Usado",
  categoria:           p.category || "",
  stock:               String(p.stock || 1),
  negotiable:          p.negotiable   ? "Si" : "No",
  acceptsTrade:        p.acceptsTrade ? "Si" : "No",
  universal:           !!p.universal,
  compatibilityBrands: p.compatibilityBrands || "",
  compatibilityModels: p.compatibilityModels || "",
  compatibilityYears:  p.compatibilityYears  || "",
  phone:               p.contactPhone || "",
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

  const [loading, setLoading]           = useState(true);
  const [notFound, setNotFound]         = useState(false);
  const [form, setForm]                 = useState(null);
  const [provinces, setProvinces]       = useState([]);
  const [cities, setCities]             = useState([]);
  const [saving, setSaving]             = useState(false);
  const [saved, setSaved]               = useState(false);
  const [saveError, setSaveError]       = useState("");
  const [errors, setErrors]             = useState({});
  const [uploadingImages, setUploadingImages] = useState(false);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      api.get(`/products/${id}`),
      api.get("/location/provinces").catch(() => ({ data: [] })),
    ])
      .then(([productRes, provincesRes]) => {
        const p = productRes.data;
        const f = fromApi(p);
        setForm(f);
        setProvinces(provincesRes.data || []);
        if (f.provinceId) {
          api.get(`/location/provinces/${f.provinceId}/cities`)
            .then((r) => setCities(r.data || []))
            .catch(() => {});
        }
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [id]);

  const handleProvinceChange = (e) => {
    const pid  = e.target.value;
    const prov = provinces.find((p) => String(p.id) === pid);
    setForm((p) => ({ ...p, provinceId: pid, provincia: prov?.name || "", cityId: "", ciudad: "" }));
    setCities([]);
    if (pid) {
      api.get(`/location/provinces/${pid}/cities`)
        .then((r) => setCities(r.data || []))
        .catch(() => {});
    }
  };

  const handleCityChange = (e) => {
    const cid  = e.target.value;
    const city = cities.find((c) => String(c.id) === cid);
    setForm((p) => ({ ...p, cityId: cid, ciudad: city?.name || "" }));
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
    if (!form.precio || Number(form.precio) <= 0) errs.precio = "Ingresá un precio válido.";
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
        price:               parseFloat(String(form.precio).replace(/[^\d.]/g, "")) || 0,
        currency:            "USD",
        stock:               parseInt(form.stock, 10) || 1,
        condition:           form.condicion === "Nuevo" ? "NEW" : "USED",
        category:            form.categoria || undefined,
        cityId:              Number(form.cityId) > 0 ? Number(form.cityId) : undefined,
        contactPhone:        form.phone || undefined,
        negotiable:          form.negotiable   === "Si",
        acceptsTrade:        form.acceptsTrade === "Si",
        universal:           !!form.universal,
        compatibilityBrands: form.compatibilityBrands || undefined,
        compatibilityModels: form.compatibilityModels || undefined,
        compatibilityYears:  form.compatibilityYears  || undefined,
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      setSaveError(err?.message || "No se pudo guardar. Intentá de nuevo.");
    } finally {
      setSaving(false);
    }
  };

  const handleStatusChange = async (newStatus) => {
    if (newStatus === form.status) return;
    try {
      await api.patch(`/products/${form.productId}/status`, { status: newStatus });
      setForm((p) => ({ ...p, status: newStatus }));
    } catch {
      setSaveError("No se pudo cambiar el estado.");
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
    const files = Array.from(e.target.files || []);
    e.target.value = "";
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
                    <input type="text" name="precio" value={form.precio} onChange={handleChange} placeholder="Ej: 35" />
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
                <Field label="Teléfono / WhatsApp">
                  <input type="tel" name="phone" value={form.phone} onChange={handleChange} placeholder="+503 7000-0000" />
                </Field>
                <div />
                <Field label="Departamento">
                  <select value={form.provinceId} onChange={handleProvinceChange}>
                    <option value="">Seleccioná el departamento</option>
                    {provinces.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                </Field>
                <Field label="Municipio">
                  <select value={form.cityId} onChange={handleCityChange} disabled={!form.provinceId}>
                    <option value="">{!form.provinceId ? "Primero elegí el departamento" : "Seleccioná el municipio"}</option>
                    {cities.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </Field>
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
                  accept="image/jpeg,image/jpg,image/png,image/webp"
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
                <li><span>Precio</span><strong>{form.precio ? `$${Number(form.precio).toLocaleString("en-US")}` : "—"}</strong></li>
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
