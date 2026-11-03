import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  AlertCircle, ArrowLeft, CheckCircle, Edit3, Loader2,
  Pause, Play, Plus, Save, Trash2, X,
} from "lucide-react";
import Navbar from "../../../components/Navbar/Navbar";
import { api } from "../../../lib/api";
import { formatUSD, isValidPrice, parseMoney } from "../../../lib/money";
import { formatSvPhone, isValidSvPhone, normalizeSvPhone } from "../../../lib/phone";
import { IMAGE_ACCEPT, validateImageFiles } from "../../../lib/images";
import { SERVICE_TYPE_OPTIONS, serviceTypeLabel } from "../../../lib/categories";
import { publishItem, apiErrorMessage } from "../../../lib/publishing";
import useSafeTimeout from "../../../hooks/useSafeTimeout";
import LocationSelect from "../shared/LocationSelect/LocationSelect";
import {
  MAX_SERVICE_PHOTOS, NO_PRICE_NOTE, PRICE_NOTES,
  normalizeWebsite, priceNoteFromApi, priceNoteToApi,
} from "../PublicarServicio/serviceForm";
import styles from "../EditarVehiculo/EditarVehiculo.module.css";

const STATUS_LABELS = {
  DRAFT:    { label: "Borrador",     color: "#6b7280" },
  PENDING:  { label: "En revisión",  color: "#d97706" },
  ACTIVE:   { label: "Activo",       color: "#059669" },
  PAUSED:   { label: "Pausado",      color: "#d97706" },
  REJECTED: { label: "Rechazado",    color: "#dc2626" },
  EXPIRED:  { label: "Vencido",      color: "#6b7280" },
};

const HORARIOS = ["Mañana", "Tarde", "Noche", "Todo el día"];

const fromApi = (s) => ({
  serviceId:       s.id,
  slug:            s.slug || "",
  serviceType:     s.serviceType || "",
  titulo:          s.title || "",
  descripcion:     s.description || "",
  precio:          s.price ? String(s.price) : "",
  priceNote:       priceNoteFromApi(s.priceNote),
  provinceId:      String(s.city?.province?.id || ""),
  cityId:          String(s.city?.id || s.cityId || ""),
  direccion:       s.address || "",
  contactName:     s.contactName || "",
  phone:           formatSvPhone(s.contactPhone),
  showWhatsapp:    s.showWhatsapp !== false,
  contactHours:    s.contactHours || "",
  website:         s.website || "",
  status:          s.status || "DRAFT",
  moderationNotes: s.moderationNotes || "",
  images:          s.images || [],
});

const Field = ({ label, required, children, error }) => (
  <div className={styles.field}>
    <label>{label}{required && <span className={styles.req}>*</span>}</label>
    {children}
    {error && <p className={styles.fieldError}>{error}</p>}
  </div>
);

