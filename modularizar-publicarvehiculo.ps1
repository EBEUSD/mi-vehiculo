$ErrorActionPreference = "Stop"

New-Item -ItemType Directory -Force "src/pages/Vendedor/PublicarVehiculo/components" | Out-Null
New-Item -ItemType Directory -Force "src/pages/Vendedor/PublicarVehiculo/steps/DatosBasicos" | Out-Null
New-Item -ItemType Directory -Force "src/pages/Vendedor/PublicarVehiculo/steps/PrecioOperacion" | Out-Null
New-Item -ItemType Directory -Force "src/pages/Vendedor/PublicarVehiculo/steps/Caracteristicas" | Out-Null
New-Item -ItemType Directory -Force "src/pages/Vendedor/PublicarVehiculo/steps/EstadoDocumentacion" | Out-Null
New-Item -ItemType Directory -Force "src/pages/Vendedor/PublicarVehiculo/steps/Fotos" | Out-Null
New-Item -ItemType Directory -Force "src/pages/Vendedor/PublicarVehiculo/steps/ContactoUbicacion" | Out-Null
New-Item -ItemType Directory -Force "src/pages/Vendedor/PublicarVehiculo/steps/VistaPrevia" | Out-Null

@'
import { useMemo, useState } from "react";
import {
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
};

