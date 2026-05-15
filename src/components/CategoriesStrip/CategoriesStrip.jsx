import { Link } from "react-router-dom";
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
  {
    name: "Autos",
    count: "50.341 avisos",
    icon: <FaCarSide />,
    href: "/vehiculos?type=Autos&condition=used&sortBy=relevant&page=1",
  },
  {
    name: "Motos",
    count: "12.876 avisos",
    icon: <FaMotorcycle />,
    href: "/vehiculos?type=Motos&condition=used&sortBy=relevant&page=1",
  },
  {
    name: "Camionetas",
    count: "8.112 avisos",
    icon: <FaTruckPickup />,
    href: "/vehiculos?type=Camionetas&condition=used&sortBy=relevant&page=1",
  },
  {
    name: "Camiones",
    count: "2.345 avisos",
    icon: <FaTruck />,
    href: "/vehiculos?type=Camiones&condition=used&sortBy=relevant&page=1",
  },
  {
    name: "Repuestos",
    count: "25.678 avisos",
    icon: <FaCog />,
    href: "/vehiculos?sortBy=relevant&page=1",
  },
  {
    name: "Accesorios",
    count: "15.432 avisos",
    icon: <GiCarWheel />,
    href: "/vehiculos?sortBy=relevant&page=1",
  },
];

const CategoriesStrip = () => {
  return (
    <section className={styles.card}>
      {categories.map((item) => (
        <Link key={item.name} to={item.href} className={styles.item}>
          <div className={styles.icon}>{item.icon}</div>
          <h3>{item.name}</h3>
          <span>{item.count}</span>
        </Link>
      ))}
    </section>
  );
};

export default CategoriesStrip;