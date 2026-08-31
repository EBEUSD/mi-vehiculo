import { Link } from "react-router-dom";
import { FaFacebookF, FaInstagram, FaWhatsapp } from "react-icons/fa";
import logoVehiculo from "../../assets/logo-vehiculo.png";
import styles from "./Footer.module.css";

const Footer = () => (
  <footer className={styles.footer}>
    <section className={styles.bottomBar}>
      <div className={styles.container}>
        <div className={styles.brand}>
          <img src={logoVehiculo} alt="Mi Vehículo" className={styles.brandImg} />
        </div>

        <div className={styles.links}>
          <Link to="/como-funciona">Cómo funciona</Link>
          <Link to="/faq">Preguntas frecuentes</Link>
          <Link to="/terminos">Términos y condiciones</Link>
          <Link to="/privacidad">Política de privacidad</Link>
          <Link to="/contacto">Contacto</Link>
        </div>

        <div className={styles.socials}>
          <a href="#" aria-label="Facebook"><FaFacebookF /></a>
          <a href="#" aria-label="Instagram"><FaInstagram /></a>
          <a href="#" aria-label="WhatsApp"><FaWhatsapp /></a>
        </div>
      </div>

      <div className={styles.copy}>
        © 2026 Go technology . Todos los derechos reservados.
      </div>
    </section>
  </footer>
);

export default Footer;
