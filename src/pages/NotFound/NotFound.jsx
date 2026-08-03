import { Link } from "react-router-dom";
import { Home, Search, ArrowLeft } from "lucide-react";
import Navbar from "../../components/Navbar/Navbar";
import styles from "./NotFound.module.css";

const NotFound = () => (
  <div className={styles.page}>
    <Navbar />

    <div className={styles.hero}>
      <div className={styles.inner}>
        <div className={styles.code}>404</div>
        <h1 className={styles.title}>Página no encontrada</h1>
        <p className={styles.sub}>
          La dirección que ingresaste no existe o fue movida.
          <br />
          Revisá el link o volvé al inicio.
        </p>

        <div className={styles.actions}>
          <Link to="/" className={styles.btnPrimary}>
            <Home size={17} /> Ir al inicio
          </Link>
          <Link to="/vehiculos" className={styles.btnOutline}>
            <Search size={17} /> Ver vehículos
          </Link>
        </div>
      </div>
    </div>
  </div>
);

export default NotFound;
