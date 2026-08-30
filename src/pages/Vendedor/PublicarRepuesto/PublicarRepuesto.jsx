import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AlertCircle, ArrowLeft, ArrowRight, Check, CheckCircle, Pencil } from "lucide-react";
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
import VistaPreviaSimpleStep from "../shared/VistaPreviaSimpleStep/VistaPreviaSimpleStep";
import PlanPublicacionStep from "../PublicarVehiculo/steps/PlanPublicacion/PlanPublicacionStep";
import styles from "../PublicarVehiculo/PublicarVehiculo.module.css";

const DRAFT_KEY = "miVehiculo_publicarRepuestoDraft";

const steps = [
  { id: 1, label: "Datos",          title: "Datos del repuesto",  formTitle: "Datos del repuesto",  description: "Completá la información principal del repuesto.",                sideText: "Cuanto más detalle des, más fácil será encontrar al comprador correcto.", helpTitle: "En este paso", helpItems: ["Nombre del repuesto","Categoría","Condición","Descripción","Cantidad"] },
  { id: 2, label: "Compatibilidad", title: "Compatibilidad",       formTitle: "Compatibilidad",       description: "Indicá con qué vehículos es compatible.",                        sideText: "Ayuda a los compradores a encontrarte si buscan por marca o modelo.", helpTitle: "En este paso", helpItems: ["Marcas compatibles","Modelos","Años","O marcarlo como universal"] },
  { id: 3, label: "Precio",         title: "Precio",               formTitle: "Precio",               description: "Definí el precio y condiciones de venta.",                       sideText: "Un precio justo atrae más compradores.", helpTitle: "En este paso", helpItems: ["Precio en USD","Negociable","Acepta permuta"] },
  { id: 4, label: "Fotos",          title: "Fotos",                formTitle: "Fotos del repuesto",   description: "Agregá fotos claras del repuesto.",                              sideText: "Subí fotos de frente, detalle y número de parte si aplica.", helpTitle: "En este paso", helpItems: ["Mínimo 1 foto","Máximo 20 fotos","Foto principal"] },
  { id: 5, label: "Contacto",       title: "Contacto",             formTitle: "Contacto y ubicación", description: "Cómo te contactarán los interesados.",                           sideText: "Podés elegir si mostrar tu número de WhatsApp.",  helpTitle: "En este paso", helpItems: ["Nombre","WhatsApp","Departamento","Municipio"] },
  { id: 6, label: "Vista previa",   title: "Vista previa",         formTitle: "Vista previa",         description: "Revisá tu publicación antes de confirmar.",                      sideText: "Así verán tu anuncio los compradores.", helpTitle: "Revisá", helpItems: ["Foto principal","Precio","Descripción","Datos de contacto"] },
  { id: 7, label: "Plan",           title: "Plan de publicación",  formTitle: "Elegí tu plan",        description: "Seleccioná cómo querés destacar tu publicación.",                sideText: "El plan premium te da más visibilidad.", helpTitle: "Incluye", helpItems: ["Duración","Cantidad de fotos","Posicionamiento"] },
];

