import { Link } from "react-router-dom";
import {
  Search, MessageSquare, Eye, Check,
  Handshake, Users, Car, Headphones, Plus,
} from "lucide-react";
import usePublicStats from "../../hooks/usePublicStats";
import styles from "./HomePromo.module.css";

const steps = [
  { icon: Search,        title: "1. Buscá",          text: "Encontrá el vehículo ideal entre nuestros filtros" },
  { icon: MessageSquare, title: "2. Contactá",       text: "Hablá directo con el vendedor" },
  { icon: Eye,           title: "3. Revisá",         text: "Coordiná para ver el vehículo" },
  { icon: Check,         title: "4. Cerrá el trato", text: "Acordá precio y forma de pago con el vendedor" },
];

const fmtNum = (n) => Number(n).toLocaleString("es-SV");

const HomePromo = () => {
  const pubStats = usePublicStats();

  const total   = pubStats?.total   > 0 ? pubStats.total   : null;
  const sellers = pubStats?.sellers > 0 ? pubStats.sellers : null;

  // Solo cifras reales de la API; sin datos se muestra texto no numérico
  const stats = [
    { icon: Handshake,  title: "Contacto directo",                         text: "Sin intermediarios" },
    { icon: Users,      title: sellers ? fmtNum(sellers) : "Particulares", text: sellers ? "Vendedores activos" : "y empresas publicando" },
    { icon: Car,        title: total   ? fmtNum(total)   : "Todo tipo",    text: total ? "Vehículos disponibles" : "de vehículos en un solo lugar" },
    { icon: Headphones, title: "Soporte por email",                        text: "Respuesta en 24 hs hábiles" },
  ];

  return (
    <>
      <section className={styles.statsBar}>
        <div className={`${styles.container} ${styles.statsGrid}`}>
          {stats.map((s) => (
            <article key={s.text} className={styles.statItem}>
              <div className={styles.statIcon}><s.icon size={22} aria-hidden="true" /></div>
              <div>
                <strong>{s.title}</strong>
                <span>{s.text}</span>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className={styles.howItWorks}>
        <div className={styles.container}>
          <span className={styles.eyebrow}>Simple y transparente</span>
          <h2>¿Cómo funciona?</h2>
          <div className={styles.stepsGrid}>
            {steps.map((s, i) => (
              <article key={s.title} className={styles.stepCard}>
                <span className={styles.stepNum} aria-hidden="true">{String(i + 1).padStart(2, "0")}</span>
                <div className={styles.stepIcon}><s.icon size={20} aria-hidden="true" /></div>
                <h3>{s.title}</h3>
                <p>{s.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Antes era un formulario de newsletter sin backend; ahora es un CTA real a publicar */}
      <section className={styles.container}>
        <div className={styles.subscribeBar}>
          <div className={styles.subscribeLeft}>
            <div className={styles.subscribeIcon}><Car size={22} aria-hidden="true" /></div>
            <div>
              <strong>¿Querés vender tu vehículo?</strong>
              <p>Publicá gratis: tu primera publicación de cada año no tiene costo.</p>
            </div>
          </div>
          <Link to="/publicar/nuevo" className={styles.ctaBtn}>
            <Plus size={18} strokeWidth={2.6} aria-hidden="true" /> Publicar gratis
          </Link>
        </div>
      </section>
    </>
  );
};

export default HomePromo;