const PublicarVehiculo = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState(initialForm);

  const currentStepData = useMemo(() => {
    return steps.find((step) => step.id === currentStep) || steps[0];
  }, [currentStep]);

  const isLastStep = currentStep === steps.length;

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const goPrev = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const goNext = () => {
    setCurrentStep((prev) => Math.min(prev + 1, steps.length));
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
      return <EstadoDocumentacionStep formData={formData} onChange={handleChange} />;
    }

    if (currentStep === 5) {
      return <FotosStep formData={formData} onChange={handleChange} />;
    }

    if (currentStep === 6) {
      return <ContactoUbicacionStep formData={formData} onChange={handleChange} />;
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
            onStepClick={setCurrentStep}
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

              {renderStep()}
            </div>

            {isLastStep ? (
              <div className={styles.finalActions}>
                <button type="button" className={styles.secondaryBtn} onClick={goPrev}>
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

                <button type="button" className={styles.primaryBtn}>
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

                  <button type="button" className={styles.primaryBtn} onClick={goNext}>
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
'@ | Set-Content -Encoding UTF8 "src/pages/Vendedor/PublicarVehiculo/PublicarVehiculo.jsx"

@'
.page {
  min-height: 100vh;
  background:
    radial-gradient(circle at 12% 8%, rgba(37, 99, 235, 0.08), transparent 28%),
    radial-gradient(circle at 88% 18%, rgba(56, 116, 255, 0.07), transparent 30%),
    linear-gradient(180deg, #f5f8fc 0%, #f9fbff 42%, #ffffff 100%);
  color: #08183f;
  font-family: "Inter", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI",
    sans-serif;
}

.wrapper {
  width: min(100%, 1360px);
  margin: 0 auto;
  padding: 30px 28px 42px;
}

.pageHeader {
  display: grid;
  grid-template-columns: 340px minmax(0, 1fr);
  align-items: start;
  gap: 22px;
  margin-bottom: 24px;
}

.pageHeader h1 {
  margin: 0 0 8px;
  font-size: 34px;
  line-height: 1.08;
  font-weight: 950;
  letter-spacing: -1.5px;
  color: #08183f;
}

.pageHeader p {
  margin: 0;
  color: #60718f;
  font-size: 14.5px;
  font-weight: 650;
}

.contentLayout {
  display: grid;
  grid-template-columns: 300px minmax(0, 1fr);
  gap: 28px;
  align-items: start;
}

.mainColumn {
  min-width: 0;
}

.formCard {
  background: #ffffff;
  border: 1px solid #d9e3f0;
  border-radius: 21px;
  padding: 34px 40px 36px;
  box-shadow:
    0 18px 44px rgba(12, 34, 80, 0.06),
    inset 0 1px 0 rgba(255, 255, 255, 0.95);
}

.cardHeader {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  padding-bottom: 24px;
  margin-bottom: 26px;
  border-bottom: 1px solid #dbe3ef;
}

.cardHeaderIcon {
  width: 54px;
  height: 54px;
  border-radius: 16px;
  background:
    radial-gradient(circle at 35% 25%, rgba(255, 255, 255, 0.9), transparent 38%),
    linear-gradient(135deg, #edf5ff 0%, #e4efff 100%);
  color: #1265f3;
  display: grid;
  place-items: center;
  flex-shrink: 0;
  box-shadow: inset 0 0 0 1px rgba(18, 101, 243, 0.08);
}

.cardHeader h2 {
  margin: 0 0 7px;
  font-size: 30px;
  font-weight: 950;
  color: #0d1f4d;
  letter-spacing: -0.8px;
}

.cardHeader p {
  margin: 0;
  color: #60708e;
  font-size: 15.5px;
  font-weight: 650;
}

.bottomActions {
  margin-top: 30px;
  padding: 20px 24px;
  border-radius: 18px;
  border: 1px solid #d9e3f0;
  background: rgba(255, 255, 255, 0.92);
  box-shadow: 0 16px 34px rgba(12, 34, 80, 0.055);
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 18px;
  align-items: center;
}

.secondaryBtn,
.draftBtn,
.primaryBtn,
.editBtn,
.whatsappPreviewBtn {
  height: 54px;
  border-radius: 13px;
  font-family: inherit;
  font-size: 15px;
  font-weight: 950;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  cursor: pointer;
  transition: 0.2s ease;
}

.secondaryBtn {
  border: 1px solid #cbd6e5;
  background: #ffffff;
  color: #25324e;
  box-shadow: 0 10px 22px rgba(12, 34, 80, 0.04);
}

.secondaryBtn:hover {
  background: #f4f8ff;
  transform: translateY(-1px);
}

.secondaryBtn:disabled {
  opacity: 0.42;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.draftBtn {
  border: 2px solid #2f72f5;
  background: #ffffff;
  color: #1f56cb;
  box-shadow: 0 10px 22px rgba(47, 114, 245, 0.06);
}

.draftBtn:hover {
  background: #f8fbff;
  transform: translateY(-1px);
}

.primaryBtn {
  border: 0;
  background:
    radial-gradient(circle at 20% 15%, rgba(255, 255, 255, 0.25), transparent 32%),
    linear-gradient(135deg, #1b6eff 0%, #0056f0 100%);
  color: #ffffff;
  box-shadow:
    0 18px 32px rgba(0, 91, 255, 0.2),
    inset 0 1px 0 rgba(255, 255, 255, 0.22);
}

.primaryBtn:hover {
  transform: translateY(-1px);
  box-shadow:
    0 22px 38px rgba(0, 91, 255, 0.26),
    inset 0 1px 0 rgba(255, 255, 255, 0.24);
}

.autosave {
  margin-top: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 9px;
  color: #6c7a95;
  font-size: 13.5px;
  font-weight: 750;
}

.autosave svg {
  color: #23a84f;
}

.finalActions {
  margin-top: 30px;
  padding: 20px 24px 14px;
  border-radius: 18px;
  border: 1px solid #d9e3f0;
  background: rgba(255, 255, 255, 0.92);
  box-shadow: 0 16px 34px rgba(12, 34, 80, 0.055);
  display: grid;
  grid-template-columns: 0.8fr 1fr 1.25fr 1.3fr;
  gap: 18px;
  align-items: center;
}

.editBtn {
  border: 2px solid #2f72f5;
  background: #ffffff;
  color: #1f56cb;
}

.editBtn:hover {
  background: #f4f8ff;
  transform: translateY(-1px);
}

.whatsappPreviewBtn {
  border: 2px solid #16a34a;
  background: #ffffff;
  color: #138a3d;
}

.whatsappPreviewBtn:hover {
  background: #f0fbf4;
  transform: translateY(-1px);
}

.termsText {
  grid-column: 1 / -1;
  margin: 4px 0 0;
  text-align: center;
  color: #65738f;
  font-size: 13.5px;
  font-weight: 650;
}

.termsText span {
  color: #005bea;
  font-weight: 850;
}

@media (max-width: 1180px) {
  .pageHeader {
    grid-template-columns: 1fr;
    gap: 18px;
  }

  .contentLayout {
    grid-template-columns: 1fr;
  }

  .finalActions {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 820px) {
  .wrapper {
    padding: 24px 16px 32px;
  }

  .formCard {
    padding: 24px 20px;
  }

  .bottomActions,
  .finalActions {
    grid-template-columns: 1fr;
    padding: 18px;
  }

  .cardHeader {
    flex-direction: column;
  }
}

@media (max-width: 560px) {
  .pageHeader h1 {
    font-size: 28px;
  }

  .formCard {
    border-radius: 17px;
  }
}
'@ | Set-Content -Encoding UTF8 "src/pages/Vendedor/PublicarVehiculo/PublicarVehiculo.module.css"

@'
import { Bell, ChevronDown, Save } from "lucide-react";
import styles from "./PublicarTopbar.module.css";

const PublicarTopbar = () => {
  return (
    <header className={styles.topbar}>
      <div className={styles.topbarInner}>
        <div className={styles.brand}>
          <span className={styles.logoMi}>mi</span>
          <span>vehículo</span>
        </div>

        <div className={styles.topbarDivider}></div>

        <h2 className={styles.topbarTitle}>Publicar vehículo</h2>

        <div className={styles.topbarActions}>
          <button type="button" className={styles.draftGhostBtn}>
            <Save size={18} />
            Guardar borrador
          </button>

          <button type="button" className={styles.iconBtn}>
            <Bell size={18} />
            <span>2</span>
          </button>

          <button type="button" className={styles.avatarBtn}>
            <strong>AV</strong>
            <ChevronDown size={16} />
          </button>
        </div>
      </div>
    </header>
  );
};

export default PublicarTopbar;
'@ | Set-Content -Encoding UTF8 "src/pages/Vendedor/PublicarVehiculo/components/PublicarTopbar.jsx"

@'
.topbar {
  background:
    radial-gradient(circle at 16% 0%, rgba(43, 118, 255, 0.22), transparent 30%),
    linear-gradient(90deg, #04173d 0%, #06245c 50%, #04173d 100%);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 16px 38px rgba(4, 19, 54, 0.18);
}

.topbarInner {
  width: min(100%, 1360px);
  min-height: 82px;
  margin: 0 auto;
  padding: 0 28px;
  display: flex;
  align-items: center;
  gap: 20px;
}

.brand {
  color: #ffffff;
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 31px;
  font-style: italic;
  font-weight: 950;
  letter-spacing: -1.3px;
}

.logoMi {
  color: #1476ff;
}

.topbarDivider {
  width: 1px;
  height: 38px;
  background: rgba(255, 255, 255, 0.24);
}

.topbarTitle {
  margin: 0;
  color: #ffffff;
  font-size: 20px;
  font-weight: 900;
}

.topbarActions {
  margin-left: auto;
  display: flex;
  align-items: center;
  gap: 14px;
}

.draftGhostBtn,
.iconBtn,
.avatarBtn {
  border: 0;
  color: #ffffff;
  font-family: inherit;
  cursor: pointer;
}

.draftGhostBtn {
  height: 44px;
  padding: 0 18px;
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.48);
  background: transparent;
  display: inline-flex;
  align-items: center;
  gap: 10px;
  font-size: 14px;
  font-weight: 850;
  transition: 0.2s ease;
}

.draftGhostBtn:hover {
  background: rgba(255, 255, 255, 0.08);
}

.iconBtn {
  position: relative;
  width: 42px;
  height: 42px;
  border-radius: 13px;
  background: rgba(255, 255, 255, 0.08);
  display: grid;
  place-items: center;
  transition: 0.2s ease;
}

.iconBtn span {
  position: absolute;
  top: -5px;
  right: -5px;
  width: 19px;
  height: 19px;
  border-radius: 50%;
  background: #1265f3;
  color: #ffffff;
  display: grid;
  place-items: center;
  font-size: 11px;
  font-weight: 950;
}

.avatarBtn {
  min-height: 46px;
  padding: 0 10px 0 0;
  border-radius: 999px;
  background: transparent;
  display: inline-flex;
  align-items: center;
  gap: 10px;
}

.avatarBtn strong {
  width: 42px;
  height: 42px;
  border-radius: 50%;
  background:
    radial-gradient(circle at 35% 25%, rgba(255, 255, 255, 0.28), transparent 36%),
    linear-gradient(135deg, #66799d 0%, #3b4c70 100%);
  display: grid;
  place-items: center;
  font-size: 14px;
  font-weight: 900;
  box-shadow: 0 10px 22px rgba(0, 0, 0, 0.18);
}

@media (max-width: 820px) {
  .topbarInner {
    min-height: 74px;
    padding: 0 16px;
  }

  .topbarDivider,
  .draftGhostBtn {
    display: none;
  }

  .brand {
    font-size: 24px;
  }

  .topbarTitle {
    font-size: 16px;
  }
}
'@ | Set-Content -Encoding UTF8 "src/pages/Vendedor/PublicarVehiculo/components/PublicarTopbar.module.css"

@'
import { Check } from "lucide-react";
import styles from "./PublicarStepper.module.css";

const PublicarStepper = ({ steps, currentStep, onStepClick }) => {
  return (
    <div className={styles.stepsNav}>
      {steps.map((step, index) => {
        const isActive = step.id === currentStep;
        const isCompleted = step.id < currentStep;

        return (
          <div key={step.id} className={styles.stepItemWrapper}>
            <button
              type="button"
              className={`${styles.stepItem} ${
                isActive ? styles.stepActive : ""
              } ${isCompleted ? styles.stepCompleted : ""}`}
              onClick={() => onStepClick(step.id)}
            >
              <div className={styles.stepCircle}>
                {isCompleted ? <Check size={16} /> : step.id}
              </div>

              <span>{step.label}</span>
            </button>

            {index < steps.length - 1 && <div className={styles.stepLine}></div>}
          </div>
        );
      })}
    </div>
  );
};

export default PublicarStepper;
'@ | Set-Content -Encoding UTF8 "src/pages/Vendedor/PublicarVehiculo/components/PublicarStepper.jsx"

@'
.stepsNav {
  display: grid;
  grid-template-columns: repeat(7, minmax(105px, 1fr));
  gap: 0;
  padding-top: 6px;
}

.stepItemWrapper {
  position: relative;
  display: flex;
  align-items: flex-start;
}

.stepItem {
  width: 100%;
  border: 0;
  background: transparent;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  padding: 0;
  cursor: pointer;
  color: #7a879f;
  font-family: inherit;
}

.stepCircle {
  width: 39px;
  height: 39px;
  border-radius: 50%;
  border: 2px solid #d1dae9;
  background: linear-gradient(180deg, #ffffff 0%, #f8fafc 100%);
  display: grid;
  place-items: center;
  font-size: 15px;
  font-weight: 950;
  color: #3c4965;
  position: relative;
  z-index: 2;
  box-shadow: 0 7px 16px rgba(15, 35, 80, 0.04);
}

.stepItem span {
  max-width: 120px;
  min-height: 38px;
  font-size: 13.5px;
  font-weight: 850;
  line-height: 1.35;
  text-align: center;
}

.stepLine {
  position: absolute;
  top: 19px;
  left: calc(50% + 22px);
  right: calc(-50% + 22px);
  height: 2px;
  background: #d8e1ee;
}

.stepActive .stepCircle {
  border-color: #125ff0;
  background: linear-gradient(135deg, #1d77ff 0%, #0056e8 100%);
  color: #ffffff;
  box-shadow: 0 12px 24px rgba(0, 91, 255, 0.2);
}

.stepCompleted .stepCircle {
  border-color: #23a84f;
  background: #ffffff;
  color: #23a84f;
}

.stepActive span {
  color: #1057d8;
}

.stepCompleted span {
  color: #53637f;
}

.stepCompleted .stepLine {
  background: #1265f3;
}

@media (max-width: 1180px) {
  .stepsNav {
    grid-template-columns: repeat(7, minmax(112px, 1fr));
    overflow-x: auto;
    padding-bottom: 8px;
  }
}

@media (max-width: 560px) {
  .stepItem span {
    font-size: 12px;
  }

  .stepCircle {
    width: 34px;
    height: 34px;
    font-size: 14px;
  }
}
'@ | Set-Content -Encoding UTF8 "src/pages/Vendedor/PublicarVehiculo/components/PublicarStepper.module.css"

@'
import {
  CalendarDays,
  Car,
  CheckCircle,
  ClipboardList,
  CreditCard,
  FileCheck,
  Gauge,
  Headphones,
  Image,
  MapPin,
  Settings2,
} from "lucide-react";
import styles from "./PublicarSidebar.module.css";

const iconsByText = {
  "Tipo de vehículo": Car,
  "Marca y modelo": CheckCircle,
  "Año y versión": CalendarDays,
  Kilometraje: Gauge,
  "Condición del vehículo": CheckCircle,
  Precio: CreditCard,
  Moneda: CreditCard,
  Permuta: CheckCircle,
  Negociable: CheckCircle,
  Financiación: CreditCard,
  Combustible: Settings2,
  Transmisión: Settings2,
  Motor: Settings2,
  Color: Settings2,
  Puertas: Car,
  Carrocería: Car,
  Tracción: Settings2,
  Documentación: FileCheck,
  "Estado mecánico": CheckCircle,
  Observaciones: ClipboardList,
  "Fotos del vehículo": Image,
  "Ubicación del vehículo": MapPin,
  "Datos de contacto": CheckCircle,
  "Horario de contacto": CalendarDays,
  "Preferencias de visibilidad": CheckCircle,
  "Revisar tu publicación antes de hacerla pública": ClipboardList,
};

const PublicarSidebar = ({ currentStep, totalSteps, stepData }) => {
  if (!stepData) {
    return null;
  }

  return (
    <aside className={styles.sidebar}>
      <div className={styles.sideCard}>
        <div className={styles.sideIcon}>
          <ClipboardList size={22} />
        </div>

        <p className={styles.sideStep}>
          Paso {currentStep} de {totalSteps}
        </p>

        <h3>{stepData.title}</h3>
        <p className={styles.sideText}>{stepData.sideText}</p>

        <div className={styles.sideDivider}></div>

        <div className={styles.sideHelpBlock}>
          <h4>{stepData.helpTitle}</h4>

          <ul>
            {stepData.helpItems.map((item) => {
              const Icon = iconsByText[item] || CheckCircle;

              return (
                <li key={item}>
                  <span className={styles.bulletIcon}>
                    <Icon size={14} />
                  </span>
                  {item}
                </li>
              );
            })}
          </ul>
        </div>
      </div>

      <div className={styles.helpCard}>
        <div className={styles.helpHead}>
          <div className={styles.helpIcon}>
            <Headphones size={21} />
          </div>

          <div>
            <h4>¿Necesitás ayuda?</h4>
            <p>Nuestro equipo está para acompañarte en todo el proceso.</p>
          </div>
        </div>

        <button type="button" className={styles.supportBtn}>
          Contactar soporte
        </button>
      </div>
    </aside>
  );
};

export default PublicarSidebar;
'@ | Set-Content -Encoding UTF8 "src/pages/Vendedor/PublicarVehiculo/components/PublicarSidebar.jsx"

@'
.sidebar {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.sideCard,
.helpCard {
  border-radius: 20px;
  border: 1px solid #c6d3e4;
  box-shadow:
    0 18px 42px rgba(15, 35, 80, 0.08),
    inset 0 1px 0 rgba(255, 255, 255, 0.9);
}

.sideCard {
  padding: 22px;
  background:
    radial-gradient(circle at 20% 0%, rgba(26, 110, 255, 0.13), transparent 38%),
    linear-gradient(180deg, #eef3f9 0%, #e6edf6 100%);
}

.helpCard {
  padding: 20px;
  background:
    radial-gradient(circle at 85% 10%, rgba(26, 110, 255, 0.13), transparent 34%),
    linear-gradient(180deg, #eef3f9 0%, #e5ecf5 100%);
}

.sideIcon {
  width: 54px;
  height: 54px;
  border-radius: 17px;
  background: linear-gradient(135deg, #1c6eff 0%, #0957ec 100%);
  color: #ffffff;
  display: grid;
  place-items: center;
  margin-bottom: 18px;
  box-shadow:
    0 12px 24px rgba(26, 110, 255, 0.2),
    inset 0 1px 0 rgba(255, 255, 255, 0.22);
}

.sideStep {
  margin: 0 0 8px;
  color: #1265f3;
  font-size: 15px;
  font-weight: 950;
}

.sideCard h3 {
  margin: 0 0 14px;
  font-size: 24px;
  line-height: 1.14;
  font-weight: 950;
  color: #0b1d49;
  letter-spacing: -0.45px;
}

.sideText {
  margin: 0;
  color: #5d6d88;
  font-size: 15px;
  line-height: 1.65;
  font-weight: 650;
}

.sideDivider {
  height: 1px;
  background: linear-gradient(90deg, transparent, #c4d0df, transparent);
  margin: 22px 0;
}

.sideHelpBlock h4 {
  margin: 0 0 14px;
  font-size: 15px;
  font-weight: 950;
  color: #13224c;
}

.sideHelpBlock ul {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 13px;
}

.sideHelpBlock li {
  display: flex;
  align-items: center;
  gap: 10px;
  color: #556684;
  font-size: 14px;
  font-weight: 750;
}

.bulletIcon {
  width: 25px;
  height: 25px;
  border-radius: 9px;
  background: #dfe8f4;
  color: #1d63e7;
  display: grid;
  place-items: center;
  flex-shrink: 0;
  box-shadow: inset 0 0 0 1px rgba(47, 109, 240, 0.1);
}

.helpHead {
  display: flex;
  align-items: flex-start;
  gap: 14px;
}

.helpIcon {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background:
    radial-gradient(circle at 35% 24%, rgba(255, 255, 255, 0.85), transparent 38%),
    #dfe9f8;
  color: #1a6eff;
  display: grid;
  place-items: center;
  flex-shrink: 0;
  box-shadow: 0 10px 20px rgba(26, 110, 255, 0.12);
}

.helpHead h4 {
  margin: 0 0 6px;
  font-size: 16px;
  font-weight: 950;
  color: #10204c;
}

.helpHead p {
  margin: 0;
  color: #65738f;
  font-size: 14px;
  line-height: 1.55;
  font-weight: 650;
}

.supportBtn {
  margin-top: 18px;
  width: 100%;
  height: 48px;
  border-radius: 13px;
  border: 2px solid #2f72f5;
  background: #ffffff;
  color: #1a60e8;
  font-family: inherit;
  font-size: 15px;
  font-weight: 950;
  cursor: pointer;
  transition: 0.2s ease;
  box-shadow: 0 10px 22px rgba(47, 114, 245, 0.08);
}

.supportBtn:hover {
  background: #eef4ff;
  transform: translateY(-1px);
}

@media (max-width: 1180px) {
  .sidebar {
    order: 2;
  }
}

@media (max-width: 560px) {
  .sideCard,
  .helpCard {
    padding: 18px;
    border-radius: 17px;
  }
}
'@ | Set-Content -Encoding UTF8 "src/pages/Vendedor/PublicarVehiculo/components/PublicarSidebar.module.css"

@'
import { Gauge, Info, Sparkles } from "lucide-react";
import styles from "./DatosBasicosStep.module.css";

const DatosBasicosStep = ({ formData, onChange }) => {
  const setValue = (name, value) => {
    onChange({
      target: {
        name,
        value,
      },
    });
  };

  return (
    <>
      <div className={styles.formGrid}>
        <div className={styles.field}>
          <label>
            Tipo de vehículo <span>*</span>
          </label>
          <select
            name="tipoVehiculo"
            value={formData.tipoVehiculo}
            onChange={onChange}
          >
            <option value="">Seleccioná el tipo</option>
            <option value="Auto">Auto</option>
            <option value="Moto">Moto</option>
            <option value="Camioneta">Camioneta</option>
            <option value="Camión">Camión</option>
          </select>
        </div>

        <div className={styles.field}>
          <label>
            Marca <span>*</span>
          </label>
          <select name="marca" value={formData.marca} onChange={onChange}>
            <option value="">Seleccioná la marca</option>
            <option value="Toyota">Toyota</option>
            <option value="Volkswagen">Volkswagen</option>
            <option value="Ford">Ford</option>
            <option value="Chevrolet">Chevrolet</option>
            <option value="Peugeot">Peugeot</option>
            <option value="Fiat">Fiat</option>
            <option value="Renault">Renault</option>
          </select>
        </div>

        <div className={styles.field}>
          <label>
            Modelo <span>*</span>
          </label>
          <select
            name="modelo"
            value={formData.modelo}
            onChange={onChange}
            className={!formData.modelo ? styles.fieldError : ""}
          >
            <option value="">Seleccioná el modelo</option>
            <option value="Corolla">Corolla</option>
            <option value="Hilux">Hilux</option>
            <option value="Golf">Golf</option>
            <option value="Focus">Focus</option>
            <option value="Cruze">Cruze</option>
            <option value="208">208</option>
          </select>
          {!formData.modelo && <p className={styles.errorText}>Campo obligatorio</p>}
        </div>

        <div className={styles.field}>
          <label>
            Año <span>*</span>
          </label>
          <input
            type="text"
            name="anio"
            value={formData.anio}
            onChange={onChange}
            placeholder="Ej.: 2018"
          />
        </div>

        <div className={styles.field}>
          <label>Versión</label>
          <input
            type="text"
            name="version"
            value={formData.version}
            onChange={onChange}
            placeholder="Ej.: 1.6 Trendline"
          />
        </div>

        <div className={styles.field}>
          <label>
            Kilometraje <span>*</span>
          </label>
          <div className={styles.inputWithSuffix}>
            <input
              type="text"
              name="kilometraje"
              value={formData.kilometraje}
              onChange={onChange}
              placeholder="Ej.: 85000"
            />
            <span>km</span>
          </div>
        </div>

        <div className={`${styles.field} ${styles.conditionField}`}>
          <label>
            Condición <span>*</span>
          </label>

          <div className={styles.conditionGrid}>
            <button
              type="button"
              className={`${styles.conditionCard} ${
                formData.condicion === "Nuevo" ? styles.conditionActive : ""
              }`}
              onClick={() => setValue("condicion", "Nuevo")}
            >
              <span className={styles.conditionIcon}>
                <Sparkles size={29} />
              </span>

              <span className={styles.conditionContent}>
                <strong>Nuevo</strong>
                <small>0 km. Sin uso previo.</small>
              </span>
            </button>

            <button
              type="button"
              className={`${styles.conditionCard} ${
                formData.condicion === "Usado" ? styles.conditionActive : ""
              }`}
              onClick={() => setValue("condicion", "Usado")}
            >
              <span className={styles.conditionIcon}>
                <Gauge size={29} />
              </span>

              <span className={styles.conditionContent}>
                <strong>Usado</strong>
                <small>Con uso previo.</small>
              </span>
            </button>
          </div>
        </div>
      </div>

      <div className={styles.infoNotice}>
        <Info size={18} />
        <p>
          Todos los campos marcados con <span>*</span> son obligatorios.
        </p>
      </div>
    </>
  );
};

export default DatosBasicosStep;
'@ | Set-Content -Encoding UTF8 "src/pages/Vendedor/PublicarVehiculo/steps/DatosBasicos/DatosBasicosStep.jsx"

@'
.formGrid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 22px 28px;
}

.field {
  min-width: 0;
}

.field label {
  display: block;
  margin-bottom: 8px;
  font-size: 13.7px;
  font-weight: 900;
  color: #18264d;
}

.field label span {
  color: #ff4055;
}

.field input,
.field select {
  width: 100%;
  height: 54px;
  border-radius: 12px;
  border: 1px solid #cbd6e5;
  background: linear-gradient(180deg, #ffffff 0%, #fbfcff 100%);
  padding: 0 16px;
  outline: none;
  color: #12214b;
  font-family: inherit;
  font-size: 14px;
  font-weight: 650;
  transition: 0.18s ease;
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.95),
    0 5px 14px rgba(10, 28, 70, 0.025);
}

.field input::placeholder {
  color: #94a2b8;
}

.field input:focus,
.field select:focus {
  border-color: #216ff3;
  background: #ffffff;
  box-shadow:
    0 0 0 4px rgba(33, 111, 243, 0.11),
    0 10px 22px rgba(33, 111, 243, 0.055);
}

.fieldError {
  border-color: #ff3d4f !important;
  box-shadow: 0 0 0 4px rgba(255, 61, 79, 0.08) !important;
}

.errorText {
  margin: 8px 0 0;
  color: #ff3347;
  font-size: 13px;
  font-weight: 850;
}

.inputWithSuffix {
  position: relative;
}

.inputWithSuffix input {
  padding-right: 52px;
}

.inputWithSuffix span {
  position: absolute;
  right: 14px;
  top: 50%;
  transform: translateY(-50%);
  color: #6d7b91;
  font-size: 14px;
  font-weight: 850;
}

.conditionField {
  grid-column: 1 / -1;
}

.conditionGrid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 28px;
}

.conditionCard {
  position: relative;
  min-height: 108px;
  border-radius: 14px;
  border: 1px solid #cfd8e6;
  background: linear-gradient(180deg, #ffffff 0%, #fbfcff 100%);
  padding: 0 28px;
  display: flex;
  align-items: center;
  gap: 22px;
  font-family: inherit;
  cursor: pointer;
  color: #172550;
  transition: 0.2s ease;
  box-shadow: 0 8px 18px rgba(12, 34, 80, 0.035);
}

.conditionCard:hover {
  border-color: #2d72f6;
  background: #f8fbff;
  transform: translateY(-1px);
}

.conditionActive {
  border: 2px solid #1a6eff;
  background:
    radial-gradient(circle at 18% 20%, rgba(26, 110, 255, 0.06), transparent 32%),
    #ffffff;
  box-shadow:
    0 0 0 4px rgba(26, 110, 255, 0.08),
    0 14px 26px rgba(26, 110, 255, 0.08);
}

.conditionActive::after {
  content: "✓";
  position: absolute;
  top: 16px;
  right: 16px;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: #1265f3;
  color: #ffffff;
  display: grid;
  place-items: center;
  font-size: 14px;
  font-weight: 950;
}

.conditionIcon {
  width: 66px;
  height: 66px;
  border-radius: 50%;
  display: grid;
  place-items: center;
  color: #1a6eff;
  background: #eaf2ff;
}

.conditionCard:not(.conditionActive) .conditionIcon {
  color: #7d8aa1;
  background: #eef1f5;
}

.conditionContent {
  display: flex;
  flex-direction: column;
  gap: 4px;
  text-align: left;
}

.conditionContent strong {
  font-size: 18px;
  font-weight: 950;
  color: #14214a;
}

.conditionContent small {
  font-size: 14px;
  font-weight: 700;
  color: #687791;
}

.infoNotice {
  margin-top: 22px;
  min-height: 52px;
  border-radius: 14px;
  background: linear-gradient(90deg, #eef5ff 0%, #f5f9ff 100%);
  color: #536b96;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 0 16px;
  font-size: 13.7px;
  font-weight: 750;
  border: 1px solid rgba(190, 211, 246, 0.42);
}

.infoNotice p {
  margin: 0;
}

.infoNotice span {
  color: #ff3347;
  font-weight: 950;
}

@media (max-width: 820px) {
  .formGrid,
  .conditionGrid {
    grid-template-columns: 1fr;
  }

  .conditionField {
    grid-column: span 1;
  }
}
'@ | Set-Content -Encoding UTF8 "src/pages/Vendedor/PublicarVehiculo/steps/DatosBasicos/DatosBasicosStep.module.css"

@'
import {
  ArrowLeftRight,
  Ban,
  Building2,
  CircleSlash,
  Info,
  Lock,
  Tag,
  TrendingUp,
} from "lucide-react";
import styles from "./PrecioOperacionStep.module.css";

const PrecioOperacionStep = ({ formData, onChange }) => {
  const setValue = (name, value) => {
    onChange({
      target: {
        name,
        value,
      },
    });
  };

  return (
    <>
      <div className={styles.priceHeaderNote}>
        <div className={styles.priceNoteIcon}>
          <TrendingUp size={24} />
        </div>
        <p>Un precio competitivo ayuda a recibir más consultas.</p>
      </div>

      <div className={styles.formGrid}>
        <div className={styles.field}>
          <label>
            Precio <span>*</span>
          </label>
          <div className={styles.inputWithPrefix}>
            <span>$</span>
            <input
              type="text"
              name="precio"
              value={formData.precio}
              onChange={onChange}
              placeholder="18.900.000"
            />
          </div>
        </div>

        <div className={styles.field}>
          <label>
            Moneda <span>*</span>
          </label>
          <select name="moneda" value={formData.moneda} onChange={onChange}>
            <option value="ARS">ARS - Peso argentino</option>
            <option value="USD">USD - Dólar estadounidense</option>
          </select>
        </div>

        <div className={styles.optionGroup}>
          <label>Acepta permuta</label>
          <div className={styles.compactOptionGrid}>
            <button
              type="button"
              className={`${styles.choiceCard} ${
                formData.aceptaPermuta === "Si" ? styles.choiceActive : ""
              }`}
              onClick={() => setValue("aceptaPermuta", "Si")}
            >
              <span className={styles.choiceIcon}>
                <ArrowLeftRight size={27} />
              </span>
              <span className={styles.choiceText}>
                <strong>Sí, acepto permuta</strong>
              </span>
            </button>

            <button
              type="button"
              className={`${styles.choiceCard} ${
                formData.aceptaPermuta === "No" ? styles.choiceActive : ""
              }`}
              onClick={() => setValue("aceptaPermuta", "No")}
            >
              <span className={styles.choiceIcon}>
                <CircleSlash size={27} />
              </span>
              <span className={styles.choiceText}>
                <strong>No acepto permuta</strong>
              </span>
            </button>
          </div>
        </div>

        <div className={styles.optionGroup}>
          <label>Precio negociable</label>
          <div className={styles.compactOptionGrid}>
            <button
              type="button"
              className={`${styles.choiceCard} ${
                formData.precioNegociable === "Si" ? styles.choiceActive : ""
              }`}
              onClick={() => setValue("precioNegociable", "Si")}
            >
              <span className={styles.choiceIcon}>
                <Tag size={27} />
              </span>
              <span className={styles.choiceText}>
                <strong>Sí, negociable</strong>
              </span>
            </button>

            <button
              type="button"
              className={`${styles.choiceCard} ${
                formData.precioNegociable === "No" ? styles.choiceActive : ""
              }`}
              onClick={() => setValue("precioNegociable", "No")}
            >
              <span className={styles.choiceIcon}>
                <Lock size={27} />
              </span>
              <span className={styles.choiceText}>
                <strong>No, precio fijo</strong>
              </span>
            </button>
          </div>
        </div>

        <div className={styles.fullField}>
          <label>Financiación</label>
          <div className={styles.wideOptionGrid}>
            <button
              type="button"
              className={`${styles.choiceCard} ${
                formData.financiacion === "Si" ? styles.choiceActive : ""
              }`}
              onClick={() => setValue("financiacion", "Si")}
            >
              <span className={styles.choiceIcon}>
                <Building2 size={27} />
              </span>
              <span className={styles.choiceText}>
                <strong>Sí, ofrezco financiación</strong>
              </span>
            </button>

            <button
              type="button"
              className={`${styles.choiceCard} ${
                formData.financiacion === "No" ? styles.choiceActive : ""
              }`}
              onClick={() => setValue("financiacion", "No")}
            >
              <span className={styles.choiceIcon}>
                <Ban size={27} />
              </span>
              <span className={styles.choiceText}>
                <strong>No ofrezco financiación</strong>
              </span>
            </button>
          </div>
        </div>

        <div className={styles.fullField}>
          <label>Información adicional sobre financiación</label>
          <div className={styles.textareaWrap}>
            <textarea
              name="infoFinanciacion"
              value={formData.infoFinanciacion || ""}
              onChange={onChange}
              maxLength={500}
              placeholder="Ej.: Entidad financiera, monto máximo, tasa, plazo, etc."
            />
            <span>{formData.infoFinanciacion?.length || 0}/500</span>
          </div>
        </div>
      </div>

      <div className={styles.infoNotice}>
        <Info size={18} />
        <p>Completá esta información con claridad para evitar consultas innecesarias.</p>
      </div>
    </>
  );
};

export default PrecioOperacionStep;
'@ | Set-Content -Encoding UTF8 "src/pages/Vendedor/PublicarVehiculo/steps/PrecioOperacion/PrecioOperacionStep.jsx"

@'
.formGrid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 22px 28px;
}

.priceHeaderNote {
  width: fit-content;
  min-height: 74px;
  margin-left: auto;
  margin-top: -98px;
  margin-bottom: 26px;
  padding: 0 22px;
  border-radius: 13px;
  border: 1px solid #cddcf2;
  background: linear-gradient(180deg, #f5f9ff 0%, #eef5ff 100%);
  display: flex;
  align-items: center;
  gap: 16px;
  color: #526b99;
  box-shadow:
    0 12px 28px rgba(12, 34, 80, 0.045),
    inset 0 1px 0 rgba(255, 255, 255, 0.95);
}

.priceHeaderNote p {
  max-width: 245px;
  margin: 0;
  font-size: 14px;
  line-height: 1.45;
  font-weight: 700;
}

.priceNoteIcon {
  width: 46px;
  height: 46px;
  border-radius: 50%;
  background: linear-gradient(135deg, #1b6eff 0%, #0056f0 100%);
  color: #ffffff;
  display: grid;
  place-items: center;
  flex-shrink: 0;
}

.field,
.optionGroup,
.fullField {
  min-width: 0;
}

.field label,
.optionGroup > label,
.fullField > label {
  display: block;
  margin-bottom: 10px;
  font-size: 13.7px;
  font-weight: 900;
  color: #18264d;
}

.field label span {
  color: #ff4055;
}

.field input,
.field select,
.textareaWrap textarea {
  width: 100%;
  border-radius: 12px;
  border: 1px solid #cbd6e5;
  background: linear-gradient(180deg, #ffffff 0%, #fbfcff 100%);
  outline: none;
  color: #12214b;
  font-family: inherit;
  font-size: 14px;
  font-weight: 650;
}

.field input,
.field select {
  height: 54px;
  padding: 0 16px;
}

.field input:focus,
.field select:focus,
.textareaWrap textarea:focus {
  border-color: #216ff3;
  box-shadow: 0 0 0 4px rgba(33, 111, 243, 0.11);
}

.inputWithPrefix {
  position: relative;
}

.inputWithPrefix span {
  position: absolute;
  left: 18px;
  top: 50%;
  transform: translateY(-50%);
  color: #6d7b91;
  font-size: 15px;
  font-weight: 850;
  z-index: 2;
}

.inputWithPrefix input {
  padding-left: 42px;
}

.fullField {
  grid-column: 1 / -1;
}

.compactOptionGrid,
.wideOptionGrid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px;
}

.choiceCard {
  position: relative;
  min-height: 92px;
  border-radius: 14px;
  border: 1px solid #cfd8e6;
  background: linear-gradient(180deg, #ffffff 0%, #fbfcff 100%);
  padding: 0 22px;
  display: flex;
  align-items: center;
  gap: 18px;
  font-family: inherit;
  cursor: pointer;
  color: #172550;
  transition: 0.2s ease;
  box-shadow: 0 8px 18px rgba(12, 34, 80, 0.035);
  text-align: left;
}

.choiceCard:hover {
  border-color: #2d72f6;
  background: #f8fbff;
  transform: translateY(-1px);
}

.choiceActive {
  border: 2px solid #1a6eff;
  background: #ffffff;
  box-shadow:
    0 0 0 4px rgba(26, 110, 255, 0.08),
    0 14px 26px rgba(26, 110, 255, 0.08);
}

.choiceActive::after {
  content: "✓";
  position: absolute;
  top: 14px;
  right: 14px;
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background: #1265f3;
  color: #ffffff;
  display: grid;
  place-items: center;
  font-size: 13px;
  font-weight: 950;
}

.choiceIcon {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: #eef2f7;
  color: #7d8aa1;
  display: grid;
  place-items: center;
  flex-shrink: 0;
}

.choiceActive .choiceIcon {
  background: #eaf2ff;
  color: #1a6eff;
}

.choiceText strong {
  font-size: 15px;
  font-weight: 900;
  color: #14214a;
  line-height: 1.25;
}

.textareaWrap {
  position: relative;
}

.textareaWrap textarea {
  min-height: 82px;
  resize: vertical;
  padding: 16px 18px 28px;
  line-height: 1.5;
}

.textareaWrap span {
  position: absolute;
  right: 14px;
  bottom: 10px;
  color: #7a879f;
  font-size: 12.5px;
  font-weight: 800;
}

.infoNotice {
  margin-top: 22px;
  min-height: 52px;
  border-radius: 14px;
  background: linear-gradient(90deg, #eef5ff 0%, #f5f9ff 100%);
  color: #536b96;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 0 16px;
  font-size: 13.7px;
  font-weight: 750;
  border: 1px solid rgba(190, 211, 246, 0.42);
}

.infoNotice p {
  margin: 0;
}

@media (max-width: 1180px) {
  .priceHeaderNote {
    margin-top: 0;
    margin-left: 0;
    width: 100%;
  }
}

@media (max-width: 820px) {
  .formGrid,
  .compactOptionGrid,
  .wideOptionGrid {
    grid-template-columns: 1fr;
  }
}
'@ | Set-Content -Encoding UTF8 "src/pages/Vendedor/PublicarVehiculo/steps/PrecioOperacion/PrecioOperacionStep.module.css"

@'
import {
  Car,
  Droplets,
  Fuel,
  Gauge,
  Info,
  Settings2,
  SlidersHorizontal,
} from "lucide-react";
import styles from "./CaracteristicasStep.module.css";

const fuelOptions = ["Nafta", "Diésel", "GNC", "Híbrido", "Eléctrico"];
const transmissionOptions = ["Manual", "Automática"];
const motorOptions = ["1.0", "1.4", "1.6", "2.0+"];
const doorsOptions = ["2", "3", "4", "5"];
const bodyOptions = ["Sedán", "Hatchback", "SUV", "Pick up", "Rural/SW", "Coupé"];
const tractionOptions = ["Delantera 4x2", "Trasera 4x2", "Integral 4x4"];
const colorOptions = [
  { label: "Blanco", value: "Blanco", className: "white" },
  { label: "Gris claro", value: "Gris claro", className: "lightGray" },
  { label: "Negro", value: "Negro", className: "black" },
  { label: "Gris oscuro", value: "Gris oscuro", className: "darkGray" },
  { label: "Azul", value: "Azul", className: "blue" },
  { label: "Rojo", value: "Rojo", className: "red" },
  { label: "Plateado", value: "Plateado", className: "silver" },
  { label: "Beige", value: "Beige", className: "beige" },
];

const CaracteristicasStep = ({ formData, onChange }) => {
  const setValue = (name, value) => {
    onChange({
      target: {
        name,
        value,
      },
    });
  };

  const chipList = (name, options, wrap = false) => (
    <div className={wrap ? styles.chipRowWrap : styles.chipRow}>
      {options.map((option) => (
        <button
          key={option}
          type="button"
          className={`${styles.miniChip} ${
            formData[name] === option ? styles.miniChipActive : ""
          }`}
          onClick={() => setValue(name, option)}
        >
          {option}
        </button>
      ))}
    </div>
  );

  return (
    <>
      <div className={styles.featuresGrid}>
        <div className={styles.featureGroup}>
          <div className={styles.field}>
            <label>
              Combustible <span>*</span>
            </label>
            <div className={styles.iconSelect}>
              <Fuel size={20} />
              <select name="combustible" value={formData.combustible} onChange={onChange}>
                {fuelOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
          </div>
          {chipList("combustible", fuelOptions)}
        </div>

        <div className={styles.featureGroup}>
          <div className={styles.field}>
            <label>
              Transmisión <span>*</span>
            </label>
            <div className={styles.iconSelect}>
              <SlidersHorizontal size={20} />
              <select name="transmision" value={formData.transmision} onChange={onChange}>
                {transmissionOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
          </div>
          {chipList("transmision", transmissionOptions)}
        </div>

        <div className={styles.featureGroup}>
          <div className={styles.field}>
            <label>
              Motor <span>*</span>
            </label>
            <div className={styles.iconSelect}>
              <Settings2 size={20} />
              <select name="motor" value={formData.motor} onChange={onChange}>
                {motorOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
          </div>
          {chipList("motor", motorOptions)}
        </div>

        <div className={styles.featureGroup}>
          <div className={styles.field}>
            <label>
              Color <span>*</span>
            </label>
            <div className={styles.iconSelect}>
              <Droplets size={20} />
              <select name="color" value={formData.color} onChange={onChange}>
                {colorOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className={styles.colorPickerRow}>
            {colorOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                aria-label={option.label}
                className={`${styles.colorDot} ${styles[option.className]} ${
                  formData.color === option.value ? styles.colorDotActive : ""
                }`}
                onClick={() => setValue("color", option.value)}
              ></button>
            ))}
          </div>
        </div>

        <div className={styles.featureGroup}>
          <div className={styles.field}>
            <label>
              Puertas <span>*</span>
            </label>
            <div className={styles.iconSelect}>
              <Car size={20} />
              <select name="puertas" value={formData.puertas} onChange={onChange}>
                {doorsOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
          </div>
          {chipList("puertas", doorsOptions)}
        </div>

        <div className={styles.featureGroup}>
          <div className={styles.field}>
            <label>
              Carrocería <span>*</span>
            </label>
            <div className={styles.iconSelect}>
              <Car size={20} />
              <select name="carroceria" value={formData.carroceria} onChange={onChange}>
                {bodyOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
          </div>
          {chipList("carroceria", bodyOptions, true)}
        </div>

        <div className={styles.featureGroup}>
          <div className={styles.field}>
            <label>
              Tracción <span>*</span>
            </label>
            <div className={styles.iconSelect}>
              <Gauge size={20} />
              <select name="traccion" value={formData.traccion} onChange={onChange}>
                {tractionOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
          </div>
          {chipList("traccion", tractionOptions, true)}
        </div>
      </div>

      <div className={styles.infoNotice}>
        <Info size={18} />
        <p>Cuanta más precisa sea la información, más rápido te encontrarán los compradores.</p>
      </div>
    </>
  );
};

export default CaracteristicasStep;
'@ | Set-Content -Encoding UTF8 "src/pages/Vendedor/PublicarVehiculo/steps/Caracteristicas/CaracteristicasStep.jsx"

@'
.featuresGrid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 28px 28px;
}

.featureGroup {
  min-width: 0;
}

.field label {
  display: block;
  margin-bottom: 8px;
  font-size: 13.7px;
  font-weight: 900;
  color: #18264d;
}

.field label span {
  color: #ff4055;
}

.iconSelect {
  position: relative;
  display: flex;
  align-items: center;
}

.iconSelect svg {
  position: absolute;
  left: 16px;
  color: #52627d;
  z-index: 2;
}

.iconSelect select {
  width: 100%;
  height: 54px;
  border-radius: 12px;
  border: 1px solid #cbd6e5;
  background: linear-gradient(180deg, #ffffff 0%, #fbfcff 100%);
  padding: 0 16px 0 48px;
  outline: none;
  color: #12214b;
  font-family: inherit;
  font-size: 14px;
  font-weight: 650;
}

.iconSelect select:focus {
  border-color: #216ff3;
  box-shadow: 0 0 0 4px rgba(33, 111, 243, 0.11);
}

.chipRow,
.chipRowWrap,
.colorPickerRow {
  margin-top: 12px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.chipRow {
  flex-wrap: nowrap;
}

.chipRowWrap {
  flex-wrap: wrap;
}

.miniChip {
  min-height: 36px;
  padding: 0 13px;
  border-radius: 8px;
  border: 1px solid #d3dce9;
  background: #ffffff;
  color: #4b5b78;
  font-family: inherit;
  font-size: 12.5px;
  font-weight: 800;
  cursor: pointer;
  transition: 0.18s ease;
  white-space: nowrap;
}

.miniChip:hover {
  border-color: #2d72f6;
  color: #1265f3;
  background: #f7faff;
}

.miniChipActive {
  border-color: #1265f3;
  color: #005bea;
  background: #eef5ff;
  box-shadow: 0 0 0 3px rgba(18, 101, 243, 0.08);
}

.miniChipActive::after {
  content: "✓";
  margin-left: 6px;
  font-weight: 950;
}

.colorPickerRow {
  gap: 14px;
}

.colorDot {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: 2px solid transparent;
  cursor: pointer;
  transition: 0.18s ease;
  box-shadow: 0 6px 14px rgba(12, 34, 80, 0.12);
}

.colorDotActive {
  border-color: #1265f3;
  box-shadow:
    0 0 0 4px rgba(18, 101, 243, 0.12),
    0 8px 18px rgba(12, 34, 80, 0.14);
}

.white {
  background: #ffffff;
  border-color: #1265f3;
}

.lightGray {
  background: #c9c9c9;
}

.black {
  background: #000000;
}

.darkGray {
  background: #555555;
}

.blue {
  background: #0d66d8;
}

.red {
  background: #e60b0b;
}

.silver {
  background: linear-gradient(135deg, #d9d9d9, #f6f6f6, #bfbfbf);
}

.beige {
  background: #b99a6f;
}

.infoNotice {
  margin-top: 22px;
  min-height: 52px;
  border-radius: 14px;
  background: linear-gradient(90deg, #eef5ff 0%, #f5f9ff 100%);
  color: #536b96;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 0 16px;
  font-size: 13.7px;
  font-weight: 750;
  border: 1px solid rgba(190, 211, 246, 0.42);
}

.infoNotice p {
  margin: 0;
}

@media (max-width: 1180px) {
  .featuresGrid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .chipRow {
    flex-wrap: wrap;
  }
}

@media (max-width: 820px) {
  .featuresGrid {
    grid-template-columns: 1fr;
  }
}
'@ | Set-Content -Encoding UTF8 "src/pages/Vendedor/PublicarVehiculo/steps/Caracteristicas/CaracteristicasStep.module.css"

@'
import { Info } from "lucide-react";
import styles from "./EstadoDocumentacionStep.module.css";

const papersOptions = ["Sí", "No"];
const vtvOptions = ["Vigente", "Vencida", "No aplica"];
const debtOptions = ["Sin deudas", "Tiene deudas"];
const ownershipOptions = ["Titular", "Familiar", "Gestor", "Concesionaria"];
const conditionOptions = ["Excelente", "Muy bueno", "Bueno", "Regular"];

const EstadoDocumentacionStep = ({ formData, onChange }) => {
  const setValue = (name, value) => {
    onChange({
      target: {
        name,
        value,
      },
    });
  };

  return (
    <>
      <div className={styles.documentCard}>
        <h3>Documentación</h3>

        <div className={styles.documentationGrid}>
          <div className={styles.segmentGroup}>
            <label>
              Papeles al día <span>*</span>
            </label>
            <div className={styles.segmentControl}>
              {papersOptions.map((option) => (
                <button
                  key={option}
                  type="button"
                  className={`${styles.segmentBtn} ${
                    formData.papelesAlDia === option ? styles.segmentActive : ""
                  }`}
                  onClick={() => setValue("papelesAlDia", option)}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>

          <div className={styles.segmentGroup}>
            <label>
              VTV <span>*</span>
            </label>
            <div className={`${styles.segmentControl} ${styles.threeColumns}`}>
              {vtvOptions.map((option) => (
                <button
                  key={option}
                  type="button"
                  className={`${styles.segmentBtn} ${
                    formData.vtv === option ? styles.segmentActive : ""
                  }`}
                  onClick={() => setValue("vtv", option)}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>

          <div className={styles.segmentGroup}>
            <label>
              Deudas <span>*</span>
            </label>
            <div className={styles.segmentControl}>
              {debtOptions.map((option) => (
                <button
                  key={option}
                  type="button"
                  className={`${styles.segmentBtn} ${
                    formData.deudas === option ? styles.segmentActive : ""
                  }`}
                  onClick={() => setValue("deudas", option)}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>

          <div className={styles.field}>
            <label>
              Titularidad <span>*</span>
            </label>
            <select name="titularidad" value={formData.titularidad} onChange={onChange}>
              {ownershipOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className={styles.documentCard}>
        <h3>Estado mecánico</h3>

        <div className={styles.segmentGroup}>
          <label>
            Estado general <span>*</span>
          </label>

          <div className={styles.wideSegmentControl}>
            {conditionOptions.map((option) => (
              <button
                key={option}
                type="button"
                className={`${styles.segmentBtn} ${
                  formData.estadoGeneral === option ? styles.segmentActive : ""
                }`}
                onClick={() => setValue("estadoGeneral", option)}
              >
                {option}
              </button>
            ))}
          </div>

          <p className={styles.fieldHelper}>
            Seleccioná la opción que mejor describa el estado general del vehículo.
          </p>
        </div>
      </div>

      <div className={styles.documentCard}>
        <h3>Observaciones</h3>
        <p className={styles.cardDescription}>
          Agregá detalles o aclaraciones que consideres importantes.
        </p>

        <div className={styles.textareaWrap}>
          <textarea
            name="observaciones"
            value={formData.observaciones || ""}
            onChange={onChange}
            maxLength={500}
            placeholder="Ej.: Se le cambiaron los frenos delanteros y traseros hace 3 meses."
          />
          <span>{formData.observaciones?.length || 0}/500</span>
        </div>
      </div>

      <div className={styles.trustNotice}>
        <div className={styles.trustIcon}>
          <Info size={22} />
        </div>

        <div>
          <strong>La información transparente ayuda a vender más rápido</strong>
          <p>
            Los compradores valoran la honestidad y eso se refleja en más consultas y mejores ofertas.
          </p>
        </div>
      </div>
    </>
  );
};

export default EstadoDocumentacionStep;
'@ | Set-Content -Encoding UTF8 "src/pages/Vendedor/PublicarVehiculo/steps/EstadoDocumentacion/EstadoDocumentacionStep.jsx"

@'
.documentCard {
  border: 1px solid #d8e1ee;
  border-radius: 16px;
  background: linear-gradient(180deg, #ffffff 0%, #fbfdff 100%);
  padding: 22px;
  box-shadow:
    0 10px 24px rgba(12, 34, 80, 0.035),
    inset 0 1px 0 rgba(255, 255, 255, 0.95);
}

.documentCard + .documentCard {
  margin-top: 14px;
}

.documentCard h3 {
  margin: 0 0 18px;
  color: #10204c;
  font-size: 17px;
  font-weight: 950;
  letter-spacing: -0.2px;
}

.documentationGrid {
  display: grid;
  grid-template-columns: 0.75fr 1.4fr 1.1fr 1fr;
  gap: 24px;
  align-items: end;
}

.segmentGroup {
  min-width: 0;
}

.segmentGroup label,
.field label {
  display: block;
  margin-bottom: 10px;
  color: #18264d;
  font-size: 13.7px;
  font-weight: 900;
}

.segmentGroup label span,
.field label span {
  color: #ff4055;
}

.field select {
  width: 100%;
  height: 42px;
  border-radius: 10px;
  border: 1px solid #cbd6e5;
  background: #ffffff;
  padding: 0 14px;
  color: #12214b;
  font-family: inherit;
  font-size: 13px;
  font-weight: 850;
}

.segmentControl,
.wideSegmentControl {
  display: grid;
  border: 1px solid #cbd6e5;
  border-radius: 10px;
  overflow: hidden;
  background: #ffffff;
}

.segmentControl {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.threeColumns {
  grid-template-columns: repeat(3, minmax(0, 1fr));
}

.wideSegmentControl {
  grid-template-columns: repeat(4, minmax(0, 1fr));
}

.segmentBtn {
  min-height: 42px;
  border: 0;
  border-right: 1px solid #d8e1ee;
  background: #ffffff;
  color: #4f5f7c;
  font-family: inherit;
  font-size: 13px;
  font-weight: 850;
  cursor: pointer;
  transition: 0.18s ease;
}

.segmentBtn:last-child {
  border-right: 0;
}

.segmentBtn:hover {
  background: #f4f8ff;
  color: #1265f3;
}

.segmentActive {
  background: #f0f6ff;
  color: #005bea;
  box-shadow: inset 0 0 0 2px #1a6eff;
}

.fieldHelper,
.cardDescription {
  margin: 10px 0 0;
  color: #6a7892;
  font-size: 13.5px;
  font-weight: 650;
}

.cardDescription {
  margin: -8px 0 12px;
}

.textareaWrap {
  position: relative;
}

.textareaWrap textarea {
  width: 100%;
  min-height: 82px;
  resize: vertical;
  border-radius: 12px;
  border: 1px solid #cbd6e5;
  background: #ffffff;
  padding: 16px 18px 28px;
  outline: none;
  color: #12214b;
  font-family: inherit;
  font-size: 14px;
  font-weight: 650;
}

.textareaWrap textarea:focus {
  border-color: #216ff3;
  box-shadow: 0 0 0 4px rgba(33, 111, 243, 0.11);
}

.textareaWrap span {
  position: absolute;
  right: 14px;
  bottom: 10px;
  color: #7a879f;
  font-size: 12.5px;
  font-weight: 800;
}

.trustNotice {
  margin-top: 14px;
  min-height: 58px;
  border-radius: 14px;
  background: linear-gradient(90deg, #edf5ff 0%, #f4f8ff 100%);
  border: 1px solid rgba(190, 211, 246, 0.56);
  color: #536b96;
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 12px 18px;
}

.trustIcon {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: #ffffff;
  color: #1265f3;
  display: grid;
  place-items: center;
  flex-shrink: 0;
}

.trustNotice strong {
  display: block;
  margin-bottom: 3px;
  color: #1265f3;
  font-size: 14px;
  font-weight: 950;
}

.trustNotice p {
  margin: 0;
  color: #62728d;
  font-size: 13.2px;
  line-height: 1.45;
  font-weight: 650;
}

@media (max-width: 1180px) {
  .documentationGrid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .wideSegmentControl {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 820px) {
  .documentationGrid,
  .wideSegmentControl {
    grid-template-columns: 1fr;
  }

  .segmentBtn {
    border-right: 0;
    border-bottom: 1px solid #d8e1ee;
  }

  .segmentBtn:last-child {
    border-bottom: 0;
  }
}
'@ | Set-Content -Encoding UTF8 "src/pages/Vendedor/PublicarVehiculo/steps/EstadoDocumentacion/EstadoDocumentacionStep.module.css"

@'
import { useRef, useState } from "react";
import { Check, CloudUpload, Info, RefreshCw, Star, Trash2 } from "lucide-react";
import styles from "./FotosStep.module.css";

const mockPhotos = [
  { id: 1, label: "Frente 3/4", className: "photoOne" },
  { id: 2, label: "Lateral", className: "photoTwo" },
  { id: 3, label: "Trasera", className: "photoThree" },
  { id: 4, label: "Frente", className: "photoFour" },
  { id: 5, label: "Interior", className: "photoFive" },
  { id: 6, label: "Baúl", className: "photoSix" },
];

const FotosStep = () => {
  const fileInputRef = useRef(null);
  const [selectedPhoto, setSelectedPhoto] = useState(1);
  const [mainPhoto, setMainPhoto] = useState(1);

  return (
    <>
      <div className={styles.uploadBox} onClick={() => fileInputRef.current?.click()}>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/png,image/jpeg,image/jpg"
          multiple
          className={styles.hiddenInput}
        />

        <div className={styles.uploadIcon}>
          <CloudUpload size={54} />
        </div>

        <h3>
          Arrastrá tus fotos aquí o <span>seleccioná archivos</span>
        </h3>

        <p>Formatos soportados: JPG, JPEG, PNG. Peso máximo por archivo: 10 MB.</p>
      </div>

      <div className={styles.photoRequirement}>
        <Check size={18} />
        <span>Subí al menos 4 fotos para publicar tu vehículo</span>
      </div>

      <div className={styles.photosGrid}>
        {mockPhotos.map((photo) => (
          <button
            key={photo.id}
            type="button"
            className={`${styles.photoCard} ${styles[photo.className]} ${
              selectedPhoto === photo.id ? styles.photoSelected : ""
            }`}
            onClick={() => setSelectedPhoto(photo.id)}
          >
            {mainPhoto === photo.id && (
              <span className={styles.mainPhotoBadge}>Foto principal</span>
            )}

            <span className={styles.photoLabel}>{photo.label}</span>
          </button>
        ))}
      </div>

      <div className={styles.photoActionsRow}>
        <div className={styles.photoActions}>
          <button
            type="button"
            className={styles.photoActionBtn}
            onClick={() => setMainPhoto(selectedPhoto)}
          >
            <Star size={18} />
            Elegir principal
          </button>

          <button type="button" className={styles.photoActionBtn}>
            <RefreshCw size={18} />
            Reemplazar foto
          </button>

          <button type="button" className={`${styles.photoActionBtn} ${styles.deleteBtn}`}>
            <Trash2 size={18} />
            Eliminar
          </button>
        </div>

        <p>{mockPhotos.length} de 20 fotos</p>
      </div>

      <div className={styles.infoNotice}>
        <Info size={18} />
        <p>Cuantas más fotos y mejor iluminación, más consultas vas a recibir.</p>
      </div>
    </>
  );
};

export default FotosStep;
'@ | Set-Content -Encoding UTF8 "src/pages/Vendedor/PublicarVehiculo/steps/Fotos/FotosStep.jsx"

@'
.uploadBox {
  min-height: 185px;
  border: 2px dashed #b9c7da;
  border-radius: 16px;
  background:
    radial-gradient(circle at 50% 20%, rgba(26, 110, 255, 0.055), transparent 35%),
    linear-gradient(180deg, #fbfdff 0%, #f7faff 100%);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
  cursor: pointer;
  transition: 0.2s ease;
}

.uploadBox:hover {
  border-color: #1a6eff;
  background: #f3f7ff;
}

.hiddenInput {
  display: none;
}

.uploadIcon {
  color: #0b64f4;
  display: grid;
  place-items: center;
}

.uploadBox h3 {
  margin: 0;
  color: #18264d;
  font-size: 17px;
  font-weight: 900;
}

.uploadBox h3 span {
  color: #0062ff;
}

.uploadBox p {
  margin: 0;
  color: #75839a;
  font-size: 13.5px;
  font-weight: 650;
}

.photoRequirement {
  width: fit-content;
  min-height: 42px;
  margin: 18px auto 20px;
  padding: 0 22px;
  border-radius: 999px;
  border: 1px solid #a9e2bf;
  background: #ecfbf2;
  color: #13984a;
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 14px;
  font-weight: 900;
}

.photosGrid {
  display: grid;
  grid-template-columns: repeat(6, minmax(0, 1fr));
  gap: 12px;
}

.photoCard {
  position: relative;
  min-height: 142px;
  border: 2px solid transparent;
  border-radius: 12px;
  overflow: hidden;
  cursor: pointer;
  background: #edf2f8;
  box-shadow: 0 10px 22px rgba(12, 34, 80, 0.08);
  transition: 0.2s ease;
}

.photoCard:hover {
  transform: translateY(-2px);
}

.photoSelected {
  border-color: #1265f3;
  box-shadow:
    0 0 0 4px rgba(18, 101, 243, 0.12),
    0 14px 30px rgba(18, 101, 243, 0.14);
}

.photoCard::before {
  content: "";
  position: absolute;
  inset: 0;
  background:
    linear-gradient(180deg, transparent 0%, rgba(4, 15, 38, 0.62) 100%),
    var(--photo-bg);
  background-size: cover;
  background-position: center;
}

.photoOne {
  --photo-bg:
    radial-gradient(circle at 48% 44%, #6d7887 0 9%, transparent 10%),
    linear-gradient(135deg, #32404f 0%, #7a8790 46%, #293747 100%);
}

.photoTwo {
  --photo-bg:
    radial-gradient(circle at 32% 62%, #1f2937 0 8%, transparent 9%),
    radial-gradient(circle at 72% 62%, #1f2937 0 8%, transparent 9%),
    linear-gradient(135deg, #6b7280 0%, #a7b0ba 48%, #4b5563 100%);
}

.photoThree {
  --photo-bg:
    radial-gradient(circle at 50% 55%, #374151 0 16%, transparent 17%),
    linear-gradient(135deg, #5f6b75 0%, #9aa5ad 48%, #334155 100%);
}

.photoFour {
  --photo-bg:
    radial-gradient(circle at 50% 48%, #1f2937 0 12%, transparent 13%),
    linear-gradient(135deg, #334155 0%, #94a3b8 45%, #1e293b 100%);
}

.photoFive {
  --photo-bg:
    linear-gradient(90deg, #111827 0 22%, transparent 23% 77%, #111827 78%),
    linear-gradient(135deg, #374151 0%, #9ca3af 52%, #1f2937 100%);
}

.photoSix {
  --photo-bg:
    radial-gradient(circle at 50% 36%, #111827 0 22%, transparent 23%),
    linear-gradient(135deg, #4b5563 0%, #a1a1aa 48%, #27272a 100%);
}

.mainPhotoBadge {
  position: absolute;
  z-index: 2;
  top: 10px;
  left: 10px;
  min-height: 25px;
  padding: 0 10px;
  border-radius: 8px;
  background: #1265f3;
  color: #ffffff;
  display: inline-flex;
  align-items: center;
  font-size: 12px;
  font-weight: 900;
}

.photoLabel {
  position: absolute;
  z-index: 2;
  left: 12px;
  bottom: 10px;
  color: #ffffff;
  font-size: 12px;
  font-weight: 900;
}

.photoActionsRow {
  margin-top: 18px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.photoActionsRow p {
  margin: 0;
  color: #7a879f;
  font-size: 14px;
  font-weight: 850;
}

.photoActions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.photoActionBtn {
  min-height: 45px;
  padding: 0 18px;
  border-radius: 10px;
  border: 1px solid #d4deea;
  background: #ffffff;
  color: #52627d;
  display: inline-flex;
  align-items: center;
  gap: 10px;
  font-family: inherit;
  font-size: 14px;
  font-weight: 850;
  cursor: pointer;
  transition: 0.2s ease;
}

.photoActionBtn:hover {
  border-color: #1a6eff;
  color: #1265f3;
  background: #f7faff;
}

.deleteBtn {
  color: #e02f44;
}

.deleteBtn:hover {
  border-color: #ffbdc5;
  color: #d71931;
  background: #fff6f7;
}

.infoNotice {
  margin-top: 22px;
  min-height: 52px;
  border-radius: 14px;
  background: linear-gradient(90deg, #eef5ff 0%, #f5f9ff 100%);
  color: #536b96;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 0 16px;
  font-size: 13.7px;
  font-weight: 750;
  border: 1px solid rgba(190, 211, 246, 0.42);
}

.infoNotice p {
  margin: 0;
}

@media (max-width: 1180px) {
  .photosGrid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  .photoActionsRow {
    align-items: flex-start;
    flex-direction: column;
  }
}

@media (max-width: 820px) {
  .photosGrid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .photoActions {
    width: 100%;
    flex-direction: column;
  }

  .photoActionBtn {
    width: 100%;
    justify-content: center;
  }

  .uploadBox {
    padding: 28px 18px;
    text-align: center;
  }
}

@media (max-width: 520px) {
  .photosGrid {
    grid-template-columns: 1fr;
  }
}
'@ | Set-Content -Encoding UTF8 "src/pages/Vendedor/PublicarVehiculo/steps/Fotos/FotosStep.module.css"

@'
import {
  EyeOff,
  Info,
  LockKeyhole,
  Mail,
  MapPin,
  Phone,
  Users,
} from "lucide-react";
import styles from "./ContactoUbicacionStep.module.css";

const ContactoUbicacionStep = ({ formData, onChange }) => {
  const setValue = (name, value) => {
    onChange({
      target: {
        name,
        value,
      },
    });
  };

  const toggleWhatsappVisibility = () => {
    setValue("mostrarWhatsapp", formData.mostrarWhatsapp === "Si" ? "No" : "Si");
  };

  return (
    <div className={styles.contactStepLayout}>
      <div className={styles.contactFormCard}>
        <section className={styles.contactSection}>
          <div className={styles.contactSectionTitle}>
            <MapPin size={24} />
            <h3>Ubicación</h3>
          </div>

          <div className={styles.contactGrid}>
            <div className={styles.field}>
              <label>
                Provincia <span>*</span>
              </label>
              <select name="provincia" value={formData.provincia} onChange={onChange}>
                <option value="">Seleccioná la provincia</option>
                <option value="Buenos Aires">Buenos Aires</option>
                <option value="CABA">CABA</option>
                <option value="Córdoba">Córdoba</option>
                <option value="Santa Fe">Santa Fe</option>
                <option value="Mendoza">Mendoza</option>
              </select>
            </div>

            <div className={styles.field}>
              <label>
                Ciudad <span>*</span>
              </label>
              <select name="ciudad" value={formData.ciudad} onChange={onChange}>
                <option value="">Seleccioná la ciudad</option>
                <option value="La Plata">La Plata</option>
                <option value="Mar del Plata">Mar del Plata</option>
                <option value="Palermo">Palermo</option>
                <option value="Córdoba Capital">Córdoba Capital</option>
                <option value="Rosario">Rosario</option>
              </select>
            </div>
          </div>
        </section>

        <section className={styles.contactSection}>
          <div className={styles.contactSectionTitle}>
            <Users size={24} />
            <h3>Datos de contacto</h3>
          </div>

          <div className={styles.contactGrid}>
            <div className={styles.field}>
              <label>
                Nombre de contacto <span>*</span>
              </label>
              <input
                type="text"
                name="nombreContacto"
                value={formData.nombreContacto}
                onChange={onChange}
                placeholder="Ej.: Juan Pérez"
              />
            </div>

            <div className={styles.field}>
              <label>
                WhatsApp <span>*</span>
              </label>

              <div className={styles.phoneInput}>
                <span>🇦🇷</span>
                <small>+54</small>
                <input
                  type="text"
                  name="whatsapp"
                  value={formData.whatsapp}
                  onChange={onChange}
                  placeholder="11 2345 6789"
                />
              </div>
            </div>

            <div className={styles.field}>
              <label>
                Email <span>*</span>
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={onChange}
                placeholder="Ej.: juanperez@email.com"
              />
            </div>

            <div className={styles.field}>
              <label>
                Horario de contacto <span>*</span>
              </label>
              <select
                name="horarioContacto"
                value={formData.horarioContacto}
                onChange={onChange}
              >
                <option value="">Seleccioná un horario</option>
                <option value="Mañana">Mañana</option>
                <option value="Tarde">Tarde</option>
                <option value="Noche">Noche</option>
                <option value="Todo el día">Todo el día</option>
              </select>
            </div>
          </div>

          <div className={styles.visibilityControl}>
            <button
              type="button"
              className={`${styles.switchBtn} ${
                formData.mostrarWhatsapp === "Si" ? styles.switchActive : ""
              }`}
              onClick={toggleWhatsappVisibility}
            >
              <span></span>
            </button>

            <div>
              <strong>
                Mostrar WhatsApp públicamente <Info size={16} />
              </strong>
              <p>Los interesados podrán ver tu número de WhatsApp en el aviso.</p>
            </div>
          </div>
        </section>
      </div>

      <aside className={styles.privacyPanel}>
        <div className={styles.privacyMainIcon}>
          <LockKeyhole size={28} />
        </div>

        <h3>Tu email no será visible públicamente.</h3>

        <div className={styles.privacyDivider}></div>

        <div className={styles.privacyItem}>
          <div className={styles.privacyIcon}>
            <EyeOff size={18} />
          </div>

          <div>
            <strong>Solo tu ciudad será pública</strong>
            <p>Mostraremos únicamente la ciudad donde se encuentra el vehículo.</p>
          </div>
        </div>

        <div className={styles.privacyItem}>
          <div className={styles.privacyIcon}>
            <Phone size={18} />
          </div>

          <div>
            <strong>Vos elegís qué mostrar</strong>
            <p>Podés decidir si tu número de WhatsApp es visible en el aviso.</p>
          </div>
        </div>

        <div className={styles.privacyItem}>
          <div className={styles.privacyIcon}>
            <Mail size={18} />
          </div>

          <div>
            <strong>Tu email está protegido</strong>
            <p>Nunca compartiremos tu email ni será visible para otros usuarios.</p>
          </div>
        </div>
      </aside>
    </div>
  );
};

export default ContactoUbicacionStep;
'@ | Set-Content -Encoding UTF8 "src/pages/Vendedor/PublicarVehiculo/steps/ContactoUbicacion/ContactoUbicacionStep.jsx"

@'
.contactStepLayout {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 265px;
  gap: 26px;
  align-items: stretch;
}

.contactFormCard {
  min-width: 0;
}

.contactSection {
  padding-bottom: 28px;
  border-bottom: 1px solid #dbe3ef;
}

.contactSection + .contactSection {
  padding-top: 28px;
}

.contactSection:last-child {
  border-bottom: 0;
  padding-bottom: 0;
}

.contactSectionTitle {
  display: flex;
  align-items: center;
  gap: 14px;
  margin-bottom: 22px;
  color: #08183f;
}

.contactSectionTitle h3 {
  margin: 0;
  font-size: 19px;
  font-weight: 950;
}

.contactGrid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 22px 28px;
}

.field label {
  display: block;
  margin-bottom: 8px;
  font-size: 13.7px;
  font-weight: 900;
  color: #18264d;
}

.field label span {
  color: #ff4055;
}

.field input,
.field select {
  width: 100%;
  height: 54px;
  border-radius: 12px;
  border: 1px solid #cbd6e5;
  background: linear-gradient(180deg, #ffffff 0%, #fbfcff 100%);
  padding: 0 16px;
  outline: none;
  color: #12214b;
  font-family: inherit;
  font-size: 14px;
  font-weight: 650;
}

.field input:focus,
.field select:focus {
  border-color: #216ff3;
  box-shadow: 0 0 0 4px rgba(33, 111, 243, 0.11);
}

.phoneInput {
  height: 54px;
  border-radius: 12px;
  border: 1px solid #cbd6e5;
  background: linear-gradient(180deg, #ffffff 0%, #fbfcff 100%);
  display: grid;
  grid-template-columns: 44px 44px minmax(0, 1fr);
  align-items: center;
  overflow: hidden;
}

.phoneInput:focus-within {
  border-color: #216ff3;
  box-shadow: 0 0 0 4px rgba(33, 111, 243, 0.11);
}

.phoneInput span {
  display: grid;
  place-items: center;
  font-size: 18px;
}

.phoneInput small {
  color: #7b879d;
  font-size: 13.5px;
  font-weight: 850;
}

.phoneInput input {
  width: 100%;
  height: 100%;
  border: 0;
  outline: 0;
  background: transparent;
  color: #12214b;
  font-family: inherit;
  font-size: 14px;
  font-weight: 650;
}

.visibilityControl {
  margin-top: 24px;
  display: flex;
  align-items: flex-start;
  gap: 16px;
}

.visibilityControl strong {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: #16244f;
  font-size: 15px;
  font-weight: 900;
}

.visibilityControl p {
  margin: 8px 0 0;
  color: #647390;
  font-size: 13.5px;
  font-weight: 650;
}

.switchBtn {
  width: 48px;
  height: 26px;
  border: 0;
  border-radius: 999px;
  background: #cbd6e5;
  padding: 3px;
  cursor: pointer;
  display: flex;
  align-items: center;
  flex-shrink: 0;
  transition: 0.2s ease;
}

.switchBtn span {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: #ffffff;
  display: block;
  transition: 0.2s ease;
  box-shadow: 0 4px 10px rgba(12, 34, 80, 0.18);
}

.switchActive {
  background: #1265f3;
}

.switchActive span {
  transform: translateX(22px);
}

.privacyPanel {
  border-radius: 20px;
  border: 1px solid #d9e3f0;
  background:
    radial-gradient(circle at 22% 10%, rgba(26, 110, 255, 0.09), transparent 30%),
    linear-gradient(180deg, #f8fbff 0%, #f1f5fa 100%);
  padding: 34px 24px;
  box-shadow:
    0 18px 42px rgba(15, 35, 80, 0.06),
    inset 0 1px 0 rgba(255, 255, 255, 0.9);
}

.privacyMainIcon {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  margin-bottom: 26px;
  background: linear-gradient(135deg, #1b6eff 0%, #0056f0 100%);
  color: #ffffff;
  display: grid;
  place-items: center;
}

.privacyPanel h3 {
  margin: 0;
  color: #10204c;
  font-size: 20px;
  line-height: 1.35;
  font-weight: 950;
}

.privacyDivider {
  height: 1px;
  background: linear-gradient(90deg, transparent, #cbd6e5, transparent);
  margin: 32px 0;
}

.privacyItem {
  display: flex;
  align-items: flex-start;
  gap: 14px;
}

.privacyItem + .privacyItem {
  margin-top: 34px;
}

.privacyIcon {
  width: 34px;
  height: 34px;
  border-radius: 50%;
  background: #e9f1ff;
  color: #1265f3;
  display: grid;
  place-items: center;
  flex-shrink: 0;
}

.privacyItem strong {
  display: block;
  margin-bottom: 8px;
  color: #14214a;
  font-size: 14.5px;
  line-height: 1.35;
  font-weight: 950;
}

.privacyItem p {
  margin: 0;
  color: #65738f;
  font-size: 13.5px;
  line-height: 1.6;
  font-weight: 650;
}

@media (max-width: 1180px) {
  .contactStepLayout {
    grid-template-columns: 1fr;
  }

  .privacyPanel {
    display: grid;
    grid-template-columns: 220px 1fr;
    gap: 24px;
  }

  .privacyDivider {
    display: none;
  }

  .privacyItem + .privacyItem {
    margin-top: 18px;
  }
}

@media (max-width: 820px) {
  .contactGrid,
  .privacyPanel {
    grid-template-columns: 1fr;
  }
}
'@ | Set-Content -Encoding UTF8 "src/pages/Vendedor/PublicarVehiculo/steps/ContactoUbicacion/ContactoUbicacionStep.module.css"

@'
import {
  CalendarDays,
  Camera,
  Car,
  ChevronLeft,
  ChevronRight,
  Fuel,
  Gauge,
  Info,
  MapPin,
  MessageCircle,
  Pencil,
  Snowflake,
  Smartphone,
  User,
  Wrench,
} from "lucide-react";
import styles from "./VistaPreviaStep.module.css";

const previewThumbs = [
  "previewPhotoMain",
  "previewPhotoBack",
  "previewPhotoInterior",
  "previewPhotoSeats",
  "previewPhotoTrunk",
];

const equipment = [
  { label: "Aire acondicionado", icon: Snowflake },
  { label: "Android Auto / CarPlay", icon: Smartphone },
  { label: "Cámara de retroceso", icon: Camera },
  { label: "Control crucero", icon: Gauge },
  { label: "Sensores de estacionamiento", icon: Wrench },
];

const VistaPreviaStep = ({ formData }) => {
  const title = `${formData.marca || "Toyota"} ${formData.modelo || "Corolla"} ${
    formData.motor || "2.0"
  } XEI CVT ${formData.anio || "2021"}`;
  const price = formData.precio || "18.900.000";
  const location = `${formData.provincia || "CABA"}, ${formData.ciudad || "Palermo"}`;

  return (
    <>
      <div className={styles.previewEditRow}>
        <button type="button" className={styles.previewEditBtn}>
          <Pencil size={18} />
          Editar publicación
        </button>
      </div>

      <div className={styles.previewLayout}>
        <div className={styles.previewGallery}>
          <div className={`${styles.previewMainPhoto} ${styles.previewPhotoMain}`}>
            <span className={styles.previewCounter}>
              <Camera size={16} /> 1 / 16
            </span>

            <button type="button" className={`${styles.galleryArrow} ${styles.galleryPrev}`}>
              <ChevronLeft size={20} />
            </button>

            <button type="button" className={`${styles.galleryArrow} ${styles.galleryNext}`}>
              <ChevronRight size={20} />
            </button>
          </div>

          <div className={styles.previewThumbs}>
            {previewThumbs.map((photo, index) => (
              <button
                key={photo}
                type="button"
                className={`${styles.previewThumb} ${styles[photo]} ${
                  index === 0 ? styles.previewThumbActive : ""
                }`}
              ></button>
            ))}
          </div>

          <div className={styles.sellerBox}>
            <h3>Datos del vendedor</h3>

            <div className={styles.sellerContent}>
              <div className={styles.sellerAvatar}>
                <User size={24} />
              </div>

              <div>
                <strong>{formData.nombreContacto || "Juan Manuel Pérez"}</strong>
                <p>Usuario desde 2021</p>
              </div>

              <button type="button" className={styles.whatsappSellerBtn}>
                <MessageCircle size={20} />
                Enviar mensaje por WhatsApp
              </button>
            </div>
          </div>
        </div>

        <div className={styles.previewInfo}>
          <h2>{title}</h2>
          <strong className={styles.previewPrice}>$ {price}</strong>

          <div className={styles.previewLocation}>
            <MapPin size={18} />
            {location}
          </div>

          <div className={styles.previewSpecs}>
            <div className={styles.previewSpec}>
              <CalendarDays size={22} />
              <div>
                <span>Año</span>
                <strong>{formData.anio || "2021"}</strong>
              </div>
            </div>

            <div className={styles.previewSpec}>
              <Wrench size={22} />
              <div>
                <span>Transmisión</span>
                <strong>{formData.transmision || "Automática (CVT)"}</strong>
              </div>
            </div>

            <div className={styles.previewSpec}>
              <Gauge size={22} />
              <div>
                <span>Kilometraje</span>
                <strong>{formData.kilometraje || "85.000"} km</strong>
              </div>
            </div>

            <div className={styles.previewSpec}>
              <Car size={22} />
              <div>
                <span>Motor</span>
                <strong>{formData.motor || "2.0"}</strong>
              </div>
            </div>

            <div className={styles.previewSpec}>
              <Fuel size={22} />
              <div>
                <span>Combustible</span>
                <strong>{formData.combustible || "Nafta"}</strong>
              </div>
            </div>

            <div className={styles.previewSpec}>
              <Car size={22} />
              <div>
                <span>Puertas</span>
                <strong>{formData.puertas || "4"}</strong>
              </div>
            </div>
          </div>

          <div className={styles.previewDescription}>
            <h3>Descripción</h3>
            <p>
              Único dueño. Service oficiales al día. Muy buen estado general.
              Equipamiento completo, cámara de retroceso, sensores de
              estacionamiento, control crucero y pantalla multimedia.
            </p>
          </div>

          <div className={styles.previewTags}>
            {equipment.map((item) => {
              const Icon = item.icon;

              return (
                <span key={item.label}>
                  <Icon size={16} />
                  {item.label}
                </span>
              );
            })}

            <span>+ 3 más</span>
          </div>
        </div>
      </div>

      <div className={styles.previewNotice}>
        <Info size={18} />
        <p>
          Una vez publicada, tu aviso será visible para miles de compradores en Mi Vehículo.
          Podrás editarlo o gestionarlo desde tu Panel de Vendedor.
        </p>
      </div>
    </>
  );
};

export default VistaPreviaStep;
'@ | Set-Content -Encoding UTF8 "src/pages/Vendedor/PublicarVehiculo/steps/VistaPrevia/VistaPreviaStep.jsx"

@'
.previewEditRow {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 16px;
}

.previewEditBtn {
  min-height: 40px;
  padding: 0 18px;
  border-radius: 8px;
  border: 2px solid #1a6eff;
  background: #ffffff;
  color: #1265f3;
  font-family: inherit;
  font-size: 14px;
  font-weight: 900;
  display: inline-flex;
  align-items: center;
  gap: 9px;
  cursor: pointer;
}

.previewLayout {
  display: grid;
  grid-template-columns: 430px minmax(0, 1fr);
  gap: 26px;
  align-items: start;
}

.previewMainPhoto {
  position: relative;
  height: 330px;
  border-radius: 12px;
  overflow: hidden;
  background: #d8e1ee;
  box-shadow: 0 12px 28px rgba(12, 34, 80, 0.09);
}

.previewMainPhoto::before,
.previewThumb::before {
  content: "";
  position: absolute;
  inset: 0;
  background:
    linear-gradient(180deg, transparent 0%, rgba(4, 15, 38, 0.25) 100%),
    var(--preview-bg);
  background-size: cover;
  background-position: center;
}

.previewPhotoMain {
  --preview-bg:
    radial-gradient(circle at 50% 53%, #2f3744 0 18%, transparent 19%),
    radial-gradient(circle at 33% 62%, #111827 0 6%, transparent 7%),
    radial-gradient(circle at 74% 62%, #111827 0 6%, transparent 7%),
    linear-gradient(135deg, #657282 0%, #b9c1c9 46%, #374151 100%);
}

.previewPhotoBack {
  --preview-bg:
    radial-gradient(circle at 52% 55%, #374151 0 16%, transparent 17%),
    linear-gradient(135deg, #5f6b75 0%, #9aa5ad 48%, #334155 100%);
}

.previewPhotoInterior {
  --preview-bg:
    linear-gradient(90deg, #111827 0 22%, transparent 23% 77%, #111827 78%),
    linear-gradient(135deg, #374151 0%, #9ca3af 52%, #1f2937 100%);
}

.previewPhotoSeats {
  --preview-bg:
    radial-gradient(circle at 34% 50%, #111827 0 18%, transparent 19%),
    radial-gradient(circle at 68% 50%, #111827 0 18%, transparent 19%),
    linear-gradient(135deg, #4b5563 0%, #a1a1aa 48%, #27272a 100%);
}

.previewPhotoTrunk {
  --preview-bg:
    radial-gradient(circle at 50% 36%, #111827 0 22%, transparent 23%),
    linear-gradient(135deg, #4b5563 0%, #a1a1aa 48%, #27272a 100%);
}

.previewCounter {
  position: absolute;
  z-index: 2;
  top: 16px;
  right: 16px;
  min-height: 32px;
  padding: 0 12px;
  border-radius: 9px;
  background: rgba(10, 19, 43, 0.78);
  color: #ffffff;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  font-weight: 850;
}

.galleryArrow {
  position: absolute;
  z-index: 2;
  top: 50%;
  transform: translateY(-50%);
  width: 34px;
  height: 34px;
  border: 0;
  border-radius: 50%;
  background: #ffffff;
  color: #10204c;
  display: grid;
  place-items: center;
  cursor: pointer;
  box-shadow: 0 8px 20px rgba(12, 34, 80, 0.16);
}

.galleryPrev {
  left: 12px;
}

.galleryNext {
  right: 12px;
}

.previewThumbs {
  margin-top: 14px;
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 10px;
}

.previewThumb {
  position: relative;
  height: 66px;
  border-radius: 9px;
  border: 2px solid transparent;
  overflow: hidden;
  background: #e5ecf5;
  cursor: pointer;
}

.previewThumbActive {
  border-color: #1265f3;
  box-shadow: 0 0 0 3px rgba(18, 101, 243, 0.12);
}

.sellerBox {
  margin-top: 28px;
  border: 1px solid #d8e1ee;
  border-radius: 14px;
  background: #ffffff;
  padding: 18px 22px;
  box-shadow: 0 10px 24px rgba(12, 34, 80, 0.045);
}

.sellerBox h3 {
  margin: 0 0 14px;
  color: #10204c;
  font-size: 16px;
  font-weight: 950;
}

.sellerContent {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) auto;
  align-items: center;
  gap: 14px;
}

.sellerAvatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: #eaf2ff;
  color: #1265f3;
  display: grid;
  place-items: center;
}

.sellerContent strong {
  display: block;
  color: #14214a;
  font-size: 14.5px;
  font-weight: 950;
}

.sellerContent p {
  margin: 4px 0 0;
  color: #65738f;
  font-size: 13px;
  font-weight: 650;
}

.whatsappSellerBtn {
  min-height: 46px;
  padding: 0 18px;
  border-radius: 10px;
  border: 1px solid #16a34a;
  background: #ffffff;
  color: #138a3d;
  font-family: inherit;
  font-size: 13.5px;
  font-weight: 900;
  display: inline-flex;
  align-items: center;
  gap: 9px;
  cursor: pointer;
}

.previewInfo h2 {
  margin: 0 0 10px;
  color: #08183f;
  font-size: 29px;
  line-height: 1.15;
  letter-spacing: -0.8px;
  font-weight: 950;
}

.previewPrice {
  display: block;
  color: #0062ff;
  font-size: 31px;
  line-height: 1.1;
  font-weight: 950;
  letter-spacing: -0.6px;
}

.previewLocation {
  margin-top: 12px;
  color: #53637f;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14.5px;
  font-weight: 750;
}

.previewSpecs {
  margin-top: 20px;
  padding-bottom: 22px;
  border-bottom: 1px solid #dbe3ef;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 20px 34px;
}

.previewSpec {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  color: #53637f;
}

.previewSpec svg {
  color: #51617c;
  flex-shrink: 0;
}

.previewSpec span {
  display: block;
  margin-bottom: 4px;
  color: #53637f;
  font-size: 13px;
  font-weight: 750;
}

.previewSpec strong {
  color: #172550;
  font-size: 14px;
  line-height: 1.35;
  font-weight: 850;
}

.previewDescription {
  margin-top: 18px;
}

.previewDescription h3 {
  margin: 0 0 10px;
  color: #10204c;
  font-size: 16px;
  font-weight: 950;
}

.previewDescription p {
  margin: 0;
  color: #53637f;
  font-size: 14px;
  line-height: 1.55;
  font-weight: 650;
}

.previewTags {
  margin-top: 16px;
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.previewTags span {
  min-height: 32px;
  padding: 0 12px;
  border-radius: 8px;
  border: 1px solid #d8e1ee;
  background: #ffffff;
  color: #53637f;
  display: inline-flex;
  align-items: center;
  gap: 7px;
  font-size: 12.5px;
  font-weight: 800;
}

.previewTags svg {
  color: #1265f3;
}

.previewNotice {
  margin-top: 20px;
  min-height: 46px;
  border-radius: 10px;
  border: 1px solid rgba(190, 211, 246, 0.56);
  background: linear-gradient(90deg, #edf5ff 0%, #f4f8ff 100%);
  color: #536b96;
  padding: 0 16px;
  display: flex;
  align-items: center;
  gap: 10px;
}

.previewNotice p {
  margin: 0;
  font-size: 13px;
  font-weight: 650;
}

.previewNotice svg {
  color: #1265f3;
  flex-shrink: 0;
}

@media (max-width: 1180px) {
  .previewLayout {
    grid-template-columns: 1fr;
  }

  .previewMainPhoto {
    height: 360px;
  }
}

@media (max-width: 820px) {
  .previewMainPhoto {
    height: 260px;
  }

  .previewSpecs {
    grid-template-columns: 1fr;
  }

  .sellerContent {
    grid-template-columns: auto 1fr;
  }

  .whatsappSellerBtn {
    grid-column: 1 / -1;
    justify-content: center;
  }
}
'@ | Set-Content -Encoding UTF8 "src/pages/Vendedor/PublicarVehiculo/steps/VistaPrevia/VistaPreviaStep.module.css"

Write-Host "PublicarVehiculo modularizado correctamente."
