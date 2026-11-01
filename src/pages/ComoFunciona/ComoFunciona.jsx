import { Link } from "react-router-dom";
import {
  Search, Car, MessageCircle, Shield, Pencil, CheckCircle2,
  Megaphone, DollarSign, Users, Tag, Headphones, Heart, ArrowRight,
} from "lucide-react";
import Navbar from "../../components/Navbar/Navbar";
import styles from "./ComoFunciona.module.css";

const BUYER_STEPS = [
  { icon: <Search size={26} />, title: "Buscá", desc: "Explorá las publicaciones y usá los filtros para encontrar lo que necesitás." },
  { icon: <Car size={26} />, title: "Elegí", desc: "Revisá los detalles, fotos y características del vehículo que te interesa." },
  { icon: <MessageCircle size={26} />, title: "Contactá", desc: "Hablá directamente con el vendedor por WhatsApp u otros medios." },
  { icon: <Shield size={26} />, title: "Comprá seguro", desc: "Coordiná la visita y revisá el vehículo y su documentación antes de pagar." },
];

const SELLER_STEPS = [
  { icon: <Pencil size={24} />, title: "Publicá", desc: "Completá los datos de tu vehículo y subí fotos de calidad en minutos." },
  { icon: <CheckCircle2 size={24} />, title: "Elegí tu plan", desc: "Publicá gratis o elegí un plan con más fotos, video y mejor posición en los resultados." },
  { icon: <Megaphone size={24} />, title: "Se publica", desc: "Tu primera publicación queda pendiente de aprobación mientras verificamos tus datos; después, tus avisos salen al instante." },
  { icon: <MessageCircle size={24} />, title: "Recibí consultas", desc: "Te contactan por WhatsApp u otros medios para coordinar una visita." },
  { icon: <DollarSign size={24} />, title: "Vendé", desc: "Cerrá la venta y marcá tu publicación como vendida." },
];

const BENEFITS = [
  { icon: <MessageCircle size={22} />, title: "Contacto directo", desc: "Hablás con el vendedor, sin intermediarios." },
  { icon: <Tag size={22} />, title: "Múltiples planes", desc: "Desde gratuito a premium, con todo el detalle." },
  { icon: <Headphones size={22} />, title: "Soporte por email", desc: "Te respondemos en menos de 24 horas hábiles." },
  { icon: <Heart size={22} />, title: "Hecho para El Salvador", desc: "Compradores y vendedores de todo el país, en un solo lugar." },
];

function StepFlow({ steps, color }) {
  return (
    <div className={styles.stepsRow}>
      {steps.map((step, i) => (
        <div key={step.title} className={styles.stepWrap}>
          <div className={styles.step}>
            <span className={styles.stepNum} style={{ background: color }}>{i + 1}</span>
            <div className={styles.stepIcon} style={{ borderColor: color, color }}>{step.icon}</div>
            <strong className={styles.stepTitle}>{step.title}</strong>
            <p className={styles.stepDesc}>{step.desc}</p>
          </div>
          {i < steps.length - 1 && (
            <div className={styles.connector} style={{ borderColor: color }} aria-hidden="true" />
          )}
        </div>
      ))}
    </div>
  );
}

const ComoFunciona = () => (
  <div className={styles.page}>
    <title>Cómo funciona | Mi Vehículo</title>
    <meta name="description" content="Cómo comprar y vender vehículos en Mi Vehículo: buscá, contactá directo al vendedor y publicá tu vehículo en minutos." />
    <Navbar />

    <main>
      {/* Hero */}
      <section className={styles.hero}>
        <h1 className={styles.heroTitle}>
          ¿Cómo funciona <span className={styles.heroHighlight}>Mi Vehículo</span>?
        </h1>
        <p className={styles.heroSub}>
          Un proceso simple, seguro y transparente para comprar o vender tu vehículo.
        </p>
      </section>

      <div className={styles.shell}>
        {/* Compradores */}
        <section className={styles.flowCard}>
          <div className={styles.flowLabel}>
            <div className={styles.flowLabelIcon} style={{ background: "rgba(29, 78, 216,0.1)", color: "#1d4ed8" }}>
              <Users size={28} />
            </div>
            <div>
              <h2 className={styles.flowLabelTitle}>Para compradores</h2>
              <p className={styles.flowLabelSub}>Encontrá tu próximo vehículo en 4 simples pasos.</p>
            </div>
          </div>
          <div className={styles.flowDivider} />
          <div className={styles.flowSteps}>
            <StepFlow steps={BUYER_STEPS} color="#1d4ed8" />
          </div>
        </section>

        {/* Vendedores */}
        <section className={`${styles.flowCard} ${styles.flowCardGreen}`}>
          <div className={styles.flowLabel}>
            <div className={styles.flowLabelIcon} style={{ background: "rgba(22,163,74,0.1)", color: "#16a34a" }}>
              <Tag size={28} />
            </div>
            <div>
              <h2 className={styles.flowLabelTitle}>Para vendedores</h2>
              <p className={styles.flowLabelSub}>Publicá tu vehículo y llegá a más compradores.</p>
            </div>
          </div>
          <div className={styles.flowDivider} />
          <div className={styles.flowSteps}>
            <StepFlow steps={SELLER_STEPS} color="#16a34a" />
          </div>
        </section>

        {/* Trust banner */}
        <div className={styles.trustBanner}>
          <div className={styles.trustLeft}>
            <div className={styles.trustIcon}>
              <Shield size={26} />
            </div>
            <div>
              <h3 className={styles.trustTitle}>Confianza y transparencia</h3>
              <p className={styles.trustDesc}>
                Promovemos buenas prácticas, te damos consejos para comprar y vender seguro y te
                acompañamos en todo el proceso.
              </p>
            </div>
          </div>
          <Link to="/publicar/nuevo" className={styles.trustCta}>
            Ofrecé tu vehículo <ArrowRight size={18} />
          </Link>
        </div>

        {/* Benefits */}
        <div className={styles.benefitsGrid}>
          {BENEFITS.map((b) => (
            <div key={b.title} className={styles.benefitItem}>
              <div className={styles.benefitIcon}>{b.icon}</div>
              <div>
                <strong>{b.title}</strong>
                <p>{b.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  </div>
);

export default ComoFunciona;
