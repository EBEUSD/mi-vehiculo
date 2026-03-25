import styles from "./FeaturedCars.module.css";
import { FiHeart } from "react-icons/fi";

const vehicles = [
  {
    id: 1,
    title: "Toyota Corolla 1.8 XEi",
    price: "US$ 18.500",
    year: "2020",
    km: "45.000 km",
    location: "Buenos Aires",
    type: "Sedán",
    image:
      "https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?auto=format&fit=crop&w=1200&q=80",
    tag: "USED",
  },
  {
    id: 2,
    title: "Honda XR 150 L",
    price: "$ 3.200.000",
    year: "2023",
    km: "5.800 km",
    location: "Córdoba",
    type: "Moto",
    image:
      "https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&w=1200&q=80",
    tag: "DESTACADO",
  },
  {
    id: 3,
    title: "Ford Ranger 3.2 XLT 4x4",
    price: "US$ 28.900",
    year: "2019",
    km: "80.000 km",
    location: "Santa Fe",
    type: "Camioneta",
    image:
      "https://images.unsplash.com/photo-1517524206127-48bbd363f3d7?auto=format&fit=crop&w=1200&q=80",
    tag: "USED",
  },
  {
    id: 4,
    title: "Mercedes-Benz Atego 1725",
    price: "$ 45.000.000",
    year: "2021",
    km: "120.000 km",
    location: "Santa Fe",
    type: "Camión",
    image:
      "https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?auto=format&fit=crop&w=1200&q=80",
    tag: "DESTACADO",
  },
];

const FeaturedCars = () => {
  return (
    <section className={styles.wrapper}>
      <div className={styles.topbar}>
        <h2> Publicaciones destacadas</h2>
        <a href="#">Ver todas las publicaciones</a>
      </div>

      <div className={styles.grid}>
        {vehicles.map((vehicle) => (
          <article key={vehicle.id} className={styles.card}>
            <div className={styles.imageWrap}>
              <img src={vehicle.image} alt={vehicle.title} />
              <span
                className={`${styles.tag} ${
                  vehicle.tag === "DESTACADO" ? styles.green : styles.blue
                }`}
              >
                {vehicle.tag}
              </span>
              <button className={styles.favorite} aria-label="Guardar">
                <FiHeart />
              </button>
            </div>

            <div className={styles.info}>
              <strong className={styles.price}>{vehicle.price}</strong>
              <h3>{vehicle.title}</h3>
              <p className={styles.meta}>
                {vehicle.year} • {vehicle.km} • {vehicle.location}
              </p>
              <span className={styles.type}>{vehicle.type}</span>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
};

export default FeaturedCars;