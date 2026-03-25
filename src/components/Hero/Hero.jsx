import styles from "./Hero.module.css";
import { FaCarSide } from "react-icons/fa";

const Hero = () => {
  return (
    <section className={styles.hero}>
      <div className={styles.bgGlowOne} />
      <div className={styles.bgGlowTwo} />

      <div className={styles.container}>
        <div className={styles.content}>
          <h1>Encontrá tu próximo vehículo</h1>
          <p>
            La plataforma líder para comprar y vender automotores de forma fácil
            y segura
          </p>

          <button className={styles.cta}>
            <FaCarSide />
            <span>Publicar mi vehículo</span>
          </button>
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