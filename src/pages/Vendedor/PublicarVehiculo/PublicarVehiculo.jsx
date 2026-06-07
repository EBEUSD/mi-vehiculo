import { useMemo, useState } from "react";
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Check,
  MessageCircle,
  Pencil,
  Save,
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
import styles from "./PublicarVehiculo.module.css";

const steps = [
  {
    id: 1,
    label: "Datos básicos",
    title: "Datos básicos",
    formTitle: "Datos del vehículo",
    description: "Completá la información principal para comenzar tu publicación.",
    sideText:
      "Contanos lo esencial de tu vehículo para que podamos ayudarte a llegar a más compradores.",
    helpTitle: "En este paso vas a completar",
    helpItems: [
      "Tipo de vehículo",
      "Marca y modelo",
      "Año y versión",
      "Kilometraje",
      "Condición del vehículo",
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
  moneda: "ARS",
  aceptaPermuta: "Si",
  precioNegociable: "Si",
  financiacion: "Si",
  infoFinanciacion: "",

  combustible: "Nafta",
  transmision: "Manual",
  motor: "1.6",
  color: "Blanco",
  puertas: "4",
  carroceria: "SUV",
  traccion: "Delantera 4x2",

  papelesAlDia: "Sí",
  vtv: "Vigente",
  deudas: "Sin deudas",
  titularidad: "Titular",
  estadoGeneral: "Excelente",
  observaciones: "",

  provincia: "",
  ciudad: "",
  nombreContacto: "",
  whatsapp: "",
  email: "",
  horarioContacto: "",
  mostrarWhatsapp: "Si",

  fotos: [],
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
    vtv: "Seleccioná el estado de la VTV.",
    deudas: "Indicá si tiene deudas.",
    titularidad: "Seleccioná la titularidad.",
    estadoGeneral: "Seleccioná el estado general.",
  },
  5: {},
  6: {
    provincia: "Seleccioná la provincia.",
    ciudad: "Seleccioná la ciudad.",
    nombreContacto: "Ingresá el nombre de contacto.",
    whatsapp: "Ingresá un número de WhatsApp.",
    email: "Ingresá un email de contacto.",
    horarioContacto: "Seleccioná un horario de contacto.",
  },
};

const PublicarVehiculo = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState(initialForm);
  const [errors, setErrors] = useState({});

  const currentStepData = useMemo(() => {
    return steps.find((step) => step.id === currentStep) || steps[0];
  }, [currentStep]);

  const isLastStep = currentStep === steps.length;
  const currentErrors = Object.values(errors);

  const validateStep = (stepId = currentStep) => {
    const stepErrors = {};
    const rules = validators[stepId] || {};

    Object.entries(rules).forEach(([field, message]) => {
      const value = formData[field];

      if (value === undefined || value === null || String(value).trim() === "") {
        stepErrors[field] = message;
      }
    });

    if (stepId === 1) {
      const year = Number(formData.anio);
      const kilometers = Number(String(formData.kilometraje).replace(/\D/g, ""));

      if (formData.anio && (!year || year < 1900 || year > new Date().getFullYear() + 1)) {
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

  const handleConfirmPublication = () => {
    const invalidStep = steps.find((step) => !validateStep(step.id));

    if (invalidStep) {
      setCurrentStep(invalidStep.id);
      return;
    }

    setErrors({});
    console.log("Publicación lista para enviar", formData);
  };

  const renderStep = () => {
    if (currentStep === 1) {
      return <DatosBasicosStep formData={formData} onChange={handleChange} />;
    }

    if (currentStep === 2) {
      return <PrecioOperacionStep formData={formData} onChange={handleChange} />;
    }

    if (currentStep === 3) {
      return <CaracteristicasStep formData={formData} onChange={handleChange} />;
    }

    if (currentStep === 4) {
      return (
        <EstadoDocumentacionStep
          formData={formData}
          onChange={handleChange}
        />
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

    return <VistaPreviaStep formData={formData} />;
  };

  return (
    <div className={styles.page}>
      <PublicarTopbar />

      <main className={styles.wrapper}>
        <section className={styles.pageHeader}>
          <div>
            <h1>Publicar vehículo</h1>
            <p>Completá los pasos para publicar tu vehículo</p>
          </div>

          <PublicarStepper
            steps={steps}
            currentStep={currentStep}
            onStepClick={goToStep}
          />
        </section>

        <section className={styles.contentLayout}>
          <PublicarSidebar
            currentStep={currentStep}
            totalSteps={steps.length}
            stepData={currentStepData}
          />

          <div className={styles.mainColumn}>
            <div className={styles.formCard}>
              {!isLastStep && (
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

            {isLastStep ? (
              <div className={styles.finalActions}>
                <button
                  type="button"
                  className={styles.secondaryBtn}
                  onClick={goPrev}
                >
                  <ArrowLeft size={18} />
                  Anterior
                </button>

                <button
                  type="button"
                  className={styles.editBtn}
                  onClick={() => setCurrentStep(1)}
                >
                  <Pencil size={18} />
                  Volver a editar
                </button>

                <button type="button" className={styles.whatsappPreviewBtn}>
                  <MessageCircle size={18} />
                  Ver cómo se ve en WhatsApp
                </button>

                <button
                  type="button"
                  className={styles.primaryBtn}
                  onClick={handleConfirmPublication}
                >
                  <Check size={18} />
                  Confirmar publicación
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

                  <button type="button" className={styles.draftBtn}>
                    <Save size={18} />
                    Guardar borrador
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
                  Se guardan los cambios automáticamente
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