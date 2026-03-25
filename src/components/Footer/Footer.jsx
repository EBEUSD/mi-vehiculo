import styles from "./Footer.module.css";
import {
  FaSearch,
  FaClipboardCheck,
  FaEye,
  FaHandshake,
  FaShieldAlt,
  FaUsers,
  FaCarSide,
  FaHeadset,
  FaEnvelope,
  FaFacebookF,
  FaInstagram,
  FaWhatsapp,
} from "react-icons/fa";
import logoVehiculo from "../../assets/logo-vehiculo.png";

const steps = [
  {
    icon: <FaSearch />,
    title: "1. Buscá",
    text: "Encontrá el vehículo ideal entre nuestros filtros",
  },
  {
    icon: <FaClipboardCheck />,
    title: "2. Contactá",
    text: "Hablá directo con el vendedor",
  },
  {
    icon: <FaEye />,
    title: "3. Revisá",
    text: "Coordiná para ver el vehículo",
  },
  {
    icon: <FaHandshake />,
    title: "4. Cerrá el trato",
    text: "Comprá seguro y transparente",
  },
];

const stats = [
  {
    icon: <FaShieldAlt />,
    title: "100% Seguro",
    text: "Verificamos vendedores",
  },
  {
    icon: <FaUsers />,
    title: "+15.000",
    text: "Usuarios activos",
  },
  {
    icon: <FaCarSide />,
    title: "+3.500",
    text: "Vehículos vendidos",
  },
  {
    icon: <FaHeadset />,
    title: "Soporte 24/7",
    text: "Atención personalizada",
  },
];

const Footer = () => {
  return (
    <footer className={styles.footer}>
      <section className={styles.howItWorks}>
        <div className={styles.container}>
          <h3>¿Cómo funciona?</h3>

          <div className={styles.stepsGrid}>
            {steps.map((step) => (
              <article key={step.title} className={styles.stepCard}>
                <div className={styles.stepIcon}>{step.icon}</div>
                <div>
                  <h4>{step.title}</h4>
                  <p>{step.text}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className={styles.statsBar}>
        <div className={styles.container}>
          <div className={styles.statsGrid}>
            {stats.map((stat) => (
              <article key={stat.title} className={styles.statItem}>
                <div className={styles.statIcon}>{stat.icon}</div>
                <div>
                  <strong>{stat.title}</strong>
                  <span>{stat.text}</span>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className={styles.subscribeBar}>
        <div className={styles.container}>
          <div className={styles.subscribeLeft}>
            <div className={styles.subscribeIcon}>
              <FaEnvelope />
            </div>

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

      <section className={styles.bottomBar}>
        <div className={styles.container}>
          <div className={styles.brand}>
            <img src={logoVehiculo} alt="Mi Vehículo" className={styles.brandImg} />
          </div>

          <div className={styles.links}>
            <a href="#">Dejá tu ayuda</a>
            <a href="#">Términos y condiciones</a>
            <a href="#">Privacidad</a>
            <a href="#">Contacto</a>
          </div>

          <div className={styles.socials}>
            <a href="#" aria-label="Facebook">
              <FaFacebookF />
            </a>
            <a href="#" aria-label="Instagram">
              <FaInstagram />
            </a>
            <a href="#" aria-label="WhatsApp">
              <FaWhatsapp />
            </a>
          </div>
        </div>

        <div className={styles.copy}>
          © 2024 Mi Vehículo. Todos los derechos reservados.
        </div>
      </section>
    </footer>
  );
};

export default Footer;