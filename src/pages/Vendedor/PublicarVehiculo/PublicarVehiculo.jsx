import { useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";
import { api } from "../../../lib/api";
import { redirectToWompiCheckout } from "../../../lib/wompi";
import {
  AlertCircle, ArrowLeft, ArrowRight, Check, CheckCircle,
  ChevronRight, Save, Trash2,
} from "lucide-react";
import PublicarTopbar from "./components/PublicarTopbar";
import PublicarStepper from "./components/PublicarStepper";
import PublicarSidebar from "./components/PublicarSidebar";
import DatosVehiculoStep from "./steps/DatosVehiculo/DatosVehiculoStep";
import CaracteristicasCompletasStep from "./steps/CaracteristicasCompletas/CaracteristicasCompletasStep";
import PrecioContactoStep from "./steps/PrecioContacto/PrecioContactoStep";
import EmailVerificationGate from "../../../components/EmailVerificationGate/EmailVerificationGate";
import styles from "./PublicarVehiculo.module.css";

const CATEGORIAS = [
  { id: "autos",        label: "Autos" },
  { id: "camionetas",   label: "Camionetas y Pickups" },
  { id: "motos",        label: "Motos" },
  { id: "camiones",     label: "Camiones" },
  { id: "nautica",      label: "Náutica" },
  { id: "chocados",     label: "Autos Chocados y Averiados" },
  { id: "coleccion",    label: "Autos de Colección" },
  { id: "colectivos",   label: "Colectivos y Buses" },
  { id: "otros",        label: "Otros Vehículos" },
];

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

const DRAFT_KEY = "miVehiculo_publicarVehiculoDraft";

const getInitialDraft = () => {
  try {
    const raw = localStorage.getItem(DRAFT_KEY);
    if (!raw) return initialForm;
    const parsed = JSON.parse(raw);
    return { ...initialForm, ...parsed.formData, fotos: [] };
  } catch { return initialForm; }
};

const getInitialStep = () => {
  try {
    const raw = localStorage.getItem(DRAFT_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed.formData?.categoria) return 1;
    }
  } catch {}
  return 0;
};

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

