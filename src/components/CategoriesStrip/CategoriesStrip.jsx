import styles from "./CategoriesStrip.module.css";
import {
  FaCarSide,
  FaMotorcycle,
  FaTruckPickup,
  FaTruck,
  FaCog,
} from "react-icons/fa";
import { GiCarWheel } from "react-icons/gi";

const categories = [
  { name: "Autos", count: "50.341 avisos", icon: <FaCarSide /> },
  { name: "Motos", count: "12.876 avisos", icon: <FaMotorcycle /> },
  { name: "Camionetas", count: "8.112 avisos", icon: <FaTruckPickup /> },
  { name: "Camiones", count: "2.345 avisos", icon: <FaTruck /> },
  { name: "Repuestos", count: "25.678 avisos", icon: <FaCog /> },
  { name: "Accesorios", count: "15.432 avisos", icon: <GiCarWheel /> },
];

const CategoriesStrip = () => {
  return (
    <section className={styles.card}>
      {categories.map((item) => (
        <article key={item.name} className={styles.item}>
          <div className={styles.icon}>{item.icon}</div>
          <h3>{item.name}</h3>
          <span>{item.count}</span>
        </article>
      ))}
    </section>
  );
};

export default CategoriesStrip;