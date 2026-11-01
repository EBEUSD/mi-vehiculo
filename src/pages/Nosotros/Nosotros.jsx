import { Link } from "react-router-dom";
import { Compass, Rocket, Gem, ArrowRight } from "lucide-react";
import Navbar from "../../components/Navbar/Navbar";
import styles from "./Nosotros.module.css";

const MISION =
  "Centralizar y dinamizar todo el mercado de la movilidad, el transporte y la logística en El Salvador a través de una plataforma de anuncios integral, ágil y transparente, que facilite la compra, venta, alquiler, leasing y permuta de todo tipo de vehículos, repuestos, accesorios y servicios, potenciando la libertad económica y de movimiento de los Salvadoreños.";

const VISION =
  "Consolidarnos como el ecosistema digital automotriz, de transporte y maquinaria líder y más completo de El Salvador, siendo la solución de referencia obligatoria para particulares, empresas y agencias, transformando la manera en que el país se mueve, comercia y financia su movilidad.";

const VALORES = [
  {
    title: "Libertad de Elección",
    desc: "Ofrecemos el abanico más amplio de opciones del mercado (desde compra tradicional hasta leasing y permuta) para que cada usuario diseñe su movilidad a su manera.",
  },
  {
    title: "Integralidad y Alcance",
    desc: "Conectamos todos los mundos de la movilidad bajo un mismo techo: terrestre, acuático, aéreo, comercial, agrícola, repuestos, accesorios y servicios.",
  },
  {
    title: "Transparencia y Seguridad",
    desc: "Construimos un entorno confiable con reglas claras para que hacer negocios en El Salvador sea un proceso seguro y libre de estrés.",
  },
  {
    title: "Agilidad y Eficiencia",
    desc: "Optimizamos el tiempo de nuestros usuarios mediante herramientas de publicación y búsqueda rápidas, sencillas y autogestionables.",
  },
];

const Nosotros = () => (
  <div className={styles.page}>
    <title>Misión, visión y valores | Mi Vehículo</title>
    <meta name="description" content="Conocé la misión, visión y valores de Mi Vehículo, la plataforma integral de vehículos en El Salvador." />
    <Navbar />

    <main>
      <section className={styles.hero}>
        <h1 className={styles.heroTitle}>
          Misión, visión y <span className={styles.heroHighlight}>valores</span>
        </h1>
        <p className={styles.heroSub}>La plataforma integral de vehículos en El Salvador.</p>
      </section>

      <div className={styles.shell}>
        <div className={styles.pair}>
          <section className={styles.card}>
            <div className={styles.cardIcon}><Compass size={24} /></div>
            <h2 className={styles.cardTitle}>Misión</h2>
            <p className={styles.cardText}>“{MISION}”</p>
          </section>

          <section className={styles.card}>
            <div className={styles.cardIcon}><Rocket size={24} /></div>
            <h2 className={styles.cardTitle}>Visión</h2>
            <p className={styles.cardText}>“{VISION}”</p>
          </section>
        </div>

        <section className={styles.card}>
          <div className={styles.cardIcon}><Gem size={24} /></div>
          <h2 className={styles.cardTitle}>Valores</h2>
          <div className={styles.valuesGrid}>
            {VALORES.map((v) => (
              <div key={v.title} className={styles.valueItem}>
                <strong>{v.title}</strong>
                <p>{v.desc}</p>
              </div>
            ))}
          </div>
        </section>

        <Link to="/vehiculos" className={styles.cta}>
          Explorar publicaciones <ArrowRight size={18} />
        </Link>
      </div>
    </main>
  </div>
);

export default Nosotros;