const initialForm = {
  nombreRepuesto: "", categoriaRepuesto: "", condicion: "Nuevo",
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

const validators = {
  1: { nombreRepuesto: "Ingresá el nombre del repuesto.", categoriaRepuesto: "Seleccioná la categoría.", condicion: "Seleccioná la condición.", descripcionItem: "Escribí una descripción." },
  3: { precio: "Ingresá el precio." },
  5: { cityId: "Seleccioná el municipio.", nombreContacto: "Ingresá tu nombre.", whatsapp: "Ingresá tu WhatsApp." },
  7: { plan: "Seleccioná un plan para publicar." },
};

const PublicarRepuesto = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData]     = useState(getInitialDraft);
  const [errors, setErrors]         = useState({});
  const [draftMessage, setDraftMessage] = useState("");
  const [publishing, setPublishing] = useState(false);
  const [publishError, setPublishError] = useState("");

  const currentStepData = useMemo(() => steps.find((s) => s.id === currentStep) || steps[0], [currentStep]);
  const isPreviewStep = currentStep === 6;
  const isPlanStep    = currentStep === 7;
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
    if (stepId === 4 && !(formData.fotos || []).length) {
      stepErrors.fotos = "Subí al menos 1 foto para continuar.";
    }
    if (Object.keys(stepErrors).length) { setErrors(stepErrors); return false; }
    return true;
  };

  const saveDraft = () => {
    const { fotos, ...rest } = formData;
    localStorage.setItem(DRAFT_KEY, JSON.stringify({ formData: { ...rest, fotos: [] } }));
    setDraftMessage("Borrador guardado correctamente.");
    setTimeout(() => setDraftMessage(""), 2500);
  };

  const goPrev = () => { setErrors({}); setCurrentStep((p) => Math.max(p - 1, 1)); };
  const goNext = () => { if (!validateStep()) return; setErrors({}); setCurrentStep((p) => Math.min(p + 1, steps.length)); };
  const goToStep = (id) => {
    if (id <= currentStep) { setErrors({}); setCurrentStep(id); return; }
    if (!validateStep()) return;
    setErrors({}); setCurrentStep(id);
  };

  const handlePublish = async () => {
    if (!validateStep(7)) return;
    setErrors({}); setPublishError(""); setPublishing(true);

    try {
      // 1. Create product (DRAFT)
      const productRes = await api.post("/products", {
        title:        formData.nombreRepuesto,
        description:  formData.descripcionItem,
        price:        parseFloat(String(formData.precio).replace(/,/g, "")) || 0,
        currency:     "USD",
        stock:        parseInt(formData.cantidad, 10) || 1,
        condition:    formData.condicion === "Nuevo" ? "NEW" : "USED",
        category:     formData.categoriaRepuesto,
        cityId:       formData.cityId || undefined,
        contactPhone: `+503 ${formData.whatsapp}`,
        negotiable:   formData.precioNegociable === "Si",
        acceptsTrade: formData.aceptaPermuta    === "Si",
        universal:    !!formData.esUniversal,
        compatibilityBrands:  formData.compatibleMarcas  || undefined,
        compatibilityModels:  formData.compatibleModelos || undefined,
        compatibilityYears:   formData.compatibleAnios   || undefined,
      });
      const productId = productRes.data.id;

      // 2. Upload images
      const photos = (formData.fotos || []).filter((p) => p.file);
      if (photos.length > 0) {
        const fd = new FormData();
        photos.forEach((photo, idx) => fd.append(`image_${idx}`, photo.file));
        await api.upload(`/products/${productId}/images`, fd);
      }

      localStorage.removeItem(DRAFT_KEY);

      // 3. Plans de pago → redirigir a WOMPI; gratuito → publicar directo
      if (formData.plan !== "gratuito") {
        redirectToWompiCheckout({ plan: formData.plan, itemId: productId, itemType: "repuesto" });
        return;
      }

      await api.post(`/products/${productId}/publish`);
      navigate("/vendedor?tab=publicaciones&success=1");
    } catch {
      setPublishError("Error al publicar. Intentá de nuevo.");
    }
    setPublishing(false);
  };

  const renderStep = () => {
    if (currentStep === 1) return <DatosRepuestoStep formData={formData} onChange={handleChange} />;
    if (currentStep === 2) return <CompatibilidadStep formData={formData} onChange={handleChange} />;
    if (currentStep === 3) return <PrecioSimpleStep formData={formData} onChange={handleChange} />;
    if (currentStep === 4) return <FotosStep formData={formData} onChange={handleChange} />;
    if (currentStep === 5) return <ContactoUbicacionStep formData={formData} onChange={handleChange} />;
    if (currentStep === 6) return <VistaPreviaSimpleStep formData={formData} tipo="repuesto" />;
    return <PlanPublicacionStep formData={formData} onChange={handleChange} />;
  };

  return (
    <div className={styles.page}>
      <PublicarTopbar
        onSaveDraft={saveDraft}
        draftSaved={draftMessage === "Borrador guardado correctamente."}
      />
      <PublicarStepper steps={steps} currentStep={currentStep} onStepClick={goToStep} />

      <main className={styles.wrapper}>
        <section className={styles.contentLayout}>
          <PublicarSidebar currentStep={currentStep} totalSteps={steps.length} stepData={currentStepData} />

          <div className={styles.mainColumn}>
            <div className={styles.formCard}>
              {!isPlanStep && !isPreviewStep && (
                <div className={styles.cardHeader}>
                  <div className={styles.cardHeaderIcon}><Check size={22} /></div>
                  <div>
                    <h2>{currentStepData.formTitle}</h2>
                    <p>{currentStepData.description}</p>
                  </div>
                </div>
              )}

              {currentErrors.length > 0 && (
                <div className={styles.errorSummary}>
                  <div className={styles.errorSummaryIcon}><AlertCircle size={22} /></div>
                  <div>
                    <strong>Revisá estos campos antes de continuar</strong>
                    <ul>{currentErrors.map((e) => <li key={e}>{e}</li>)}</ul>
                  </div>
                </div>
              )}

              {renderStep()}
            </div>

            {isPlanStep ? (
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
                  {publishing ? "Publicando…" : formData.plan === "gratuito" ? "Publicar gratis" : formData.plan === "basico" ? "Pagar y publicar — $5" : "Pagar y publicar — $12"}
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
            ) : isPreviewStep ? (
              <div className={styles.finalActions}>
                <button type="button" className={styles.secondaryBtn} onClick={goPrev}><ArrowLeft size={18} /> Anterior</button>
                <button type="button" className={styles.editBtn} onClick={() => setCurrentStep(1)}><Pencil size={18} /> Volver a editar</button>
                <button type="button" className={styles.primaryBtn} onClick={goNext}>
                  Confirmar y elegir plan <ArrowRight size={18} />
                </button>
              </div>
            ) : (
              <div className={styles.navActions}>
                {currentStep > 1 && (
                  <button type="button" className={styles.secondaryBtn} onClick={goPrev}><ArrowLeft size={18} /> Anterior</button>
                )}
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
