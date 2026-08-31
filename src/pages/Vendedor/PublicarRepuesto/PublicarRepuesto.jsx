import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  AlertCircle, ArrowLeft, ArrowRight, Check, CheckCircle, ChevronRight,
} from "lucide-react";
import { useAuth } from "../../../context/AuthContext";
import { api } from "../../../lib/api";
import { redirectToWompiCheckout } from "../../../lib/wompi";
import PublicarTopbar from "../PublicarVehiculo/components/PublicarTopbar";
import PublicarStepper from "../PublicarVehiculo/components/PublicarStepper";
import PublicarSidebar from "../PublicarVehiculo/components/PublicarSidebar";
import DatosRepuestoStep from "./steps/DatosRepuesto/DatosRepuestoStep";
import CompatibilidadStep from "./steps/Compatibilidad/CompatibilidadStep";
import PrecioSimpleStep from "./steps/PrecioSimple/PrecioSimpleStep";
import FotosStep from "../PublicarVehiculo/steps/Fotos/FotosStep";
import ContactoUbicacionStep from "../PublicarVehiculo/steps/ContactoUbicacion/ContactoUbicacionStep";
import PlanPublicacionStep from "../PublicarVehiculo/steps/PlanPublicacion/PlanPublicacionStep";
import EmailVerificationGate from "../../../components/EmailVerificationGate/EmailVerificationGate";
import styles from "../PublicarVehiculo/PublicarVehiculo.module.css";

const DRAFT_KEY = "miVehiculo_publicarRepuestoDraft";

const CATEGORIAS_REPUESTO_FALLBACK = [
  "Motor", "Frenos", "Suspensión", "Dirección", "Transmisión",
  "Carrocería", "Sistema eléctrico", "Enfriamiento", "Escape",
  "Neumáticos y rines", "Otro",
].map((label, i) => ({ id: i + 1, name: label }));

const steps = [
  {
    id: 1, label: "Datos",
    title: "Datos del repuesto", formTitle: "Datos del repuesto",
    description: "Nombre, condición, descripción y compatibilidad.",
    sideText: "Cuanto más detalle des, más fácil será encontrar al comprador correcto.",
    helpTitle: "Consejos",
    helpItems: ["Nombre claro y específico", "Sé honesto con la condición", "Código OEM si aplica", "Marcas compatibles = más búsquedas"],
  },
  {
    id: 2, label: "Fotos y precio",
    title: "Fotos y precio", formTitle: "Fotos y precio",
    description: "Subí fotos del repuesto y definí el precio de venta.",
    sideText: "Fotos en buena luz y precio competitivo generan más consultas.",
    helpTitle: "Consejos",
    helpItems: ["Foto en fondo claro sin sombras", "Mostrá el número de parte si aplica", "Precio competitivo genera más interés"],
  },
  {
    id: 3, label: "Publicar",
    title: "Contacto y publicación", formTitle: "Contacto y publicación",
    description: "Cómo te van a contactar y cómo querés publicar.",
    sideText: "Elegí el plan que mejor se adapte a tu necesidad.",
    helpTitle: "Planes",
    helpItems: ["Gratuito: visible por 30 días", "Básico $5: más fotos + posicionamiento", "Premium $12: máxima visibilidad"],
  },
];

const initialForm = {
  nombreRepuesto: "", categoriaRepuesto: "", categoryId: null, condicion: "Nuevo",
  descripcionItem: "", cantidad: "1",
  compatibleMarcas: "", compatibleModelos: "", compatibleAnios: "", esUniversal: false,
  precio: "", moneda: "USD", precioNegociable: "Si", aceptaPermuta: "No",
  fotos: [],
  provinceId: "", provincia: "", cityId: "", ciudad: "",
  nombreContacto: "", whatsapp: "",
  email: "", horarioContacto: "", mostrarWhatsapp: "Si",
  plan: "",
};

const getInitialDraft = () => {
  try {
    const raw = localStorage.getItem(DRAFT_KEY);
    if (!raw) return initialForm;
    return { ...initialForm, ...JSON.parse(raw).formData, fotos: [] };
  } catch { return initialForm; }
};

const getInitialStep = () => {
  try {
    const raw = localStorage.getItem(DRAFT_KEY);
    const d = raw && JSON.parse(raw).formData;
    if (d?.categoriaRepuesto && d?.categoryId) return 1;
  } catch {}
  return 0;
};

