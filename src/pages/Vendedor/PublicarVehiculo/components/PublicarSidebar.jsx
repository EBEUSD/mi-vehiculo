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