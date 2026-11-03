import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  AlertCircle, ArrowLeft, ArrowRight, Check, CheckCircle, ChevronRight,
} from "lucide-react";
import { useAuth } from "../../../context/AuthContext";
import { api } from "../../../lib/api";
import { redirectToWompiCheckout } from "../../../lib/wompi";
import { publishItem, errorCode, apiErrorMessage } from "../../../lib/publishing";
import { usePricing } from "../../../lib/pricing";
import { getPlan, publishLabelFor } from "../../../lib/plans";
import { isValidPrice, parseMoney } from "../../../lib/money";
import { isValidSvPhone, normalizeSvPhone } from "../../../lib/phone";
import { clearDraft, readDraft, revokePreviews, writeDraft } from "../../../lib/publishDrafts";
import useSafeTimeout from "../../../hooks/useSafeTimeout";
import PublicarTopbar from "../PublicarVehiculo/components/PublicarTopbar";
import PublicarStepper from "../PublicarVehiculo/components/PublicarStepper";
import PublicarSidebar from "../PublicarVehiculo/components/PublicarSidebar";
import PrecioSimpleStep from "../PublicarRepuesto/steps/PrecioSimple/PrecioSimpleStep";
import FotosStep from "../PublicarVehiculo/steps/Fotos/FotosStep";
import ContactoUbicacionStep from "../PublicarVehiculo/steps/ContactoUbicacion/ContactoUbicacionStep";
import PlanPublicacionStep from "../PublicarVehiculo/steps/PlanPublicacion/PlanPublicacionStep";
import PhotoLimitNotice from "../shared/PhotoLimitNotice/PhotoLimitNotice";
import IdentityCard from "../shared/IdentityCard/IdentityCard";
import { needsIdentity } from "../../../lib/identity";
import EmailVerificationGate from "../../../components/EmailVerificationGate/EmailVerificationGate";
import styles from "../PublicarVehiculo/PublicarVehiculo.module.css";

// Formulario común de repuestos y accesorios. Cada tipo aporta su `config`:
// draftKey, itemType, nameField, categoryField, steps, fallbackCategories,
// extraInitial, labels { topbar, pageTitle, kicker, question, nameRequired },
// renderDatos(formData, onChange).

const baseInitial = {
  categoryId: null, condicion: "Nuevo",
  descripcionItem: "", cantidad: "1",
  precio: "", moneda: "USD", precioNegociable: "Si", aceptaPermuta: "No",
  fotos: [],
  provinceId: "", provincia: "", cityId: "", ciudad: "",
  nombreContacto: "", whatsapp: "",
  email: "", horarioContacto: "", mostrarWhatsapp: "Si",
  plan: "",
};