const EditarServicio = () => {
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
  const [statusBusy, setStatusBusy]     = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);

  // No hay GET por id para el dueño: se busca en /services/me
  useEffect(() => {
    let ignore = false;
    api.get("/services/me?limit=100")
      .then((res) => {
        if (ignore) return;
        const list = Array.isArray(res.data) ? res.data : (res.data?.items || []);
        const found = list.find((s) => String(s.id) === String(id));
        if (found) setForm(fromApi(found)); else setNotFound(true);
      })
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

  const sinPrecio = form?.priceNote === NO_PRICE_NOTE;

  const validate = () => {
    const errs = {};
    if (!form.serviceType) errs.serviceType = "Elegí el tipo de servicio.";
    if (!form.titulo?.trim()) errs.titulo = "Ingresá el título.";
    if (!form.descripcion?.trim()) errs.descripcion = "Escribí una descripción.";
    if (!sinPrecio && form.precio.trim() && !isValidPrice(form.precio)) errs.precio = "Ingresá un precio mayor a $0 o dejalo vacío.";
    if (!form.contactName?.trim()) errs.contactName = "Ingresá el nombre de contacto.";
    if (!isValidSvPhone(form.phone)) errs.phone = "El WhatsApp debe tener 8 dígitos.";
    if (normalizeWebsite(form.website) === null) errs.website = "Ingresá un sitio web válido (ej.: mitaller.com).";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    setSaving(true); setSaveError(""); setSaved(false);
    try {
      await api.patch(`/services/${form.serviceId}`, {
        serviceType:  form.serviceType,
        title:        form.titulo.trim(),
        description:  form.descripcion.trim(),
        // null borra el precio/nota guardados (p. ej. al pasar a "A convenir")
        price:        sinPrecio || !form.precio.trim() ? null : parseMoney(form.precio),
        currency:     "USD",
        priceNote:    priceNoteToApi(form.priceNote) ?? null,
        cityId:       Number(form.cityId) > 0 ? Number(form.cityId) : undefined,
        address:      form.direccion.trim() || undefined,
        contactName:  form.contactName.trim(),
        contactPhone: normalizeSvPhone(form.phone),
        showWhatsapp: form.showWhatsapp,
        contactHours: form.contactHours || undefined,
        website:      normalizeWebsite(form.website),
      });
      setSaved(true);
      later(() => setSaved(false), 3000);
    } catch (err) {
      setSaveError(apiErrorMessage(err, "No se pudo guardar. Intentá de nuevo."));
    } finally {
      setSaving(false);
    }
  };

  const handlePause = async () => {
    setStatusBusy(true); setSaveError("");
    try {
      await api.patch(`/services/${form.serviceId}/status`, { status: "PAUSED" });
      setForm((p) => ({ ...p, status: "PAUSED" }));
    } catch (err) {
      setSaveError(apiErrorMessage(err, "No se pudo pausar el servicio."));
    } finally {
      setStatusBusy(false);
    }
  };

  // Pausado → activo: sin plan, no se vuelve a cobrar
  const handleReactivate = async () => {
    setStatusBusy(true); setSaveError("");
    try {
      const res = await publishItem({ itemType: "servicio", itemId: form.serviceId });
      setForm((p) => ({ ...p, status: res.status || "ACTIVE" }));
    } catch (err) {
      setSaveError(apiErrorMessage(err, "No se pudo reactivar el servicio."));
    } finally {
      setStatusBusy(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("¿Eliminar este servicio? No se puede deshacer.")) return;
    try {
      await api.patch(`/services/${form.serviceId}/status`, { status: "DELETED" });
      navigate("/vendedor?tab=publicaciones");
    } catch (err) {
      setSaveError(apiErrorMessage(err, "No se pudo eliminar."));
    }
  };

  const handleDeleteImage = async (imageId) => {
    if (!window.confirm("¿Eliminar esta foto?")) return;
    try {
      await api.delete(`/services/${form.serviceId}/images/${imageId}`);
      setForm((p) => ({ ...p, images: p.images.filter((i) => i.id !== imageId) }));
    } catch {
      setSaveError("No se pudo eliminar la imagen.");
    }
  };

  const handleUploadImages = async (e) => {
    const picked = Array.from(e.target.files || []);
    e.target.value = "";
    if (!picked.length) return;
    const room = MAX_SERVICE_PHOTOS - form.images.length;
    if (room <= 0) { setSaveError(`Máximo ${MAX_SERVICE_PHOTOS} fotos por servicio.`); return; }
    const { valid, error } = validateImageFiles(picked);
    const files = valid.slice(0, room);
    if (error) setSaveError(error);
    else if (valid.length > room) setSaveError(`Solo se agregaron ${room} fotos (máximo ${MAX_SERVICE_PHOTOS}).`);
    if (!files.length) return;
    setUploadingImages(true);
    try {
      const fd = new FormData();
      files.forEach((f) => fd.append("images", f));
      const res = await api.upload(`/services/${form.serviceId}/images`, fd);
      const newImgs = Array.isArray(res.data) ? res.data : (res.data?.images || res.images || []);
      setForm((p) => ({ ...p, images: [...p.images, ...newImgs] }));
    } catch (err) {
      setSaveError(apiErrorMessage(err, "No se pudieron subir las imágenes."));
    } finally {
      setUploadingImages(false);
    }
  };

  if (loading) return (
    <div className={styles.page}>
      <title>Editar servicio | Mi Vehículo</title>
      <Navbar />
      <div className={styles.center}><Loader2 size={28} className={styles.spin} /> Cargando…</div>
    </div>
  );

  if (notFound || !form) return (
    <div className={styles.page}>
      <Navbar />
      <div className={styles.center}>
        <p>No se encontró el servicio.</p>
        <Link to="/vendedor?tab=publicaciones" className={styles.backLink}>Volver al panel</Link>
      </div>
    </div>
  );

  const errorList     = Object.values(errors);
  const currentStatus = STATUS_LABELS[form.status] || STATUS_LABELS.DRAFT;

  return (
    <div className={styles.page}>
      <title>{`Editar ${form.titulo || "servicio"} | Mi Vehículo`}</title>
      <Navbar />

      <header className={styles.topBar}>
        <div className={styles.topBarInner}>
          <button className={styles.backBtn} onClick={() => navigate("/vendedor?tab=publicaciones")}>
            <ArrowLeft size={16} /> <span>Mis publicaciones</span>
          </button>
          <div className={styles.topBarTitle}>
            <Edit3 size={18} />
            <h1>Editar servicio</h1>
            <span className={styles.topBarVehicle}>{form.titulo}</span>
          </div>
          <div className={styles.topBarActions}>
            {form.slug && form.status === "ACTIVE" && (
              <Link to={`/servicio/${form.slug}`} target="_blank" rel="noreferrer" className={styles.viewBtn}>
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

          {/* ── Columna izquierda ── */}
          <div className={styles.formCol}>
            {form.status === "REJECTED" && (
              <div className={styles.errorBanner}>
                <AlertCircle size={18} />
                <div>
                  <strong>El equipo rechazó este servicio.</strong>
                  {form.moderationNotes
                    ? <p>{form.moderationNotes}</p>
                    : <p>Revisá los datos y las fotos, o contactate con soporte.</p>}
                </div>
              </div>
            )}
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
              <div className={styles.errorBanner} role="alert">
                <AlertCircle size={18} />
                <span>{saveError}</span>
              </div>
            )}

            {/* Datos del servicio */}
            <section className={styles.card}>
              <h2 className={styles.cardTitle}>Datos del servicio</h2>
              <div className={styles.grid2}>
                <Field label="Tipo de servicio" required error={errors.serviceType}>
                  <select name="serviceType" value={form.serviceType} onChange={handleChange}>
                    <option value="">Seleccioná el tipo</option>
                    {SERVICE_TYPE_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                </Field>
                <Field label="Título" required error={errors.titulo}>
                  <input type="text" name="titulo" value={form.titulo} onChange={handleChange} maxLength={120} placeholder="Ej: Taller mecánico y escáner en Santa Tecla" />
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
                placeholder="Contá qué servicios ofrecés, marcas que atendés, garantía, si vas a domicilio, etc."
                className={styles.textarea}
                rows={5}
                maxLength={2000}
              />
              <p className={styles.charCount}>{(form.descripcion || "").length}/2000</p>
            </section>

            {/* Precio */}
            <section className={styles.card}>
              <h2 className={styles.cardTitle}>Precio</h2>
              <div className={styles.grid2}>
                <Field label="Modalidad">
                  <select name="priceNote" value={form.priceNote} onChange={handleChange}>
                    {PRICE_NOTES.map((n) => <option key={n} value={n}>{n}</option>)}
                  </select>
                </Field>
                {!sinPrecio && (
                  <Field label="Precio (USD, opcional)" error={errors.precio}>
                    <div className={styles.inputPrefix}>
                      <span>$</span>
                      <input type="text" inputMode="decimal" name="precio" value={form.precio} onChange={handleChange} placeholder="Ej: 25.00" />
                    </div>
                  </Field>
                )}
              </div>
            </section>

            {/* Contacto y ubicación */}
            <section className={styles.card}>
              <h2 className={styles.cardTitle}>Contacto y ubicación</h2>
              <div className={styles.grid2}>
                <Field label="Nombre de contacto" required error={errors.contactName}>
                  <input type="text" name="contactName" value={form.contactName} onChange={handleChange} placeholder="Ej.: Juan Pérez" />
                </Field>
                <Field label="WhatsApp" required error={errors.phone}>
                  <input type="tel" inputMode="tel" name="phone" value={form.phone} onChange={handleChange} placeholder="+503 7000-0000" />
                </Field>
                <Field label="Horario de contacto">
                  <select name="contactHours" value={form.contactHours} onChange={handleChange}>
                    <option value="">Sin especificar</option>
                    {HORARIOS.map((h) => <option key={h} value={h}>{h}</option>)}
                    {form.contactHours && !HORARIOS.includes(form.contactHours) && (
                      <option value={form.contactHours}>{form.contactHours}</option>
                    )}
                  </select>
                </Field>
                <Field label="Sitio web o red social" error={errors.website}>
                  <input type="url" inputMode="url" name="website" value={form.website} onChange={handleChange} placeholder="Ej: mitaller.com" />
                </Field>
                <LocationSelect
                  provinceId={form.provinceId}
                  cityId={form.cityId}
                  onChange={handleLocationChange}
                  fieldClassName={styles.field}
                />
                <Field label="Dirección">
                  <input type="text" name="direccion" value={form.direccion} onChange={handleChange} maxLength={200} placeholder="Ej: Calle Chiltiupán, Santa Tecla" />
                </Field>
              </div>
              <div className={styles.toggleRow}>
                <button
                  type="button"
                  className={`${styles.toggle} ${form.showWhatsapp ? styles.toggleOn : ""}`}
                  onClick={() => set("showWhatsapp", !form.showWhatsapp)}
                >
                  <span className={styles.toggleKnob} />
                  <span className={styles.toggleLabel}>{form.showWhatsapp ? "Sí" : "No"} — Mostrar WhatsApp a usuarios registrados</span>
                </button>
              </div>
            </section>

            {/* Fotos */}
            <section className={styles.card}>
              <div className={styles.cardTitleRow}>
                <h2 className={styles.cardTitle}>Fotos ({form.images.length}/{MAX_SERVICE_PHOTOS})</h2>
                <button
                  type="button"
                  className={styles.addPhotoBtn}
                  onClick={() => fileRef.current?.click()}
                  disabled={uploadingImages || form.images.length >= MAX_SERVICE_PHOTOS}
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
                      <button type="button" className={styles.deleteImageBtn} onClick={() => handleDeleteImage(img.id)} title="Eliminar foto">
                        <X size={13} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>

          {/* ── Sidebar ── */}
          <aside className={styles.sidebar}>
            <div className={styles.sideCard}>
              <h3>Estado del servicio</h3>
              <p className={styles.statusHint}>
                Estado actual: <strong style={{ color: currentStatus.color }}>{currentStatus.label}</strong>
              </p>
              {form.status === "ACTIVE" && (
                <button type="button" className={styles.statusBtn} onClick={handlePause} disabled={statusBusy}>
                  <Pause size={14} /> Pausar
                </button>
              )}
              {form.status === "PAUSED" && (
                <button type="button" className={styles.statusBtn} onClick={handleReactivate} disabled={statusBusy}>
                  <Play size={14} /> Reactivar
                </button>
              )}
              {form.status === "PENDING" && (
                <p className={styles.statusHint}>El equipo lo está revisando. Te avisamos cuando se apruebe.</p>
              )}
              {(form.status === "DRAFT" || form.status === "EXPIRED") && (
                <p className={styles.statusHint}>No está publicado. Para publicarlo elegí un plan desde Mis publicaciones.</p>
              )}
            </div>

            <div className={styles.sideCard}>
              <h3>Información</h3>
              <ul className={styles.infoList}>
                <li><span>Tipo</span><strong>{serviceTypeLabel(form.serviceType)}</strong></li>
                <li><span>Precio</span><strong>{sinPrecio || !form.precio ? "A convenir" : formatUSD(form.precio)}</strong></li>
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
              <button className={styles.deletePubBtn} onClick={handleDelete}>
                <Trash2 size={14} /> Eliminar servicio
              </button>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
};

export default EditarServicio;
