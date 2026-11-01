import { Link } from "react-router-dom";
import styles from "./Hero.module.css";
import { ArrowRight, Plus } from "lucide-react";

const Hero = () => {
  return (
    <section className={styles.hero}>
      {/* Imagen como <img> (y no background-image) para que el navegador la priorice */}
      <img
        className={styles.bgImg}
        src="/hero.webp"
        srcSet="/hero-800.webp 800w, /hero-1200.webp 1200w, /hero.webp 1774w"
        sizes="(max-width: 520px) 460px, (max-width: 900px) 600px, 100vw"
        width="1774"
        height="887"
        alt=""
        fetchPriority="high"
        decoding="async"
      />
      <div className={styles.overlay} />

      <div className={styles.container}>
        <div className={styles.content}>
          <span className={styles.badge}>Comprá · Vendé · Alquilá · Permutá</span>
          <h1>La plataforma integral de vehículos en El Salvador</h1>
          <p>
            Comprá, vendé, alquilá, permutá y ofrecé o contratá tu servicio para
            cualquier tipo de vehículo: desde una bicicleta hasta un carro, bus,
            camión, acuáticos, maquinaria o aeronaves. También repuestos y
            accesorios. ¡Sí! Todo en un solo lugar.
          </p>
          <p className={styles.slogan}>
            “Si se mueve, trabaja o te lleva a donde necesitás ir, está en{" "}
            <strong>mivehiculosv.com</strong>”
          </p>

          <div className={styles.actions}>
            <Link to="/publicar/nuevo" className={styles.primaryBtn}>
              <Plus size={18} strokeWidth={2.6} />
              <span>Publicar</span>
            </Link>

            <Link
              to="/vehiculos?sortBy=relevant&page=1"
              className={styles.secondaryBtn}
            >
              <span>Ver todos los vehículos</span>
              <ArrowRight size={17} />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
