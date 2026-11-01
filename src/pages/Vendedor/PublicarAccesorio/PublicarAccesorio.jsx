import PublicarProducto from "../PublicarProducto/PublicarProducto";
import DatosAccesorioStep from "./steps/DatosAccesorio/DatosAccesorioStep";
import { DRAFT_KEYS } from "../../../lib/publishDrafts";

const CATEGORIAS_ACCESORIO_FALLBACK = [
  "Audio y multimedia", "Rines y llantas", "Iluminación",
  "Exterior", "Interior", "Seguridad", "Cuidado y limpieza",
  "Tapicería", "Mecánica de rendimiento", "Otro",
].map((label, i) => ({ id: i + 100, name: label }));

const steps = [
  {
    id: 1, label: "Datos",
    title: "Datos del accesorio", formTitle: "Datos del accesorio",
    description: "Nombre, condición y descripción del accesorio.",
    sideText: "Un título claro y descripción precisa atrae a los compradores correctos.",
    helpTitle: "Consejos",
    helpItems: ["Nombre claro y reconocible", "Sé honesto con la condición", "Descripción con marca y medidas", "Foto instalada genera más confianza"],
  },
  {
    id: 2, label: "Fotos y precio",
    title: "Fotos y precio", formTitle: "Fotos y precio",
    description: "Subí fotos del accesorio y definí el precio de venta.",
    sideText: "Fotos en buena luz y precio competitivo generan más consultas.",
    helpTitle: "Consejos",
    helpItems: ["Foto en fondo claro sin sombras", "Mostrá el accesorio instalado si podés", "Precio competitivo genera más interés"],
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
  draftKey:      DRAFT_KEYS.accesorio,
  itemType:      "accesorio",
  nameField:     "nombreAccesorio",
  categoryField: "categoriaAccesorio",
  steps,
  fallbackCategories: CATEGORIAS_ACCESORIO_FALLBACK,
  extraInitial: {},
  labels: {
    topbar:       "Publicar accesorio",
    pageTitle:    "Publicar accesorio",
    kicker:       "Nuevo accesorio",
    question:     "¿Qué tipo de accesorio es?",
    nameRequired: "Ingresá el nombre del accesorio.",
  },
  renderDatos: (formData, onChange) => (
    <DatosAccesorioStep formData={formData} onChange={onChange} hideCategory />
  ),
};

const PublicarAccesorio = () => <PublicarProducto config={config} />;

export default PublicarAccesorio;
