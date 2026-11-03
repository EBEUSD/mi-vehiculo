import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  AlertCircle, ArrowLeft, ArrowRight, Check, CheckCircle, ChevronRight,
} from "lucide-react";
import { useAuth } from "../../../context/AuthContext";
import { api } from "../../../lib/api";
import { redirectToWompiCheckout } from "../../../lib/wompi";
import { publishItem, errorCode, apiErrorMessage } from "../../../lib/publishing";
import { getPlan, publishLabelFor } from "../../../lib/plans";
import { isValidPrice, parseMoney } from "../../../lib/money";
import { isValidSvPhone, normalizeSvPhone } from "../../../lib/phone";
import { SERVICE_TYPE_OPTIONS, serviceTypeLabel } from "../../../lib/categories";
import { DRAFT_KEYS, clearDraft, readDraft, revokePreviews, writeDraft } from "../../../lib/publishDrafts";
import useSafeTimeout from "../../../hooks/useSafeTimeout";
import PublicarTopbar from "../PublicarVehiculo/components/PublicarTopbar";
import PublicarStepper from "../PublicarVehiculo/components/PublicarStepper";
import PublicarSidebar from "../PublicarVehiculo/components/PublicarSidebar";
import FotosStep from "../PublicarVehiculo/steps/Fotos/FotosStep";
import ContactoUbicacionStep from "../PublicarVehiculo/steps/ContactoUbicacion/ContactoUbicacionStep";
import PlanPublicacionStep from "../PublicarVehiculo/steps/PlanPublicacion/PlanPublicacionStep";
import PhotoLimitNotice from "../shared/PhotoLimitNotice/PhotoLimitNotice";
import IdentityCard from "../shared/IdentityCard/IdentityCard";
import { needsIdentity } from "../../../lib/identity";
import EmailVerificationGate from "../../../components/EmailVerificationGate/EmailVerificationGate";
import styles from "../PublicarVehiculo/PublicarVehiculo.module.css";
import fieldStyles from "../PublicarRepuesto/steps/DatosRepuesto/DatosRepuestoStep.module.css";
import own from "./PublicarServicio.module.css";
import {
  FIXED_PRICE_NOTE, MAX_SERVICE_PHOTOS as MAX_PHOTOS, NO_PRICE_NOTE, PRICE_NOTES,
  normalizeWebsite, priceNoteToApi,
} from "./serviceForm";

const DRAFT_KEY = DRAFT_KEYS.servicio;

const steps = [
  {
    id: 1, label: "Datos",
    title: "Datos del servicio", formTitle: "Datos del servicio",
    description: "Nombre, descripción y precio del servicio.",
    sideText: "Contá qué hacés y para qué vehículos: así te encuentran los clientes correctos.",
    helpTitle: "Consejos",
    helpItems: ["Título claro: qué hacés y dónde", "Detallá marcas o vehículos que atendés", "Si el precio varía, usá \"Desde\""],
  },
  {
    id: 2, label: "Fotos",
    title: "Fotos", formTitle: "Fotos del servicio",
    description: "Mostrá tu local, equipos y trabajos terminados.",
    sideText: "Las fotos de trabajos reales generan más confianza.",
    helpTitle: "Consejos",
    helpItems: ["Foto del local o vehículo de servicio", "Trabajos antes y después", `Hasta ${MAX_PHOTOS} fotos`],
  },
  {
    id: 3, label: "Publicar",
    title: "Contacto y publicación", formTitle: "Contacto y publicación",
    description: "Dónde estás, cómo te contactan y cómo querés publicar.",
    sideText: "Elegí el plan que mejor se adapte a tu necesidad.",
    helpTitle: "Planes",
    helpItems: ["Gratuito: visible por 45 días", "Básico $9: más fotos + posicionamiento", "Premium $19: máxima visibilidad"],
  },
];

const initialForm = {
  serviceType: "",
  titulo: "", descripcionItem: "",
  precio: "", priceNote: FIXED_PRICE_NOTE,
  fotos: [],
  provinceId: "", provincia: "", cityId: "", ciudad: "", direccion: "",
  nombreContacto: "", whatsapp: "",
  email: "", horarioContacto: "", mostrarWhatsapp: "Si", sitioWeb: "",
  plan: "",
};