const PublicarProducto = ({ config }) => {
  const {
    draftKey, itemType, nameField, categoryField, steps,
    fallbackCategories, extraInitial, labels, renderDatos,
  } = config;

  const { user } = useAuth();
  const { plans } = usePricing();
  const navigate = useNavigate();
  const later = useSafeTimeout();

  const initialForm = useMemo(
    () => ({ ...baseInitial, [nameField]: "", [categoryField]: "", ...extraInitial }),
    [nameField, categoryField, extraInitial],
  );

  const validators = useMemo(() => ({
    1: {
      [nameField]:     labels.nameRequired,
      condicion:       "Seleccioná la condición.",
      descripcionItem: "Escribí una descripción.",
    },
    2: { precio: "Ingresá el precio." },
    3: {
      cityId:         "Seleccioná el municipio.",
      nombreContacto: "Ingresá tu nombre.",
      whatsapp:       "Ingresá tu WhatsApp.",
      plan:           "Seleccioná un plan para publicar.",
    },
  }), [nameField, labels.nameRequired]);

  const [currentStep, setCurrentStep] = useState(() => {
    const d = readDraft(draftKey)?.formData;
    return d?.[categoryField] && d?.categoryId ? 1 : 0;
  });
  const [formData, setFormData] = useState(() => {
    const d = readDraft(draftKey)?.formData;
    return d ? { ...initialForm, ...d, fotos: [] } : initialForm;
  });
  // Publicación ya creada en un intento anterior: { id, photosUploaded }
  const [created, setCreated]           = useState(() => readDraft(draftKey)?.created || null);
  const [errors, setErrors]             = useState({});
  const [draftMessage, setDraftMessage] = useState("");
  const [publishing, setPublishing]     = useState(false);
  const [publishError, setPublishError] = useState("");
  const [categories, setCategories]     = useState(fallbackCategories);
  const [usingFallbackCategories, setUsingFallback] = useState(true);
  const publishingRef = useRef(false);
  const fotosRef      = useRef([]);

  useEffect(() => {
    let ignore = false;
    api.get("/products/categories").then((r) => {
      const cats = r.data || [];
      if (!ignore && cats.length) { setCategories(cats); setUsingFallback(false); }
    }).catch(() => {});
    return () => { ignore = true; };
  }, []);

  // Liberar vistas previas de fotos al salir de la página
  useEffect(() => { fotosRef.current = formData.fotos || []; }, [formData.fotos]);
  useEffect(() => {
    const ref = fotosRef;
    return () => revokePreviews(ref.current);
  }, []);

  const currentStepData = useMemo(
    () => steps.find((s) => s.id === currentStep) || steps[0],
    [steps, currentStep],
  );
  const isFinalStep   = currentStep === 3;
  const currentErrors = Object.values(errors);

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
    if (stepId === 2) {
      if (!(formData.fotos || []).length) stepErrors.fotos = "Subí al menos 1 foto para continuar.";
      if (formData.precio && !isValidPrice(formData.precio)) stepErrors.precio = "Ingresá un precio mayor a $0.";
    }
    if (stepId === 3) {
      if (formData.whatsapp && !isValidSvPhone(formData.whatsapp)) {
        stepErrors.whatsapp = "Ingresá un WhatsApp válido de 8 dígitos.";
      }
      if (!isValidPrice(formData.precio)) stepErrors.precio = "Ingresá un precio mayor a $0 en el paso 2.";
      if (!(formData.fotos || []).length && !created?.photosUploaded) {
        stepErrors.fotos = "Volvé a cargar las fotos en el paso 2 (no se guardan en el borrador).";
      }
      const planInfo = getPlan(formData.plan);
      if (planInfo && (formData.fotos || []).length > planInfo.fotos) {
        stepErrors.fotos = `El plan ${planInfo.nombre} permite hasta ${planInfo.fotos} fotos. Elegí cuáles conservar o un plan mayor.`;
      }
    }
    if (Object.keys(stepErrors).length) { setErrors(stepErrors); return false; }
    return true;
  };

  const handleSelectCategoria = (cat) => {
    setFormData((p) => ({ ...p, [categoryField]: cat.name, categoryId: cat.id }));
    setCurrentStep(1);
  };

  const saveDraft = () => {
    writeDraft(draftKey, formData, created ? { created } : {});
    setDraftMessage("Borrador guardado correctamente.");
    later(() => setDraftMessage(""), 2500);
  };

  // Guarda el progreso del publish para que un reintento no duplique el aviso
  const rememberCreated = (next) => {
    setCreated(next);
    writeDraft(draftKey, formData, { created: next });
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

  const handlePublish = async () => {
    if (publishingRef.current) return; // evita doble envío
    if (!validateStep(3)) return;
    if (needsIdentity(user)) return;
    if (usingFallbackCategories && !created?.id) {
      setPublishError("No se pudo verificar la categoría con el servidor. Actualizá la página e intentá de nuevo.");
      return;
    }
    publishingRef.current = true;
    setErrors({}); setPublishError(""); setPublishing(true);

    try {
      let progress = created;

      // 1. Crear el producto (solo la primera vez)
      if (!progress?.id) {
        const productRes = await api.post("/products", {
          title:       formData[nameField],
          description: formData.descripcionItem,
          price:       parseMoney(formData.precio),
          currency:    "USD",
          stock:       parseInt(formData.cantidad, 10) || 1,
          condition:   formData.condicion === "Nuevo" ? "NEW" : "USED",
          categoryId:  formData.categoryId,
          contactName: formData.nombreContacto,
          whatsapp:    normalizeSvPhone(formData.whatsapp),
          cityId:      formData.cityId ? Number(formData.cityId) : undefined,
        });
        progress = { id: productRes.data.id, photosUploaded: false };
        rememberCreated(progress);
      }

      // 2. Subir fotos (la principal primero)
      if (!progress.photosUploaded) {
        const photos = (formData.fotos || [])
          .filter((p) => p.file)
          .sort((a, b) => Number(b.isMain) - Number(a.isMain));
        if (photos.length > 0) {
          const fd = new FormData();
          photos.forEach((photo, idx) => fd.append(`image_${idx}`, photo.file));
          await api.upload(`/products/${progress.id}/images`, fd);
        }
        progress = { ...progress, photosUploaded: true };
        rememberCreated(progress);
      }

      // 3. Pago → WOMPI (el borrador se limpia al confirmar el pago)
      if (formData.plan !== "gratuito") {
        await redirectToWompiCheckout({ plan: formData.plan, itemId: progress.id, itemType });
        return;
      }

      // Gratuito: consume el cupo anual; sin verificar queda PENDING
      let pendingApproval = false;
      try {
        const res = await publishItem({ itemType, itemId: progress.id, plan: "gratuito" });
        pendingApproval = res.status === "PENDING";
      } catch (err) {
        if (errorCode(err) === "PENDING_REVIEW") pendingApproval = true;
        else if (err?.status !== 409) throw err; // ALREADY_ACTIVE
      }
      clearDraft(draftKey);
      navigate(`/vendedor?tab=publicaciones&success=${pendingApproval ? "pending" : "1"}`);
    } catch (err) {
      setPublishError(apiErrorMessage(err, "Error al publicar. Intentá de nuevo."));
    } finally {
      publishingRef.current = false;
      setPublishing(false);
    }
  };

  const renderStep = () => {
    if (currentStep === 1) return renderDatos(formData, handleChange);
    if (currentStep === 2) return (
      <>
        <FotosStep formData={formData} onChange={handleChange} />
        {(formData.fotos || []).length > 0 && (
          <div className={styles.revealBlock}>
            <div className={styles.sectionDivider} />
            <h3 className={styles.sectionTitle}>Precio</h3>
            <p className={styles.sectionSub}>Definí el precio y condiciones de venta.</p>
            <PrecioSimpleStep formData={formData} onChange={handleChange} />
          </div>
        )}
      </>
    );
    if (currentStep === 3) return (
      <>
        <ContactoUbicacionStep formData={formData} onChange={handleChange} />
        {formData.nombreContacto?.trim() && formData.whatsapp?.trim() && (
          <div className={styles.revealBlock}>
            <div className={styles.sectionDivider} />
            <h3 className={styles.sectionTitle}>Plan de publicación</h3>
            <p className={styles.sectionSub}>Seleccioná cómo querés destacar tu publicación.</p>
            <PlanPublicacionStep formData={formData} onChange={handleChange} />
          </div>
        )}
      </>
    );
    return null;
  };

  if (!user?.emailConfirmed) return <EmailVerificationGate>{null}</EmailVerificationGate>;

  const pageTitle = <title>{`${labels.pageTitle} | Mi Vehículo`}</title>;

  /* ── Paso 0: selección de categoría ── */
  if (currentStep === 0) {
    return (
      <div className={styles.page}>
        {pageTitle}
        <PublicarTopbar onSaveDraft={null} draftSaved={false} title={labels.topbar} />
        <main className={styles.wrapper}>
          <div className={styles.categoryScreen}>
            <div className={styles.categoryHeader}>
              <p className={styles.categoryStep}>{labels.kicker}</p>
              <h1 className={styles.categoryTitle}>{labels.question}</h1>
              <p className={styles.categorySub}>Elegí la categoría que mejor lo describe</p>
            </div>
            <div className={styles.categoryCard}>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  className={styles.categoryRow}
                  onClick={() => handleSelectCategoria(cat)}
                >
                  <span className={styles.categoryLabel}>{cat.name}</span>
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

  const planInfo = getPlan(formData.plan);
  const overPhotoLimit = isFinalStep && planInfo && (formData.fotos || []).length > planInfo.fotos;
  // Primera publicación: faltan los datos de identidad
  const identityPending = isFinalStep && needsIdentity(user);

  /* ── Pasos 1–3 ── */
  return (
    <div className={styles.page}>
      {pageTitle}
      <PublicarTopbar
        onSaveDraft={saveDraft}
        draftSaved={draftMessage === "Borrador guardado correctamente."}
        title={labels.topbar}
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
                key={`${planInfo.id}-${formData.fotos.length}`}
                photos={formData.fotos}
                plan={planInfo}
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
                  {publishing ? "Publicando…" : publishLabelFor(formData.plan, plans)}
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
                      {created?.id && " Tu publicación ya quedó creada: al reintentar solo se completan los pasos pendientes."}
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

export default PublicarProducto;
