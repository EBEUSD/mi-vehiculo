import Navbar from "../../components/Navbar/Navbar";
import Hero from "../../components/Hero/Hero";
import CategoriesStrip from "../../components/CategoriesStrip/CategoriesStrip";
import SearchFilters from "../../components/SearchFilters/SearchFilters";
import FeaturedCars from "../../components/FeaturedCars/FeaturedCars";
import Footer from "../../components/Footer/Footer";
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

      <Footer />
    </div>
  );
};

export default Home;