const PublicarVehiculo = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [currentStep, setCurrentStep] = useState(getInitialStep);
  const [formData, setFormData]     = useState(getInitialDraft);
  const [errors, setErrors]         = useState({});
  const [draftMessage, setDraftMessage] = useState("");
  const [publishing, setPublishing] = useState(false);
  const [publishError, setPublishError] = useState("");
  const errorRef = useRef(null);

  const currentStepData = useMemo(
    () => steps.find((s) => s.id === currentStep) || steps[0],
    [currentStep]
  );
  const isFinalStep  = currentStep === 3;
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

    if (stepId === 1) {
      // Custom brand/model text validation
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
      // Nuevo → km field is hidden, remove required validation
      if (formData.condicion === "Nuevo") {
        delete stepErrors.kilometraje;
      }
      if (!(formData.fotos || []).length) {
        stepErrors.fotos = "Subí al menos 1 foto para continuar.";
      }
    }

    if (stepId === 3) {
      const price = Number(String(formData.precio).replace(/[^\d.]/g, ""));
      if (formData.precio && (!price || price <= 0)) {
        stepErrors.precio = "Ingresá un precio válido.";
      }
      const phone = String(formData.whatsapp).replace(/\D/g, "");
      if (formData.whatsapp && phone.length < 8) {
        stepErrors.whatsapp = "Ingresá un WhatsApp válido (mínimo 8 dígitos).";
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
    const { fotos, ...rest } = formData;
    localStorage.setItem(DRAFT_KEY, JSON.stringify({ formData: { ...rest, fotos: [] }, savedAt: new Date().toISOString() }));
    setDraftMessage("Borrador guardado correctamente.");
    setTimeout(() => setDraftMessage(""), 3000);
  };

  const clearDraft = () => {
    localStorage.removeItem(DRAFT_KEY);
    setFormData(initialForm);
    setErrors({});
    setCurrentStep(0);
    setDraftMessage("Borrador eliminado.");
    setTimeout(() => setDraftMessage(""), 3000);
  };

  const goPrev = () => {
    setErrors({});
    if (currentStep <= 1) { setCurrentStep(0); return; }
    setCurrentStep((p) => p - 1);
  };

  const goNext = () => {
    if (!validateStep(currentStep)) {
      setTimeout(() => errorRef.current?.scrollIntoView({ behavior: "smooth", block: "center" }), 50);
      return;
    }
    setErrors({});
    setCurrentStep((p) => Math.min(p + 1, steps.length));
  };

  const goToStep = (id) => {
    if (id <= currentStep) { setErrors({}); setCurrentStep(id); return; }
    if (!validateStep(currentStep)) return;
    setErrors({}); setCurrentStep(id);
  };

  // Map UI category label → API category enum
  const CATEGORY_MAP = {
    "Autos":                     "AUTO",
    "Camionetas y Pickups":      "CAMIONETA",
    "Motos":                     "MOTO",
    "Camiones":                  "CAMION",
    "Náutica":                   "ACUATICO",
    "Autos Chocados y Averiados":"AUTO",
    "Autos de Colección":        "AUTO",
    "Colectivos y Buses":        "CAMION",
    "Maquinaria Agrícola":       "OTRO",
    "Maquinaria Vial":           "OTRO",
    "Otros Vehículos":           "OTRO",
  };

  const handlePublish = async () => {
    if (!validateStep(3)) {
      setTimeout(() => errorRef.current?.scrollIntoView({ behavior: "smooth", block: "center" }), 50);
      return;
    }
    setErrors({}); setPublishError(""); setPublishing(true);

    // Mock users — gratuito: simulate success; paid: redirect to Wompi sandbox with fake ID
    if (user?.id?.startsWith("mock-")) {
      if (formData.plan !== "gratuito") {
        const fakeId = `mock-${Date.now()}`;
        localStorage.removeItem(DRAFT_KEY);
        setPublishing(false);
        redirectToWompiCheckout({ plan: formData.plan, itemId: fakeId, itemType: "vehicle" });
        return;
      }
      await new Promise((r) => setTimeout(r, 1200));
      localStorage.removeItem(DRAFT_KEY);
      setPublishing(false);
      navigate("/vendedor?tab=publicaciones&success=1");
      return;
    }

    try {
      // Resolve attribute definition IDs from the catalog
      let combustibleDefId = null;
      let transmisionDefId = null;
      try {
        const defsRes = await api.get("/catalog/attribute-definitions");
        const defs = defsRes.data || [];
        const combustibleDef = defs.find((d) => d.name?.toLowerCase().includes("combustible"));
        const transmisionDef = defs.find((d) => d.name?.toLowerCase().includes("transm"));
        if (combustibleDef) combustibleDefId = combustibleDef.id;
        if (transmisionDef) transmisionDefId = transmisionDef.id;
      } catch {}

      if (!combustibleDefId || !transmisionDefId) {
        setPublishError("No se pudieron cargar los atributos del vehículo (combustible/transmisión). Actualizá la página e intentá de nuevo.");
        setPublishing(false);
        return;
      }

      // 1. Create vehicle in DRAFT
      const vehicleRes = await api.post("/vehicles", {
        category:           CATEGORY_MAP[formData.categoria] || "AUTO",
        ...(formData.marcaId === "OTRA" || String(formData.marcaId).startsWith("__static__")
          ? { brandName: formData.marca }
          : { brandId: Number(formData.marcaId) }),
        ...(formData.modeloId === "OTRO" || formData.marcaId === "OTRA" || String(formData.marcaId).startsWith("__static__")
          ? { modelName: formData.modelo }
          : { modelId: Number(formData.modeloId) }),
        year:               parseInt(formData.anio, 10) || undefined,
        version:            formData.version   || undefined,
        condition:          formData.condicion === "Nuevo" ? "NEW" : "USED",
        mileage:            formData.condicion === "Nuevo" ? undefined : parseInt(String(formData.kilometraje).replace(/\D/g, ""), 10) || 0,
        price:              parseFloat(String(formData.precio).replace(/[^\d.]/g, "")) || 0,
        currency:           "USD",
        acceptsExchange:    formData.aceptaPermuta   === "Si",
        financingAvailable: formData.financiacion    === "Si",
        negotiablePrice:    formData.precioNegociable=== "Si",
        description:        formData.descripcion     || undefined,
        cityId:             Number(formData.cityId),
        contactPhone:       formData.whatsapp
          ? `+503${formData.whatsapp.trim().replace(/^\+503/, "").replace(/\D/g, "")}`
          : undefined,
        showWhatsapp:       formData.mostrarWhatsapp === "Si",
        contactHours:       formData.horarioContacto || undefined,
        attributes: [
          { definitionId: combustibleDefId, value: formData.combustible },
          { definitionId: transmisionDefId, value: formData.transmision },
        ].filter((a) => a.value),
      });

      const vehicleId = vehicleRes.data.id;

      // 2. Upload photos via backend (backend uploads to Cloudinary)
      //    Auto-assign required categories to first 4 photos, rest as OTRA
      const PHOTO_CATS = ["FRENTE", "LATERAL", "TRASERA", "INTERIOR"];
      const photos = (formData.fotos || []).filter((p) => p.file);
      if (photos.length) {
        const fd = new FormData();
        photos.forEach((photo, idx) => {
          fd.append(PHOTO_CATS[idx] || `EXTRA_${idx}`, photo.file);
        });
        await api.upload(`/vehicles/${vehicleId}/images`, fd);
      }

      // 3. Plans de pago → redirigir a WOMPI; gratuito → publicar directo
      if (formData.plan !== "gratuito") {
        redirectToWompiCheckout({ plan: formData.plan, itemId: vehicleId, itemType: "vehicle" });
        return; // borrador se conserva por si el usuario vuelve de Wompi
      }

      await api.post(`/vehicles/${vehicleId}/publish`);
      localStorage.removeItem(DRAFT_KEY);
      navigate("/vendedor?tab=publicaciones&success=1");
    } catch (err) {
      console.error("[publish]", err);
      const msg = err?.message || err?.data?.message || "Error al publicar. Intentá de nuevo.";
      setPublishError(msg);
    } finally {
      setPublishing(false);
    }
  };

  const publishLabel = publishing ? "Publicando…"
    : formData.plan === "gratuito" ? "Publicar gratis"
    : formData.plan === "basico"   ? "Pagar y publicar — $5"
    : formData.plan === "premium"  ? "Pagar y publicar — $12"
    : "Publicar";

  const renderStep = () => {
    if (currentStep === 1) return <DatosVehiculoStep formData={formData} onChange={handleChange} />;
    if (currentStep === 2) return <CaracteristicasCompletasStep formData={formData} onChange={handleChange} />;
    if (currentStep === 3) return <PrecioContactoStep formData={formData} onChange={handleChange} />;
    return null;
  };

  if (!user?.emailConfirmed) return <EmailVerificationGate>{null}</EmailVerificationGate>;

  /* ── Category selection screen (step 0) ── */
  if (currentStep === 0) {
    return (
      <div className={styles.page}>
        <PublicarTopbar onSaveDraft={null} draftSaved={false} />
        <main className={styles.wrapper}>
          <div className={styles.categoryScreen}>
            <div className={styles.categoryHeader}>
              <p className={styles.categoryStep}>Paso 1 de 3</p>
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

  /* ── 3-step form ── */
  return (
    <div className={styles.page}>
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
                  disabled={!formData.plan || publishing}
                >
                  <CheckCircle size={18} />
                  {publishLabel}
                </button>
                {publishError && (
                  <p style={{ color: "#dc2626", fontSize: 13, margin: 0 }}>
                    <AlertCircle size={13} style={{ verticalAlign: "middle", marginRight: 4 }} />
                    {publishError}
                  </p>
                )}
                <p className={styles.termsText}>
                  Al confirmar, aceptás nuestras <span>Condiciones de uso</span> y <span>Política de privacidad</span>.
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
                  <button type="button" className={styles.clearDraftBtn} onClick={clearDraft}>
                    <Trash2 size={17} /> Limpiar borrador
                  </button>
                  <button type="button" className={styles.primaryBtn} onClick={goNext}>
                    Siguiente <ArrowRight size={18} />
                  </button>
                </div>
                <div className={styles.autosave}>
                  <Check size={16} />
                  {draftMessage || "Los cambios se guardan automáticamente"}
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
