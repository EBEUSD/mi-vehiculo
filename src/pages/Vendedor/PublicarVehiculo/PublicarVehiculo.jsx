import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";
import { api } from "../../../lib/api";
import { redirectToWompiCheckout } from "../../../lib/wompi";
import { getPlan, publishLabelFor } from "../../../lib/plans";
import { isValidPrice, parseMoney } from "../../../lib/money";
import { isValidSvPhone, normalizeSvPhone } from "../../../lib/phone";
import { DRAFT_KEYS, clearDraft, readDraft, revokePreviews, writeDraft } from "../../../lib/publishDrafts";
import useSafeTimeout from "../../../hooks/useSafeTimeout";
import {
  AlertCircle, ArrowLeft, ArrowRight, Check, CheckCircle,
  ChevronRight, Save,
} from "lucide-react";
import PublicarTopbar from "./components/PublicarTopbar";
import PublicarStepper from "./components/PublicarStepper";
import PublicarSidebar from "./components/PublicarSidebar";
import DatosVehiculoStep from "./steps/DatosVehiculo/DatosVehiculoStep";
import CaracteristicasCompletasStep from "./steps/CaracteristicasCompletas/CaracteristicasCompletasStep";
import PrecioContactoStep from "./steps/PrecioContacto/PrecioContactoStep";
import PhotoLimitNotice from "../shared/PhotoLimitNotice/PhotoLimitNotice";
import IdentityCard from "../shared/IdentityCard/IdentityCard";
import { needsIdentity } from "../../../lib/identity";
import EmailVerificationGate from "../../../components/EmailVerificationGate/EmailVerificationGate";
import styles from "./PublicarVehiculo.module.css";
import { VEHICLE_CATEGORIES as CATEGORIAS, getVehicleCategory } from "../../../lib/categories";

const steps = [
  {
    id: 1, label: "Datos del vehículo",
    formTitle: "Datos del vehículo",
    description: "Indicá la marca, modelo, año y subí las fotos.",
    sideText: "Un título claro con marca y modelo atrae más compradores.",
    helpTitle: "En este paso", helpItems: ["Marca y modelo", "Año", "Versión (opcional)", "Kilometraje", "Fotos"],
  },
  {
    id: 2, label: "Características",
    formTitle: "Características del vehículo",
    description: "Completá los detalles técnicos y el estado del vehículo.",
    sideText: "Más detalle equivale a más consultas serias.",
    helpTitle: "En este paso", helpItems: ["Condición", "Color y carrocería", "Combustible y transmisión", "Documentación", "Descripción libre"],
  },
  {
    id: 3, label: "Precio y contacto",
    formTitle: "Precio, contacto y plan",
    description: "Definí el precio, tu contacto y elegí cómo publicar.",
    sideText: "Un precio justo con fotos claras = el auto se vende más rápido.",
    helpTitle: "En este paso", helpItems: ["Precio en USD", "Ubicación", "Datos de contacto", "Plan de publicación"],
  },
];

const initialForm = {
  categoria: "",
  tipoVehiculo: "",
  tipoOperacion: "Venta",
  // marca/modelo con id numérico para la API + nombre para mostrar
  marcaId: "", marca: "", modeloId: "", modelo: "", anio: "", version: "",
  kilometraje: "", condicion: "Usado",

  precio: "", moneda: "USD",
  aceptaPermuta: "Si", precioNegociable: "Si", financiacion: "Si", infoFinanciacion: "",

  combustible: "", transmision: "",
  motor: "", color: "", puertas: "4", carroceria: "", traccion: "Delantera 4x2",

  papelesAlDia: "Sí", vtv: "Al día", deudas: "Sin deudas",
  titularidad: "Titular", estadoGeneral: "Excelente", observaciones: "",
  descripcion: "",

  // ubicación con id numérico para la API + nombre para mostrar
  provinceId: "", provincia: "", cityId: "", ciudad: "",
  nombreContacto: "", whatsapp: "", email: "", horarioContacto: "", mostrarWhatsapp: "Si",

  fotos: [], plan: "",
};

const DRAFT_KEY = DRAFT_KEYS.vehicle;
const AUTOSAVE_MS = 600;

