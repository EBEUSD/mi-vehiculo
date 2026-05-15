import { Link } from "react-router-dom";
import styles from "./Hero.module.css";
import { FaCarSide } from "react-icons/fa";
import { FiArrowRight } from "react-icons/fi";

const Hero = () => {
  return (
    <section className={styles.hero}>
      <div className={styles.overlay} />

      <div className={styles.container}>
        <div className={styles.content}>
          <h1>Encontrá tu próximo vehículo</h1>
          <p>
            La plataforma líder para comprar y vender automotores de forma fácil
            y segura
          </p>

          <div className={styles.actions}>
            <Link to="/publicar" className={styles.primaryBtn}>
              <FaCarSide />
              <span>Publicar mi vehículo</span>
            </Link>

            <Link
              to="/vehiculos?sortBy=relevant&page=1"
              className={styles.secondaryBtn}
            >
              <span>Ver todos los vehículos</span>
              <FiArrowRight />
            </Link>
          </div>
        </div>

        <div className={styles.carWrap}>
          <img
            src="https://pngimg.com/d/hyundai_PNG11231.png"
            alt="Auto destacado"
          />
        </div>
      </div>
    </section>
  );
};

export default Hero;