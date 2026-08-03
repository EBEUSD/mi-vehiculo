import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";
import { supabase } from "../../../lib/supabase";
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle,
  MessageCircle,
  Pencil,
  Save,
  Trash2,
  Zap,
} from "lucide-react";
import PublicarTopbar from "./components/PublicarTopbar";
import PublicarStepper from "./components/PublicarStepper";
import PublicarSidebar from "./components/PublicarSidebar";
import DatosBasicosStep from "./steps/DatosBasicos/DatosBasicosStep";
import PrecioOperacionStep from "./steps/PrecioOperacion/PrecioOperacionStep";
import CaracteristicasStep from "./steps/Caracteristicas/CaracteristicasStep";
import EstadoDocumentacionStep from "./steps/EstadoDocumentacion/EstadoDocumentacionStep";
import FotosStep from "./steps/Fotos/FotosStep";
import ContactoUbicacionStep from "./steps/ContactoUbicacion/ContactoUbicacionStep";
import VistaPreviaStep from "./steps/VistaPrevia/VistaPreviaStep";
import PlanPublicacionStep from "./steps/PlanPublicacion/PlanPublicacionStep";
import styles from "./PublicarVehiculo.module.css";

const steps = [
  {
    id: 1,
    label: "Datos básicos",
    title: "Datos básicos",
    formTitle: "Datos del vehículo",
    description:
      "Completá la información principal para comenzar tu publicación.",
    sideText:
      "Contanos lo esencial de tu vehículo para que podamos ayudarte a llegar a más compradores.",
    helpTitle: "En este paso vas a completar",
    helpItems: [
      "Tipo de vehículo",
      "Marca y modelo",
      "Año y versión",
      "Kilometraje",
      "Condición del vehículo",
      "Descripción (opcional)",
    ],
  },
  {
    id: 2,
    label: "Precio y operación",
    title: "Precio y operación",
    formTitle: "Precio y operación",
    description: "Definí el valor y las opciones de venta de tu vehículo.",
    sideText:
      "Definí el precio y las condiciones de venta para que los interesados entiendan tus opciones.",
    helpTitle: "En este paso vas a completar",
    helpItems: ["Precio", "Moneda", "Permuta", "Negociable", "Financiación"],
  },
  {
    id: 3,
    label: "Características",
    title: "Características",
    formTitle: "Características del vehículo",
    description: "Completá las especificaciones principales de tu vehículo.",
    sideText:
      "Sumá los detalles técnicos y de configuración para que tu vehículo se destaque.",
    helpTitle: "En este paso vas a completar",
    helpItems: [
      "Combustible",
      "Transmisión",
      "Motor",
      "Color",
      "Puertas",
      "Carrocería",
      "Tracción",
    ],
  },
  {
    id: 4,
    label: "Estado y documentación",
    title: "Estado y documentación",
    formTitle: "Estado y documentación",
    description:
      "Completá esta información para generar confianza en los compradores.",
    sideText:
      "Completá esta información para generar confianza en los compradores.",
    helpTitle: "En este paso vas a completar",
    helpItems: ["Documentación", "Estado mecánico", "Observaciones"],
  },
  {
    id: 5,
    label: "Fotos",
    title: "Fotos del vehículo",
    formTitle: "Subí las fotos de tu vehículo",
    description:
      "Agregá fotos claras y reales para generar confianza y recibir más consultas.",
    sideText:
      "Subí al menos 4 fotos claras de tu vehículo. Las imágenes de buena calidad generan más confianza y consultas.",
    helpTitle: "En este paso vas a completar",
    helpItems: ["Fotos del vehículo"],
  },
  {
    id: 6,
    label: "Contacto y ubicación",
    title: "Contacto y ubicación",
    formTitle: "Contacto y ubicación",
    description:
      "Completá tus datos para que los interesados puedan contactarte.",
    sideText:
      "Completá tus datos de contacto y ubicación para que los interesados puedan comunicarse con vos.",
    helpTitle: "En este paso vas a completar",
    helpItems: [
      "Ubicación del vehículo",
      "Datos de contacto",
      "Horario de contacto",
      "Preferencias de visibilidad",
    ],
  },
  {
    id: 7,
    label: "Vista previa",
    title: "Vista previa",
    formTitle: "",
    description: "",
    sideText:
      "Revisá que toda la información sea correcta antes de publicar tu vehículo.",
    helpTitle: "En este paso vas a",
    helpItems: ["Revisar tu publicación antes de hacerla pública"],
  },
  {
    id: 8,
    label: "Plan",
    title: "Plan de publicación",
    formTitle: "Elegí tu plan",
    description: "Elegí cómo querés destacar tu publicación y llegar a más compradores.",
    sideText:
      "Un plan de mayor visibilidad puede marcar la diferencia. Los avisos Premium aparecen en la página principal.",
    helpTitle: "Los planes incluyen",
    helpItems: [
      "Duración extendida de la publicación",
      "Mayor posición en búsquedas",
      "Badge destacado en el aviso",
      "Aparición en la página principal",
    ],
  },
];

