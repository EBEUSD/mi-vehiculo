import { Link } from "react-router-dom";
import { ArrowRight, Building2, CalendarClock, Check, Gift, Zap, Star } from "lucide-react";
import { PLANS, CONSULT_PLANS } from "../../../../../lib/plans";
import styles from "./PlanPublicacionStep.module.css";

const ICONS = { gratuito: Gift, basico: Zap, premium: Star };

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
        {PLANS.map((plan) => {
          const Icon = ICONS[plan.id];
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

      <div className={styles.consultGrid}>
        {CONSULT_PLANS.map((plan) => {
          const Icon = plan.id === "anual" ? CalendarClock : Building2;
          return (
            <div key={plan.id} className={styles.consultCard} style={{ "--accent": plan.accent }}>
              <div className={styles.cardTop}>
                <span className={styles.iconWrap} style={{ background: `${plan.accent}18`, color: plan.accent }}>
                  <Icon size={22} />
                </span>
                <div>
                  <h4 className={styles.planName}>{plan.nombre}</h4>
                  <p className={styles.planSub}>{plan.subtitulo}</p>
                </div>
              </div>
              <div className={styles.priceRow}>
                <span className={styles.price} style={{ color: plan.accent }}>{plan.precioLabel}</span>
                <span className={styles.pricePer}>{plan.precioPer}</span>
              </div>
              <ul className={styles.featureList}>
                {plan.incluye.map((item) => (
                  <li key={item} className={styles.featureOn}>
                    <Check size={12} strokeWidth={3} style={{ flexShrink: 0, color: plan.accent }} />
                    {item}
                  </li>
                ))}
              </ul>
              <Link to={plan.href} className={styles.consultBtn}>
                {plan.cta} <ArrowRight size={14} />
              </Link>
            </div>
          );
        })}
      </div>

      {!selected && (
        <p className={styles.hint}>Seleccioná un plan para poder publicar</p>
      )}

      {selected && selected !== "gratuito" && (
        <div className={styles.payNote}>
          El cobro se procesa de forma segura con Wompi al confirmar. Podés pagar con tarjeta de crédito o débito, puntos, cuotas o Bitcoin.
        </div>
      )}
    </div>
  );
}