const getInitialDraft = () => {
  const draft = readDraft(DRAFT_KEY);
  return draft?.formData ? { ...initialForm, ...draft.formData, fotos: [] } : initialForm;
};

const getInitialStep = () => (readDraft(DRAFT_KEY)?.formData?.categoria ? 1 : 0);

// Publicación ya creada en un intento anterior: { id, photosUploaded }
const getInitialCreated = () => readDraft(DRAFT_KEY)?.created || null;

const validators = {
  1: {
    marcaId:     "Seleccioná la marca.",
    modeloId:    "Seleccioná el modelo.",
    anio:        "Seleccioná el año.",
    kilometraje: "Ingresá el kilometraje.",
    condicion:   "Seleccioná la condición.",
  },
  2: {
    combustible: "Seleccioná el combustible.",
    color:       "Seleccioná el color.",
    transmision: "Seleccioná la transmisión.",
  },
  3: {
    precio:         "Ingresá el precio.",
    cityId:         "Seleccioná el municipio.",
    nombreContacto: "Ingresá tu nombre de contacto.",
    whatsapp:       "Ingresá tu número de WhatsApp.",
    plan:           "Seleccioná un plan para publicar.",
  },
};

const isCustomId = (id) => id === "OTRA" || id === "OTRO" || String(id).startsWith("__static__");