const initialForm = {
  tipoVehiculo: "",
  marca: "",
  modelo: "",
  anio: "",
  version: "",
  kilometraje: "",
  condicion: "Nuevo",

  precio: "",
  moneda: "USD",
  aceptaPermuta: "Si",
  precioNegociable: "Si",
  financiacion: "Si",
  infoFinanciacion: "",

  combustible: "Gasolina",
  transmision: "Manual",
  motor: "1.6",
  color: "Blanco",
  puertas: "4",
  carroceria: "SUV",
  traccion: "Delantera 4x2",

  papelesAlDia: "Sí",
  vtv: "Al día",
  deudas: "Sin deudas",
  titularidad: "Titular",
  estadoGeneral: "Excelente",
  observaciones: "",
  descripcion: "",

  provincia: "",
  ciudad: "",
  nombreContacto: "",
  whatsapp: "",
  email: "",
  horarioContacto: "",
  mostrarWhatsapp: "Si",

  fotos: [],
  plan: "",
};

const DRAFT_KEY = "miVehiculo_publicarVehiculoDraft";

const getInitialDraft = () => {
  try {
    const savedDraft = localStorage.getItem(DRAFT_KEY);

    if (!savedDraft) {
      return initialForm;
    }

    const parsedDraft = JSON.parse(savedDraft);

    return {
      ...initialForm,
      ...parsedDraft.formData,
      fotos: [],
    };
  } catch {
    return initialForm;
  }
};

const prepareDraftData = (data) => {
  const { fotos, ...rest } = data;

  return {
    ...rest,
    fotos: [],
  };
};

const validators = {
  1: {
    tipoVehiculo: "Seleccioná el tipo de vehículo.",
    marca: "Seleccioná la marca.",
    modelo: "Seleccioná el modelo.",
    anio: "Ingresá el año del vehículo.",
    kilometraje: "Ingresá el kilometraje.",
    condicion: "Seleccioná la condición del vehículo.",
  },
  2: {
    precio: "Ingresá el precio.",
    moneda: "Seleccioná la moneda.",
    aceptaPermuta: "Indicá si aceptás permuta.",
    precioNegociable: "Indicá si el precio es negociable.",
    financiacion: "Indicá si ofrecés financiación.",
  },
  3: {
    combustible: "Seleccioná el combustible.",
    transmision: "Seleccioná la transmisión.",
    motor: "Seleccioná el motor.",
    color: "Seleccioná el color.",
    puertas: "Seleccioná la cantidad de puertas.",
    carroceria: "Seleccioná la carrocería.",
    traccion: "Seleccioná la tracción.",
  },
  4: {
    papelesAlDia: "Indicá si tiene papeles al día.",
    vtv: "Seleccioná el estado de la tarjeta de circulación.",
    deudas: "Indicá si tiene deudas.",
    titularidad: "Seleccioná la titularidad.",
    estadoGeneral: "Seleccioná el estado general.",
  },
  5: {},
  6: {
    provincia: "Seleccioná el departamento.",
    ciudad: "Seleccioná el municipio.",
    nombreContacto: "Ingresá el nombre de contacto.",
    whatsapp: "Ingresá un número de WhatsApp.",
    email: "Ingresá un email de contacto.",
    horarioContacto: "Seleccioná un horario de contacto.",
  },
  7: {},
  8: {
    plan: "Seleccioná un plan para continuar.",
  },
};

