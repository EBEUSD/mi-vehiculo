// Planes de publicación — única fuente de verdad para precios, límites y textos.
// `amountCents` debe coincidir con lo que valida el backend en el webhook/publish de Wompi.

export const PLANS = [
  {
    id: "gratuito",
    nombre: "Gratuito",
    subtitulo: "Para comenzar",
    precio: null,
    amountCents: 0,
    dias: 45,
    fotos: 5,
    videos: 0,
    badge: null,
    accent: "#64748b",
    highlight: false,
    incluye: [
      "1 publicación gratis por año",
      "45 días de duración",
      "Hasta 5 fotos",
      "Visible en búsquedas",
    ],
    noIncluye: [
      "Posición destacada en resultados",
      "Aparece en la página principal",
      "Badge en el aviso",
      "Estadísticas de visitas",
    ],
    nota: "Solo 1 publicación gratuita por año calendario",
  },
  {
    id: "basico",
    nombre: "Básico",
    subtitulo: "Mayor alcance",
    precio: 9,
    amountCents: 900,
    dias: 90,
    fotos: 10,
    videos: 0,
    badge: "Más popular",
    accent: "#1570ff",
    highlight: true,
    incluye: [
      "Publicaciones ilimitadas",
      "90 días de duración",
      "Hasta 10 fotos",
      "Posición destacada en búsquedas",
      'Badge "Destacado" en tu aviso',
      "Estadísticas de visitas",
    ],
    noIncluye: ["Aparece en la página principal"],
    nota: null,
  },
  {
    id: "premium",
    nombre: "Premium",
    subtitulo: "Máxima visibilidad",
    precio: 19,
    amountCents: 1900,
    dias: 120,
    fotos: 15,
    videos: 1,
    badge: "Mayor visibilidad",
    accent: "#7c3aed",
    highlight: false,
    incluye: [
      "Publicaciones ilimitadas",
      "120 días de duración",
      "Hasta 15 fotos y 1 video",
      "Aparece en la página principal",
      "Top de resultados de búsqueda",
      'Badge "Premium" en tu aviso',
      "Estadísticas avanzadas",
    ],
    noIncluye: [],
    nota: null,
  },
];

// Planes que todavía no se cobran online: se muestran con CTA a contacto.
export const CONSULT_PLANS = [
  {
    id: "anual",
    nombre: "Suscripción anual",
    subtitulo: "Para vendedores frecuentes",
    precioLabel: "$130",
    precioPer: "al año · o $14 mensual",
    accent: "#0f766e",
    incluye: [
      "Todo lo del plan Premium",
      "Hasta 12 publicaciones al año",
      "Cada publicación dura 1 año",
      "Hasta 20 fotos y 2 videos por publicación",
    ],
    cta: "Consultar",
    href: "/contacto?asunto=suscripcion-anual",
  },
  {
    id: "empresas",
    nombre: "Planes para empresas",
    subtitulo: "Agencias, lotes y comercios",
    precioLabel: "A medida",
    precioPer: "planes mensuales",
    accent: "#07153f",
    incluye: [
      "Todo lo del plan Premium",
      "Publicaciones sin límite anual",
      "Carga por lotes de hasta 10 publicaciones",
      "Publicidad en banner, carrusel o landing page",
    ],
    cta: "Consultar planes especiales",
    href: "/contacto?asunto=planes-empresas",
  },
];

export const getPlan = (id) => PLANS.find((p) => p.id === id) || null;

// Límite de fotos: el del plan elegido o, sin plan aún, el máximo comprable.
export const MAX_PLAN_PHOTOS = Math.max(...PLANS.map((p) => p.fotos));
export const getMaxPhotos = (planId) => getPlan(planId)?.fotos ?? MAX_PLAN_PHOTOS;

export const publishLabelFor = (planId) => {
  const plan = getPlan(planId);
  if (!plan) return "Publicar";
  return plan.precio === null ? "Publicar gratis" : `Pagar y publicar — $${plan.precio}`;
};

// Opciones de "Destacar" una publicación ya activa.
export const HIGHLIGHT_OPTIONS = [
  { dias: 10, precio: 6 },
  { dias: 20, precio: 10 },
  { dias: 30, precio: 14 },
];