const PublicarVehiculo = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const later = useSafeTimeout();

  const [currentStep, setCurrentStep] = useState(getInitialStep);
  const [formData, setFormData]     = useState(getInitialDraft);
  const [created, setCreated]       = useState(getInitialCreated);
  const [errors, setErrors]         = useState({});
  const [draftMessage, setDraftMessage] = useState("");
  const [publishing, setPublishing] = useState(false);
  const [publishError, setPublishError] = useState("");
  const errorRef      = useRef(null);
  const publishingRef = useRef(false);
  const fotosRef      = useRef([]);

  const currentStepData = useMemo(
    () => steps.find((s) => s.id === currentStep) || steps[0],
    [currentStep]
  );
  const isFinalStep  = currentStep === 3;
  const currentErrors = Object.values(errors);

  // Autoguardado del borrador (sin fotos) con debounce
  useEffect(() => {
    if (!formData.categoria) return;
    const t = setTimeout(() => writeDraft(DRAFT_KEY, formData, created ? { created } : {}), AUTOSAVE_MS);
    return () => clearTimeout(t);
  }, [formData, created]);

  // Liberar vistas previas de fotos al salir de la página
  useEffect(() => { fotosRef.current = formData.fotos || []; }, [formData.fotos]);
  useEffect(() => {
    const ref = fotosRef;
    return () => revokePreviews(ref.current);
  }, []);

  const flash = (msg) => {
    setDraftMessage(msg);
    later(() => setDraftMessage(""), 3000);
  };

  const scrollToErrors = () =>
    later(() => errorRef.current?.scrollIntoView({ behavior: "smooth", block: "center" }), 50);

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

    if (stepId === 1) {
      // Marca/modelo escritos a mano
      const isCustomBrand = formData.marcaId === "OTRA" || String(formData.marcaId).startsWith("__static__");
      if (isCustomBrand) {
        delete stepErrors.marcaId;
        if (formData.marcaId === "OTRA" && !formData.marca?.trim()) stepErrors.marca = "Escribí el nombre de la marca.";
      }
      if (formData.modeloId === "OTRO" || isCustomBrand) {
        delete stepErrors.modeloId;
        if (!formData.modelo?.trim()) stepErrors.modelo = "Escribí el nombre del modelo.";
      }

      const year = Number(formData.anio);
      if (formData.anio && (year < 1960 || year > new Date().getFullYear() + 2)) {
        stepErrors.anio = "Ingresá un año válido.";
      }
      // Nuevo, o categorías sin odómetro (bicicletas, maquinaria…) → sin km
      if (formData.condicion === "Nuevo" || !getVehicleCategory(formData.categoria).filters.km) {
        delete stepErrors.kilometraje;
      }
      if (!(formData.fotos || []).length) {
        stepErrors.fotos = "Subí al menos 1 foto para continuar.";
      }
    }

    if (stepId === 2) {
      const applies = getVehicleCategory(formData.categoria).filters;
      if (!applies.fuel) delete stepErrors.combustible;
      if (!applies.transmission) delete stepErrors.transmision;
    }

    if (stepId === 3) {
      if (formData.precio && !isValidPrice(formData.precio)) {
        stepErrors.precio = "Ingresá un precio mayor a $0 (ej.: 15,000).";
      }
      if (formData.whatsapp && !isValidSvPhone(formData.whatsapp)) {
        stepErrors.whatsapp = "Ingresá un WhatsApp válido de 8 dígitos.";
      }
      // Las fotos no viven en el borrador: tras recargar hay que volver a cargarlas
      if (!(formData.fotos || []).length && !created?.photosUploaded) {
        stepErrors.fotos = "Volvé a cargar las fotos en el paso 1 (no se guardan en el borrador).";
      }
      const planInfo = getPlan(formData.plan);
      if (planInfo && (formData.fotos || []).length > planInfo.fotos) {
        stepErrors.fotos = `El plan ${planInfo.nombre} permite hasta ${planInfo.fotos} fotos. Elegí cuáles conservar o un plan mayor.`;
      }
    }

    setErrors(stepErrors);
    return Object.keys(stepErrors).length === 0;
  };

  const handleSelectCategoria = (cat) => {
    setFormData((p) => ({ ...p, categoria: cat.label }));
    setCurrentStep(1);
  };

  const saveDraft = () => {
    writeDraft(DRAFT_KEY, formData, created ? { created } : {});
    flash("Borrador guardado correctamente.");
  };

  const handleClearDraft = () => {
    if (!window.confirm("¿Descartar el borrador? Se borrarán todos los datos y fotos cargados en este formulario.")) return;
    clearDraft(DRAFT_KEY);
    revokePreviews(formData.fotos);
    setFormData(initialForm);
    setCreated(null);
    setErrors({});
    setPublishError("");
    setCurrentStep(0);
    flash("Borrador eliminado.");
  };

  // Plan con menos fotos: conservar solo las elegidas
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
    if (!validateStep(currentStep)) { scrollToErrors(); return; }
    setErrors({});
    setCurrentStep((p) => Math.min(p + 1, steps.length));
  };

  const goToStep = (id) => {
    if (id <= currentStep) { setErrors({}); setCurrentStep(id); return; }
    if (!validateStep(currentStep)) return;
    setErrors({}); setCurrentStep(id);
  };

  // Guarda el progreso del publish para que un reintento no duplique el aviso
  const rememberCreated = (next) => {
    setCreated(next);
    writeDraft(DRAFT_KEY, formData, { created: next });
  };

  const buildPayload = (defs) => {
    const applies = getVehicleCategory(formData.categoria).filters;
    const customBrand = isCustomId(formData.marcaId);
    return {
      category:           getVehicleCategory(formData.categoria).api,
      ...(customBrand ? { brandName: formData.marca } : { brandId: Number(formData.marcaId) }),
      ...(isCustomId(formData.modeloId) || customBrand
        ? { modelName: formData.modelo }
        : { modelId: Number(formData.modeloId) }),
      year:               parseInt(formData.anio, 10) || undefined,
      version:            formData.version   || undefined,
      condition:          formData.condicion === "Nuevo" ? "NEW" : "USED",
      mileage:            formData.condicion === "Nuevo" || !applies.km ? undefined : parseInt(String(formData.kilometraje).replace(/\D/g, ""), 10) || 0,
      price:              parseMoney(formData.precio),
      currency:           "USD",
      acceptsExchange:    formData.aceptaPermuta   === "Si",
      financingAvailable: formData.financiacion    === "Si",
      negotiablePrice:    formData.precioNegociable=== "Si",
      description:        formData.descripcion     || undefined,
      cityId:             Number(formData.cityId),
      contactPhone:       normalizeSvPhone(formData.whatsapp),
      showWhatsapp:       formData.mostrarWhatsapp === "Si",
      contactHours:       formData.horarioContacto || undefined,
      attributes: [
        { definitionId: defs.combustible, value: formData.combustible },
        { definitionId: defs.transmision, value: formData.transmision },
        { definitionId: defs.operacion,   value: formData.tipoOperacion },
      ].filter((a) => a.definitionId && a.value),
    };
  };

  const handlePublish = async () => {
    if (publishingRef.current) return; // evita doble envío
    if (!validateStep(3)) { scrollToErrors(); return; }
    if (needsIdentity(user)) return;
    publishingRef.current = true;
    setErrors({}); setPublishError(""); setPublishing(true);

    try {
      // Mock users — gratuito: simula éxito; pago: redirige a Wompi sandbox con ID falso
      if (user?.id?.startsWith("mock-")) {
        if (formData.plan !== "gratuito") {
          redirectToWompiCheckout({ plan: formData.plan, itemId: `mock-${Date.now()}`, itemType: "vehicle" });
          return;
        }
        await new Promise((r) => setTimeout(r, 1200));
        clearDraft(DRAFT_KEY);
        navigate("/vendedor?tab=publicaciones&success=1");
        return;
      }

      let progress = created;

      // 1. Crear el vehículo en DRAFT (solo la primera vez)
      if (!progress?.id) {
        const applies = getVehicleCategory(formData.categoria).filters;
        const defs = { combustible: null, transmision: null, operacion: null };
        try {
          const defsRes = await api.get("/catalog/attribute-definitions");
          const list = defsRes.data || [];
          defs.combustible = list.find((d) => d.name?.toLowerCase().includes("combustible"))?.id ?? null;
          defs.transmision = list.find((d) => d.name?.toLowerCase().includes("transm"))?.id ?? null;
          // Opcional: solo se envía si el catálogo tiene el atributo "Tipo de operación"
          defs.operacion   = list.find((d) => d.name?.toLowerCase().includes("operaci"))?.id ?? null;
        } catch { /* se valida abajo */ }

        if ((applies.fuel && !defs.combustible) || (applies.transmission && !defs.transmision)) {
          setPublishError("No se pudieron cargar los atributos del vehículo (combustible/transmisión). Actualizá la página e intentá de nuevo.");
          return;
        }

        const vehicleRes = await api.post("/vehicles", buildPayload(defs));
        progress = { id: vehicleRes.data.id, photosUploaded: false };
        rememberCreated(progress);
      }

      // 2. Subir fotos (el backend las sube a Cloudinary); la principal va primero
      if (!progress.photosUploaded) {
        const PHOTO_CATS = ["FRENTE", "LATERAL", "TRASERA", "INTERIOR"];
        const photos = (formData.fotos || [])
          .filter((p) => p.file)
          .sort((a, b) => Number(b.isMain) - Number(a.isMain));
        if (photos.length) {
          const fd = new FormData();
          photos.forEach((photo, idx) => {
            fd.append(PHOTO_CATS[idx] || `EXTRA_${idx}`, photo.file);
          });
          await api.upload(`/vehicles/${progress.id}/images`, fd);
        }
        progress = { ...progress, photosUploaded: true };
        rememberCreated(progress);
      }

      // 3. Planes de pago → WOMPI (el borrador se conserva hasta confirmar el pago)
      if (formData.plan !== "gratuito") {
        redirectToWompiCheckout({ plan: formData.plan, itemId: progress.id, itemType: "vehicle" });
        return;
      }

      // Gratuito → publicar directo (409 = ya estaba publicado)
      try {
        await api.post(`/vehicles/${progress.id}/publish`);
      } catch (err) {
        if (err?.status !== 409) throw err;
      }
      clearDraft(DRAFT_KEY);
      navigate("/vendedor?tab=publicaciones&success=1");
    } catch (err) {
      console.error("[publish]", err);
      const msg = err?.message || err?.data?.message || "Error al publicar. Intentá de nuevo.";
      setPublishError(msg);
    } finally {
      publishingRef.current = false;
      setPublishing(false);
    }
  };

  const publishLabel = publishing ? "Publicando…" : publishLabelFor(formData.plan);

  const renderStep = () => {
    if (currentStep === 1) return <DatosVehiculoStep formData={formData} onChange={handleChange} />;
    if (currentStep === 2) return <CaracteristicasCompletasStep formData={formData} onChange={handleChange} />;
    if (currentStep === 3) return <PrecioContactoStep formData={formData} onChange={handleChange} />;
    return null;
  };

  if (!user?.emailConfirmed) return <EmailVerificationGate>{null}</EmailVerificationGate>;

  const pageTitle = <title>Publicar vehículo | Mi Vehículo</title>;

  /* ── Category selection screen (step 0) ── */
  if (currentStep === 0) {
    return (
      <div className={styles.page}>
        {pageTitle}
        <PublicarTopbar onSaveDraft={null} draftSaved={false} />
        <main className={styles.wrapper}>
          <div className={styles.categoryScreen}>
            <div className={styles.categoryHeader}>
              <p className={styles.categoryStep}>Nuevo vehículo</p>
              <h1 className={styles.categoryTitle}>Empezá describiendo el vehículo</h1>
              <p className={styles.categorySub}>Primero, elegí la categoría</p>
            </div>

            <div className={styles.categoryCard}>
              {CATEGORIAS.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  className={styles.categoryRow}
                  onClick={() => handleSelectCategoria(cat)}
                >
                  <span className={styles.categoryLabel}>{cat.label}</span>
                  <ChevronRight size={20} className={styles.categoryChevron} />
                </button>
              ))}
            </div>

            <button
              type="button"
              className={styles.categoryBack}
              onClick={() => navigate("/publicar/nuevo")}
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

  /* ── 3-step form ── */
  return (
    <div className={styles.page}>
      {pageTitle}
      <PublicarTopbar
        onSaveDraft={saveDraft}
        draftSaved={draftMessage === "Borrador guardado correctamente."}
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
            {/* Steps 1 & 2: single card */}
            {!isFinalStep && (
              <div className={styles.formCard}>
                <div className={styles.cardHeader}>
                  <div className={styles.cardHeaderIcon}><Check size={22} /></div>
                  <div>
                    <h2>{currentStepData.formTitle}</h2>
                    <p>{currentStepData.description}</p>
                  </div>
                </div>

                {currentErrors.length > 0 && (
                  <div className={styles.errorWrap} ref={errorRef}>
                    <div className={styles.errorSummary}>
                      <div className={styles.errorSummaryIcon}><AlertCircle size={22} /></div>
                      <div>
                        <strong>Revisá estos campos antes de continuar</strong>
                        <ul>{currentErrors.map((e) => <li key={e}>{e}</li>)}</ul>
                      </div>
                    </div>
                  </div>
                )}

                {renderStep()}
              </div>
            )}

            {/* Step 3: price/contact + plan (merged into one component) */}
            {isFinalStep && (
              <div className={styles.formCard}>
                {currentErrors.length > 0 && (
                  <div className={styles.errorWrap} ref={errorRef}>
                    <div className={styles.errorSummary}>
                      <div className={styles.errorSummaryIcon}><AlertCircle size={22} /></div>
                      <div>
                        <strong>Completá estos campos para poder publicar</strong>
                        <ul>{currentErrors.map((e) => <li key={e}>{e}</li>)}</ul>
                      </div>
                    </div>
                  </div>
                )}
                <PrecioContactoStep formData={formData} onChange={handleChange} />
              </div>
            )}

            {identityPending && <IdentityCard />}

            {overPhotoLimit && (
              <PhotoLimitNotice
                key={`${planInfo.id}-${formData.fotos.length}`}
                photos={formData.fotos}
                plan={planInfo}
                onKeep={handleKeepPhotos}
                onGoToPhotos={() => { setErrors({}); setCurrentStep(1); }}
              />
            )}

            {/* Navigation */}
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
                  {publishLabel}
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
              <>
                <div className={styles.bottomActions}>
                  <button type="button" className={styles.secondaryBtn} onClick={goPrev}>
                    <ArrowLeft size={18} /> Anterior
                  </button>
                  <button type="button" className={styles.draftBtn} onClick={saveDraft}>
                    <Save size={18} /> Guardar borrador
                  </button>
                  <button type="button" className={styles.primaryBtn} onClick={goNext}>
                    Siguiente <ArrowRight size={18} />
                  </button>
                </div>
                <div className={styles.autosave} aria-live="polite">
                  <Check size={16} />
                  <span>
                    {draftMessage || "Los datos se guardan automáticamente en este dispositivo (las fotos no)."}
                  </span>
                  <button type="button" className={styles.clearDraftLink} onClick={handleClearDraft}>
                    Descartar borrador
                  </button>
                </div>
              </>
            )}
          </div>
        </section>
      </main>
    </div>
  );
};

export default PublicarVehiculo;
