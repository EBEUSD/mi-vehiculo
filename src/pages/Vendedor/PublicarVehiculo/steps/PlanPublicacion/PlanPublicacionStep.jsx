import { Check, Gift, Zap, Star } from "lucide-react";
import styles from "./PlanPublicacionStep.module.css";

const PLANES = [
  {
    id: "gratuito",
    nombre: "Gratuito",
    subtitulo: "Para comenzar",
    precio: null,
    badge: null,
    icon: Gift,
    accent: "#64748b",
    highlight: false,
    incluye: [
      "1 publicación gratis por año",
      "60 días de duración",
      "Hasta 10 fotos",
      "Visible en búsquedas",
    ],
    noIncluye: [
      "Posición destacada en resultados",
      "Aparece en la página principal",
      "Badge en el aviso",
      "Estadísticas de visitas",
    ],
    nota: "Solo 1 publicación gratuita por año calendario",
    cta: "Publicar gratis",
  },
  {
    id: "basico",
    nombre: "Básico",
    subtitulo: "Mayor alcance",
    precio: 5,
    badge: "Más popular",
    icon: Zap,
    accent: "#1570ff",
    highlight: true,
    incluye: [
      "Publicaciones ilimitadas",
      "90 días de duración",
      "Hasta 20 fotos",
      "Posición destacada en búsquedas",
      'Badge "Destacado" en tu aviso',
      "Estadísticas de visitas",
    ],
    noIncluye: [
      "Aparece en la página principal",
    ],
    nota: null,
    cta: "Elegir Básico",
  },
  {
    id: "premium",
    nombre: "Premium",
    subtitulo: "Máxima visibilidad",
    precio: 12,
    badge: "Mayor visibilidad",
    icon: Star,
    accent: "#7c3aed",
    highlight: false,
    incluye: [
      "Publicaciones ilimitadas",
      "120 días de duración",
      "Hasta 30 fotos",
      "Aparece en la página principal",
      "Top de resultados de búsqueda",
      'Badge "Premium" en tu aviso',
      "Estadísticas avanzadas",
    ],
    noIncluye: [],
    nota: null,
    cta: "Elegir Premium",
  },
];

export default function PlanPublicacionStep({ formData, onChange }) {
  const selected = formData.plan || null;

  const handleSelect = (planId) => {
    onChange({ target: { name: "plan", value: planId } });
  };

  return (
    <div className={styles.wrap}>
      <div className={styles.intro}>
        <h3 className={styles.introTitle}>Elegí cómo querés publicar</h3>
        <p className={styles.introSub}>
          Más visibilidad genera más consultas. Podés cambiar de plan en cualquier momento.
        </p>
      </div>

      <div className={styles.grid}>
        {PLANES.map((plan) => {
          const Icon = plan.icon;
          const isSelected = selected === plan.id;

          return (
            <button
              key={plan.id}
              type="button"
              className={[
                styles.card,
                plan.highlight ? styles.cardHighlight : "",
                isSelected ? styles.cardSelected : "",
              ].join(" ")}
              style={{ "--accent": plan.accent }}
              onClick={() => handleSelect(plan.id)}
            >
              {plan.badge && (
                <span className={styles.badge} style={{ background: plan.accent }}>
                  {plan.badge}
                </span>
              )}

              <div className={styles.cardTop}>
                <span className={styles.iconWrap} style={{ background: `${plan.accent}18`, color: plan.accent }}>
                  <Icon size={22} />
                </span>
                <div>
                  <h4 className={styles.planName}>{plan.nombre}</h4>
                  <p className={styles.planSub}>{plan.subtitulo}</p>
                </div>
                <div className={`${styles.radio} ${isSelected ? styles.radioOn : ""}`}>
                  {isSelected && <Check size={12} strokeWidth={3} />}
                </div>
              </div>

              <div className={styles.priceRow}>
                {plan.precio === null ? (
                  <span className={styles.price} style={{ color: plan.accent }}>Gratis</span>
                ) : (
                  <>
                    <span className={styles.price} style={{ color: plan.accent }}>
                      ${plan.precio.toLocaleString("en-US")}
                    </span>
                    <span className={styles.pricePer}>por publicación</span>
                  </>
                )}
              </div>

              <ul className={styles.featureList}>
                {plan.incluye.map((item) => (
                  <li key={item} className={styles.featureOn}>
                    <Check size={12} strokeWidth={3} style={{ flexShrink: 0, color: plan.accent }} />
                    {item}
                  </li>
                ))}
                {plan.noIncluye.map((item) => (
                  <li key={item} className={styles.featureOff}>
                    <span className={styles.dash}>—</span>
                    {item}
                  </li>
                ))}
              </ul>

              {plan.nota && <p className={styles.nota}>{plan.nota}</p>}
            </button>
          );
        })}
      </div>

      {!selected && (
        <p className={styles.hint}>Seleccioná un plan para poder publicar</p>
      )}

      {selected && selected !== "gratuito" && (
        <div className={styles.payNote}>
          El cobro se procesa de forma segura al confirmar. Podés pagar con tarjeta de crédito, débito o transferencia.
        </div>
      )}
    </div>
  );
}
