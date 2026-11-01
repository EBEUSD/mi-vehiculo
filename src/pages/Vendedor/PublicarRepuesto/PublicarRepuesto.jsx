import PublicarProducto from "../PublicarProducto/PublicarProducto";
import DatosRepuestoStep from "./steps/DatosRepuesto/DatosRepuestoStep";
import CompatibilidadStep from "./steps/Compatibilidad/CompatibilidadStep";
import { DRAFT_KEYS } from "../../../lib/publishDrafts";
import styles from "../PublicarVehiculo/PublicarVehiculo.module.css";

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
    helpItems: ["Gratuito: visible por 45 días", "Básico $9: más fotos + posicionamiento", "Premium $19: máxima visibilidad"],
  },
];

const config = {
  draftKey:      DRAFT_KEYS.repuesto,
  itemType:      "repuesto",
  nameField:     "nombreRepuesto",
  categoryField: "categoriaRepuesto",
  steps,
  fallbackCategories: CATEGORIAS_REPUESTO_FALLBACK,
  extraInitial: { compatibleMarcas: "", compatibleModelos: "", compatibleAnios: "", esUniversal: false },
  labels: {
    topbar:       "Publicar repuesto",
    pageTitle:    "Publicar repuesto",
    kicker:       "Nuevo repuesto",
    question:     "¿Qué tipo de repuesto es?",
    nameRequired: "Ingresá el nombre del repuesto.",
  },
  // Datos + compatibilidad (aparece al completar la descripción)
  renderDatos: (formData, onChange) => (
    <>
      <DatosRepuestoStep formData={formData} onChange={onChange} hideCategory />
      {formData.descripcionItem?.trim().length > 0 && (
        <div className={styles.revealBlock}>
          <div className={styles.sectionDivider} />
          <h3 className={styles.sectionTitle}>Compatibilidad</h3>
          <p className={styles.sectionSub}>¿Con qué vehículos es compatible este repuesto?</p>
          <CompatibilidadStep formData={formData} onChange={onChange} />
        </div>
      )}
    </>
  ),
};

const PublicarRepuesto = () => <PublicarProducto config={config} />;

export default PublicarRepuesto;