const validators = {
  1: {
    nombreRepuesto:  "Ingresá el nombre del repuesto.",
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
};

const PublicarRepuesto = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(getInitialStep);
  const [formData, setFormData]       = useState(getInitialDraft);
  const [errors, setErrors]           = useState({});
  const [draftMessage, setDraftMessage] = useState("");
  const [publishing, setPublishing]   = useState(false);
  const [publishError, setPublishError] = useState("");
  const [categories, setCategories]   = useState(CATEGORIAS_REPUESTO_FALLBACK);

  useEffect(() => {
    api.get("/products?limit=100").then((r) => {
      const seen = {};
      (r.data || []).forEach((p) => { if (p.category) seen[p.category.id] = p.category; });
      const cats = Object.values(seen);
      if (cats.length) setCategories(cats);
    }).catch(() => {});
  }, []);

  const currentStepData = useMemo(
    () => steps.find((s) => s.id === currentStep) || steps[0],
    [currentStep],
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
    if (stepId === 2 && !(formData.fotos || []).length) {
      stepErrors.fotos = "Subí al menos 1 foto para continuar.";
    }
    if (Object.keys(stepErrors).length) { setErrors(stepErrors); return false; }
    return true;
  };

  const handleSelectCategoria = (cat) => {
    setFormData((p) => ({ ...p, categoriaRepuesto: cat.name, categoryId: cat.id }));
    setCurrentStep(1);
  };

  const saveDraft = () => {
    const { fotos, ...rest } = formData;
    localStorage.setItem(DRAFT_KEY, JSON.stringify({ formData: { ...rest, fotos: [] } }));
    setDraftMessage("Borrador guardado correctamente.");
    setTimeout(() => setDraftMessage(""), 2500);
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
    if (!validateStep(3)) return;
    setErrors({}); setPublishError(""); setPublishing(true);

    try {
      const payload = {
        title:       formData.nombreRepuesto,
        description: formData.descripcionItem,
        price:       parseFloat(String(formData.precio).replace(/,/g, "")) || 0,
        currency:    "USD",
        stock:       parseInt(formData.cantidad, 10) || 1,
        condition:   formData.condicion === "Nuevo" ? "NEW" : "USED",
        categoryId:  formData.categoryId,
      };
      console.log("[PublicarRepuesto] payload →", payload);
      const productRes = await api.post("/products", payload);
      const productId = productRes.data.id;

      const photos = (formData.fotos || []).filter((p) => p.file);
      if (photos.length > 0) {
        const fd = new FormData();
        photos.forEach((photo, idx) => fd.append(`image_${idx}`, photo.file));
        await api.upload(`/products/${productId}/images`, fd);
      }

      localStorage.removeItem(DRAFT_KEY);

      if (formData.plan !== "gratuito") {
        redirectToWompiCheckout({ plan: formData.plan, itemId: productId, itemType: "repuesto" });
        return;
      }

      navigate("/vendedor?tab=publicaciones&success=1");
    } catch (err) {
      console.error("[PublicarRepuesto] error →", err?.message, err?.body);
      setPublishError(err?.message || "Error al publicar. Intentá de nuevo.");
    }
    setPublishing(false);
  };

  const renderStep = () => {
    if (currentStep === 1) return (
      <>
        <DatosRepuestoStep formData={formData} onChange={handleChange} hideCategory />
        {formData.descripcionItem?.trim().length > 0 && (
          <div className={styles.revealBlock}>
            <div className={styles.sectionDivider} />
            <h3 className={styles.sectionTitle}>Compatibilidad</h3>
            <p className={styles.sectionSub}>¿Con qué vehículos es compatible este repuesto?</p>
            <CompatibilidadStep formData={formData} onChange={handleChange} />
          </div>
        )}
      </>
    );
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

  /* ── Paso 0: selección de categoría ── */
  if (currentStep === 0) {
    return (
      <div className={styles.page}>
        <PublicarTopbar onSaveDraft={null} draftSaved={false} />
        <main className={styles.wrapper}>
          <div className={styles.categoryScreen}>
            <div className={styles.categoryHeader}>
              <p className={styles.categoryStep}>Nuevo repuesto</p>
              <h1 className={styles.categoryTitle}>¿Qué tipo de repuesto es?</h1>
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

  /* ── Pasos 1–3 ── */
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
                  {publishing          ? "Publicando…"
                    : formData.plan === "gratuito" ? "Publicar gratis"
                    : formData.plan === "basico"   ? "Pagar y publicar — $5"
                    :                                "Pagar y publicar — $12"}
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

export default PublicarRepuesto;
