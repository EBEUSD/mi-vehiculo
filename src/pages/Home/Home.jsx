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
      <Navbar />

      <main className={styles.main}>
        <Hero />

        <div className={styles.floatingCategories}>
          <CategoriesStrip />
        </div>

        <section className={styles.filtersSection}>
          <SearchFilters />
        </section>

        <section className={styles.featuredSection}>
          <FeaturedCars />
        </section>
      </main>

      <HomePromo />

    </div>
  );
};

export default Home;