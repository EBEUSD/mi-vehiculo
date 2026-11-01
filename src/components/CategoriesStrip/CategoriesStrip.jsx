import { useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import styles from "./CategoriesStrip.module.css";
import usePublicStats from "../../hooks/usePublicStats";
import { VEHICLE_CATEGORIES, PRODUCT_CATEGORIES } from "../../lib/categories";

const fmtCount = (n) =>
  n == null ? null : n.toLocaleString("es-SV") + " aviso" + (n !== 1 ? "s" : "");

// Varias categorías comparten enum en el backend (ej. Maquinaria y Otros → OTRO);
// el conteo solo se muestra cuando el enum es exclusivo de la categoría.
const apiUseCount = VEHICLE_CATEGORIES.reduce((acc, c) => ({ ...acc, [c.api]: (acc[c.api] || 0) + 1 }), {});

const ITEMS = [
  ...VEHICLE_CATEGORIES.map((c) => ({
    name:  c.label,
    icon:  c.icon,
    key:   apiUseCount[c.api] === 1 ? c.api : null,
    href:  `/vehiculos?type=${c.id}&sortBy=relevant&page=1`,
  })),
  ...PRODUCT_CATEGORIES.map((c) => ({ name: c.label, icon: c.icon, key: null, href: c.href, product: true })),
];

const CategoriesStrip = () => {
  const counts = usePublicStats() || {};
  const { hash, key } = useLocation();

  // Navbar "Categorías" enlaza a /#categorias: React Router no hace scroll a anclas
  useEffect(() => {
    if (hash !== "#categorias") return;
    const id = requestAnimationFrame(() =>
      document.getElementById("categorias")?.scrollIntoView({ behavior: "smooth", block: "start" }));
    return () => cancelAnimationFrame(id);
  }, [hash, key]);

  return (
    <section id="categorias" className={styles.section}>
      <div className={styles.head}>
        <div>
          <span className={styles.eyebrow}>Categorías</span>
          <h2>¿Qué estás buscando?</h2>
        </div>
        <Link to="/vehiculos?sortBy=relevant&page=1" className={styles.headLink}>
          Ver todos los vehículos <ArrowRight size={16} />
        </Link>
      </div>

      <div className={styles.grid}>
        {ITEMS.map((item) => {
          const count = item.key ? fmtCount(counts[item.key]) : null;
          return (
            <Link
              key={item.name}
              to={item.href}
              className={`${styles.item} ${item.product ? styles.product : ""}`}
            >
              <div className={styles.icon}><item.icon size={22} strokeWidth={1.8} aria-hidden="true" /></div>
              <h3>{item.name}</h3>
              <span>{count ?? "Ver publicaciones"} <ArrowRight size={12} /></span>
            </Link>
          );
        })}
      </div>
    </section>
  );
};

export default CategoriesStrip;