const PublicarVehiculo = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState(getInitialDraft);
  const [errors, setErrors] = useState({});
  const [draftMessage, setDraftMessage] = useState("");
  const [publishing, setPublishing] = useState(false);
  const [publishError, setPublishError] = useState("");

  const currentStepData = useMemo(() => {
    return steps.find((step) => step.id === currentStep) || steps[0];
  }, [currentStep]);

  const isPreviewStep = currentStep === 7;
  const isPlanStep    = currentStep === 8;
  const isLastStep    = isPlanStep;
  const currentErrors = Object.values(errors);

  const validateStep = (stepId = currentStep) => {
    const stepErrors = {};
    const rules = validators[stepId] || {};

    Object.entries(rules).forEach(([field, message]) => {
      const value = formData[field];

      if (
        value === undefined ||
        value === null ||
        String(value).trim() === ""
      ) {
        stepErrors[field] = message;
      }
    });

    if (stepId === 1) {
      const year = Number(formData.anio);
      const kilometers = Number(
        String(formData.kilometraje).replace(/\D/g, ""),
      );

      if (
        formData.anio &&
        (!year || year < 1900 || year > new Date().getFullYear() + 1)
      ) {
        stepErrors.anio = "Ingresá un año válido.";
      }

      if (formData.kilometraje && Number.isNaN(kilometers)) {
        stepErrors.kilometraje = "Ingresá un kilometraje válido.";
      }

      if (formData.condicion === "Nuevo" && kilometers > 0) {
        stepErrors.kilometraje = "Un vehículo nuevo debería tener 0 km.";
      }
    }

    if (stepId === 2) {
      const price = Number(String(formData.precio).replace(/\D/g, ""));

      if (formData.precio && (!price || price <= 0)) {
        stepErrors.precio = "Ingresá un precio válido.";
      }
    }

    if (stepId === 5) {
      if (!formData.fotos || formData.fotos.length < 4) {
        stepErrors.fotos = "Subí al menos 4 fotos para continuar.";
      }
    }

    if (stepId === 6) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      const phoneNumbers = String(formData.whatsapp).replace(/\D/g, "");

      if (formData.email && !emailRegex.test(formData.email)) {
        stepErrors.email = "Ingresá un email válido.";
      }

      if (formData.whatsapp && phoneNumbers.length < 8) {
        stepErrors.whatsapp = "Ingresá un WhatsApp válido.";
      }
    }

    setErrors(stepErrors);

    return Object.keys(stepErrors).length === 0;
  };

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    setErrors((prev) => {
      if (!prev[name]) {
        return prev;
      }

      const nextErrors = { ...prev };
      delete nextErrors[name];
      return nextErrors;
    });
  };

  const saveDraft = () => {
    const draftData = {
      formData: prepareDraftData(formData),
      savedAt: new Date().toISOString(),
    };

    localStorage.setItem(DRAFT_KEY, JSON.stringify(draftData));
    setDraftMessage("Borrador guardado correctamente.");

    setTimeout(() => {
      setDraftMessage("");
    }, 3000);
  };

  const clearDraft = () => {
    localStorage.removeItem(DRAFT_KEY);
    setFormData(initialForm);
    setErrors({});
    setCurrentStep(1);
    setDraftMessage("Borrador eliminado.");

    setTimeout(() => {
      setDraftMessage("");
    }, 3000);
  };

  const goPrev = () => {
    setErrors({});
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const goNext = () => {
    const isValid = validateStep(currentStep);

    if (!isValid) {
      return;
    }

    setErrors({});
    setCurrentStep((prev) => Math.min(prev + 1, steps.length));
  };

  const goToStep = (stepId) => {
    if (stepId <= currentStep) {
      setErrors({});
      setCurrentStep(stepId);
      return;
    }

    const isValid = validateStep(currentStep);

    if (!isValid) {
      return;
    }

    setErrors({});
    setCurrentStep(stepId);
  };

  /* Step 7: advance to plan selection (step 8) */
  const handleConfirmPublication = () => {
    setErrors({});
    setCurrentStep(8);
  };

  /* Step 8: final publish with chosen plan */
  const handlePublish = async () => {
    const isValid = validateStep(8);
    if (!isValid) return;
    setErrors({});
    setPublishError("");
    setPublishing(true);

    // Mock users: simulate publish in demo mode
    if (user?.id?.startsWith("mock-")) {
      await new Promise((r) => setTimeout(r, 800));
      localStorage.removeItem(DRAFT_KEY);
      setPublishing(false);
      navigate("/vendedor?tab=publicaciones&success=1");
      return;
    }

    const payload = {
      seller_id:          user.id,
      tipo_vehiculo:      formData.tipoVehiculo,
      marca:              formData.marca,
      modelo:             formData.modelo,
      anio:               parseInt(formData.anio, 10) || null,
      version:            formData.version,
      kilometraje:        parseInt(String(formData.kilometraje).replace(/\D/g, ""), 10) || null,
      condicion:          formData.condicion,
      precio:             parseFloat(String(formData.precio).replace(/,/g, "")) || null,
      moneda:             formData.moneda,
      acepta_permuta:     formData.aceptaPermuta,
      precio_negociable:  formData.precioNegociable,
      financiacion:       formData.financiacion,
      info_financiacion:  formData.infoFinanciacion,
      combustible:        formData.combustible,
      transmision:        formData.transmision,
      motor:              formData.motor,
      color:              formData.color,
      puertas:            formData.puertas,
      carroceria:         formData.carroceria,
      traccion:           formData.traccion,
      papeles_al_dia:     formData.papelesAlDia,
      tarjeta_circulacion: formData.vtv,
      deudas:             formData.deudas,
      titularidad:        formData.titularidad,
      estado_general:     formData.estadoGeneral,
      observaciones:      formData.observaciones,
      descripcion:        formData.descripcion,
      fotos:              (formData.fotos || []).filter((p) => p.url).map((p) => p.url),
      departamento:       formData.provincia,
      municipio:          formData.ciudad,
      nombre_contacto:    formData.nombreContacto,
      whatsapp:           formData.whatsapp,
      email_contacto:     formData.email,
      horario_contacto:   formData.horarioContacto,
      mostrar_whatsapp:   formData.mostrarWhatsapp,
      plan:               formData.plan,
    };

    const { error } = await supabase.from("listings").insert(payload);

    setPublishing(false);

    if (error) {
      setPublishError("Error al publicar. Intentá de nuevo.");
      return;
    }

    localStorage.removeItem(DRAFT_KEY);
    navigate("/vendedor?tab=publicaciones&success=1");
  };

  const renderStep = () => {
    if (currentStep === 1) {
      return <DatosBasicosStep formData={formData} onChange={handleChange} />;
    }

    if (currentStep === 2) {
      return (
        <PrecioOperacionStep formData={formData} onChange={handleChange} />
      );
    }

    if (currentStep === 3) {
      return (
        <CaracteristicasStep formData={formData} onChange={handleChange} />
      );
    }

    if (currentStep === 4) {
      return (
        <EstadoDocumentacionStep formData={formData} onChange={handleChange} />
      );
    }

    if (currentStep === 5) {
      return <FotosStep formData={formData} onChange={handleChange} />;
    }

    if (currentStep === 6) {
      return (
        <ContactoUbicacionStep formData={formData} onChange={handleChange} />
      );
    }

    if (currentStep === 7) return <VistaPreviaStep formData={formData} />;

    return <PlanPublicacionStep formData={formData} onChange={handleChange} />;
  };

  return (
    <div className={styles.page}>
      <PublicarTopbar
        onSaveDraft={saveDraft}
        draftSaved={draftMessage === "Borrador guardado correctamente."}
      />

      <PublicarStepper
        steps={steps}
        currentStep={currentStep}
        onStepClick={goToStep}
      />

      <main className={styles.wrapper}>
        <section className={styles.contentLayout}>
          <PublicarSidebar
            currentStep={currentStep}
            totalSteps={steps.length}
            stepData={currentStepData}
          />

          <div className={styles.mainColumn}>
            <div className={styles.formCard}>
              {!isPlanStep && !isPreviewStep && (
                <div className={styles.cardHeader}>
                  <div className={styles.cardHeaderIcon}>
                    <Check size={22} />
                  </div>

                  <div>
                    <h2>{currentStepData.formTitle}</h2>
                    <p>{currentStepData.description}</p>
                  </div>
                </div>
              )}

              {currentErrors.length > 0 && (
                <div className={styles.errorSummary}>
                  <div className={styles.errorSummaryIcon}>
                    <AlertCircle size={22} />
                  </div>

                  <div>
                    <strong>Revisá estos campos antes de continuar</strong>

                    <ul>
                      {currentErrors.map((error) => (
                        <li key={error}>{error}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

              {renderStep()}
            </div>

            {isPlanStep ? (
              /* ── Step 8: Plan selection actions ── */
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
                  {publishing
                    ? "Publicando…"
                    : formData.plan === "gratuito"
                    ? "Publicar gratis"
                    : formData.plan === "basico"
                    ? "Pagar y publicar — $5"
                    : formData.plan === "premium"
                    ? "Pagar y publicar — $12"
                    : "Publicar ahora"}
                </button>
                {publishError && (
                  <p style={{ color: "#dc2626", fontSize: 13, margin: 0 }}>
                    <AlertCircle size={13} style={{ verticalAlign: "middle", marginRight: 4 }} />
                    {publishError}
                  </p>
                )}
                <p className={styles.termsText}>
                  Al confirmar, aceptás nuestras <span>Condiciones de uso</span>{" "}
                  y <span>Política de privacidad</span>.
                </p>
              </div>
            ) : isPreviewStep ? (
              /* ── Step 7: Vista previa actions ── */
              <div className={styles.finalActions}>
                <button type="button" className={styles.secondaryBtn} onClick={goPrev}>
                  <ArrowLeft size={18} /> Anterior
                </button>
                <button type="button" className={styles.editBtn} onClick={() => setCurrentStep(1)}>
                  <Pencil size={18} /> Volver a editar
                </button>
                <button type="button" className={styles.whatsappPreviewBtn}>
                  <MessageCircle size={18} /> Ver cómo se ve en WhatsApp
                </button>
                <button type="button" className={styles.primaryBtn} onClick={handleConfirmPublication}>
                  <Zap size={18} /> Elegir plan y publicar
                </button>
                <p className={styles.termsText}>
                  Al confirmar, aceptás nuestras <span>Condiciones de uso</span>{" "}
                  y <span>Política de privacidad</span>.
                </p>
              </div>
            ) : (
              <>
                <div className={styles.bottomActions}>
                  <button
                    type="button"
                    className={styles.secondaryBtn}
                    onClick={goPrev}
                    disabled={currentStep === 1}
                  >
                    <ArrowLeft size={18} />
                    Anterior
                  </button>

                  <button
                    type="button"
                    className={styles.draftBtn}
                    onClick={saveDraft}
                  >
                    <Save size={18} />
                    Guardar borrador
                  </button>

                  <button
                    type="button"
                    className={styles.clearDraftBtn}
                    onClick={clearDraft}
                  >
                    <Trash2 size={17} />
                    Limpiar borrador
                  </button>

                  <button
                    type="button"
                    className={styles.primaryBtn}
                    onClick={goNext}
                  >
                    Siguiente
                    <ArrowRight size={18} />
                  </button>
                </div>

                <div className={styles.autosave}>
                  <Check size={16} />
                  {draftMessage || "Se guardan los cambios automáticamente"}
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
