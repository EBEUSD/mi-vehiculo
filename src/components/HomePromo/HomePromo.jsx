import {
  FaSearch, FaClipboardCheck, FaEye, FaHandshake,
  FaShieldAlt, FaUsers, FaCarSide, FaHeadset, FaEnvelope,
} from "react-icons/fa";
import styles from "./HomePromo.module.css";

const steps = [
  { icon: <FaSearch />,       title: "1. Buscá",         text: "Encontrá el vehículo ideal entre nuestros filtros" },
  { icon: <FaClipboardCheck />, title: "2. Contactá",     text: "Hablá directo con el vendedor" },
  { icon: <FaEye />,          title: "3. Revisá",         text: "Coordiná para ver el vehículo" },
  { icon: <FaHandshake />,    title: "4. Cerrá el trato", text: "Comprá seguro y transparente" },
];

const stats = [
  { icon: <FaShieldAlt />, title: "100% Seguro",   text: "Verificamos vendedores" },
  { icon: <FaUsers />,     title: "+15.000",        text: "Usuarios activos" },
  { icon: <FaCarSide />,   title: "+3.500",         text: "Vehículos vendidos" },
  { icon: <FaHeadset />,   title: "Soporte 24/7",  text: "Atención personalizada" },
];

const HomePromo = () => (
  <>
    <section className={styles.howItWorks}>
      <div className={styles.container}>
        <h3>¿Cómo funciona?</h3>
        <div className={styles.stepsGrid}>
          {steps.map((s) => (
            <article key={s.title} className={styles.stepCard}>
              <div className={styles.stepIcon}>{s.icon}</div>
              <div>
                <h4>{s.title}</h4>
                <p>{s.text}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>

    <section className={styles.statsBar}>
      <div className={styles.container}>
        <div className={styles.statsGrid}>
          {stats.map((s) => (
            <article key={s.title} className={styles.statItem}>
              <div className={styles.statIcon}>{s.icon}</div>
              <div>
                <strong>{s.title}</strong>
                <span>{s.text}</span>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>

    <section className={styles.subscribeBar}>
      <div className={styles.container}>
        <div className={styles.subscribeLeft}>
          <div className={styles.subscribeIcon}><FaEnvelope /></div>
          <div>
            <strong>Recibí las mejores ofertas</strong>
            <p>Suscribite y enterate primero de nuevos ingresos</p>
          </div>
        </div>
        <form className={styles.subscribeForm}>
          <input type="email" placeholder="Tu email" />
          <button type="button">Suscribirme</button>
        </form>
      </div>
    </section>
  </>
);

export default HomePromo;