const validators = {
  1: {
    titulo:          "Ingresá el título del servicio.",
    descripcionItem: "Escribí una descripción.",
  },
  3: {
    cityId:         "Seleccioná el municipio.",
    nombreContacto: "Ingresá tu nombre.",
    whatsapp:       "Ingresá tu WhatsApp.",
    plan:           "Seleccioná un plan para publicar.",
  },
};

// Límite efectivo: el del plan, nunca más que el tope de servicios
const photoLimitPlan = (planInfo) =>
  planInfo ? { ...planInfo, fotos: Math.min(planInfo.fotos, MAX_PHOTOS) } : null;

const PublicarServicio = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const later = useSafeTimeout();

  const [currentStep, setCurrentStep] = useState(() => (readDraft(DRAFT_KEY)?.formData?.serviceType ? 1 : 0));
  const [formData, setFormData] = useState(() => {
    const d = readDraft(DRAFT_KEY)?.formData;
    return d ? { ...initialForm, ...d, fotos: [] } : initialForm;
  });
  // Servicio ya creado en un intento anterior: { id, photosUploaded }
  const [created, setCreated]           = useState(() => readDraft(DRAFT_KEY)?.created || null);
  const [errors, setErrors]             = useState({});
  const [draftMessage, setDraftMessage] = useState("");
  const [publishing, setPublishing]     = useState(false);
  const [publishError, setPublishError] = useState("");
  const publishingRef = useRef(false);
  const fotosRef      = useRef([]);

  // Liberar vistas previas de fotos al salir de la página
  useEffect(() => { fotosRef.current = formData.fotos || []; }, [formData.fotos]);
  useEffect(() => {
    const ref = fotosRef;
    return () => revokePreviews(ref.current);
  }, []);

  const currentStepData = useMemo(
    () => steps.find((s) => s.id === currentStep) || steps[0],
    [currentStep],
  );
  const isFinalStep   = currentStep === 3;
  const currentErrors = Object.values(errors);
  const sinPrecio     = formData.priceNote === NO_PRICE_NOTE;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((p) => ({ ...p, [name]: value }));
    setErrors((p) => { const n = { ...p }; delete n[name]; return n; });
  };

  const validateStep = (stepId = currentStep) => {
    const stepErrors = {};
    Object.entries(validators[stepId] || {}).forEach(([field, msg]) => {
      const v = formData[field];
      if (v === undefined || v === null || String(v).trim() === "") stepErrors[field] = msg;
    });
    const priceBad = !sinPrecio && String(formData.precio || "").trim() !== "" && !isValidPrice(formData.precio);
    const fotos = formData.fotos || [];
    if (stepId === 1 && priceBad) stepErrors.precio = "Ingresá un precio mayor a $0 o dejalo vacío.";
    if (stepId === 2) {
      if (!fotos.length) stepErrors.fotos = "Subí al menos 1 foto para continuar.";
      else if (fotos.length > MAX_PHOTOS) stepErrors.fotos = `Podés subir hasta ${MAX_PHOTOS} fotos por servicio.`;
    }
    if (stepId === 3) {
      if (formData.whatsapp && !isValidSvPhone(formData.whatsapp)) {
        stepErrors.whatsapp = "Ingresá un WhatsApp válido de 8 dígitos.";
      }
      if (normalizeWebsite(formData.sitioWeb) === null) stepErrors.sitioWeb = "Ingresá un sitio web válido (ej.: mitaller.com).";
      if (!formData.serviceType) stepErrors.serviceType = "Elegí el tipo de servicio.";
      if (!formData.titulo?.trim() || !formData.descripcionItem?.trim()) stepErrors.titulo = "Completá el título y la descripción en el paso 1.";
      if (priceBad) stepErrors.precio = "Ingresá un precio mayor a $0 en el paso 1.";
      if (!fotos.length && !created?.photosUploaded) {
        stepErrors.fotos = "Volvé a cargar las fotos en el paso 2 (no se guardan en el borrador).";
      }
      const limit = photoLimitPlan(getPlan(formData.plan));
      if (limit && fotos.length > limit.fotos) {
        stepErrors.fotos = `El plan ${limit.nombre} permite hasta ${limit.fotos} fotos. Elegí cuáles conservar o un plan mayor.`;
      }
    }
    if (Object.keys(stepErrors).length) { setErrors(stepErrors); return false; }
    return true;
  };

  const handleSelectTipo = (opt) => {
    setFormData((p) => ({ ...p, serviceType: opt.value }));
    setCurrentStep(1);
  };

  const saveDraft = () => {
    writeDraft(DRAFT_KEY, formData, created ? { created } : {});
    setDraftMessage("Borrador guardado correctamente.");
    later(() => setDraftMessage(""), 2500);
  };

  // Guarda el progreso del publish para que un reintento no duplique el servicio
  const rememberCreated = (next) => {
    setCreated(next);
    writeDraft(DRAFT_KEY, formData, { created: next });
  };

  const handleKeepPhotos = (next, removed) => {
    revokePreviews(removed);
    setFormData((p) => ({ ...p, fotos: next }));
    setErrors((p) => { const n = { ...p }; delete n.fotos; return n; });
  };

  const goPrev = () => {
    setErrors({});
    if (currentStep <= 1) { setCurrentStep(0); return; }
    setCurrentStep((p) => p - 1);
  };

  const goNext = () => {
    if (!validateStep()) return;
    setErrors({});
    setCurrentStep((p) => Math.min(p + 1, steps.length));
  };

  const goToStep = (id) => {
    if (id <= currentStep) { setErrors({}); setCurrentStep(id); return; }
    if (!validateStep()) return;
    setErrors({}); setCurrentStep(id);
  };

  const buildPayload = () => ({
    serviceType:  formData.serviceType,
    title:        formData.titulo.trim(),
    description:  formData.descripcionItem.trim(),
    price:        sinPrecio ? undefined : (parseMoney(formData.precio) ?? undefined),
    currency:     "USD",
    priceNote:    priceNoteToApi(formData.priceNote),
    cityId:       formData.cityId ? Number(formData.cityId) : undefined,
    address:      formData.direccion?.trim() || undefined,
    contactName:  formData.nombreContacto.trim(),
    contactPhone: normalizeSvPhone(formData.whatsapp),
    showWhatsapp: formData.mostrarWhatsapp === "Si",
    contactHours: formData.horarioContacto || undefined,
    website:      normalizeWebsite(formData.sitioWeb),
  });

  const handlePublish = async () => {
    if (publishingRef.current) return; // evita doble envío
    if (!validateStep(3)) return;
    if (needsIdentity(user)) return;
    publishingRef.current = true;
    setErrors({}); setPublishError(""); setPublishing(true);

    try {
      // Mock users — gratuito: simula éxito; pago: redirige a Wompi sandbox con ID falso
      if (user?.id?.startsWith("mock-")) {
        if (formData.plan !== "gratuito") {
          await redirectToWompiCheckout({ plan: formData.plan, itemId: `mock-${Date.now()}`, itemType: "servicio" });
          return;
        }
        await new Promise((r) => setTimeout(r, 1200));
        clearDraft(DRAFT_KEY);
        navigate("/vendedor?tab=publicaciones&success=1");
        return;
      }

      let progress = created;

      // 1. Crear el servicio en DRAFT (solo la primera vez)
      if (!progress?.id) {
        const res = await api.post("/services", buildPayload());
        progress = { id: res.data.id, photosUploaded: false };
        rememberCreated(progress);
      }

      // 2. Subir fotos (la principal primero)
      if (!progress.photosUploaded) {
        const photos = (formData.fotos || [])
          .filter((p) => p.file)
          .sort((a, b) => Number(b.isMain) - Number(a.isMain));
        if (photos.length > 0) {
          const fd = new FormData();
          photos.forEach((photo) => fd.append("images", photo.file));
          await api.upload(`/services/${progress.id}/images`, fd);
        }
        progress = { ...progress, photosUploaded: true };
        rememberCreated(progress);
      }

      // 3. Pago → WOMPI (el borrador se limpia al confirmar el pago)
      if (formData.plan !== "gratuito") {
        await redirectToWompiCheckout({ plan: formData.plan, itemId: progress.id, itemType: "servicio" });
        return;
      }

      // Gratuito: consume el cupo anual; sin verificar queda PENDING
      let pendingApproval = false;
      try {
        const res = await publishItem({ itemType: "servicio", itemId: progress.id, plan: "gratuito" });
        pendingApproval = res.status === "PENDING";
      } catch (err) {
        if (errorCode(err) === "PENDING_REVIEW") pendingApproval = true;
        else if (err?.status !== 409) throw err; // ALREADY_ACTIVE
      }
      clearDraft(DRAFT_KEY);
      navigate(`/vendedor?tab=publicaciones&success=${pendingApproval ? "pending" : "1"}`);
    } catch (err) {
      setPublishError(apiErrorMessage(err, "Error al publicar. Intentá de nuevo."));
    } finally {
      publishingRef.current = false;
      setPublishing(false);
    }
  };

  const renderDatos = () => (
    <div className={fieldStyles.formGrid}>
      <div className={`${fieldStyles.field} ${fieldStyles.fullWidth}`}>
        <label>Tipo de servicio</label>
        <div className={own.tipoRow}>
          <span>{serviceTypeLabel(formData.serviceType)}</span>
          <button type="button" className={own.changeBtn} onClick={() => setCurrentStep(0)}>Cambiar</button>
        </div>
      </div>

      <div className={`${fieldStyles.field} ${fieldStyles.fullWidth}`}>
        <label>Título <span>*</span></label>
        <input
          name="titulo"
          value={formData.titulo}
          onChange={handleChange}
          maxLength={120}
          placeholder="Ej: Taller mecánico y escáner en Santa Tecla"
        />
      </div>

      <div className={`${fieldStyles.field} ${fieldStyles.fullWidth}`}>
        <label>Descripción <span>*</span></label>
        <textarea
          name="descripcionItem"
          value={formData.descripcionItem}
          onChange={handleChange}
          rows={5}
          placeholder="Contá qué servicios ofrecés, marcas que atendés, garantía, si vas a domicilio, etc."
        />
      </div>

      <div className={fieldStyles.field}>
        <label>Modalidad de precio</label>
        <select name="priceNote" value={formData.priceNote} onChange={handleChange}>
          {PRICE_NOTES.map((n) => <option key={n} value={n}>{n}</option>)}
        </select>
      </div>

      {!sinPrecio && (
        <div className={fieldStyles.field}>
          <label>Precio (USD) <small className={own.optional}>· opcional</small></label>
          <input
            name="precio"
            inputMode="decimal"
            value={formData.precio}
            onChange={handleChange}
            placeholder="Ej: 25.00"
          />
        </div>
      )}
    </div>
  );

  const renderStep = () => {
    if (currentStep === 1) return renderDatos();
    if (currentStep === 2) return <FotosStep formData={formData} onChange={handleChange} />;
    if (currentStep === 3) return (
      <>
        <ContactoUbicacionStep formData={formData} onChange={handleChange} />
        <div className={own.localBlock}>
          <h3 className={styles.sectionTitle}>Datos del local</h3>
          <p className={styles.sectionSub}>Opcional: ayudan a que los clientes te encuentren.</p>
          <div className={fieldStyles.formGrid}>
            <div className={`${fieldStyles.field} ${fieldStyles.fullWidth}`}>
              <label>Dirección</label>
              <input
                name="direccion"
                value={formData.direccion}
                onChange={handleChange}
                maxLength={200}
                placeholder="Ej: Calle Chiltiupán, Santa Tecla"
              />
            </div>
            <div className={`${fieldStyles.field} ${fieldStyles.fullWidth}`}>
              <label>Sitio web o red social</label>
              <input
                name="sitioWeb"
                type="url"
                inputMode="url"
                value={formData.sitioWeb}
                onChange={handleChange}
                placeholder="Ej: mitaller.com"
              />
            </div>
          </div>
        </div>
        {formData.nombreContacto?.trim() && formData.whatsapp?.trim() && (
          <div className={styles.revealBlock}>
            <div className={styles.sectionDivider} />
            <h3 className={styles.sectionTitle}>Plan de publicación</h3>
            <p className={styles.sectionSub}>Seleccioná cómo querés destacar tu servicio.</p>
            <PlanPublicacionStep formData={formData} onChange={handleChange} />
          </div>
        )}
      </>
    );
    return null;
  };

  if (!user?.emailConfirmed) return <EmailVerificationGate>{null}</EmailVerificationGate>;

  const pageTitle = <title>Publicar servicio | Mi Vehículo</title>;

  /* ── Paso 0: tipo de servicio ── */
  if (currentStep === 0) {
    return (
      <div className={styles.page}>
        {pageTitle}
        <PublicarTopbar onSaveDraft={null} draftSaved={false} title="Publicar servicio" />
        <main className={styles.wrapper}>
          <div className={styles.categoryScreen}>
            <div className={styles.categoryHeader}>
              <p className={styles.categoryStep}>Nuevo servicio</p>
              <h1 className={styles.categoryTitle}>¿Qué servicio ofrecés?</h1>
              <p className={styles.categorySub}>Elegí el tipo que mejor lo describe</p>
            </div>
            <div className={styles.categoryCard}>
              {SERVICE_TYPE_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  className={styles.categoryRow}
                  onClick={() => handleSelectTipo(opt)}
                >
                  <span className={styles.categoryLabel}>{opt.label}</span>
                  <ChevronRight size={20} className={styles.categoryChevron} />
                </button>
              ))}
            </div>
            <button
              type="button"
              className={styles.categoryBack}
              onClick={() => navigate(-1)}
            >
              <ArrowLeft size={16} /> Volver
            </button>
          </div>
        </main>
      </div>
    );
  }

  const limitPlan = photoLimitPlan(getPlan(formData.plan));
  const overPhotoLimit = isFinalStep && limitPlan && (formData.fotos || []).length > limitPlan.fotos;
  // Primera publicación: faltan los datos de identidad
  const identityPending = isFinalStep && needsIdentity(user);

  /* ── Pasos 1–3 ── */
  return (
    <div className={styles.page}>
      {pageTitle}
      <PublicarTopbar
        onSaveDraft={saveDraft}
        draftSaved={draftMessage === "Borrador guardado correctamente."}
        title="Publicar servicio"
      />
      <PublicarStepper steps={steps} currentStep={currentStep} onStepClick={goToStep} />

      <main className={styles.wrapper}>
        <section className={styles.contentLayout}>
          <PublicarSidebar
            currentStep={currentStep}
            totalSteps={steps.length}
            stepData={currentStepData}
          />

          <div className={styles.mainColumn}>
            <div className={styles.formCard}>
              <div className={styles.cardHeader}>
                <div className={styles.cardHeaderIcon}><Check size={22} /></div>
                <div>
                  <h2>{currentStepData.formTitle}</h2>
                  <p>{currentStepData.description}</p>
                </div>
              </div>

              {currentErrors.length > 0 && (
                <div className={styles.errorWrap}>
                  <div className={styles.errorSummary}>
                    <div className={styles.errorSummaryIcon}><AlertCircle size={22} /></div>
                    <div>
                      <strong>Revisá estos campos antes de continuar</strong>
                      <ul>{currentErrors.map((e) => <li key={e}>{e}</li>)}</ul>
                    </div>
                  </div>
                </div>
              )}

              <div className={styles.formBody}>
                {renderStep()}
              </div>
            </div>

            {identityPending && <IdentityCard />}

            {overPhotoLimit && (
              <PhotoLimitNotice
                key={`${limitPlan.id}-${formData.fotos.length}`}
                photos={formData.fotos}
                plan={limitPlan}
                onKeep={handleKeepPhotos}
                onGoToPhotos={() => { setErrors({}); setCurrentStep(2); }}
              />
            )}

            {isFinalStep ? (
              <div className={styles.planActions}>
                <button type="button" className={styles.secondaryBtn} onClick={goPrev} disabled={publishing}>
                  <ArrowLeft size={18} /> Anterior
                </button>
                <button
                  type="button"
                  className={styles.publishBtn}
                  onClick={handlePublish}
                  disabled={!formData.plan || publishing || overPhotoLimit || identityPending}
                  aria-busy={publishing}
                >
                  <CheckCircle size={18} />
                  {publishing ? "Publicando…" : publishLabelFor(formData.plan)}
                </button>
                {identityPending && (
                  <p className={styles.publishError}>
                    <AlertCircle size={14} />
                    <span>Guardá tus datos de identidad para poder publicar.</span>
                  </p>
                )}
                {publishError && (
                  <p className={styles.publishError} role="alert">
                    <AlertCircle size={14} />
                    <span>
                      {publishError}
                      {created?.id && " Tu servicio ya quedó creado: al reintentar solo se completan los pasos pendientes."}
                    </span>
                  </p>
                )}
                <p className={styles.termsText}>
                  Al confirmar, aceptás nuestras{" "}
                  <Link to="/terminos" target="_blank" rel="noreferrer">Condiciones de uso</Link> y{" "}
                  <Link to="/privacidad" target="_blank" rel="noreferrer">Política de privacidad</Link>.
                </p>
              </div>
            ) : (
              <div className={styles.navActions}>
                <button type="button" className={styles.secondaryBtn} onClick={goPrev}>
                  <ArrowLeft size={18} /> Anterior
                </button>
                <button type="button" className={styles.primaryBtn} onClick={goNext}>
                  Siguiente <ArrowRight size={18} />
                </button>
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
};

export default PublicarServicio;
