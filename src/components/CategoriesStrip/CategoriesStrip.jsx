import { useEffect, useState } from "react";
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
import { api } from "../../lib/api";

const fmtCount = (n) =>
  n == null ? null : n.toLocaleString("es-SV") + " aviso" + (n !== 1 ? "s" : "");

const CATEGORY_DEFS = [
  {
    name:    "Autos",
    key:     "AUTO",
    icon:    <FaCarSide />,
    href:    "/vehiculos?type=Autos&condition=used&sortBy=relevant&page=1",
    fallback: "50.341 avisos",
  },
  {
    name:    "Motos",
    key:     "MOTO",
    icon:    <FaMotorcycle />,
    href:    "/vehiculos?type=Motos&condition=used&sortBy=relevant&page=1",
    fallback: "12.876 avisos",
  },
  {
    name:    "Camionetas",
    key:     "CAMIONETA",
    icon:    <FaTruckPickup />,
    href:    "/vehiculos?type=Camionetas&condition=used&sortBy=relevant&page=1",
    fallback: "8.112 avisos",
  },
  {
    name:    "Camiones",
    key:     "CAMION",
    icon:    <FaTruck />,
    href:    "/vehiculos?type=Camiones&condition=used&sortBy=relevant&page=1",
    fallback: "2.345 avisos",
  },
  {
    name:    "Repuestos",
    key:     null,
    icon:    <FaCog />,
    href:    "/productos?tipo=repuestos",
    fallback: "Ver publicaciones",
  },
  {
    name:    "Accesorios",
    key:     null,
    icon:    <GiCarWheel />,
    href:    "/productos?tipo=accesorios",
    fallback: "Ver publicaciones",
  },
];

const CategoriesStrip = () => {
  const [counts, setCounts] = useState({});

  useEffect(() => {
    api.get("/vehicles/stats/public")
      .then((res) => setCounts(res.data || {}))
      .catch(() => {});
  }, []);

  return (
    <section className={styles.card}>
      {CATEGORY_DEFS.map((item) => {
        const count = item.key ? fmtCount(counts[item.key]) : null;
        return (
          <Link key={item.name} to={item.href} className={styles.item}>
            <div className={styles.icon}>{item.icon}</div>
            <h3>{item.name}</h3>
            <span>{count ?? item.fallback}</span>
          </Link>
        );
      })}
    </section>
  );
};

export default CategoriesStrip;
