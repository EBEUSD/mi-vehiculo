import { useNavigate } from "react-router-dom";
import { Car, Wrench, Package, ChevronRight, ArrowLeft } from "lucide-react";
import Navbar from "../../../components/Navbar/Navbar";
import styles from "./PublicarCategoria.module.css";

const CATEGORIAS = [
  {
    id: "vehiculo",
    icon: <Car size={36} />,
    titulo: "Vehículo",
    sub: "Autos, motos, camionetas, camiones y más",
    ruta: "/publicar/vehiculo",
    color: "#1a6eff",
    bg: "#eef5ff",
    items: ["Autos", "Motos", "Camionetas", "Camiones", "Buses"],
  },
  {
    id: "repuesto",
    icon: <Wrench size={36} />,
    titulo: "Repuesto",
    sub: "Piezas, partes y componentes mecánicos",
    ruta: "/publicar/repuesto",
    color: "#059669",
    bg: "#ecfdf5",
    items: ["Motor", "Frenos", "Suspensión", "Carrocería", "Eléctrico"],
  },
  {
    id: "accesorio",
    icon: <Package size={36} />,
    titulo: "Accesorio",
    sub: "Rines, audio, interior, exterior y más",
    ruta: "/publicar/accesorio",
    color: "#7c3aed",
    bg: "#f5f3ff",
    items: ["Audio", "Rines", "Iluminación", "Interior", "Seguridad"],
  },
];

const PublicarCategoria = () => {
  const navigate = useNavigate();

  return (
    <div className={styles.page}>
      <Navbar />

      <main className={styles.main}>
        <div className={styles.shell}>
          <button className={styles.back} onClick={() => navigate("/vendedor")}>
            <ArrowLeft size={16} /> Volver al panel
          </button>

          <div className={styles.header}>
            <h1>¿Qué querés publicar?</h1>
            <p>Elegí la categoría que mejor describe tu publicación para mostrarte el formulario correcto.</p>
          </div>

          <div className={styles.grid}>
            {CATEGORIAS.map((cat) => (
              <button
                key={cat.id}
                className={styles.card}
                onClick={() => navigate(cat.ruta)}
              >
                <div className={styles.cardIcon} style={{ background: cat.bg, color: cat.color }}>
                  {cat.icon}
                </div>

                <div className={styles.cardBody}>
                  <h2>{cat.titulo}</h2>
                  <p>{cat.sub}</p>
                  <div className={styles.tags}>
                    {cat.items.map((item) => (
                      <span key={item} className={styles.tag} style={{ background: cat.bg, color: cat.color }}>
                        {item}
                      </span>
                    ))}
                  </div>
                </div>

                <ChevronRight size={20} className={styles.arrow} />
              </button>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default PublicarCategoria;
