import { Link } from "react-router-dom";
import logoVehiculo from "../../assets/logo-vehiculo.png";
import { VEHICLE_CATEGORIES, PRODUCT_CATEGORIES } from "../../lib/categories";
import styles from "./Footer.module.css";

const EXPLORAR = [
  ...VEHICLE_CATEGORIES.filter((c) => ["carros", "motos", "camiones", "maquinaria"].includes(c.id))
    .map((c) => ({ label: c.short, to: `/vehiculos?type=${c.id}&sortBy=relevant&page=1` })),
  ...PRODUCT_CATEGORIES.map((c) => ({ label: c.label, to: c.href })),
];

const COLUMNS = [
  { title: "Explorar", links: EXPLORAR },
  {
    title: "Nosotros",
    links: [
      { label: "Misión, visión y valores", to: "/nosotros" },
      { label: "Cómo funciona",            to: "/como-funciona" },
      { label: "Contacto",                 to: "/contacto" },
    ],
  },
  {
    title: "Ayuda",
    links: [
      { label: "Preguntas frecuentes",   to: "/faq" },
      { label: "Términos y condiciones", to: "/terminos" },
      { label: "Política de privacidad", to: "/privacidad" },
    ],
  },
];

const Footer = () => (
  <footer className={styles.footer}>
    <div className={`${styles.container} ${styles.top}`}>
      <div className={styles.brand}>
        <img
          src={logoVehiculo}
          alt="Mi Vehículo"
          className={styles.brandImg}
          width="176"
          height="32"
          loading="lazy"
          decoding="async"
        />
        <p className={styles.slogan}>
          “Si se mueve, trabaja o te lleva a donde necesitás ir, está en mivehiculosv.com”
        </p>
        {/* Redes sociales: agregar acá los links (Facebook, Instagram, WhatsApp) cuando
            existan las cuentas oficiales. Estilos listos en .socials (Footer.module.css). */}
      </div>

      {COLUMNS.map((col) => (
        <nav key={col.title} className={styles.col} aria-labelledby={`footer-${col.title}`}>
          <h2 id={`footer-${col.title}`} className={styles.colTitle}>{col.title}</h2>
          {col.links.map((l) => <Link key={l.label} to={l.to}>{l.label}</Link>)}
        </nav>
      ))}
    </div>

    <div className={styles.copy}>
      <div className={styles.container}>© 2026 Go technology. Todos los derechos reservados.</div>
    </div>
  </footer>
);

export default Footer;
