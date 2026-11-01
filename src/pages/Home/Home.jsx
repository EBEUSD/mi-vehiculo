import Navbar from "../../components/Navbar/Navbar";
import Hero from "../../components/Hero/Hero";
import CategoriesStrip from "../../components/CategoriesStrip/CategoriesStrip";
import SearchFilters from "../../components/SearchFilters/SearchFilters";
import FeaturedCars from "../../components/FeaturedCars/FeaturedCars";
import HomePromo from "../../components/HomePromo/HomePromo";
import styles from "./Home.module.css";

const Home = () => {
  return (
    <div className={styles.home}>
      <title>Mi Vehículo — Comprá y vendé vehículos en El Salvador</title>
      <meta
        name="description"
        content="Comprá y vendé carros, motos, camiones, maquinaria, repuestos y accesorios en El Salvador. Publicá gratis y contactá directo con el vendedor."
      />
      <Navbar />

      <main className={styles.main}>
        <Hero />

        {/* El buscador se superpone al final del hero */}
        <section className={styles.searchSection}>
          <SearchFilters />
        </section>

        <div className={styles.categoriesSection}>
          <CategoriesStrip />
        </div>

        {/* Solo se muestra si hay publicaciones destacadas */}
        <section className={styles.featuredSection}>
          <FeaturedCars />
        </section>

        <HomePromo />
      </main>
    </div>
  );
};

export default Home;
